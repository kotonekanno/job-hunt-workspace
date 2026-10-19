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
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  );
  const exports = {};
  const originalRequire = globals.require ?? require;
  const sharedRequire = (name) => {
    if (name === '@/shared/useOptimisticState')
      return load('src/shared/useOptimisticState.ts', globals);
    if (name === '@/features/task/lib/taskMutations')
      return load('src/features/task/lib/taskMutations.ts', globals);
    return originalRequire(name);
  };
  runInNewContext(outputText, {
    exports,
    AbortController,
    ...globals,
    require: sharedRequire,
  });
  return exports;
}
const board = load('src/features/companies/lib/companyBoard.ts');
function setup(respond) {
  const calls = [];
  const generated = load('src/api/generated/api.ts', {
    URLSearchParams,
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      return respond(url, options);
    },
  });
  const api = load('src/features/companies/lib/companyDetailApi.ts', {
    require: (name) => {
      if (name === '@/api/generated/api') return generated;
      if (name === './companyBoard') return board;
      if (name === '@/features/companies/lib/selectionProgress')
        return load('src/features/companies/lib/selectionProgress.ts');
      return { getAccessToken: () => 'token' };
    },
  });
  return { api, calls, generated };
}
const response = (data, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(data), { status });

test('detail, company-only event request and scoped tasks use generated clients and auth', async () => {
  const { api, calls, generated } = setup(async (url) =>
    response(
      url.startsWith('/events')
        ? { events: [] }
        : url.startsWith('/tasks')
          ? { tasks: [] }
          : { name: '企業', document: '本文' },
    ),
  );
  const signal = new AbortController().signal;
  assert.equal((await api.loadCompany(8, signal)).name, '企業');
  assert.equal((await api.loadCompanyEvents(8, signal)).length, 0);
  const tasks = load('src/features/task/lib/taskApi.ts', {
    require: (name) =>
      name === '@/api/generated/api'
        ? generated
        : { getAccessToken: () => 'token' },
  });
  await tasks.loadTasks(signal, 8);
  assert.deepEqual(
    calls.map((call) => call.url),
    ['/companies/8', '/events?companyId=8', '/tasks?companyId=8'],
  );
  for (const call of calls) {
    assert.equal(call.signal, signal);
    assert.equal(call.credentials, 'include');
    assert.equal(call.headers.Authorization, 'Bearer token');
  }
});

test('company, document, widgets, basic info and activity edits send exact generated payloads', async () => {
  const { api, calls } = setup(async (url, options) =>
    response({}, options.method === 'POST' ? 201 : 204),
  );
  await api.renameCompany(8, '変更');
  await api.saveCompanyPriority(8, 7);
  await api.saveCompanyDocument(8, '# メモ');
  await api.saveCompanyWidgets(8, { basicInfo: false });
  await api.saveBasicInfo(8, { title: '所在地', text: '東京' });
  await api.saveBasicInfo(8, { title: '所在地', text: '大阪' }, 3);
  await api.removeBasicInfo(8, 3);
  await api.addActivity(8, { text: '連絡', byUser: true });
  await api.updateActivity(8, 4, { occurredAt: '2026-10-01T00:00:00Z' });
  await api.removeActivity(8, 4);
  await api.removeCompany(8);
  assert.deepEqual(
    calls.map((call) => [call.method, call.url]),
    [
      ['PATCH', '/companies/8'],
      ['PATCH', '/companies/8/priority'],
      ['PUT', '/companies/8/document'],
      ['PATCH', '/companies/8/widgets'],
      ['POST', '/companies/8/basic_infos'],
      ['PATCH', '/companies/8/basic_infos/3'],
      ['DELETE', '/companies/8/basic_infos/3'],
      ['POST', '/companies/8/activities'],
      ['PATCH', '/companies/8/activities/4'],
      ['DELETE', '/companies/8/activities/4'],
      ['DELETE', '/companies/8'],
    ],
  );
  assert.deepEqual(JSON.parse(calls[2].body), { document: '# メモ' });
  assert.deepEqual(JSON.parse(calls[3].body), { basicInfo: false });
  assert.deepEqual(JSON.parse(calls[8].body), {
    occurredAt: '2026-10-01T00:00:00Z',
  });
});

test('selection mutations preserve server IDs and insert before the next persisted step', async () => {
  const { api, calls } = setup(async (url, options) =>
    response({ selectionStepId: 100 }, options.method === 'POST' ? 201 : 204),
  );
  const previous = api.selectionViews({
    activeSelectionId: 3,
    selections: [
      {
        id: 3,
        title: '本選考',
        currentStepId: 10,
        steps: [
          { id: 10, name: '書類', status: 'PENDING' },
          { id: 11, name: '面接', status: 'NOT_STARTED' },
        ],
      },
    ],
  })[0];
  assert.equal(previous.isActive, true);
  assert.equal(previous.steps[0].status, 'pending');
  await api.saveSelection(
    8,
    {
      ...previous,
      title: '新卒',
      steps: [
        { ...previous.steps[1], stepNo: 1 },
        { id: 999999.5, title: '追加', note: '', stepNo: 2 },
        { ...previous.steps[0], stepNo: 3 },
      ],
    },
    previous,
  );
  const created = calls.find((call) => call.method === 'POST');
  assert.deepEqual(JSON.parse(created.body), {
    name: '追加',
    note: '',
    nextSelectionStepId: 10,
  });
  const moved = calls.find((call) => call.url.endsWith('/10/position'));
  assert.deepEqual(JSON.parse(moved.body), { nextSelectionStepId: null });
  assert.ok(calls.every((call) => !call.url.includes('999999')));
  await api.saveSelectionStatus(8, 3, 10, 'passed');
  await api.activateSelection(8, 3, true);
  assert.deepEqual(JSON.parse(calls.at(-2).body), { status: 'PASSED' });
  assert.deepEqual(JSON.parse(calls.at(-1).body), { isActive: true });
});

test('related events show today and future ascending, all events ascending when past is enabled', () => {
  const { selectCompanyEvents } = load(
    'src/features/companies/hooks/useCompanyEvents.ts',
    {
      require: (name) =>
        name.endsWith('eventTime')
          ? {
              getEventSortKey: (event) =>
                `${event.startDate} ${event.startTime ?? '00:00'}`,
            }
          : {},
    },
  );
  const events = [
    { id: 1, startDate: '2026-10-16' },
    { id: 2, startDate: '2026-10-17', startTime: '09:00' },
    { id: 3, startDate: '2026-11-02' },
    { id: 4, startDate: '2026-10-17', startTime: '18:00' },
  ];
  assert.deepEqual(
    Array.from(
      selectCompanyEvents(events, '2026-10-17', false),
      (event) => event.id,
    ),
    [2, 4, 3],
  );
  assert.deepEqual(
    Array.from(
      selectCompanyEvents(events, '2026-10-17', true),
      (event) => event.id,
    ),
    [1, 2, 4, 3],
  );
  assert.deepEqual(
    events.map((event) => event.id),
    [1, 2, 3, 4],
  );
});

function hooks() {
  const slots = [],
    effects = [];
  let cursor = 0;
  const react = {
    useState: (initial) => {
      const i = cursor++;
      if (!(i in slots))
        slots[i] = typeof initial === 'function' ? initial() : initial;
      return [
        slots[i],
        (next) => {
          slots[i] = typeof next === 'function' ? next(slots[i]) : next;
        },
      ];
    },
    useRef: (initial) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useEffect: (effect, deps) => {
      const i = cursor++,
        previous = slots[i];
      if (
        !previous ||
        deps.some((dep, j) => !Object.is(dep, previous.deps[j]))
      ) {
        effects.push(() => {
          previous?.cleanup?.();
          slots[i] = { deps, cleanup: effect() };
        });
      }
    },
  };
  react.useMemo = (fn, deps) => {
    const i = cursor++;
    if (!slots[i] || deps.some((dep, j) => !Object.is(dep, slots[i].deps[j])))
      slots[i] = { deps, value: fn() };
    return slots[i].value;
  };
  react.useCallback = (fn, deps) => react.useMemo(() => fn, deps);
  return {
    react,
    render: (callback) => {
      cursor = 0;
      const result = callback();
      effects.splice(0).forEach((effect) => effect());
      return result;
    },
  };
}

test('company document preserves draft on unrelated refresh, debounces, saves before navigation and warns on unload', async () => {
  const h = hooks(),
    timers = new Map(),
    listeners = new Map(),
    writes = [];
  let timerId = 0,
    shouldBlock;
  let blocker = { state: 'unblocked' };
  const { DocumentSaveSession } = load(
    'src/features/documents/lib/documentSaveSession.ts',
    {
      setTimeout: (callback, delay) => {
        assert.equal(delay, 1500);
        timers.set(++timerId, callback);
        return timerId;
      },
      clearTimeout: (id) => timers.delete(id),
    },
  );
  const { useCompanyDocument } = load(
    'src/features/companies/hooks/useCompanyDocument.ts',
    {
      window: {
        addEventListener: (name, callback) => listeners.set(name, callback),
        removeEventListener: (name) => listeners.delete(name),
      },
      require: (name) => {
        if (name === 'react') return h.react;
        if (name === 'react-router-dom')
          return {
            useBlocker: (callback) => {
              shouldBlock = callback;
              return blocker;
            },
          };
        if (name.endsWith('documentSaveSession'))
          return { DocumentSaveSession };
        if (name.endsWith('companyDetailApi'))
          return {
            saveCompanyDocument: (id, text) =>
              new Promise((resolve, reject) =>
                writes.push({ id, text, resolve, reject }),
              ),
          };
        return { toast: { error: () => {} } };
      },
    },
  );
  const render = (initial = '保存済み') =>
    h.render(() => useCompanyDocument(8, initial));
  render().update('入力1');
  render().update('入力2');
  assert.equal(timers.size, 1);
  assert.equal(render('サーバー再取得内容').text, '入力2');
  assert.equal(writes.length, 0);
  let warned = false;
  listeners.get('beforeunload')({
    preventDefault: () => {
      warned = true;
    },
  });
  assert.equal(warned, true);
  const timer = [...timers.values()][0];
  timers.clear();
  timer();
  await new Promise(setImmediate);
  assert.equal(writes[0].text, '入力2');
  writes[0].resolve();
  await new Promise(setImmediate);
  render().update('移動前');
  assert.equal(
    shouldBlock({
      currentLocation: { pathname: '/companies/8' },
      nextLocation: { pathname: '/companies' },
    }),
    true,
  );
  let proceeded = false,
    reset = false;
  blocker = {
    state: 'blocked',
    proceed: () => {
      proceeded = true;
    },
    reset: () => {
      reset = true;
    },
  };
  render();
  await new Promise(setImmediate);
  assert.equal(timers.size, 0);
  assert.equal(proceeded, false);
  assert.equal(writes[1].text, '移動前');
  writes[1].reject(new Error('failure'));
  await new Promise(setImmediate);
  assert.equal(reset, true);
  assert.equal(proceeded, false);
  assert.equal(render().text, '移動前');
  const saving = render().save();
  await new Promise(setImmediate);
  writes[2].resolve();
  await saving;
  assert.equal(render().dirty, false);
  render().update('再移動');
  blocker = {
    state: 'blocked',
    proceed: () => {
      proceeded = true;
    },
    reset: () => {},
  };
  render();
  await new Promise(setImmediate);
  writes[3].resolve();
  await new Promise(setImmediate);
  assert.equal(proceeded, true);
});

test('initial detail fetch uses getCompanyById alone and seeds event/task/history widgets without extra requests', async () => {
  const detail = {
    name: '企業',
    document: '企業メモ',
    showBasicInfoWidget: true,
    showSelectionWidget: true,
    basicInfos: [],
    selections: [],
    tasks: [{ id: 3, title: '関連タスク', done: false, deadline: null }],
    events: [{ id: 4, title: '関連予定', startDate: '2026-10-17' }],
    activities: Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      occurredAt: '2026-10-17T12:00:00Z',
      text: '連絡',
    })),
  };
  const calls = [];
  const h = hooks();
  const { useCompanyDetail } = load(
    'src/features/companies/hooks/useCompanyDetail.ts',
    {
      require: (name) =>
        name === 'react'
          ? h.react
          : name.endsWith('companyDetailApi')
            ? {
                loadCompany: async (id) => {
                  calls.push(['detail', id]);
                  return detail;
                },
              }
            : { toast: { error: () => {} } },
    },
  );
  h.render(() => useCompanyDetail(8));
  await new Promise(setImmediate);
  const loaded = h.render(() => useCompanyDetail(8));
  assert.equal(loaded.detail, detail);
  assert.deepEqual(calls, [['detail', 8]]);
  const eventHooks = hooks();
  const { useCompanyEvents } = load(
    'src/features/companies/hooks/useCompanyEvents.ts',
    {
      require: (name) =>
        name === 'react'
          ? eventHooks.react
          : name.endsWith('calendarApi')
            ? { toCalendarEvent: (event) => event }
            : name.endsWith('companyDetailApi')
              ? {
                  loadCompanyEvents: () => {
                    throw new Error('unexpected initial events request');
                  },
                }
              : {},
    },
  );
  assert.equal(
    eventHooks.render(() => useCompanyEvents(8, [], detail.events)).events[0]
      .title,
    '関連予定',
  );
  const taskHooks = hooks();
  const { useCompanyTasks } = load(
    'src/features/companies/hooks/useCompanyTasks.ts',
    {
      require: (name) =>
        name === 'react'
          ? taskHooks.react
          : name.endsWith('taskApi')
            ? {
                loadTasks: () => {
                  throw new Error('unexpected initial tasks request');
                },
              }
            : {},
    },
  );
  assert.equal(
    taskHooks.render(() => useCompanyTasks(8, detail.tasks, [])).tasks[0].title,
    '関連タスク',
  );
  const activityHooks = hooks();
  const pages = [];
  const { useCompanyActivities } = load(
    'src/features/companies/hooks/useCompanyActivities.ts',
    {
      require: (name) =>
        name === 'react'
          ? activityHooks.react
          : name.endsWith('companyListApi')
            ? {
                loadCompanyActivities: async (id, page) => {
                  pages.push(page);
                  return [
                    {
                      id: 30,
                      occurredAt: '2026-10-01T00:00:00Z',
                      text: '以前',
                    },
                  ];
                },
              }
            : { toast: { error: () => {} } },
    },
  );
  const render = () =>
    activityHooks.render(() => useCompanyActivities(8, detail.activities));
  assert.equal(render().activities.length, 20);
  assert.deepEqual(pages, []);
  await render().loadNext();
  assert.deepEqual(pages, [1]);
  assert.equal(render().activities.length, 21);
  assert.equal(render().activities[0].text, '以前');
  assert.equal(render().hasMore, false);
});

test('selection drop reorders only the dragged step', async () => {
  const { api, calls } = setup(async () => response(null, 204));
  const previous = api.selectionViews({
    selections: [
      {
        id: 3,
        title: '選考',
        steps: [1, 2, 3, 4].map((id) => ({
          id,
          name: String(id),
          status: 'NOT_STARTED',
        })),
      },
    ],
  })[0];
  const next = {
    ...previous,
    steps: [...previous.steps.slice(1), previous.steps[0]].map(
      (step, index) => ({ ...step, stepNo: index + 1 }),
    ),
  };
  await api.saveSelection(8, next, previous, undefined, 1);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/companies/8/selections/3/steps/1/position');
  assert.deepEqual(JSON.parse(calls[0].body), { nextSelectionStepId: null });
});
