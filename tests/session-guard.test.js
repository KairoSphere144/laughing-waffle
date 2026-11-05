import test from "node:test";
import assert from "node:assert/strict";
import { createSessionRequestGuard } from "../src/session-guard.js";

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
