const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

function load(file, globals = {}) {
  const { outputText } = ts.transpileModule(
    readFileSync(path.join(__dirname, '..', file), 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  );
  const exports = {};
  runInNewContext(outputText, { exports, require, ...globals });
  return exports;
}

function setup(status = 204, data = {}) {
  const calls = [];
  const generated = load('src/api/generated/api.ts', {
    URLSearchParams,
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      return new Response(status === 204 ? null : JSON.stringify(data), {
        status,
      });
    },
  });
  const model = load('src/features/calendar/model/calendar.ts');
  const api = load('src/features/calendar/lib/calendarApi.ts', {
    require: (name) => {
      if (name === '@/api/generated/api') return generated;
      if (name === '@/features/auth/model/accessToken')
        return { getAccessToken: () => 'token' };
      if (name === '@/features/calendar/model/calendar') return model;
      if (name === './calendar')
        return load('src/features/calendar/lib/calendar.ts');
      if (name === './eventTime')
        return load('src/features/calendar/lib/eventTime.ts');
      throw new Error(name);
    },
  });
  return { api, calls };
}

const form = {
  title: '面接',
  category: 'INTERVIEW',
  note: '',
  company: '企業A',
  isAllDay: false,
  startDate: '2026-10-17',
  endDate: '2026-10-17',
  startTime: '10:00',
  endTime: '11:00',
  isOnline: true,
  isAttending: true,
};
const companies = [{ id: 8, name: '企業A' }];

test('upcoming is sorted, includes today, excludes other months/past days and caps at ten', () => {
  const { api } = setup();
  const events = Array.from({ length: 15 }, (_, i) => ({
    ...form,
    id: i + 1,
    startDate: `2026-10-${String(31 - i).padStart(2, '0')}`,
  }));
  events.push(
    { ...form, id: 99, startDate: '2026-10-16' },
    { ...form, id: 100, startDate: '2026-11-01' },
  );
  const result = api.selectUpcomingEvents(events, '2026-10-17');
  assert.equal(result.length, 10);
  assert.equal(result[0].startDate, '2026-10-17');
  assert.equal(result[9].startDate, '2026-10-26');
  assert.equal(events[0].startDate, '2026-10-31');
  assert.equal(api.selectUpcomingEvents(events, '2026-10-31').length, 1);
  assert.equal(api.selectUpcomingEvents([], '2026-10-17').length, 0);
});

test('same-day sorting places all-day events before timed events, and does not hide non-attendance', () => {
  const { api } = setup();
  const events = [
    { ...form, id: 1, startTime: '14:00' },
    { ...form, id: 2, startTime: '09:00', isAttending: false },
    { ...form, id: 3, isAllDay: true },
  ];
  assert.deepEqual(
    Array.from(
      api.selectUpcomingEvents(events, '2026-10-17'),
      (event) => event.id,
    ),
    [3, 2, 1],
  );
});

test('monthly GET sends month, credentials, token and abort signal', async () => {
  const { api, calls } = setup(200, { events: [], companies: [] });
  const signal = new AbortController().signal;
  await api.loadEvents('2026-10', signal);
  await api.loadEventCompanies(signal);
  assert.equal(calls[0].url, '/events?month=2026-10');
  assert.equal(calls[0].signal, signal);
  assert.equal(calls[0].headers.Authorization, 'Bearer token');
  assert.equal(calls[0].credentials, 'include');
  assert.equal(calls[1].url, '/companies/lookup');
  assert.equal(calls[1].headers.Authorization, 'Bearer token');
  assert.equal(calls[1].credentials, 'include');
  assert.equal(calls[1].signal, signal);
});

test('timed creation uses ISO timestamps, company ID and null for unused fields', async () => {
  const { api, calls } = setup(201, { eventId: 77 });
  await api.saveEventRequest(form, companies);
  const body = JSON.parse(calls[0].body);
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].url, '/events');
  assert.equal(body.companyId, 8);
  assert.equal(body.startDay, null);
  assert.equal(body.endDay, null);
  assert.equal(body.isAttending, null);
  assert.equal(body.note, null);
  assert.equal(body.startTime, new Date('2026-10-17T10:00:00').toISOString());
  const display = api.toCalendarEvent({
    ...body,
    id: 77,
    companyName: '企業A',
  });
  assert.equal(display.startDate, form.startDate);
  assert.equal(display.startTime, form.startTime);
  assert.equal(display.company, '企業A');
});

test('switch to all-day clears timestamps; unchanged company association is omitted on PATCH', async () => {
  const { api, calls } = setup();
  await api.saveEventRequest(
    { ...form, category: 'SESSION', isAllDay: true },
    [],
    { id: 7, companyName: '企業A' },
  );
  const body = JSON.parse(calls[0].body);
  assert.equal(calls[0].url, '/events/7');
  assert.equal(calls[0].method, 'PATCH');
  assert.equal(body.startTime, null);
  assert.equal(body.endTime, null);
  assert.equal(body.startDay, '2026-10-17');
  assert.equal(body.endDay, '2026-10-17');
  assert.equal(body.isAttending, true);
  assert.equal(Object.hasOwn(body, 'companyId'), false);
  await api.saveEventRequest({ ...form, company: '' }, companies, {
    id: 7,
    companyName: '企業A',
  });
  assert.equal(JSON.parse(calls[1].body).companyId, null);
});

test('invalid date ranges and ambiguous company selections do not send requests', async () => {
  const { api, calls } = setup();
  await assert.rejects(
    api.saveEventRequest({ ...form, endTime: '10:00' }, companies),
  );
  await assert.rejects(
    api.saveEventRequest(
      { ...form, isAllDay: true, endDate: '2026-10-16' },
      companies,
    ),
  );
  await assert.rejects(
    api.saveEventRequest(form, [...companies, { id: 9, name: '企業A' }]),
  );
  assert.equal(calls.length, 0);
});

test('deletion and unsuccessful responses are handled explicitly', async () => {
  const { api, calls } = setup();
  await api.deleteEventRequest(7);
  assert.equal(calls[0].method, 'DELETE');
  assert.equal(calls[0].url, '/events/7');
  for (const status of [400, 401, 403, 404, 500]) {
    const { api } = setup(status);
    await assert.rejects(api.loadEvents('2026-10'));
    await assert.rejects(api.loadEventCompanies());
    await assert.rejects(api.saveEventRequest(form, companies));
    await assert.rejects(
      api.saveEventRequest(form, companies, { id: 7, companyName: '企業A' }),
    );
    await assert.rejects(api.deleteEventRequest(7));
  }
});
