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
