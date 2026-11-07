export function useLocalStorage<T>(key: string, initialValue: T) {
  return [initialValue, () => undefined] as const;
}
