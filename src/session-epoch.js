// Prevent asynchronous work started for an old auth session from updating the active UI.
export function createSessionEpoch() {
  let current = 0;

  return {
    advance() {
      current += 1;
      return current;
    },
    isCurrent(epoch) {
      return epoch === current;
    }
  };
}
