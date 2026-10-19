const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');

// Load the actual TypeScript modules without starting a server or contacting an API.
function load(sourcePath, globals = {}) {
  const source = readFileSync(path.join(__dirname, '..', sourcePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const exports = {};
  runInNewContext(outputText, {
    exports,
    require,
    crypto: webcrypto,
    ...globals,
  });
  return exports;
}

test('login uses the generated endpoint, credentials and request body', async () => {
  const calls = [];
  const api = load('src/api/generated/api.ts', {
    fetch: async (...args) => {
      calls.push(args);
      return new Response(JSON.stringify({ accessToken: 'test-token' }), {
        status: 200,
      });
    },
  });
  const request = { email: 'user@example.com', password: 'password' };
  const response = await api.login(request, { credentials: 'include' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/auth/login');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(calls[0][1].credentials, 'include');
  assert.equal(calls[0][1].body, JSON.stringify(request));
  assert.equal(response.status, 200);
  assert.equal(response.data.accessToken, 'test-token');
});

test('registration returns user ID without an access token', async () => {
  const api = load('src/api/generated/api.ts', {
    fetch: async (url) => {
      assert.equal(url, '/auth/register');
      return new Response(JSON.stringify({ userId: 1 }), { status: 201 });
    },
  });
  const response = await api.register({
    email: 'user@example.com',
    password: 'password',
  });
  assert.equal(response.status, 201);
  assert.equal(response.data.userId, 1);
  assert.equal(response.data.accessToken, undefined);
});

test('generated login preserves empty 401/403 responses', async () => {
  for (const status of [401, 403]) {
    const api = load('src/api/generated/api.ts', {
      fetch: async () => new Response(null, { status }),
    });
    const response = await api.login({
      email: 'user@example.com',
      password: 'invalid',
    });
    assert.equal(response.status, status);
  }
});

test('network failure rejects without a success response', async () => {
  const api = load('src/api/generated/api.ts', {
    fetch: async () => {
      throw new TypeError('offline');
    },
  });
  await assert.rejects(
    api.login({ email: 'user@example.com', password: 'password' }),
    /offline/,
  );
});

test('access token persists across module loads and missing/blank values are unauthenticated', () => {
  const values = new Map();
  const sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const events = [];
  const globals = {
    sessionStorage,
    Event,
    window: { dispatchEvent: (event) => events.push(event.type) },
  };
  const auth = load('src/features/auth/model/accessToken.ts', globals);
  assert.equal(auth.getAccessToken(), null);
  auth.setAccessToken('test-token');
  assert.equal(
    load('src/features/auth/model/accessToken.ts', globals).getAccessToken(),
    'test-token',
  );
  assert.deepEqual(events, ['job-hunt-auth-change']);
  auth.setAccessToken('   ');
  assert.equal(auth.getAccessToken(), null);
});

test('toast survives navigation, deduplicates redirect notices and can be dismissed', () => {
  const notifications = load('src/shared/toast.ts');
  let updates = 0;
  const unsubscribe = notifications.subscribeToToasts(() => updates++);
  notifications.toast.error('ログインしてください。', 'login-required');
  notifications.toast.error('ログインしてください。', 'login-required');
  assert.equal(notifications.getToasts().length, 1);
  assert.equal(updates, 1);
  notifications.toast.success('登録しました');
  assert.equal(notifications.getToasts().length, 2);
  notifications.dismissToast('login-required');
  assert.equal(notifications.getToasts().length, 1);
  unsubscribe();
});

test('route guard waits for authentication before rendering or redirecting', async () => {
  for (const authenticated of [false, true]) {
    const messages = [];
    const context = { isSidebarOpen: true };
    const effects = [];
    let state = null;
    function Navigate() {}
    function Outlet() {}
    const mocks = {
      react: {
        useEffect: (effect) => effects.push(effect),
        useState: () => [
          state,
          (value) => {
            state = value;
          },
        ],
      },
      'react-router-dom': {
        Navigate,
        Outlet,
        useOutletContext: () => context,
        useLocation: () => ({ key: 'route' }),
      },
      '@/features/auth/model/authenticate': {
        ensureAuthenticated: async () => authenticated,
      },
      '@/shared/toast': {
        toast: { error: (message) => messages.push(message) },
      },
      '@/shared/LoadingState': { PageLoading: () => null },
    };
    const { RequireAuth } = load('src/features/auth/ui/RequireAuth.tsx', {
      require: (name) => mocks[name] ?? require(name),
    });
    const pending = RequireAuth();
    assert.equal(
      pending.props.children.type,
      mocks['@/shared/LoadingState'].PageLoading,
    );
    assert.equal(
      pending.props.children.props.label,
      'ログイン状態を確認しています',
    );
    assert.equal(messages.length, 0);
    effects[0]();
    await Promise.resolve();
    const result = RequireAuth();
    if (authenticated) {
      assert.equal(result.type, Outlet);
      assert.equal(result.props.context, context);
      assert.equal(messages.length, 0);
    } else {
      assert.equal(result.type, Navigate);
      assert.equal(result.props.to, '/login');
      assert.equal(result.props.replace, true);
      assert.deepEqual(messages, ['ログインしてください。']);
    }
  }
});

test('authentication checks existing tokens, restores missing/expired tokens and rejects failures', async () => {
  for (const scenario of [
    { token: 'valid', checks: [200], expected: true, refreshes: 0 },
    { token: null, checks: [200], expected: true, refreshes: 1 },
    { token: 'expired', checks: [401, 200], expected: true, refreshes: 1 },
    {
      token: null,
      checks: [],
      refreshStatus: 401,
      expected: false,
      refreshes: 1,
    },
    {
      token: 'expired',
      checks: [401],
      refreshStatus: 404,
      expected: false,
      refreshes: 1,
    },
    {
      token: 'expired',
      checks: [401],
      refreshStatus: 500,
      expected: false,
      refreshes: 1,
    },
    { token: null, checks: [401], expected: false, refreshes: 1 },
    { token: 'valid', checks: [500], expected: false, refreshes: 0 },
    { token: null, checks: [], newToken: '', expected: false, refreshes: 1 },
    { token: null, checks: [], offline: true, expected: false, refreshes: 1 },
  ]) {
    let token = scenario.token;
    let refreshes = 0;
    const checkedTokens = [];
    const checks = [...scenario.checks];
    const mocks = {
      '@/api/generated/api': {
        getCurrentUser: async (options) => {
          assert.equal(options.credentials, 'include');
          checkedTokens.push(options.headers.Authorization);
          assert.ok(checks.length);
          return { status: checks.shift() };
        },
        refresh: async (options) => {
          refreshes++;
          assert.equal(options.credentials, 'include');
          if (scenario.offline) throw new Error('offline');
          return {
            status: scenario.refreshStatus ?? 200,
            data: { accessToken: scenario.newToken ?? 'renewed' },
          };
        },
      },
      './accessToken': {
        getAccessToken: () => token,
        setAccessToken: (value) => {
          token = value;
        },
        clearAccessToken: () => {
          token = null;
        },
      },
    };
    const auth = load('src/features/auth/model/authenticate.ts', {
      require: (name) => mocks[name] ?? require(name),
    });
    const first = auth.ensureAuthenticated();
    const concurrent = auth.ensureAuthenticated();
    assert.equal(first, concurrent);
    assert.equal(await first, scenario.expected);
    assert.equal(refreshes, scenario.refreshes);
    assert.equal(checks.length, 0);
    assert.equal(
      token,
      scenario.expected ? (scenario.refreshes ? 'renewed' : 'valid') : null,
    );
    if (scenario.token)
      assert.equal(checkedTokens[0], `Bearer ${scenario.token}`);
    if (scenario.expected && scenario.refreshes)
      assert.equal(checkedTokens.at(-1), 'Bearer renewed');
  }
});

function findForm(element) {
  if (!element || typeof element !== 'object') return;
  if (element.type === 'form') return element;
  const children = element.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const form = findForm(child);
    if (form) return form;
  }
}

test('auth form navigates only on success, stores only login tokens and reports errors', async () => {
  for (const [mode, status] of [
    ['login', 200],
    ['login', 400],
    ['login', 401],
    ['login', 403],
    ['login', 404],
    ['login', 500],
    ['register', 201],
    ['register', 400],
    ['register', 409],
    ['register', 500],
    ['login', 'offline'],
  ]) {
    const navigation = [];
    const tokens = [];
    const errors = [];
    const successes = [];
    const states = ['user@example.com', 'password', false, false];
    const request = async (body, options) => {
      assert.equal(body.email, 'user@example.com');
      assert.equal(body.password, 'password');
      assert.equal(options.credentials, 'include');
      if (status === 'offline') throw new Error('offline');
      return {
        status,
        data: status === 200 ? { accessToken: 'test-token' } : { userId: 1 },
      };
    };
    const mocks = {
      react: {
        useState: () => [states.shift(), () => {}],
        useRef: () => ({ current: false }),
      },
      'react-router-dom': {
        Link: () => null,
        useNavigate: () => (to) => navigation.push(to),
      },
      '@/api/generated/api': { login: request, register: request },
      '@/features/auth/model/accessToken': {
        setAccessToken: (token) => tokens.push(token),
      },
      '@/shared/toast': {
        toast: {
          error: (message) => errors.push(message),
          success: (message) => successes.push(message),
        },
      },
    };
    const { AuthForm } = load('src/features/auth/ui/AuthForm.tsx', {
      require: (name) => mocks[name] ?? require(name),
    });
    const form = findForm(AuthForm({ mode }));
    assert.ok(form);
    await form.props.onSubmit({ preventDefault() {} });
    if (status === 200) {
      assert.deepEqual(navigation, ['/home']);
      assert.deepEqual(tokens, ['test-token']);
      assert.equal(errors.length, 0);
    } else if (status === 201) {
      assert.deepEqual(navigation, ['/login']);
      assert.equal(tokens.length, 0);
      assert.equal(successes.length, 1);
    } else {
      assert.equal(navigation.length, 0);
      assert.equal(tokens.length, 0);
      assert.equal(errors.length, 1);
    }
  }
});

test('account logout clears the token and redirects only on API success', async () => {
  for (const status of [204, 401, 500, 'offline']) {
    const events = [];
    const mocks = {
      react: {
        useRef: (current) => ({ current }),
        useState: () => [false, () => {}],
      },
      'react-router-dom': {
        Link: () => null,
        useNavigate: () => (to, options) => {
          assert.equal(options.replace, true);
          events.push(to);
        },
      },
      '@/api/generated/api': {
        logout: async (options) => {
          assert.equal(options.credentials, 'include');
          assert.equal(options.headers.Authorization, 'Bearer test-token');
          events.push('request');
          if (status === 'offline') throw new Error('offline');
          return { status };
        },
      },
      '../model/accessToken': {
        useAccessToken: () => 'test-token',
        clearAccessToken: () => events.push('clear'),
      },
      '@/shared/toast': { toast: { error: () => events.push('error') } },
    };
    const { AccountMenu } = load('src/features/auth/ui/AccountMenu.tsx', {
      require: (name) => mocks[name] ?? require(name),
    });
    function findButton(element) {
      if (!element || typeof element !== 'object') return;
      if (element.type === 'button') return element;
      const children = element.props?.children;
      for (const child of Array.isArray(children) ? children : [children]) {
        const button = findButton(child);
        if (button) return button;
      }
    }
    const button = findButton(AccountMenu());
    assert.ok(button);
    button.props.onClick();
    button.props.onClick();
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(
      events,
      status === 204 ? ['request', 'clear', '/login'] : ['request', 'error'],
    );
  }
});
