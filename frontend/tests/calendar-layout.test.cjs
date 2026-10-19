const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
function load(file) {
  const { outputText } = ts.transpileModule(
    readFileSync(
      path.join(__dirname, '..', 'src/features/calendar/lib', file + '.ts'),
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  );
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require: (name) => load(name.slice(2)),
  });
  return exports;
}
const { getCalendarDays } = load('calendar');
const { layoutWeekEvents } = load('weekLayout');
const days = getCalendarDays(new Date(2026, 9, 1));
const week = days.slice(7, 14); // October 4–10
function event(id, startDate, endDate, rest = {}) {
  return {
    id,
    title: `予定${id}`,
    startDate,
    endDate,
    isAllDay: true,
    category: 'OTHER',
    note: '',
    isOnline: false,
    ...rest,
  };
}

test('multi-day events occupy one contiguous segment with inclusive all-day end', () => {
  const result = layoutWeekEvents(week, [event(1, '2026-10-05', '2026-10-07')]);
  assert.equal(result.length, 1);
  assert.equal(result[0].startColumn, 2);
  assert.equal(result[0].endColumn, 5);
});

test('week-spanning events are clipped and retain continuation markers', () => {
  const events = [event(1, '2026-10-09', '2026-10-13')];
  const first = layoutWeekEvents(week, events)[0];
  const next = layoutWeekEvents(days.slice(14, 21), events)[0];
  assert.equal(first.startColumn, 6);
  assert.equal(first.endColumn, 8);
  assert.equal(first.continuesAfter, true);
  assert.equal(next.startColumn, 1);
  assert.equal(next.endColumn, 4);
  assert.equal(next.continuesBefore, true);
});

test('overlapping spans and single-day events never overlap within a lane', () => {
  const events = [
    event(1, '2026-10-04', '2026-10-08'),
    event(2, '2026-10-06', '2026-10-10'),
    event(3, '2026-10-07', '2026-10-07'),
    event(4, '2026-10-09', '2026-10-09'),
  ];
  const result = layoutWeekEvents(week, events);
  assert.equal(result.length, 4);
  for (const a of result)
    for (const b of result) {
      if (a.event.id === b.event.id || a.lane !== b.lane) continue;
      assert.ok(a.endColumn <= b.startColumn || b.endColumn <= a.startColumn);
    }
});

test('timed multi-day events span dates; midnight end excludes next day', () => {
  const timed = event(1, '2026-10-05', '2026-10-07', {
    isAllDay: false,
    startTime: '18:00',
    endTime: '09:00',
  });
  assert.equal(layoutWeekEvents(week, [timed])[0].endColumn, 5);
  assert.equal(
    layoutWeekEvents(week, [{ ...timed, endTime: '00:00' }])[0].endColumn,
    4,
  );
});

test('month boundaries clip at the visible grid and unrelated events are excluded', () => {
  const result = layoutWeekEvents(days.slice(0, 7), [
    event(1, '2026-09-20', '2026-10-02'),
    event(2, '2026-11-01', '2026-11-02'),
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].startColumn, 1);
  assert.equal(result[0].continuesBefore, true);
  assert.equal(layoutWeekEvents([], []).length, 0);
});
