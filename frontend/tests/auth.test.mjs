import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearSession,
  checkSession,
  getSession,
  getAccessToken,
  signIn,
  signOut,
  renewAccessToken,
} from '../src/features/auth/api/session.ts';
import { authenticatedRequest } from '../src/api/authenticatedRequest.ts';

const originalFetch = globalThis.fetch;
let calls;
let respond;
const credentials = { email: 'test@example.com', password: 'test-password' };
const json = (status, body) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
beforeEach(() => {
  clearSession();
  calls = [];
  respond = () => {
    throw new Error('Unexpected request');
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return respond(url, options);
  };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  clearSession();
});
async function logIn() {
  respond = (url) =>
    url === '/auth/login'
      ? json(200, { accessToken: 'login-token' })
      : json(200);
  await signIn(credentials);
}

test('login and protected entry validate the bearer token with /auth/me', async () => {
  await logIn();
  await checkSession();
  assert.equal(getSession().status, 'authenticated');
  assert.equal(getAccessToken(), 'login-token');
  assert.deepEqual(
    calls.map((call) => call.url),
    ['/auth/login', '/auth/me', '/auth/me'],
  );
  assert.equal(
    calls.at(-1).options.headers.Authorization,
    'Bearer login-token',
  );
});
test('direct entry without a token requires login if refresh fails', async () => {
  respond = () => json(401);
  await checkSession();
  assert.deepEqual(
    calls.map((call) => call.url),
    ['/auth/refresh'],
  );
  assert.equal(getSession().status, 'anonymous');
});
test('page reload restores the cookie session and verifies the new access token', async () => {
  respond = (url, options) =>
    url === '/auth/refresh'
      ? json(200, { accessToken: 'restored-token' })
      : json(options.headers.Authorization ? 200 : 401);
  await checkSession();
  assert.equal(getSession().status, 'authenticated');
  assert.deepEqual(
    calls.map((call) => call.url),
    ['/auth/refresh', '/auth/me'],
  );
  assert.equal(
    calls.at(-1).options.headers.Authorization,
    'Bearer restored-token',
  );
});
test('resource 401 after successful login does not log out a valid /auth/me session', async () => {
  await logIn();
  respond = () => json(200);
  const response = await authenticatedRequest(async () => ({ status: 401 }));
  assert.equal(response.status, 401);
  assert.equal(getSession().status, 'authenticated');
  assert.equal(getAccessToken(), 'login-token');
  assert.equal(calls.filter((call) => call.url === '/auth/refresh').length, 0);
});
test('expired access token is refreshed once and the resource is retried', async () => {
  await logIn();
  respond = (url, options) =>
    url === '/auth/refresh'
      ? json(200, { accessToken: 'renewed-token' })
      : json(
          options.headers.Authorization === 'Bearer renewed-token' ? 200 : 401,
        );
  const sent = [];
  const response = await authenticatedRequest(async (options) => {
    sent.push(new Headers(options.headers).get('Authorization'));
    return { status: sent.length === 1 ? 401 : 200 };
  });
  assert.equal(response.status, 200);
  assert.deepEqual(sent, ['Bearer login-token', 'Bearer renewed-token']);
  assert.equal(getSession().status, 'authenticated');
});
test('rejected refresh makes the session anonymous', async () => {
  await logIn();
  respond = () => json(401);
  await authenticatedRequest(async () => ({ status: 401 }));
  assert.equal(getSession().status, 'anonymous');
  assert.equal(getAccessToken(), null);
});
test('server failure during verification is an error, not a login redirect', async () => {
  await logIn();
  respond = () => json(500);
  await checkSession();
  assert.equal(getSession().status, 'error');
  assert.equal(getAccessToken(), 'login-token');
});
test('concurrent protected checks share a single verification request', async () => {
  await logIn();
  calls = [];
  const waiting = deferred();
  respond = () => waiting.promise;
  const first = checkSession();
  const second = checkSession();
  assert.equal(first, second);
  waiting.resolve(json(200));
  await Promise.all([first, second]);
  assert.equal(calls.length, 1);
});
test('a late failed refresh cannot clear a newer login', async () => {
  await logIn();
  const waiting = deferred();
  respond = (url) =>
    url === '/auth/refresh'
      ? waiting.promise
      : url === '/auth/login'
        ? json(200, { accessToken: 'new-login-token' })
        : json(200);
  const oldRefresh = renewAccessToken();
  await signIn(credentials);
  waiting.resolve(json(401));
  await oldRefresh;
  assert.equal(getSession().status, 'authenticated');
  assert.equal(getAccessToken(), 'new-login-token');
});
test('a late resource 401 cannot log out a newer login', async () => {
  await logIn();
  const waiting = deferred();
  let attempts = 0;
  const oldRequest = authenticatedRequest(async () =>
    ++attempts === 1 ? waiting.promise : { status: 200 },
  );
  respond = (url) =>
    url === '/auth/login'
      ? json(200, { accessToken: 'new-login-token' })
      : json(200);
  await signIn(credentials);
  waiting.resolve({ status: 401 });
  await oldRequest;
  assert.equal(attempts, 1);
  assert.equal(getSession().status, 'authenticated');
  assert.equal(getAccessToken(), 'new-login-token');
});
test('a refreshed token rejected by /auth/me still requires login', async () => {
  await logIn();
  respond = (url) =>
    url === '/auth/refresh'
      ? json(200, { accessToken: 'rejected-token' })
      : json(401);
  await checkSession();
  assert.equal(getSession().status, 'anonymous');
  assert.equal(getAccessToken(), null);
});
test('verification completed after logout cannot restore the session', async () => {
  await logIn();
  const waiting = deferred();
  respond = () => waiting.promise;
  const check = checkSession();
  clearSession();
  waiting.resolve(json(200));
  await check;
  assert.equal(getSession().status, 'anonymous');
  assert.equal(getAccessToken(), null);
});

test('logout deletes the server cookie and clears the local session', async () => {
  await logIn();
  respond = () => json(204);
  await signOut();
  assert.equal(calls.at(-1).url, '/auth/logout');
  assert.equal(calls.at(-1).options.credentials, 'include');
  assert.equal(calls.at(-1).options.method, 'POST');
  assert.equal(
    calls.at(-1).options.headers.Authorization,
    'Bearer login-token',
  );
  assert.equal(getSession().status, 'anonymous');
  assert.equal(getAccessToken(), null);
});

test('failed logout keeps the session so the user can retry', async () => {
  await logIn();
  respond = () => json(500);
  await assert.rejects(signOut(), /ログアウトできませんでした/);
  assert.equal(getSession().status, 'authenticated');
  assert.equal(getAccessToken(), 'login-token');
});

test('restored token rejected by /auth/me is not refreshed a second time', async () => {
  respond = (url) =>
    url === '/auth/refresh'
      ? json(200, { accessToken: 'rejected-token' })
      : json(401);
  await checkSession();
  assert.deepEqual(
    calls.map((call) => call.url),
    ['/auth/refresh', '/auth/me'],
  );
  assert.equal(getSession().status, 'anonymous');
});

test('concurrent checks without an access token share restoration', async () => {
  const waiting = deferred();
  respond = (url) => (url === '/auth/refresh' ? waiting.promise : json(200));
  const first = checkSession();
  const second = checkSession();
  waiting.resolve(json(200, { accessToken: 'restored-token' }));
  await Promise.all([first, second]);
  assert.deepEqual(
    calls.map((call) => call.url),
    ['/auth/refresh', '/auth/me'],
  );
  assert.equal(getSession().status, 'authenticated');
});
