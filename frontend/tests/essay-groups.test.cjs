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
  runInNewContext(outputText, { exports, require, ...globals });
  return exports;
}
function setup(status = 204, data = {}, respond) {
  const calls = [];
  const generated = load('src/api/generated/api.ts', {
    URLSearchParams,
    fetch: async (url, options) => {
      calls.push({ url, ...options });
      if (respond) return respond(url, options);
      return new Response(status === 204 ? null : JSON.stringify(data), {
        status,
      });
    },
  });
  const api = load('src/features/essay/lib/essayGroupsApi.ts', {
    require: (name) => {
      if (name === '@/api/generated/api') return generated;
      if (name === '@/features/auth/model/accessToken')
        return { getAccessToken: () => 'token' };
      throw new Error(name);
    },
  });
  return { api, calls };
}
const groups = [
  { id: 1, name: '志望動機', quantity: 12 },
  { id: 2, name: '自己PR', quantity: 5 },
  { id: null, name: '未分類', quantity: 3 },
];

test('list uses server quantities and order with unclassified last, without loading detail essays', async () => {
  const { api, calls } = setup(200, {
    essayGroups: [groups[2], groups[1], groups[0]],
  });
  const signal = new AbortController().signal;
  const result = await api.loadEssayGroups(signal);
  assert.deepEqual(
    Array.from(result, (group) => group.id),
    [2, 1, null],
  );
  assert.equal(result[1].quantity, 12);
  assert.equal(api.groupPathId(null), 'unclassified');
  assert.equal(api.groupPathId(2), '2');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/essay-groups');
  assert.equal(calls[0].signal, signal);
  assert.equal(calls[0].credentials, 'include');
  assert.equal(calls[0].headers.Authorization, 'Bearer token');
});

test('group creation, rename and deletion use generated endpoints', async () => {
  const created = setup(201, { essayGroupId: 7 });
  await created.api.addEssayGroupRequest('研究');
  assert.equal(created.calls[0].method, 'POST');
  assert.deepEqual(JSON.parse(created.calls[0].body), { name: '研究' });
  const { api, calls } = setup();
  await api.updateEssayGroupRequest(7, '学業');
  await api.deleteEssayGroupRequest(7);
  assert.equal(calls[0].url, '/essay-groups/7');
  assert.equal(calls[0].method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[0].body), { name: '学業' });
  assert.equal(calls[1].method, 'DELETE');
});

test('essay creation supports unclassified and maps company names to IDs', async () => {
  const { api, calls } = setup(201, { essayId: 9 });
  await api.addEssayRequest(
    { groupId: 'unclassified', question: '設問', answer: '', company: '' },
    groups,
    [],
  );
  assert.equal(calls[0].url, '/essay-groups/unclassified/essays');
  assert.deepEqual(JSON.parse(calls[0].body), {
    question: '設問',
    answer: '',
    companyId: null,
  });
  await api.addEssayRequest(
    { groupId: '2', question: '設問', answer: '回答', company: '企業A' },
    groups,
    [{ id: 8, name: '企業A' }],
  );
  assert.equal(calls[1].url, '/essay-groups/2/essays');
  assert.equal(JSON.parse(calls[1].body).companyId, 8);
  await assert.rejects(
    api.addEssayRequest(
      { groupId: 'missing', question: '設問', answer: '' },
      groups,
      [],
    ),
  );
  await assert.rejects(
    api.addEssayRequest(
      { groupId: '1', question: '設問', answer: '', company: '企業A' },
      groups,
      [
        { id: 1, name: '企業A' },
        { id: 2, name: '企業A' },
      ],
    ),
  );
  assert.equal(calls.length, 2);
});

test('reordering uses next IDs and null for last, never mutates unclassified', async () => {
  const order = [1, 2, 3];
  const { api, calls } = setup(204, {}, async (url, options) => {
    const id = Number(url.split('/')[2]);
    const { nextEssayGroupId } = JSON.parse(options.body);
    assert.equal(options.method, 'PUT');
    assert.ok(order.includes(id));
    order.splice(order.indexOf(id), 1);
    order.splice(
      nextEssayGroupId === null
        ? order.length
        : order.indexOf(nextEssayGroupId),
      0,
      id,
    );
    return new Response(null, { status: 204 });
  });
  const previous = [
    ...groups.slice(0, 2),
    { id: 3, name: '研究', quantity: 0 },
    groups[2],
  ];
  await api.saveEssayGroupOrder(previous, [3, 2, 1]);
  assert.deepEqual(order, [3, 2, 1]);
  assert.ok(calls.every((call) => !call.url.includes('unclassified')));
  const count = calls.length;
  await api.saveEssayGroupOrder(
    [previous[2], previous[1], previous[0], previous[3]],
    [3, 2, 1],
  );
  assert.equal(calls.length, count);
  await assert.rejects(api.saveEssayGroupOrder(previous, [1, 1, 3]));
});

test('API failures reject, including conflict on group creation', async () => {
  const conflict = setup(409);
  await assert.rejects(conflict.api.addEssayGroupRequest('重複'), /既に登録/);
  for (const status of [401, 403, 404, 500]) {
    const { api } = setup(status);
    await assert.rejects(api.loadEssayGroups());
    await assert.rejects(api.loadEssayCompanies());
    await assert.rejects(api.addEssayGroupRequest('研究'));
    await assert.rejects(api.updateEssayGroupRequest(1, '研究'));
    await assert.rejects(api.deleteEssayGroupRequest(1));
    await assert.rejects(
      api.addEssayRequest(
        { groupId: '1', question: '設問', answer: '回答' },
        groups,
        [],
      ),
    );
    await assert.rejects(api.saveEssayGroupOrder(groups, [2, 1]));
  }
});

test('frontend unclassidied route maps to backend unclassified, while numeric routes stay numeric', () => {
  const routes = load('src/features/essay/lib/essayRoutes.ts');
  assert.equal(routes.essayGroupUrl(null), '/essays/unclassidied');
  assert.equal(routes.essayGroupApiId('unclassidied'), 'unclassified');
  assert.equal(routes.essayGroupUrl(42), '/essays/42');
  assert.equal(routes.essayGroupApiId('42'), '42');
  for (const invalid of [
    undefined,
    '',
    'unclassified',
    'abc',
    '-1',
    '0',
    '1.2',
    '2147483648',
  ]) {
    assert.equal(routes.essayGroupApiId(invalid), undefined);
  }
});

test('detail GET accepts unclassified and uses generated response shape', async () => {
  const essays = [
    { id: 5, companyName: null, question: '設問', answer: '回答' },
  ];
  const { api, calls } = setup(200, { essays });
  const signal = new AbortController().signal;
  const result = await api.loadGroupEssays('unclassified', signal);
  assert.equal(result[0].question, '設問');
  assert.equal(calls[0].url, '/essay-groups/unclassified');
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls[0].signal, signal);
});

test('inline edit patches only the changed field and preserves an empty answer', async () => {
  const { api, calls } = setup();
  await api.updateEssayRequest('1', 5, { question: '変更した設問' });
  await api.updateEssayRequest('unclassified', 5, { answer: '' });
  assert.equal(calls[0].url, '/essay-groups/1/essays/5');
  assert.equal(calls[0].method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[0].body), { question: '変更した設問' });
  assert.equal(calls[1].url, '/essay-groups/unclassified/essays/5');
  assert.deepEqual(JSON.parse(calls[1].body), { answer: '' });
});

test('group moves patch the source route with numeric destination or null for unclassified', async () => {
  const { api, calls } = setup();
  await api.moveEssayRequest('1', 5, 'unclassified', groups);
  await api.moveEssayRequest('unclassified', 5, '2', groups);
  assert.equal(calls[0].url, '/essay-groups/1/essays/5');
  assert.deepEqual(JSON.parse(calls[0].body), { essayGroupId: null });
  assert.equal(calls[1].url, '/essay-groups/unclassified/essays/5');
  assert.deepEqual(JSON.parse(calls[1].body), { essayGroupId: 2 });
  await assert.rejects(api.moveEssayRequest('1', 5, 'missing', groups));
  assert.equal(calls.length, 2);
});

test('detail deletion uses source group path, and errors reject', async () => {
  const success = setup();
  await success.api.deleteEssayRequest('unclassified', 5);
  assert.equal(success.calls[0].url, '/essay-groups/unclassified/essays/5');
  assert.equal(success.calls[0].method, 'DELETE');
  for (const status of [400, 401, 403, 404, 500]) {
    const { api } = setup(status);
    await assert.rejects(
      api.loadGroupEssays('1'),
      (error) => error.status === status,
    );
    await assert.rejects(api.updateEssayRequest('1', 5, { answer: '回答' }));
    await assert.rejects(api.deleteEssayRequest('1', 5));
    await assert.rejects(api.moveEssayRequest('1', 5, 'unclassified', groups));
  }
});

test('inline save failure retains draft, successful retry exits editing', async () => {
  const slots = [];
  let cursor = 0;
  let succeeds = false;
  const written = [];
  const react = {
    useState: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (value) => {
          slots[index] = value;
        },
      ];
    },
    useRef: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
  };
  const { InlineEssayField } = load(
    'src/features/essay/ui/InlineEssayField.tsx',
    {
      require: (name) => {
        if (name === 'react') return react;
        if (name === 'react/jsx-runtime') return require(name);
        if (name === '@/shared/InlineEditActions')
          return { InlineEditActions: 'actions' };
        if (name === '@/shared/InlineTextarea')
          return { InlineTextarea: 'textarea' };
        return { Pencil: 'icon' };
      },
    },
  );
  function find(node, match) {
    if (!node || typeof node !== 'object') return undefined;
    if (match(node)) return node;
    const children = node.props?.children;
    for (const child of Array.isArray(children) ? children : [children]) {
      const found = find(child, match);
      if (found) return found;
    }
  }
  const render = () => {
    cursor = 0;
    return InlineEssayField({
      label: 'ANSWER',
      value: '保存済み',
      maxLength: 5000,
      children: '保存済み',
      onSave: async (value) => {
        written.push(value);
        return succeeds;
      },
    });
  };
  find(
    render(),
    (node) => node.props?.['aria-label'] === 'ANSWERを編集',
  ).props.onClick();
  find(render(), (node) => node.type === 'textarea').props.onChange({
    target: { value: '編集中の回答' },
  });
  await find(render(), (node) => node.type === 'actions').props.onSave();
  assert.equal(
    find(render(), (node) => node.type === 'textarea').props.value,
    '編集中の回答',
  );
  succeeds = true;
  await find(render(), (node) => node.type === 'actions').props.onSave();
  assert.equal(
    find(render(), (node) => node.type === 'textarea'),
    undefined,
  );
  assert.deepEqual(written, ['編集中の回答', '編集中の回答']);
});

test('genre reorder only sends requests for groups dragged in the dialog', async () => {
  const previous = [1, 2, 3, 4].map((id) => ({
    id,
    name: String(id),
    quantity: 0,
  }));
  const { api, calls } = setup();
  await api.saveEssayGroupOrder(previous, [2, 3, 4, 1], undefined, [1]);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.startsWith('/essay-groups/1/'));
  assert.deepEqual(JSON.parse(calls[0].body), { nextEssayGroupId: null });
});
