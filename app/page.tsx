"use client";

import Header from "../components/Header";
import Hero from "../components/Hero";
import ItemGrid from "../components/ItemGrid";
import CartPopup from "../components/CartPopup";
import FloatingCartButton from "../components/FloatingCartButton";
import { useState, Suspense, useEffect } from "react";
import { getStocks } from "../utils/smartbill/stocks";
import { useStocksStore } from "../store/stocks";

export type Item = {
  id: number;
  name: string;
};

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const setStocks = useStocksStore((state) => state.setStocks);
  const setLoading = useStocksStore((state) => state.setLoading);
  const setError = useStocksStore((state) => state.setError);
  const products = useStocksStore(
    (state) =>
      state?.stocks?.list.find(
        (stock: any) => stock.warehouse.warehouseName === "TRAMAR",
      )?.products,
  );
  console.log("stocks:", products);

  // useEffect(() => {
  //   const fetchStocks = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       // TODO: Replace with real params or move to config
  //       const stocks = await getStocks({
  //         cif: "RO46277850",
  //         date: new Date().toISOString().slice(0, 10),
  //         warehouseName: "TRAMAR",
  //       });
  //       setStocks(stocks);
  //     } catch (err: any) {
  //       setError(err.message || "Failed to fetch stocks");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchStocks();
  // }, [setStocks, setLoading, setError]);

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header onCartClick={() => setCartOpen(true)} />
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
      <div className="flex-1 flex flex-col items-center pt-12 px-4">
        <ItemGrid />
      </div>
      <Suspense fallback={null}>
        <CartPopup open={cartOpen} onClose={() => setCartOpen(false)} />
      </Suspense>
      {!cartOpen && <FloatingCartButton onClick={() => setCartOpen(true)} />}
    </main>
  );
}
