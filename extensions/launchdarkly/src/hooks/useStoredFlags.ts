import { useLocalStorage } from "@raycast/utils";
import { LDFlag, StoredFlagRef } from "../types";

const FAVORITES_KEY = "FAVORITE_FLAGS";
const RECENTS_KEY = "RECENT_FLAGS";
const MAX_RECENTS = 10;

function sameFlag(a: StoredFlagRef, b: { projectKey: string; key: string }) {
  return a.projectKey === b.projectKey && a.key === b.key;
}

export function toFlagRef(projectKey: string, flag: LDFlag): StoredFlagRef {
  return { projectKey, key: flag.key, name: flag.name };
}

export function useFavorites(projectKey: string) {
  const { value, setValue, isLoading } = useLocalStorage<StoredFlagRef[]>(FAVORITES_KEY, []);
  const all = value ?? [];
  const favorites = all.filter((f) => f.projectKey === projectKey);

  return {
    favorites,
    isLoading,
    isFavorite: (flag: { key: string }) => favorites.some((f) => f.key === flag.key),
    toggleFavorite: async (ref: StoredFlagRef) => {
      const exists = all.some((f) => sameFlag(f, ref));
      await setValue(exists ? all.filter((f) => !sameFlag(f, ref)) : [...all, ref]);
      return !exists;
    },
  };
}

export function useRecents(projectKey: string) {
  const { value, setValue, isLoading } = useLocalStorage<StoredFlagRef[]>(RECENTS_KEY, []);
  const all = value ?? [];
  const recents = all.filter((f) => f.projectKey === projectKey);

  return {
    recents,
    isLoading,
    recordVisit: (ref: StoredFlagRef) => {
      const rest = all.filter((f) => !sameFlag(f, ref));
      return setValue([{ ...ref, visitedAt: Date.now() }, ...rest].slice(0, MAX_RECENTS * 3));
    },
    clearRecents: () => setValue(all.filter((f) => f.projectKey !== projectKey)),
  };
}
