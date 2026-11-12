let readyName: string | null = null;
const listeners = new Set<() => void>();

export function markBookReady(name: string) {
  readyName = name;
  for (const listener of listeners) listener();
}

export function bookReadyName() {
  return readyName;
}

export function subscribeBookReady(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
