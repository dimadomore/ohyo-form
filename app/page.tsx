"use client";

import Header from "../components/Header";
import Hero from "../components/Hero";
import ItemGrid from "../components/ItemGrid";
import CartPopup from "../components/CartPopup";
import FloatingCartButton from "../components/FloatingCartButton";
import { useState, useEffect } from "react";
import { useStocksStore } from "../store/stocks";
import { useClientStore } from "../store/client";
import { getAsanaTaskData } from "../utils/api";
import {
  items as gridItems,
  type Item,
  type PackType,
} from "../utils/constants";
import clsx from "clsx";

const getGidFromUrl = (url: string) => {
  try {
    return new URL(url).searchParams.get("gid");
  } catch {
    return null;
  }
};

type SmartbillProduct = {
  productName: string;
  quantity: number;
};

function enrichGridItemsWithStock(
  gridItems: Item[],
  products: SmartbillProduct[],
): Item[] {
  return gridItems.map((item) => {
    const match = products.find(
      (p) =>
        p.productName.trim().toLowerCase() ===
        (item.smartbillProductName ?? "").trim().toLowerCase(),
    );
    return { ...item, stock: match ? match.quantity : 0 };
  });
}

const TABS: {
  id: PackType;
  label: string;
  activeClass: string;
  inactiveClass: string;
}[] = [
  {
    id: "single",
    label: "Single pack",
    activeClass: "bg-[#ee798d] text-white border-[#ee798d]",
    inactiveClass:
      "bg-transparent text-[#ee798d] border-[#ee798d] hover:bg-[#f7d6de]",
  },
  {
    id: "box",
    label: "Single box",
    activeClass: "bg-[#91c57e] text-white border-[#91c57e]",
    inactiveClass:
      "bg-transparent text-[#91c57e] border-[#91c57e] hover:bg-[#e6f5e0]",
  },
  {
    id: "pack",
    label: "4-Pack",
    activeClass: "bg-[#f9c66d] text-white border-[#f9c66d]",
    inactiveClass:
      "bg-transparent text-[#d99d39] border-[#f9c66d] hover:bg-[#fff7e8]",
  },
];

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [packType, setPackType] = useState<PackType>("single");

  const setStocks = useStocksStore((state) => state.setStocks);
  const setLoading = useStocksStore((state) => state.setLoading);
  const setError = useStocksStore((state) => state.setError);
  const stocksLoading = useStocksStore((state) => state.loading);
  const setClient = useClientStore((state) => state.setClient);

  const products = useStocksStore(
    (state) =>
      state?.stocks?.list.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stock: any) => stock.warehouse.warehouseName === "TRAMAR",
      )?.products,
  );

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/stocks");
        if (!res.ok) throw new Error("Failed to fetch stocks");
        setStocks(await res.json());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch stocks");
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, [setStocks, setLoading, setError]);

  useEffect(() => {
    const gid = getGidFromUrl(window.location.href);
    if (!gid) return;
    getAsanaTaskData(gid).then((data) => {
      if (data.length > 0) setClient(data[0]);
    });
  }, [setClient]);

  const matchedItems = products
    ? enrichGridItemsWithStock(gridItems, products)
    : gridItems.map((item) => ({ ...item, stock: undefined }));

  return (
    <main className="min-h-screen flex flex-col bg-[#f6f6f6]">
      <Header onCartClick={() => setCartOpen(true)} />
      <Hero />

      <section className="flex-1 flex flex-col items-center py-8 md:py-12 px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-screen-xl">
          {/* Section title */}
          <h2 className="uppercase text-[#e95d75] font-extrabold text-2xl sm:text-4xl md:text-5xl tracking-tight text-center mb-6 sm:mb-8">
            Comandați deserturi mochi!
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-3 mb-6 sm:mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPackType(tab.id)}
                className={clsx(
                  "flex-1 min-w-[140px] sm:min-w-0 py-3 sm:py-4 px-4 rounded-2xl border-2 font-bold uppercase text-sm sm:text-base tracking-wide transition-all",
                  packType === tab.id ? tab.activeClass : tab.inactiveClass,
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <ItemGrid
            items={matchedItems}
            packType={packType}
            loading={stocksLoading}
          />
        </div>
      </section>

      <CartPopup open={cartOpen} onClose={() => setCartOpen(false)} />
      <FloatingCartButton onClick={() => setCartOpen(true)} />
    </main>
  );
}
