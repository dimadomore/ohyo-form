import { create } from "zustand";

interface ClientState {
  client: string;
  setClient: (client: string) => void;
  clearClient: () => void;
}

export const useClientStore = create<ClientState>((set) => ({
  client: "",
  setClient: (client) => set({ client }),
  clearClient: () => set({ client: "" }),
}));
