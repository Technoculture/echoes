"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type track = {
  id: string;
  title: string;
  // artist: string;
  // album: string;
  // albumArt: string;
  // duration: number;
  src: string;
};

type Store = {
  audioSrc: string | undefined;
  setAudioSrc: (src: string | undefined) => void;
  reset: () => void;
  tracks: track[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  playTrack: (index: number) => void;
  queueTracks: (track: track) => void;
  playNextTrack: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      audioSrc: "",
      setAudioSrc: (src) => set((state) => ({ ...state, audioSrc: src })),
      reset: () => {
        set({
          tracks: [] as track[],
          currentTrackIndex: null,
          isPlaying: false,
        });
      },
      tracks: [] as track[],
      currentTrackIndex: null,
      isPlaying: false,
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      playTrack: (index) =>
        set({
          currentTrackIndex: index,
          isPlaying: true,
        }),
      queueTracks: (track) => {
        const { tracks } = get();
        const isAlreadyAdded = tracks.find((t) => t.id === track.id);
        if (isAlreadyAdded) {
          return;
        } else {
          set({ tracks: [...tracks, track] });
        }
      },
      playNextTrack: () => {
        const { tracks, currentTrackIndex } = get();
        const nextTrackIndex =
          currentTrackIndex !== null ? currentTrackIndex + 1 : 0;
        if (nextTrackIndex < tracks.length) {
          set({ currentTrackIndex: nextTrackIndex });
        } else {
          set({ currentTrackIndex: null, isPlaying: false });
        }
      },
    }),
    {
      name: "audio-src", // name of the item in the storage (must be unique)
      // storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);

export default useStore;
