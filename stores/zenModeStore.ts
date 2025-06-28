import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ZenModeStore {
  isZenMode: boolean;
  hasBeenAccessed: boolean; // Track if zen mode has been used before
  toggleZenMode: () => void;
  setZenMode: (isZenMode: boolean) => void;
  markAsAccessed: () => void;
}

export const useZenModeStore = create<ZenModeStore>()(
  persist(
    (set) => ({
      isZenMode: false,
      hasBeenAccessed: false,
      toggleZenMode: () =>
        set((state) => ({
          isZenMode: !state.isZenMode,
          hasBeenAccessed: true,
        })),
      setZenMode: (isZenMode: boolean) =>
        set({
          isZenMode,
          hasBeenAccessed: true,
        }),
      markAsAccessed: () => set({ hasBeenAccessed: true }),
    }),
    {
      name: "zen-mode-store",
      partialize: (state) => ({ hasBeenAccessed: state.hasBeenAccessed }),
    }
  )
);
