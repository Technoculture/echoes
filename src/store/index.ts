"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Store = {
  audioSrc: string;
  setAudioSrc: (src: string) => void;
  reset: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      audioSrc: "",
      setAudioSrc: (src) => set((state) => ({ ...state, audioSrc: src })),
      reset: () => {
        set({ audioSrc: "" });
      },
    }),
    {
      name: "audio-src", // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);

export default useStore;
