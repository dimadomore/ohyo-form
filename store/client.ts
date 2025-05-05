import { create } from "zustand";

type Client = Record<string, string>;

interface ClientState {
  client?: Client;
  setClient: (client: Client) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  client: undefined,
  setClient: (client: Client) => set({ client }),
}));
