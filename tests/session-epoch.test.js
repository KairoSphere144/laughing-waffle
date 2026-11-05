import test from "node:test";
import assert from "node:assert/strict";
import { createSessionEpoch } from "../src/session-epoch.js";

test("only the newest session request remains current", () => {
  const guard = createSessionEpoch();
  const first = guard.advance();
  const second = guard.advance();

  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), true);
});

test("advancing the session invalidates pending requests after sign-out", () => {
  const guard = createSessionEpoch();
  const pending = guard.advance();

  guard.advance();

  assert.equal(guard.isCurrent(pending), false);
});

test("a later session can safely establish a new current request", () => {
  const guard = createSessionEpoch();
  const first = guard.advance();
  const second = guard.advance();
  const third = guard.advance();

  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), false);
  assert.equal(guard.isCurrent(third), true);
});
