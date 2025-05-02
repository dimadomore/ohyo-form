"use client";

import Header from "../components/Header";
import Hero from "../components/Hero";
import ItemGrid from "../components/ItemGrid";
import CartPopup from "../components/CartPopup";
import FloatingCartButton from "../components/FloatingCartButton";
import { useState, Suspense } from "react";

export type Item = {
  id: number;
  name: string;
};

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);

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
