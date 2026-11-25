import test from "node:test";
import assert from "node:assert/strict";
import { createSessionRequestGuard, runSessionMutation } from "../src/session-guard.js";

test("keeps a request valid while the same user remains active", () => {
  const guard = createSessionRequestGuard();
  const first = guard.activate("user-a");
  const repeated = guard.activate("user-a");

  assert.equal(first.changed, true);
  assert.equal(repeated.changed, false);
  assert.equal(guard.isCurrent(first.ticket), true);
  assert.equal(guard.isCurrent(repeated.ticket), true);
});

test("invalidates pending data requests when the active account changes", () => {
  const guard = createSessionRequestGuard();
  const firstUser = guard.activate("user-a");
  const secondUser = guard.activate("user-b");

  assert.equal(guard.isCurrent(firstUser.ticket), false);
  assert.equal(guard.isCurrent(secondUser.ticket), true);
});

test("invalidates pending data requests immediately on sign-out", () => {
  const guard = createSessionRequestGuard();
  const signedIn = guard.activate("user-a");
  const signedOut = guard.activate(null);

  assert.equal(guard.isCurrent(signedIn.ticket), false);
  assert.equal(guard.isCurrent(signedOut.ticket), true);
});

test("does not start a mutation after its originating session becomes stale", async () => {
  const guard = createSessionRequestGuard();
  const ticket = guard.activate("user-a").ticket;
  guard.activate("user-b");
  let operationStarted = false;
  let successCalled = false;
  let errorCalled = false;

  const applied = await runSessionMutation({
    operation: async () => { operationStarted = true; },
    isCurrent: () => guard.isCurrent(ticket),
    onSuccess: () => { successCalled = true; },
    onError: () => { errorCalled = true; }
  });

  assert.equal(applied, false);
  assert.equal(operationStarted, false);
  assert.equal(successCalled, false);
  assert.equal(errorCalled, false);
});

test("ignores a successful mutation response after an account switch", async () => {
  const guard = createSessionRequestGuard();
  const ticket = guard.activate("user-a").ticket;
  let resolveOperation;
  let successCalled = false;
  let errorCalled = false;
  const pending = new Promise(resolve => { resolveOperation = resolve; });

  const mutation = runSessionMutation({
    operation: () => pending,
    isCurrent: () => guard.isCurrent(ticket),
    onSuccess: () => { successCalled = true; },
    onError: () => { errorCalled = true; }
  });

  guard.activate("user-b");
  resolveOperation({ id: "record-a" });

  assert.equal(await mutation, false);
  assert.equal(successCalled, false);
  assert.equal(errorCalled, false);
});

test("ignores a failed mutation response after sign-out", async () => {
  const guard = createSessionRequestGuard();
  const ticket = guard.activate("user-a").ticket;
  let rejectOperation;
  let errorCalled = false;
  const pending = new Promise((_, reject) => { rejectOperation = reject; });

  const mutation = runSessionMutation({
    operation: () => pending,
    isCurrent: () => guard.isCurrent(ticket),
    onSuccess: () => assert.fail("stale success handler must not run"),
    onError: () => { errorCalled = true; }
  });

  guard.activate(null);
  rejectOperation(new Error("late failure"));

  assert.equal(await mutation, false);
  assert.equal(errorCalled, false);
});

test("applies a successful mutation while the originating user remains active", async () => {
  const guard = createSessionRequestGuard();
  const ticket = guard.activate("user-a").ticket;
  let savedRecord;

  const applied = await runSessionMutation({
    operation: async () => ({ id: "record-a" }),
    isCurrent: () => guard.isCurrent(ticket),
    onSuccess: record => { savedRecord = record; },
    onError: error => { throw error; }
  });

  assert.equal(applied, true);
  assert.deepEqual(savedRecord, { id: "record-a" });
});


test("surfaces validation errors from mutation preparation through the error handler", async () => {
  const guard = createSessionRequestGuard();
  const ticket = guard.activate("user-a").ticket;
  let reportedError;
  const validationError = new Error("Choose a valid pipeline stage.");

  const applied = await runSessionMutation({
    operation: () => { throw validationError; },
    isCurrent: () => guard.isCurrent(ticket),
    onSuccess: () => assert.fail("invalid input must not save"),
    onError: error => { reportedError = error; }
  });

  assert.equal(applied, false);
  assert.equal(reportedError, validationError);
});
