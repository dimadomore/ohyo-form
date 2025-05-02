import { create } from "zustand";
import type { SmartbillStockResponse } from "../utils/smartbill/stocks";

interface StocksState {
  stocks: SmartbillStockResponse | null;
  loading: boolean;
  error: string | null;
  setStocks: (stocks: SmartbillStockResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStocksStore = create<StocksState>((set, get) => ({
  stocks: null,
  loading: false,
  error: null,
  setStocks: (stocks) => set({ stocks }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
