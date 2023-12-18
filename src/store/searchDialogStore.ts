"use client";

import { create } from "zustand";

type searchDialogState = {
  showSearchDialog: boolean;
  toggleSearchDialog: () => void;
};

const useSearchDialogState = create<searchDialogState>()((set, get) => ({
  showSearchDialog: false,
  toggleSearchDialog: () => {
    const { showSearchDialog } = get();
    set({ showSearchDialog: !showSearchDialog });
  },
}));

export default useSearchDialogState;
