"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type track = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
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
  currentTrackId: string | null;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  play: () => void;
  pause: () => void;
  playTrack: (index: number) => void;
  queueTracks: (track: track) => void;
  removeFromQueue: (track: track) => void;
  playNextTrack: () => Boolean;
  playTrackById: (id: string) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      audioSrc: "",
      setAudioSrc: (src) => set((state) => ({ ...state, audioSrc: src })),
      reset: () => {
        set({
          tracks: [] as track[],
          currentTrackId: null,
          isPlaying: false,
        });
      },
      tracks: [] as track[],
      currentTrackId: null,
      isPlaying: false,
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      playTrack: (index) => {
        const { tracks } = get();
        set({
          currentTrackId: tracks[index].id,
          isPlaying: true,
        });
      },
      playTrackById: (id) => {
        set({
          currentTrackId: id,
          isPlaying: true,
        });
      },
      queueTracks: (track) => {
        const { tracks } = get();
        const isAlreadyAdded = tracks.find((t) => t.id === track.id);
        if (isAlreadyAdded) {
          return;
        } else {
          set({ tracks: [...tracks, track] });
        }
      },
      removeFromQueue: (track) => {
        const { tracks } = get();
        const filteredTracks = tracks.filter((t) => t.id !== track.id);
        if (filteredTracks.length === 0) {
          set({ currentTrackId: null, isPlaying: false });
        } else {
          set({ tracks: filteredTracks });
        }
      },
      playNextTrack: () => {
        const { tracks, currentTrackId } = get();

        const currentTrackIndex =
          currentTrackId !== null
            ? tracks.findIndex((t) => t.id == currentTrackId)
            : 0;
        const nextTrackId = tracks[currentTrackIndex + 1]?.id;
        if (currentTrackIndex + 1 < tracks.length) {
          set({ currentTrackId: nextTrackId });
          return true;
        } else {
          set({ currentTrackId: null, isPlaying: false });
          return false;
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
