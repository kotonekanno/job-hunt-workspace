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

function apiWithFetch(fetch) {
  const generated = load('src/api/generated/api.ts', { fetch });
  return load('src/features/documents/lib/documentApi.ts', {
    require: (name) => {
      if (name === '@/api/generated/api') return generated;
      if (name === '@/features/auth/model/accessToken')
        return { getAccessToken: () => 'token' };
      throw new Error(name);
    },
  });
}
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status });

test('document CRUD uses generated routes, auth, IDs and Markdown request bodies', async () => {
  const calls = [];
  const api = apiWithFetch(async (url, options) => {
    calls.push({ url, ...options });
    if (options.method === 'GET')
      return json(
        url === '/documents'
          ? { documents: [{ id: 9, title: 'メモ' }] }
          : { title: 'メモ', text: '# 本文' },
      );
    if (options.method === 'POST') return json({ documentId: 9 }, 201);
    return new Response(null, { status: 204 });
  });
  assert.equal((await api.fetchDocuments())[0].id, 9);
  assert.equal((await api.fetchDocument(9)).text, '# 本文');
  assert.equal(await api.createDocumentRequest('メモ'), 9);
  await api.updateDocumentRequest(9, { text: '' });
  await api.deleteDocumentRequest(9);
  assert.deepEqual(
    calls.map((call) => [call.url, call.method]),
    [
      ['/documents', 'GET'],
      ['/documents/9', 'GET'],
      ['/documents', 'POST'],
      ['/documents/9', 'PATCH'],
      ['/documents/9', 'DELETE'],
    ],
  );
  assert.deepEqual(JSON.parse(calls[2].body), { title: 'メモ' });
  assert.deepEqual(JSON.parse(calls[3].body), { text: '' });
  for (const call of calls) {
    assert.equal(call.headers.Authorization, 'Bearer token');
    assert.equal(call.credentials, 'include');
  }
});

test('reorder produces target order including moves to the end and filtered-list permutations', async () => {
  for (const desired of [
    [4, 3, 2, 1],
    [2, 1, 3, 4],
    [1, 4, 3, 2],
    [2, 3, 4, 1],
    [1, 2, 3, 4],
  ]) {
    const server = [1, 2, 3, 4];
    const api = apiWithFetch(async (url, options) => {
      assert.equal(options.method, 'PUT');
      const id = Number(url.split('/')[2]);
      const { nextDocumentId } = JSON.parse(options.body);
      assert.notEqual(nextDocumentId, undefined);
      server.splice(server.indexOf(id), 1);
      server.splice(
        nextDocumentId === null
          ? server.length
          : server.indexOf(nextDocumentId),
        0,
        id,
      );
      return new Response(null, { status: 204 });
    });
    await api.persistDocumentOrder([1, 2, 3, 4], desired);
    assert.deepEqual(server, desired);
  }
});

test('invalid permutations and API errors are rejected', async () => {
  const api = apiWithFetch(async () => json({}, 500));
  await assert.rejects(api.fetchDocuments());
  await assert.rejects(api.fetchDocument(1));
  await assert.rejects(api.createDocumentRequest('メモ'));
  await assert.rejects(api.updateDocumentRequest(1, { text: '本文' }));
  await assert.rejects(api.deleteDocumentRequest(1));
  await assert.rejects(api.persistDocumentOrder([1, 2], [2, 1]));
  await assert.rejects(api.persistDocumentOrder([1, 2], [1, 1]));
});

// Exercise the provider's actual asynchronous operations with a minimal hook store.
// No browser server or real API is started.
function fakeClock() {
  let now = 0;
  let sequence = 0;
  const timers = new Map();
  return {
    setTimeout: (fn, delay) => {
      const id = ++sequence;
      timers.set(id, { at: now + delay, fn });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    advance: async (ms) => {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.at <= now) {
          timers.delete(id);
          timer.fn();
        }
      }
      await tick();
    },
  };
}

function archiveHarness(api) {
  const clock = fakeClock();
  const saveModule = load(
    'src/features/documents/lib/documentSaveSession.ts',
    clock,
  );
  const slots = [];
  let cursor = 0;
  const effects = [];
  const errors = [];
  const react = {
    useState: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (next) => {
          slots[index] = typeof next === 'function' ? next(slots[index]) : next;
        },
      ];
    },
    useRef: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useCallback: (fn) => fn,
    useEffect: (fn) => {
      const index = cursor++;
      if (!(index in slots)) {
        slots[index] = true;
        effects.push(fn());
      }
    },
  };
  const module = load('src/features/documents/ui/DocumentArchiveProvider.tsx', {
    require: (name) => {
      if (name === 'react') return react;
      if (name === '@/features/documents/lib/documentSaveSession')
        return saveModule;
      if (name === '@/features/documents/lib/documentApi') return api;
      if (name === '@/features/auth/model/accessToken')
        return { useAccessToken: () => 'token' };
      if (name === '@/features/documents/model/DocumentArchiveContext')
        return { DocumentArchiveContext: { Provider: 'provider' } };
      if (name === '@/shared/toast')
        return { toast: { error: (message) => errors.push(message) } };
      return require(name);
    },
  });
  const session = module.DocumentArchiveProvider({ children: null });
  return {
    render: () => {
      cursor = 0;
      return session.type(session.props).props.value;
    },
    errors,
    clock,
  };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('autosave serializes in-flight edits and coalesces to the latest Markdown', async () => {
  const writes = [];
  let release;
  const first = new Promise((resolve) => {
    release = resolve;
  });
  const harness = archiveHarness({
    fetchDocument: async () => ({ title: 'メモ', text: '' }),
    updateDocumentRequest: async (id, request) => {
      writes.push({ id, ...request });
      if (writes.length === 1) await first;
    },
  });
  const archive = harness.render();
  await archive.loadDocument(7);
  archive.updateDocument(7, '# A');
  await harness.clock.advance(1500);
  archive.updateDocument(7, '# B');
  archive.updateDocument(7, '# C');
  assert.equal(writes.length, 1);
  release();
  await tick();
  await harness.clock.advance(1500);
  assert.deepEqual(writes, [
    { id: 7, text: '# A' },
    { id: 7, text: '# C' },
  ]);
  assert.equal(harness.render().contents.get(7).text, '# C');
});

test('failed save retains the draft and retries on edit; oversized text is not sent', async () => {
  let fail = true;
  const writes = [];
  const harness = archiveHarness({
    fetchDocument: async () => ({ title: 'メモ', text: '' }),
    updateDocumentRequest: async (id, request) => {
      writes.push(request.text);
      if (fail) throw new Error('offline');
    },
  });
  const archive = harness.render();
  await archive.loadDocument(7);
  archive.updateDocument(7, 'draft');
  await harness.clock.advance(1500);
  assert.equal(harness.render().contents.get(7).text, 'draft');
  assert.equal(harness.errors.length, 1);
  fail = false;
  archive.updateDocument(7, 'retry');
  await harness.clock.advance(1500);
  assert.deepEqual(writes, ['draft', 'retry']);
  archive.updateDocument(7, 'x'.repeat(50001));
  await harness.clock.advance(1500);
  assert.equal(writes.length, 2);
});

test('failed creation/deletion preserves list and successful creation uses server ID', async () => {
  let fail = true;
  const harness = archiveHarness({
    fetchDocuments: async () => [{ id: 1, title: '既存' }],
    createDocumentRequest: async () => {
      if (fail) throw new Error('offline');
      return 99;
    },
    deleteDocumentRequest: async () => {
      if (fail) throw new Error('offline');
    },
  });
  const archive = harness.render();
  await archive.loadDocuments();
  assert.equal(await archive.addDocument('追加'), false);
  assert.equal(await archive.deleteDocument(1), false);
  assert.equal(harness.render().documents.length, 1);
  fail = false;
  assert.equal(await archive.addDocument('追加'), true);
  assert.equal(harness.render().documents[1].id, 99);
  assert.equal(await archive.deleteDocument(1), true);
  assert.equal(harness.render().documents[0].id, 99);
});

test('typing resets the 1.5-second timer; explicit save cancels it', async () => {
  const writes = [];
  const harness = archiveHarness({
    fetchDocument: async () => ({ title: 'メモ', text: '' }),
    updateDocumentRequest: async (id, request) => writes.push(request.text),
  });
  const archive = harness.render();
  await archive.loadDocument(7);
  archive.updateDocument(7, 'a');
  await harness.clock.advance(1000);
  archive.updateDocument(7, 'ab');
  await harness.clock.advance(1499);
  assert.deepEqual(writes, []);
  assert.equal(harness.render().contents.get(7).text, 'ab');
  await harness.clock.advance(1);
  assert.deepEqual(writes, ['ab']);
  archive.updateDocument(7, 'abc');
  assert.equal(archive.hasUnsavedDocument(7), true);
  assert.equal(await archive.saveDocument(7), true);
  assert.equal(archive.hasUnsavedDocument(7), false);
  await harness.clock.advance(2000);
  assert.deepEqual(writes, ['ab', 'abc']);
});

test('navigation flush waits for acknowledgement; failure remains dirty and permits retry', async () => {
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  let fail = false;
  const harness = archiveHarness({
    fetchDocument: async () => ({ title: 'メモ', text: '' }),
    updateDocumentRequest: async () => {
      await pending;
      if (fail) throw new Error('offline');
    },
  });
  const archive = harness.render();
  await archive.loadDocument(7);
  archive.updateDocument(7, 'draft');
  let completed = false;
  const saving = archive.saveDocument(7).then((result) => {
    completed = true;
    return result;
  });
  await tick();
  assert.equal(completed, false);
  assert.equal(archive.hasUnsavedDocument(7), true);
  release();
  assert.equal(await saving, true);
  assert.equal(archive.hasUnsavedDocument(7), false);
  fail = true;
  archive.updateDocument(7, 'unsaved');
  assert.equal(await archive.saveDocument(7), false);
  assert.equal(archive.hasUnsavedDocument(7), true);
  fail = false;
  assert.equal(await archive.saveDocument(7), true);
});

test('drag updates only the preview; drop commits once and cancellation commits nothing', () => {
  const slots = [];
  let cursor = 0;
  let cancel;
  const commits = [];
  const react = {
    useState: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (next) => {
          slots[index] = next;
        },
      ];
    },
    useRef: (initial) => {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
  };
  const { DocumentList } = load('src/features/documents/ui/DocumentList.tsx', {
    require: (name) => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return require(name);
      if (name === 'motion/react') return { Reorder: { Group: 'group' } };
      if (name === '@/shared/useListDragSession')
        return {
          useListDragSession: () => ({
            isDragSessionActive: true,
            startDragSession: (callback) => {
              cancel = callback;
            },
            endDragSession: () => {},
          }),
        };
      return {};
    },
  });
  const documents = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const render = () => {
    cursor = 0;
    return DocumentList({
      documents,
      onReorder: (items) => commits.push(items.map((item) => item.id)),
      onDelete: async () => true,
    });
  };
  let group = render();
  group.props.children[0].props.onDragSessionStart(() => {});
  group.props.onReorder([documents[1], documents[0], documents[2]]);
  group.props.onReorder([documents[1], documents[2], documents[0]]);
  assert.equal(commits.length, 0);
  group = render();
  group.props.children[0].props.onDragSessionEnd();
  assert.deepEqual(commits, [[2, 3, 1]]);
  group = render();
  group.props.children[0].props.onDragSessionStart(() => {});
  group.props.onReorder([documents[2], documents[1], documents[0]]);
  cancel();
  group.props.children[0].props.onDragSessionEnd();
  assert.equal(commits.length, 1);
});

test('detail navigation proceeds only after a successful flush, and beforeunload checks dirty state', async () => {
  for (const success of [true, false]) {
    let finish;
    let dirty = true;
    let proceeded = 0;
    let reset = 0;
    let shouldBlock;
    const listeners = new Map();
    const result = new Promise((resolve) => {
      finish = resolve;
    });
    const { DocumentDetailPage } = load(
      'src/pages/documents/DocumentDetailPage.tsx',
      {
        window: {
          addEventListener: (name, callback) => listeners.set(name, callback),
          removeEventListener: (name) => listeners.delete(name),
        },
        require: (name) => {
          if (name === 'react')
            return {
              useState: (initial) => [initial, () => {}],
              useRef: (current) => ({ current }),
              useEffect: (callback) => callback(),
            };
          if (name === 'react/jsx-runtime') return require(name);
          if (name === 'react-router-dom')
            return {
              useNavigate: () => () => {},
              useParams: () => ({ documentsId: '7' }),
              useBlocker: (callback) => {
                shouldBlock = callback;
                return {
                  state: 'blocked',
                  proceed: () => proceeded++,
                  reset: () => reset++,
                };
              },
            };
          if (name === '@/features/documents/hooks/useDocumentArchive')
            return {
              useDocumentArchive: () => ({
                contents: new Map(),
                loadDocument: async () => {},
                saveDocument: () => result,
                hasUnsavedDocument: () => dirty,
              }),
            };
          return {};
        },
      },
    );
    const page = DocumentDetailPage();
    page.type(page.props);
    assert.equal(
      shouldBlock({
        currentLocation: { pathname: '/documents/7' },
        nextLocation: { pathname: '/tasks' },
      }),
      true,
    );
    assert.equal(proceeded, 0);
    assert.equal(reset, 0);
    let prevented = false;
    const event = {
      preventDefault: () => {
        prevented = true;
      },
    };
    listeners.get('beforeunload')(event);
    assert.equal(prevented, true);
    assert.equal(event.returnValue, '');
    dirty = false;
    prevented = false;
    listeners.get('beforeunload')(event);
    assert.equal(prevented, false);
    finish(success);
    await tick();
    assert.equal(proceeded, success ? 1 : 0);
    assert.equal(reset, success ? 0 : 1);
  }
});

test('document create caches its server ID/content, delete and reorder update before acknowledgement without refetch', async () => {
  let reads = 0,
    createResolve,
    deleteReject,
    reorderReject;
  const h = archiveHarness({
    fetchDocuments: async () => {
      reads++;
      return [{ id: 1, title: '既存' }];
    },
    fetchDocument: async () => {
      throw new Error('created document must use cache');
    },
    createDocumentRequest: () =>
      new Promise((resolve) => {
        createResolve = resolve;
      }),
    deleteDocumentRequest: () =>
      new Promise((resolve, reject) => {
        deleteReject = reject;
      }),
    persistDocumentOrder: () =>
      new Promise((resolve, reject) => {
        reorderReject = reject;
      }),
  });
  await h.render().loadDocuments();
  const saving = h.render().addDocument('追加');
  assert.equal(h.render().documents.length, 2);
  assert.ok(h.render().documents[1].id < 0);
  await tick();
  createResolve(7);
  await saving;
  assert.equal(h.render().documents[1].id, 7);
  assert.equal((await h.render().loadDocument(7)).title, '追加');
  const deleting = h.render().deleteDocument(7);
  assert.equal(h.render().documents.length, 1);
  await tick();
  deleteReject(new Error('failed'));
  await deleting;
  assert.equal(h.render().documents.length, 2);
  h.render().reorderDocuments([7, 1], 7);
  assert.equal(h.render().documents[0].id, 7);
  await tick();
  reorderReject(new Error('failed'));
  await tick();
  assert.equal(h.render().documents[0].id, 1);
  assert.equal(reads, 1);
});

test('document drop sends one request for the dragged document, including downward moves', async () => {
  for (const [desired, movedId, nextDocumentId] of [
    [[2, 3, 4, 1], 1, null],
    [[4, 1, 2, 3], 4, 1],
    [[1, 3, 2, 4], 2, 4],
  ]) {
    const calls = [];
    const api = apiWithFetch(async (url, options) => {
      calls.push({ url, body: JSON.parse(options.body) });
      return new Response(null, { status: 204 });
    });
    await api.persistDocumentOrder([1, 2, 3, 4], desired, undefined, movedId);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.startsWith(`/documents/${movedId}/`));
    assert.deepEqual(calls[0].body, { nextDocumentId });
    await api.persistDocumentOrder(desired, desired, undefined, movedId);
    assert.equal(calls.length, 1);
  }
});
