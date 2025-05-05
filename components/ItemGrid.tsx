import React, { useState } from "react";
import { useCartStore } from "../store/cart";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { type Item, items } from "../utils/constants";

interface ItemGridProps {
  items: Item[];
}

const ItemCard: React.FC<{ item: Item }> = ({ item }) => {
  const cartItem = useCartStore((state) =>
    state.items.find((i) => i.item.id === item.id),
  );
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const [highlight, setHighlight] = useState(false);

  const quantityInCart = cartItem ? cartItem.quantity : 0;
  // Only allow adding if at least 20 left in stock
  const canAdd = (item.stock ?? Infinity) - quantityInCart >= 20;

  // Highlight only on add
  const handleAdd = () => {
    if (canAdd) {
      addItem(item);
      setHighlight(true);
    }
  };
  const handleIncrement = () => {
    if (canAdd) {
      increment(item.id);
      setHighlight(true);
    }
  };

  React.useEffect(() => {
    if (highlight) {
      const timeout = setTimeout(() => setHighlight(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [highlight]);

  return (
    <div
      className={
        "bg-white rounded-xl shadow p-3 md:p-6 flex flex-col items-center h-full transition-colors duration-300 relative"
      }
      style={{ backgroundColor: highlight ? "#bbf7d0" : "white" }}
    >
      {/* Stock tag in top right */}
      <div
        className={clsx(
          "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold",
          canAdd ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600",
        )}
        style={{ zIndex: 2 }}
      >
        {canAdd ? "În stoc" : "Stoc epuizat"}
      </div>
      <img
        src={`/mochi/${item.image}`}
        alt={item.name}
        className="w-36 h-28 object-contain mb-2"
        loading="lazy"
      />
      <div className="font-semibold text-lg mb-4 text-center">{item.name}</div>
      <div className="mt-auto w-full flex justify-center">
        {cartItem ? (
          <div className="flex items-center w-full">
            <button
              className="w-10 h-10 bg-gray-200 rounded-full text-xl font-bold hover:bg-gray-300 transition-colors flex items-center justify-center"
              onClick={() => decrement(item.id)}
              aria-label="Decrement"
            >
              <Minus size={20} />
            </button>
            <div className="flex items-baseline justify-center gap-1 flex-1 px-2 md:px-4 mx-1 md:mx-4 py-2 md:py-1 bg-gray-100 text-sm md:text-lg font-semibold text-center rounded-md">
              {cartItem.quantity}{" "}
              <span className="text-xs font-normal">buc.</span>
            </div>
            <button
              className="w-10 h-10 bg-pink-500 text-white rounded-full text-xl font-bold hover:bg-pink-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleIncrement}
              aria-label="Increment"
              disabled={!canAdd}
            >
              <Plus size={20} />
            </button>
          </div>
        ) : (
          <button
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors w-full"
            onClick={handleAdd}
            disabled={!canAdd}
          >
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              Adaugă
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

const ItemGrid: React.FC<ItemGridProps> = ({ items }) => {
  // Only show items with stock > 0 and Smartbill product
  const filtered = items.filter(
    (item) => item.smartbillProductName && (item.stock ?? 0) > 0,
  );
  return (
    <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
      {filtered.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ItemGrid;
