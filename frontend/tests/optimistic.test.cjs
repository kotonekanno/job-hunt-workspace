const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const tick = () => new Promise(setImmediate);
const json = (data, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(data), { status });
function harness(initial) {
  const slots = [],
    effects = [],
    calls = [],
    writes = [],
    errors = [];
  let cursor = 0;
  const react = {
    useState(value) {
      const i = cursor++;
      if (!(i in slots))
        slots[i] = typeof value === 'function' ? value() : value;
      return [
        slots[i],
        (next) => {
          slots[i] = typeof next === 'function' ? next(slots[i]) : next;
        },
      ];
    },
    useRef(value) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: value };
      return slots[i];
    },
    useMemo(fn, deps) {
      const i = cursor++;
      if (!slots[i] || deps.some((dep, j) => !Object.is(dep, slots[i].deps[j])))
        slots[i] = { deps, value: fn() };
      return slots[i].value;
    },
    useCallback(fn, deps) {
      return react.useMemo(() => fn, deps);
    },
    useEffect(effect, deps) {
      const i = cursor++,
        before = slots[i];
      if (!before || deps.some((dep, j) => !Object.is(dep, before.deps[j])))
        effects.push(() => {
          before?.cleanup?.();
          slots[i] = { deps, cleanup: effect() };
        });
    },
  };
  const cache = new Map();
  function load(file) {
    const full = path.resolve(__dirname, '..', file);
    if (cache.has(full)) return cache.get(full);
    const output = ts.transpileModule(readFileSync(full, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    const exports = {};
    cache.set(full, exports);
    runInNewContext(output, {
      exports,
      AbortController,
      URLSearchParams,
      setTimeout,
      clearTimeout,
      setInterval: () => 1,
      clearInterval: () => {},
      fetch: async (url, options) => {
        const call = { url, ...options };
        calls.push(call);
        if (options.method === 'GET') return json(initial(url));
        return new Promise((resolve) => writes.push({ ...call, resolve }));
      },
      require(name) {
        if (name === 'react') return react;
        if (name === '@/shared/toast')
          return { toast: { error: (message) => errors.push(message) } };
        if (name === '@/features/auth/model/accessToken')
          return { getAccessToken: () => 'token' };
        if (name.startsWith('@/') || name.startsWith('.')) {
          const base = name.startsWith('@/')
            ? path.join(__dirname, '../src', name.slice(2))
            : path.resolve(path.dirname(full), name);
          const target = existsSync(`${base}.ts`)
            ? `${base}.ts`
            : `${base}.tsx`;
          return load(target);
        }
        return require(name);
      },
    });
    return exports;
  }
  return {
    load,
    calls,
    writes,
    errors,
    render(fn) {
      cursor = 0;
      const value = fn();
      effects.splice(0).forEach((effect) => effect());
      return value;
    },
    gets: () => calls.filter((call) => call.method === 'GET').length,
    accept(data = {}, status = 204) {
      const request = writes.shift();
      assert.ok(request, 'pending write');
      request.resolve(json(data, status));
      return request;
    },
  };
}
const companies = [
  { id: 8, name: '企業', priority: 4, currentSelection: null },
  { id: 9, name: '別企業', priority: 1, currentSelection: null },
];

test('tasks create with server IDs, rollback failure and delete without another GET', async () => {
  const h = harness((url) =>
    url.startsWith('/companies') ? { companies } : { tasks: [] },
  );
  const { useTasks } = h.load('src/features/task/hooks/useTasks.ts');
  const render = () => h.render(useTasks);
  render();
  await tick();
  const initialGets = h.gets();
  const saving = render().saveTask({
    title: '準備',
    note: '',
    deadline: null,
    companyName: '企業',
    done: false,
  });
  assert.equal(render().tasks[0].title, '準備');
  assert.ok(render().tasks[0].id < 0);
  h.accept({ taskId: 42 }, 201);
  assert.equal(await saving, true);
  assert.equal(render().tasks[0].id, 42);
  render().toggleTask(42);
  assert.equal(render().tasks[0].done, true);
  h.accept({}, 500);
  await tick();
  assert.equal(render().tasks[0].done, false);
  render().deleteTask(42);
  assert.equal(render().tasks.length, 0);
  assert.equal(h.accept().url, '/tasks/42');
  await tick();
  assert.equal(h.gets(), initialGets);
});

test('company tasks remove a moved task locally and restore it if PATCH fails', async () => {
  const h = harness(() => {
    throw new Error('unexpected GET');
  });
  const { useCompanyTasks } = h.load(
    'src/features/companies/hooks/useCompanyTasks.ts',
  );
  const initial = [
    {
      id: 5,
      companyName: '企業',
      title: '応募',
      note: '',
      deadline: null,
      done: false,
    },
  ];
  const render = () => h.render(() => useCompanyTasks(8, initial, companies));
  const saving = render().saveTask({ ...initial[0], companyName: '別企業' });
  assert.equal(render().tasks.length, 0);
  const request = h.accept({}, 500);
  assert.equal(JSON.parse(request.body).companyId, 9);
  assert.equal(await saving, false);
  assert.equal(render().tasks[0].id, 5);
  assert.equal(h.gets(), 0);
});

test('calendar keeps displayed and upcoming lists coherent during create, move, failure and delete without refetch', async () => {
  const h = harness((url) =>
    url.startsWith('/companies') ? { companies } : { events: [] },
  );
  const { useCalendar } = h.load('src/features/calendar/hooks/useCalendar.ts');
  const render = () => h.render(useCalendar);
  render();
  await tick();
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const form = {
    title: '面接',
    company: '企業',
    note: '',
    category: 'INTERVIEW',
    isAllDay: true,
    isOnline: false,
    startDate: date,
    endDate: date,
  };
  const initialGets = h.gets();
  const saving = render().saveEvent(form);
  assert.equal(render().events.length, 1);
  assert.equal(render().upcomingEvents.length, 1);
  h.accept({ eventId: 44 }, 201);
  await saving;
  assert.equal(render().events[0].id, 44);
  const moved = render().saveEvent(
    { ...form, startDate: '2099-12-01', endDate: '2099-12-01' },
    44,
  );
  assert.equal(render().events.length, 0);
  assert.equal(render().upcomingEvents.length, 0);
  h.accept({}, 500);
  await moved;
  assert.equal(render().events[0].id, 44);
  assert.equal(render().upcomingEvents[0].id, 44);
  const deleted = render().deleteEvent(44);
  assert.equal(render().events.length, 0);
  h.accept();
  await deleted;
  assert.equal(h.gets(), initialGets);
});

test('company event CRUD uses only writes and keeps other company events out of the widget', async () => {
  const h = harness(() => {
    throw new Error('unexpected GET');
  });
  const { useCompanyEvents } = h.load(
    'src/features/companies/hooks/useCompanyEvents.ts',
  );
  const render = () => h.render(() => useCompanyEvents(8, companies, []));
  const form = {
    title: '面接',
    company: '企業',
    note: '',
    category: 'INTERVIEW',
    isAllDay: true,
    isOnline: false,
    startDate: '2026-10-17',
    endDate: '2026-10-17',
  };
  const added = render().saveEvent(form);
  assert.equal(render().events.length, 1);
  h.accept({ eventId: 7 }, 201);
  await added;
  const moved = render().saveEvent({ ...form, company: '別企業' }, 7);
  assert.equal(render().events.length, 0);
  h.accept();
  await moved;
  assert.equal(h.gets(), 0);
});

test('essay group creation retains server ID, counts update locally and deleting a group moves counts to unclassified', async () => {
  const h = harness((url) =>
    url.startsWith('/companies')
      ? { companies }
      : { essayGroups: [{ id: null, name: '未分類', quantity: 1 }] },
  );
  const { useEssayGroups } = h.load(
    'src/features/essay/hooks/useEssayGroups.ts',
  );
  const render = () => h.render(useEssayGroups);
  render();
  await tick();
  const initialGets = h.gets();
  const added = render().addGroup('志望動機');
  assert.ok(render().groups[0].id < 0);
  h.accept({ essayGroupId: 4 }, 201);
  await added;
  assert.equal(render().groups[0].id, 4);
  const essay = render().addEssay({
    groupId: '4',
    question: '設問',
    answer: '',
    company: '企業',
  });
  assert.equal(render().groups[0].quantity, 1);
  h.accept({ essayId: 90 }, 201);
  await essay;
  const deleted = render().deleteGroup(4);
  assert.equal(render().groups.length, 1);
  assert.equal(render().groups[0].quantity, 2);
  h.accept({}, 500);
  await deleted;
  assert.equal(render().groups[0].id, 4);
  assert.equal(render().groups[1].quantity, 1);
  assert.equal(h.gets(), initialGets);
});

test('essay edits, creation, moving and deletion retain IDs/counts without refetch', async () => {
  const groups = [
    { id: 4, name: '志望動機', quantity: 1 },
    { id: null, name: '未分類', quantity: 0 },
  ];
  const h = harness((url) =>
    url.startsWith('/companies')
      ? { companies }
      : url === '/essay-groups'
        ? { essayGroups: groups }
        : { essays: [{ id: 1, question: '設問', answer: '回答' }] },
  );
  const { useEssayGroup } = h.load('src/features/essay/hooks/useEssayGroup.ts');
  const render = () => h.render(() => useEssayGroup('4'));
  render();
  await tick();
  const initialGets = h.gets();
  const edited = render().updateEssay(1, { answer: '変更' });
  assert.equal(render().essays[0].answer, '変更');
  h.accept({}, 500);
  await edited;
  assert.equal(render().essays[0].answer, '回答');
  const added = render().addEssay({
    groupId: '4',
    question: '追加',
    answer: '',
  });
  h.accept({ essayId: 90 }, 201);
  await added;
  assert.equal(render().essays[1].id, 90);
  const moved = render().moveEssay(render().essays[1], 'unclassified');
  assert.equal(render().essays.length, 1);
  assert.equal(render().groups[1].quantity, 1);
  h.accept();
  await moved;
  const deleted = render().deleteEssay(1);
  h.accept();
  await deleted;
  assert.equal(render().groups[0].quantity, 0);
  assert.equal(h.gets(), initialGets);
});

test('company list create/reorder saves locally and keeps POST IDs', async () => {
  const h = harness(() => ({ companies }));
  const { useCompanyList } = h.load(
    'src/features/companies/hooks/useCompanyList.ts',
  );
  const render = () => h.render(useCompanyList);
  render();
  await tick();
  const initialGets = h.gets();
  const added = render().addCompany({ name: '追加企業', priority: 6 });
  assert.ok(render().companies.at(-1).id < 0);
  h.accept({ companyId: 77 }, 201);
  await added;
  assert.equal(render().companies.at(-1).id, 77);
  const next = render().companies.map((item) =>
    item.id === 77 ? { ...item, priority: 7 } : item,
  );
  const reordered = render().reorderCompanies(next, 77);
  assert.equal(render().companies.at(-1).priority, 7);
  h.accept({}, 500);
  await reordered;
  assert.equal(render().companies.at(-1).priority, 6);
  assert.equal(h.gets(), initialGets);
});

test('activity CRUD is optimistic and does not refetch; subsequent pagination handles the shifted boundary', async () => {
  const h = harness(() => ({ activities: [] }));
  const { useCompanyActivities } = h.load(
    'src/features/companies/hooks/useCompanyActivities.ts',
  );
  const seed = Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    occurredAt: '2026-10-17T00:00:00Z',
    text: '履歴',
    byUser: false,
  }));
  const render = () => h.render(() => useCompanyActivities(8, seed));
  render();
  const added = render().create('追加', true);
  assert.equal(render().activities.length, 21);
  h.accept({ activityId: 77 }, 201);
  await added;
  assert.ok(render().activities.some((item) => item.id === 77));
  const edited = render().update(77, { text: '編集' });
  assert.equal(render().activities.find((item) => item.id === 77).text, '編集');
  h.accept({}, 500);
  await edited;
  assert.equal(render().activities.find((item) => item.id === 77).text, '追加');
  const removed = render().remove(1);
  assert.equal(render().activities.length, 20);
  h.accept();
  await removed;
  assert.equal(h.gets(), 0);
  await render().loadNext();
  assert.equal(h.calls.at(-1).url, '/companies/8/activities?page=1');
});

test('company detail displays API priority and selection creation reconciles every returned ID without refetch', async () => {
  const h = harness(() => ({
    name: '企業',
    priority: 5,
    document: '',
    showBasicInfoWidget: true,
    showSelectionWidget: true,
    basicInfos: [],
    activities: [],
    selections: [],
    activeSelectionId: null,
    events: [],
    tasks: [],
  }));
  const { useCompanyDetail } = h.load(
    'src/features/companies/hooks/useCompanyDetail.ts',
  );
  const { useSelectionProgress } = h.load(
    'src/features/companies/hooks/useSelectionProgress.ts',
  );
  const render = () =>
    h.render(() => {
      const company = useCompanyDetail(8);
      return {
        company,
        selection: company.detail
          ? useSelectionProgress(8, company.detail, company.mutate)
          : undefined,
      };
    });
  render();
  await tick();
  assert.equal(render().company.detail.priority, 5);
  const draft = {
    id: -1,
    title: '本選考',
    isActive: false,
    currentStep: -2,
    steps: [
      {
        id: -2,
        stepNo: 1,
        title: '書類',
        note: '',
        heldAt: '',
        status: 'not_started',
      },
      {
        id: -3,
        stepNo: 2,
        title: '面接',
        note: '',
        heldAt: '',
        status: 'not_started',
      },
    ],
  };
  const added = render().selection.saveTrack(draft);
  assert.equal(render().selection.tracks[0].id, -1);
  h.accept({ selectionId: 20, selectionStepIds: [21, 22] }, 201);
  await added;
  assert.equal(render().selection.tracks[0].id, 20);
  assert.deepEqual(
    Array.from(render().selection.tracks[0].steps, (step) => step.id),
    [21, 22],
  );
  const active = render().selection.setActive(20);
  assert.equal(render().company.detail.activeSelectionId, 20);
  h.accept();
  await active;
  const track = render().selection.tracks[0];
  const edited = render().selection.saveTrack({
    ...track,
    steps: track.steps.map((step) =>
      step.id === 21 ? { ...step, note: '変更' } : step,
    ),
  });
  assert.equal(render().selection.tracks[0].steps[0].note, '変更');
  assert.equal(h.accept({}, 500).url, '/companies/8/selections/20/steps/21');
  await edited;
  assert.equal(render().selection.tracks[0].steps[0].note, '');
  const deleted = render().selection.removeTrack(20);
  assert.equal(render().selection.tracks.length, 0);
  assert.equal(render().company.detail.activeSelectionId, null);
  h.accept();
  await deleted;
  assert.equal(h.gets(), 1);
});

test('concurrent mutation is rejected and external state replacement is not overwritten by an old failed request', async () => {
  const h = harness(() => ({}));
  const { useOptimisticState } = h.load('src/shared/useOptimisticState.ts');
  const render = () => h.render(() => useOptimisticState([1]));
  let fail;
  const first = render().mutate(
    () => [2],
    () =>
      new Promise((resolve, reject) => {
        fail = reject;
      }),
  );
  assert.equal(
    await render().mutate(
      () => [3],
      async () => {
        throw new Error('must not send');
      },
    ),
    false,
  );
  render().setValue([4]);
  fail(new Error('network'));
  assert.equal(await first, false);
  assert.deepEqual(render().value, [4]);
});

test('a multi-request selection edit keeps acknowledged IDs and changes when a later write fails', async () => {
  const h = harness(() => ({
    name: '企業',
    priority: 1,
    document: '',
    showBasicInfoWidget: true,
    showSelectionWidget: true,
    basicInfos: [],
    activities: [],
    selections: [
      {
        id: 3,
        title: '本選考',
        currentStepId: 10,
        steps: [
          { id: 10, name: '書類', note: '', status: 'PENDING' },
          { id: 11, name: '面接', note: '', status: 'NOT_STARTED' },
        ],
      },
    ],
    activeSelectionId: 3,
    events: [],
    tasks: [],
  }));
  const { useCompanyDetail } = h.load(
    'src/features/companies/hooks/useCompanyDetail.ts',
  );
  const { useSelectionProgress } = h.load(
    'src/features/companies/hooks/useSelectionProgress.ts',
  );
  const render = () =>
    h.render(() => {
      const company = useCompanyDetail(8);
      return company.detail
        ? useSelectionProgress(8, company.detail, company.mutate)
        : undefined;
    });
  render();
  await tick();
  const original = render().tracks[0];
  const saving = render().saveTrack({
    ...original,
    title: '更新済み',
    steps: [
      { ...original.steps[1], stepNo: 1, note: '変更' },
      {
        id: -5,
        title: '追加',
        note: '',
        heldAt: '',
        status: 'not_started',
        stepNo: 2,
      },
      { ...original.steps[0], stepNo: 3 },
    ],
  });
  h.accept();
  await tick(); // title
  h.accept();
  await tick(); // move step 10
  h.accept({ selectionStepId: 100 }, 201);
  await tick();
  h.accept({}, 500);
  assert.equal(await saving, false);
  assert.equal(render().tracks[0].title, '更新済み');
  assert.deepEqual(
    Array.from(render().tracks[0].steps, (step) => step.id),
    [11, 100, 10],
  );
  assert.equal(render().tracks[0].steps[0].note, '');
  assert.equal(h.gets(), 1);
});

test('home initially fetches only dashboard, preserves server counts/order and rolls back task completion', async () => {
  const data = {
    counts: { companies: 20, undoneTasks: 8, upcomingEvents: 15, essays: 30 },
    tasks: [{ id: 41, title: '提出', done: false, deadline: '2026-10-18' }],
    companies: [companies[0], companies[1]],
    events: [
      {
        id: 21,
        title: '面接',
        category: 'INTERVIEW',
        isAllDay: true,
        isOnline: false,
        startDay: '2026-10-20',
        endDay: '2026-10-20',
      },
    ],
  };
  const h = harness((url) => {
    assert.equal(url, '/dashboard');
    return data;
  });
  const { useDashboard } = h.load('src/features/home/hooks/useDashboard.ts');
  const render = () => h.render(useDashboard);
  assert.equal(render().dashboard, undefined);
  await tick();
  assert.equal(h.gets(), 1);
  assert.equal(h.calls[0].credentials, 'include');
  assert.equal(h.calls[0].headers.Authorization, 'Bearer token');
  assert.equal(render().dashboard.counts.companies, 20);
  assert.deepEqual(
    Array.from(render().dashboard.companies, (item) => item.id),
    [8, 9],
  );
  render().toggleTask(41);
  assert.equal(render().dashboard.tasks[0].done, true);
  assert.equal(render().dashboard.counts.undoneTasks, 7);
  const failed = h.accept({}, 500);
  assert.equal(failed.url, '/tasks/41');
  assert.equal(failed.method, 'PATCH');
  assert.deepEqual(JSON.parse(failed.body), { done: true });
  await tick();
  assert.equal(render().dashboard.tasks[0].done, false);
  assert.equal(render().dashboard.counts.undoneTasks, 8);
  render().toggleTask(41);
  h.accept();
  await tick();
  assert.equal(render().dashboard.tasks[0].done, true);
  assert.equal(render().dashboard.counts.undoneTasks, 7);
  assert.equal(h.gets(), 1);
});

test('home selection updates optimistically, resolves selection ID only on action and never refreshes after PUT', async () => {
  const data = {
    counts: { companies: 1, undoneTasks: 0, upcomingEvents: 0, essays: 0 },
    tasks: [],
    events: [],
    companies: [
      {
        ...companies[0],
        currentSelection: {
          title: '本選考',
          step: { id: 22, name: '面接', status: 'PENDING' },
        },
      },
    ],
  };
  const h = harness((url) => {
    if (url === '/dashboard') return data;
    assert.equal(url, '/companies/8');
    return {
      activeSelectionId: 3,
      selections: [{ id: 3, steps: [{ id: 22 }] }],
    };
  });
  const { useDashboard } = h.load('src/features/home/hooks/useDashboard.ts');
  const render = () => h.render(useDashboard);
  render();
  await tick();
  assert.equal(h.gets(), 1);
  render().updateSelectionResult(8, 'PASSED');
  assert.equal(
    render().dashboard.companies[0].currentSelection.step.status,
    'PASSED',
  );
  await tick();
  const request = h.accept();
  assert.equal(request.method, 'PUT');
  assert.deepEqual(JSON.parse(request.body), { status: 'PASSED' });
  await tick();
  assert.equal(h.gets(), 2);
  assert.equal(render().dashboard.companies[0].currentSelection.step.id, 22);
  render().updateSelectionResult(8, 'FAILED');
  await tick();
  h.accept({}, 500);
  await tick();
  assert.equal(
    render().dashboard.companies[0].currentSelection.step.status,
    'PASSED',
  );
  assert.equal(h.gets(), 3);
});

test('home reports load failure without falling back to mock data', async () => {
  const h = harness(() => {
    throw new Error('offline');
  });
  const { useDashboard } = h.load('src/features/home/hooks/useDashboard.ts');
  h.render(useDashboard);
  await tick();
  assert.equal(h.render(useDashboard).dashboard, undefined);
  assert.equal(h.errors.length, 1);
  assert.equal(h.gets(), 1);
});
