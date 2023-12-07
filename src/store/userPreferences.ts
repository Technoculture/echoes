"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Preferences = {
  showSubRoll: boolean;
  toggleShowSubRoll: () => void;
};

export const usePreferences = create<Preferences>()(
  persist(
    (set, get) => ({
      showSubRoll: false,
      toggleShowSubRoll: () => {
        const { showSubRoll } = get();
        set({ showSubRoll: !showSubRoll });
      },
    }),
    {
      name: "user-preferences",
    },
  ),
);

export default usePreferences;
