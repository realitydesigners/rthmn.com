import { create } from "zustand";

interface ZenModeStore {
  isZenMode: boolean;
  toggleZenMode: () => void;
  setZenMode: (isZenMode: boolean) => void;
}

export const useZenModeStore = create<ZenModeStore>((set) => ({
  isZenMode: false,
  toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
  setZenMode: (isZenMode: boolean) => set({ isZenMode }),
}));
