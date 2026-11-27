export function createSessionRequestGuard() {
  let activeUserId = null;
  let generation = 0;

  return {
    activate(userId) {
      const nextUserId = userId ?? null;
      const changed = nextUserId !== activeUserId;
      if (changed) {
        activeUserId = nextUserId;
        generation += 1;
      }
      return { changed, ticket: { userId: activeUserId, generation } };
    },
    isCurrent(ticket) {
      return ticket?.userId === activeUserId && ticket?.generation === generation;
    }
  };
}

/**
 * Run a mutation only while its originating session is still active.
 * Late success and error responses are ignored after a session change.
 */
export async function runSessionMutation({ operation, isCurrent, onSuccess, onError }) {
  if (!isCurrent()) return false;

  try {
    const result = await operation();
    if (!isCurrent()) return false;
    onSuccess(result);
    return true;
  } catch (error) {
    if (isCurrent()) onError(error);
    return false;
  }
}
