"use client";

import Header from "../components/Header";
import Hero from "../components/Hero";
import ItemGrid from "../components/ItemGrid";
import CartPopup from "../components/CartPopup";
import FloatingCartButton from "../components/FloatingCartButton";
import { useState, Suspense, useEffect } from "react";
import { getStocks } from "../utils/smartbill/stocks";
import { useStocksStore } from "../store/stocks";
import { useClientStore } from "../store/client";
import { getAsanaTaskData } from "../utils/api";
import { items as gridItems, type Item } from "../utils/constants";

const getGidFromUrl = (url: string) => {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("gid");
};

type SmartbillProduct = {
  productName: string;
  quantity: number;
  // ...other fields
};

export function enrichGridItemsWithStock(
  gridItems: Item[],
  products: SmartbillProduct[],
): Item[] {
  return gridItems.map((item) => {
    const matchedProduct = products.find(
      (product) =>
        product.productName.trim().toLowerCase() ===
        (item.smartbillProductName ?? "").trim().toLowerCase(),
    );
    return {
      ...item,
      stock: matchedProduct ? matchedProduct.quantity : 0,
    };
  });
}

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const setStocks = useStocksStore((state) => state.setStocks);
  const setLoading = useStocksStore((state) => state.setLoading);
  const setClient = useClientStore((state) => state.setClient);
  const setError = useStocksStore((state) => state.setError);
  const products = useStocksStore(
    (state) =>
      state?.stocks?.list.find(
        (stock: any) => stock.warehouse.warehouseName === "TRAMAR",
      )?.products,
  );

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with real params or move to config
        const stocks = await getStocks({
          cif: "RO46277850",
          date: new Date().toISOString().slice(0, 10),
          warehouseName: "TRAMAR",
        });
        setStocks(stocks);
      } catch (err: any) {
        setError(err.message || "Failed to fetch stocks");
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, [setStocks, setLoading, setError]);

  useEffect(() => {
    const gid = getGidFromUrl(window.location.href);

    if (!gid) {
      return;
    }

    const fetchAsanaTaskData = async () => {
      const data = await getAsanaTaskData(gid);
      if (data.length > 0) {
        const [client] = data;
        setClient(client);
      }
    };
    fetchAsanaTaskData();
  }, []);

  const matchedItems = products
    ? enrichGridItemsWithStock(gridItems, products)
    : [];

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <Header onCartClick={() => setCartOpen(true)} />
      <Suspense fallback={null}>
        <Hero />
      </Suspense>
      <div className="flex-1 flex flex-col items-center py-6 px-4 bg-gray-50">
        <ItemGrid items={matchedItems} />
      </div>
      <Suspense fallback={null}>
        <CartPopup open={cartOpen} onClose={() => setCartOpen(false)} />
      </Suspense>
      {!cartOpen && <FloatingCartButton onClick={() => setCartOpen(true)} />}
    </main>
  );
}
