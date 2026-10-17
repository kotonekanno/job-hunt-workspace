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
  runInNewContext(outputText, {
    exports,
    require,
    AbortController,
    ...globals,
  });
  return exports;
}
function setup(respond) {
  const calls = [];
  const generated = load('src/api/generated/api.ts', {
    URLSearchParams,
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      return respond(url, options);
    },
  });
  const api = load('src/features/companies/lib/companyListApi.ts', {
    require: (name) =>
      name === '@/api/generated/api'
        ? generated
        : { getAccessToken: () => 'token' },
  });
  return { api, calls };
}
const company = (id, priority = 1) => ({
  id,
  priority,
  name: `企業${id}`,
  currentSelection: null,
});
const board = load('src/features/companies/lib/companyBoard.ts');

test('list, creation and history use generated endpoints and zero-based pages', async () => {
  const { api, calls } = setup(
    async (url, options) =>
      new Response(
        JSON.stringify(
          url.includes('activities')
            ? { activities: [{ id: 3 }] }
            : { companies: [company(1)] },
        ),
        {
          status:
            options.method === 'POST' || url.includes('activities') ? 201 : 200,
        },
      ),
  );
  assert.equal((await api.loadCompanies())[0].id, 1);
  await api.addCompanyRequest({ name: '追加', priority: 6 });
  const signal = new AbortController().signal;
  for (const page of [0, 1])
    assert.equal((await api.loadCompanyActivities(1, page, signal))[0].id, 3);
  assert.deepEqual(
    calls.map((call) => call.url),
    [
      '/companies',
      '/companies',
      '/companies/1/activities?page=0',
      '/companies/1/activities?page=1',
    ],
  );
  assert.deepEqual(JSON.parse(calls[1].body), { name: '追加', priority: 6 });
  assert.equal(calls[2].signal, signal);
  assert.ok(
    calls.every(
      (call) =>
        call.credentials === 'include' &&
        call.headers.Authorization === 'Bearer token',
    ),
  );
});

test('filtered reorder preserves hidden companies and saves lane changes with valid next IDs', async () => {
  const previous = [company(1), company(2), company(3), company(4, 7)];
  const desired = board.mergeVisibleCompanyOrder(previous, [
    company(3),
    company(1, 7),
  ]);
  assert.deepEqual(
    Array.from(desired, (c) => c.id),
    [3, 2, 1, 4],
  );
  const server = previous.map((c) => ({ ...c }));
  const { api, calls } = setup(async (url, options) => {
    const id = Number(url.split('/')[2]);
    const request = JSON.parse(options.body);
    const index = server.findIndex((c) => c.id === id);
    const [item] = server.splice(index, 1);
    item.priority = request.priority;
    const next =
      request.nextCompanyId === null
        ? server.length
        : server.findIndex(
            (c) =>
              c.id === request.nextCompanyId && c.priority === item.priority,
          );
    assert.ok(next >= 0);
    server.splice(next, 0, item);
    return new Response(null, { status: 204 });
  });
  await api.persistCompanyOrder(previous, desired);
  for (const priority of [1, 7])
    assert.deepEqual(
      server.filter((c) => c.priority === priority).map((c) => c.id),
      Array.from(
        desired.filter((c) => c.priority === priority),
        (c) => c.id,
      ),
    );
  const count = calls.length;
  await api.persistCompanyOrder(desired, desired);
  assert.equal(calls.length, count);
  await assert.rejects(
    api.persistCompanyOrder(previous, [company(1), company(1)]),
  );
});

test('status update resolves active selection ID and rejects stale list data', async () => {
  let currentStepId = 9;
  let steps = [{ id: 9 }];
  const { api, calls } = setup(async (url, options) =>
    options.method === 'GET'
      ? new Response(
          JSON.stringify({
            activeSelectionId: 8,
            selections: [{ id: 8, currentStepId, steps }],
          }),
          { status: 200 },
        )
      : new Response(null, { status: 204 }),
  );
  const item = {
    ...company(1),
    currentSelection: {
      title: '本選考',
      step: { id: 9, name: '面接', status: 'PENDING' },
    },
  };
  await api.changeCompanyStatus(item, 'PASSED');
  assert.equal(calls[1].url, '/companies/1/selections/8/steps/9/status');
  assert.deepEqual(JSON.parse(calls[1].body), { status: 'PASSED' });
  currentStepId = 10;
  await api.changeCompanyStatus(item, 'FAILED');
  assert.equal(calls[3].url, '/companies/1/selections/8/steps/9/status');
  steps = [{ id: 10 }];
  await assert.rejects(api.changeCompanyStatus(item, 'FAILED'));
  await api.changeCompanyStatus({ ...item, priority: 7 }, 'FAILED');
  await api.changeCompanyStatus(company(2), 'FAILED');
  assert.equal(calls.length, 5);
});

test('history only loads initial page automatically, prevents concurrent requests and retries same page', async () => {
  const calls = [],
    effects = [],
    slots = [];
  let cursor = 0;
  const react = {
    useState: (value) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = value;
      return [
        slots[i],
        (next) => {
          slots[i] = next;
        },
      ];
    },
    useRef: (value) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: value };
      return slots[i];
    },
    useCallback: (callback) => callback,
    useEffect: (effect) => effects.push(effect),
  };
  const hook = load('src/features/companies/hooks/useCompanyActivities.ts', {
    require: (name) =>
      name === 'react'
        ? react
        : name === '@/shared/toast'
          ? { toast: { error: () => {} } }
          : {
              loadCompanyActivities: (id, page, signal) =>
                new Promise((resolve, reject) =>
                  calls.push({ id, page, signal, resolve, reject }),
                ),
            },
  });
  const render = () => {
    cursor = 0;
    return hook.useCompanyActivities(7);
  };
  let view = render();
  assert.equal(calls.length, 0);
  const cleanup = effects[0]();
  assert.equal(calls[0].page, 0);
  await view.loadNext();
  assert.equal(calls.length, 1);
  calls[0].resolve(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      occurredAt: '2026-10-01T00:00:00Z',
      text: '履歴',
    })),
  );
  await new Promise(setImmediate);
  assert.equal(calls.length, 1);
  view = render();
  assert.equal(view.activities.length, 20);
  const failed = view.loadNext();
  calls[1].reject(new Error('network'));
  await failed;
  const retry = view.loadNext();
  assert.deepEqual(
    calls.map((call) => call.page),
    [0, 1, 1],
  );
  calls[2].resolve([
    { id: 1, occurredAt: '2026-10-01T00:00:00Z', text: '重複' },
    { id: 21, occurredAt: '2026-09-01T00:00:00Z', text: '以前' },
  ]);
  await retry;
  view = render();
  assert.equal(view.activities.length, 21);
  assert.equal(view.activities[0].id, 21);
  assert.equal(view.hasMore, false);
  await view.loadNext();
  assert.equal(calls.length, 3);
  cleanup();
  assert.equal(calls[0].signal.aborted, true);
});

function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const found = find(child, predicate);
    if (found) return found;
  }
}
test('archive hides activity and badge; null selection retains badge space', () => {
  const { CompanyListCard } = load(
    'src/features/companies/ui/list/CompanyListCard.tsx',
    {
      require: (name) => {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'motion/react')
          return { useDragControls: () => ({}), Reorder: {} };
        if (name === 'react-router-dom') return { useNavigate: () => () => {} };
        if (name.endsWith('companyBoard')) return board;
        if (name === '@/lib/utils')
          return { cn: (...parts) => parts.filter(Boolean).join(' ') };
        return new Proxy({}, { get: (_, key) => key });
      },
    },
  );
  const props = {
    ...company(1),
    latestActivity: '連絡',
    currentSelection: {
      title: '本選考',
      step: { id: 9, name: '面接', status: 'PENDING' },
    },
  };
  const normal = CompanyListCard({ company: props });
  assert.ok(find(normal, (n) => n.type === 'SelectionStepBadge'));
  assert.equal(
    find(normal, (n) => n.type === 'HoverCard').props.openOnHover,
    false,
  );
  const archive = CompanyListCard({ company: { ...props, priority: 7 } });
  assert.equal(
    find(
      archive,
      (n) => n.type === 'SelectionStepBadge' || n.type === 'HoverCard',
    ),
    undefined,
  );
  const empty = CompanyListCard({
    company: { ...props, currentSelection: null },
  });
  assert.equal(
    find(empty, (n) => n.type === 'SelectionStepBadge'),
    undefined,
  );
  assert.ok(
    find(empty, (n) => n.props?.className === 'inline-flex h-7 w-20 shrink-0'),
  );
});

test('drag preview sends no writes, drop saves once, cancellation discards preview', async () => {
  let cancelSession;
  const writes = [];
  const { CompanyPriorityBoard } = load(
    'src/features/companies/ui/list/CompanyPriorityBoard.tsx',
    {
      require: (name) => {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react')
          return {
            useMemo: (fn) => fn(),
            useState: (value) => [value, () => {}],
            useRef: (value) => ({ current: value }),
          };
        if (name === 'motion/react')
          return { Reorder: { Group: 'group', Item: 'item' } };
        if (name.endsWith('companyBoard')) return board;
        if (name.endsWith('useListDragSession'))
          return {
            useListDragSession: () => ({
              startDragSession: (cancel) => {
                cancelSession = cancel;
              },
              endDragSession: () => {},
            }),
          };
        return new Proxy({}, { get: (_, key) => key });
      },
    },
  );
  const tree = CompanyPriorityBoard({
    companies: [company(1), company(2)],
    onCompaniesReorder: async (items) => {
      writes.push(items);
      return true;
    },
  });
  const card = find(tree, (n) => n.type === 'CompanyListCard');
  const group = find(tree, (n) => n.type === 'group');
  const next = board.companyBoardIds([company(2), company(1)]);
  card.props.onDragSessionStart(() => {});
  group.props.onReorder(next);
  assert.equal(writes.length, 0);
  await card.props.onDragSessionEnd();
  await card.props.onDragSessionEnd();
  assert.deepEqual(
    Array.from(writes[0], (item) => item.id),
    [2, 1],
  );
  card.props.onDragSessionStart(() => {});
  group.props.onReorder(next);
  cancelSession();
  await card.props.onDragSessionEnd();
  assert.equal(writes.length, 1);
});

test('history accepts actual HTTP 200 and documented 201 without treating success as failure', async () => {
  const activities = [
    {
      id: 4,
      occurredAt: '2026-10-17T12:00:00+09:00',
      byUser: false,
      text: '面接のご案内',
    },
  ];
  for (const status of [200, 201]) {
    const { api } = setup(
      async () => new Response(JSON.stringify({ activities }), { status }),
    );
    assert.equal(
      JSON.stringify(await api.loadCompanyActivities(1, 0)),
      JSON.stringify(activities),
    );
    const empty = setup(async () => new Response('{}', { status }));
    assert.equal((await empty.api.loadCompanyActivities(1, 0)).length, 0);
  }
  for (const status of [400, 401, 403, 404, 500]) {
    const { api } = setup(async () => new Response('{}', { status }));
    await assert.rejects(
      api.loadCompanyActivities(1, 0),
      /やりとり履歴を取得できませんでした/,
    );
  }
});

test('badge updates immediately, keeps displayed step after success and rolls back failure without refetching', async () => {
  const slots = [],
    effects = [],
    writes = [],
    errors = [];
  let cursor = 0,
    reads = 0;
  const initial = {
    ...company(1),
    currentSelection: {
      title: '本選考',
      step: { id: 9, name: '面接', status: 'PENDING' },
    },
  };
  const react = {
    useState: (value) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = value;
      return [
        slots[i],
        (next) => {
          slots[i] = typeof next === 'function' ? next(slots[i]) : next;
        },
      ];
    },
    useRef: (value) => {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: value };
      return slots[i];
    },
    useMemo: (fn) => fn(),
    useEffect: (effect) => effects.push(effect),
  };
  const { useCompanyList } = load(
    'src/features/companies/hooks/useCompanyList.ts',
    {
      require: (name) => {
        if (name === 'react') return react;
        if (name.endsWith('companyBoard')) return board;
        if (name === '@/shared/toast')
          return { toast: { error: (message) => errors.push(message) } };
        return {
          loadCompanies: async () => {
            reads++;
            return [initial];
          },
          changeCompanyStatus: (item, status) =>
            new Promise((resolve, reject) =>
              writes.push({ item, status, resolve, reject }),
            ),
        };
      },
    },
  );
  const render = () => {
    cursor = 0;
    return useCompanyList();
  };
  render();
  const cleanup = effects[0]();
  await new Promise(setImmediate);
  render().updateSelectionResult(1, 'PASSED');
  assert.equal(render().companies[0].currentSelection.step.status, 'PASSED');
  assert.equal(writes[0].status, 'PASSED');
  writes[0].resolve();
  await new Promise(setImmediate);
  assert.equal(reads, 1);
  assert.equal(render().companies[0].currentSelection.step.id, 9);
  assert.equal(render().companies[0].currentSelection.step.name, '面接');
  render().updateSelectionResult(1, 'FAILED');
  assert.equal(render().companies[0].currentSelection.step.status, 'FAILED');
  writes[1].reject(new Error('failure'));
  await new Promise(setImmediate);
  assert.equal(render().companies[0].currentSelection.step.status, 'PASSED');
  assert.equal(reads, 1);
  assert.equal(errors.length, 1);
  cleanup();
});
