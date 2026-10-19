const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

function load(file, globals) {
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
  runInNewContext(outputText, { exports, ...globals });
  return exports;
}

function setup(status, data = {}) {
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
  const api = load('src/features/task/lib/taskApi.ts', {
    require: (name) => {
      if (name === '@/api/generated/api') return generated;
      if (name === '@/features/auth/model/accessToken')
        return { getAccessToken: () => 'test-token' };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return { api, calls };
}

const task = {
  id: 4,
  title: '応募',
  note: null,
  deadline: null,
  done: false,
  companyName: '企業A',
};
const companies = [{ id: 7, name: '企業A' }];

test('create uses company ID, nullable fields, authentication and server-assigned ID', async () => {
  const { api, calls } = setup(201, { taskId: 99 });
  await api.saveTaskRequest(
    { ...task, id: undefined, note: '', deadline: '' },
    companies,
  );
  assert.equal(calls[0].url, '/tasks');
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].credentials, 'include');
  assert.equal(calls[0].headers.Authorization, 'Bearer test-token');
  assert.deepEqual(JSON.parse(calls[0].body), {
    title: '応募',
    note: null,
    deadline: null,
    companyId: 7,
  });
});

test('editing preserves unchanged company even when its ID is unavailable', async () => {
  const { api, calls } = setup(204);
  await api.saveTaskRequest({ ...task, title: '変更' }, [], task);
  assert.equal(calls[0].url, '/tasks/4');
  assert.equal(calls[0].method, 'PATCH');
  assert.deepEqual(JSON.parse(calls[0].body), {
    title: '変更',
    note: null,
    deadline: null,
  });
});

test('clearing company and deadline explicitly sends null', async () => {
  const { api, calls } = setup(204);
  await api.saveTaskRequest(
    { ...task, companyName: undefined, deadline: null },
    companies,
    task,
  );
  assert.equal(JSON.parse(calls[0].body).companyId, null);
  assert.equal(JSON.parse(calls[0].body).deadline, null);
});

test('ambiguous or missing company prevents mutation', async () => {
  for (const options of [[], [...companies, { id: 8, name: '企業A' }]]) {
    const { api, calls } = setup(201);
    await assert.rejects(api.saveTaskRequest(task, options));
    assert.equal(calls.length, 0);
  }
});

test('toggle only patches done; delete uses DELETE; bulk delete selects all completed IDs', async () => {
  const { api, calls } = setup(204);
  await api.toggleTaskRequest(task);
  await api.deleteTaskRequest(4);
  await api.deleteCompletedTaskRequest([
    task,
    { ...task, id: 5, done: true },
    { ...task, id: 6, done: true },
  ]);
  assert.deepEqual(JSON.parse(calls[0].body), { done: true });
  assert.equal(calls[1].method, 'DELETE');
  assert.equal(calls[1].url, '/tasks/4');
  assert.equal(calls[2].url, '/tasks/bulk-delete');
  assert.deepEqual(JSON.parse(calls[2].body), { taskIds: [5, 6] });
  await api.deleteCompletedTaskRequest([task]);
  assert.equal(calls.length, 3);
});

test('loads lists and propagates cancellation signal', async () => {
  const { api, calls } = setup(200, { tasks: [task], companies });
  const signal = new AbortController().signal;
  assert.equal((await api.loadTasks(signal))[0].id, 4);
  assert.equal((await api.loadTaskCompanies(signal))[0].id, 7);
  assert.equal(calls[0].signal, signal);
  assert.equal(calls[1].url, '/companies/lookup');
  assert.equal(calls[1].headers.Authorization, 'Bearer test-token');
  assert.equal(calls[1].credentials, 'include');
  assert.equal(calls[1].signal, signal);
});

test('unsuccessful HTTP responses reject instead of reporting success', async () => {
  for (const status of [400, 401, 403, 404, 500]) {
    const { api } = setup(status);
    await assert.rejects(api.loadTasks());
    await assert.rejects(api.loadTaskCompanies());
    await assert.rejects(api.saveTaskRequest(task, companies));
    await assert.rejects(api.saveTaskRequest(task, companies, task));
    await assert.rejects(api.toggleTaskRequest(task));
    await assert.rejects(api.deleteTaskRequest(task.id));
    await assert.rejects(
      api.deleteCompletedTaskRequest([{ ...task, done: true }]),
    );
  }
});
