"use client";
import React from "react";
import { create } from "zustand";

type Store = {
  slot: React.ReactNode;
  setSlot: (slot: React.ReactNode) => void;
};

const useSlotStore = create<Store>()((set, get) => ({
  slot: null,
  setSlot: (slot) => set((state) => ({ ...state, slot: slot })),
}));

export default useSlotStore;
