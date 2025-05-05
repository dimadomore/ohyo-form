import { create } from "zustand";

export interface ClientLocation {
  gid: string;
  color: string;
  enabled: boolean;
  name: string;
  resource_type: string;
}

export interface Client {
  gid: string;
  name: string;
  email?: string;
  description?: string;
  phoneNumber?: string;
  minimalUnitsPerOrder?: string;
  locations?: ClientLocation[];
  frequencyByMonth?: string;
  lastOrderDate?: string;
}

interface ClientState {
  client?: Client;
  setClient: (client: Client) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  client: undefined,
  setClient: (client: Client) => set({ client }),
}));
