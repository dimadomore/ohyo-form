import React, { useState } from "react";
import { useCartStore } from "../store/cart";
import { useClientStore } from "../store/client";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import { type Item, type PackType, getItemImage } from "../utils/constants";

interface ItemGridProps {
  items: Item[];
  packType: PackType;
  loading?: boolean;
}

const StockBadge: React.FC<{ inStock: boolean }> = ({ inStock }) => (
  <div
    className={clsx(
      "absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-white z-10",
      inStock ? "bg-[#91c57e]" : "bg-[#e87a7a]",
    )}
  >
    <span
      className={clsx(
        "w-2 h-2 rounded-full flex-shrink-0",
        inStock ? "bg-white" : "bg-white/70",
      )}
    />
    {inStock ? "În stoc" : "Indisponibil"}
  </div>
);

const ItemCard: React.FC<{ item: Item; packType: PackType }> = ({
  item,
  packType,
}) => {
  const client = useClientStore((state) => state.client);
  const cartItem = useCartStore((state) =>
    state.items.find((i) => i.item.id === item.id),
  );
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const [highlight, setHighlight] = useState(false);

  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const inStock = (item.stock ?? 0) > 0;
  const orderMultiple = Number(process.env.NEXT_PUBLIC_ORDER_MULTIPLE) || 16;
  const canAdd =
    inStock && (item.stock ?? Infinity) - quantityInCart >= orderMultiple;

  const requireClient = () => {
    toast.error("Accesați pagina printr-un link personal pentru a comanda.");
  };

  const handleAdd = () => {
    if (!client) {
      requireClient();
      return;
    }
    if (canAdd) {
      addItem(item);
      setHighlight(true);
    }
  };
  const handleIncrement = () => {
    if (!client) {
      requireClient();
      return;
    }
    if (canAdd) {
      increment(item.id);
      setHighlight(true);
    }
  };

  React.useEffect(() => {
    if (highlight) {
      const t = setTimeout(() => setHighlight(false), 1800);
      return () => clearTimeout(t);
    }
  }, [highlight]);

  const imgSrc = getItemImage(item, packType);

  return (
    <div
      className={clsx(
        "relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300",
        highlight && "ring-2 ring-green-300",
      )}
    >
      <StockBadge inStock={inStock} />

      {/* Image */}
      <div className="flex items-center justify-center pt-10 pb-2 px-4 sm:px-6 min-h-[160px] sm:min-h-[200px] md:min-h-[240px]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.label}
            className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] h-auto object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-40 bg-gray-100 rounded-xl" />
        )}
      </div>

      {/* Pink bottom section: name + action */}
      <div className="mx-3 mb-3 mt-2 rounded-2xl bg-[#f7d6de] p-4">
        {/* Name */}
        <div className="text-center font-bold text-base sm:text-lg text-[#2c2c2c] mb-2">
          {item.label}
        </div>

        {/* Action */}
        {cartItem ? (
          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 flex-shrink-0 bg-[#ee798d] hover:bg-[#e95d75] text-white rounded-2xl flex items-center justify-center transition-colors"
              onClick={() => decrement(item.id)}
              aria-label="Reduce quantity"
              type="button"
            >
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <div className="flex-1 bg-white rounded-2xl py-2 text-center text-base font-bold text-[#a0566a]">
              {cartItem.quantity}
            </div>
            <button
              className="w-10 h-10 flex-shrink-0 bg-[#ee798d] hover:bg-[#e95d75] text-white rounded-2xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleIncrement}
              aria-label="Add quantity"
              disabled={!canAdd}
              type="button"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            className={clsx(
              "w-full py-2.5 rounded-xl font-bold uppercase text-xs sm:text-sm transition-colors flex items-center justify-center gap-2",
              canAdd
                ? "bg-[#ee798d] hover:bg-[#e95d75] text-white"
                : "bg-[#d0d0d0] text-white cursor-not-allowed",
            )}
            onClick={handleAdd}
            disabled={!canAdd}
            type="button"
          >
            <ShoppingCart size={15} strokeWidth={2.5} />
            Adăugați la comandă
          </button>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-100 m-4 rounded-xl" />
    <div className="h-4 bg-gray-100 rounded mx-6 mb-2" />
    <div className="h-4 bg-gray-100 rounded mx-8 mb-4" />
    <div className="mx-3 mb-3 rounded-2xl bg-[#f7d6de]/50 h-12" />
  </div>
);

const ItemGrid: React.FC<ItemGridProps> = ({ items, packType, loading }) => {
  const filtered = items.filter(
    (item) => item.smartbillProductName && getItemImage(item, packType),
  );

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {filtered.map((item) => (
        <ItemCard key={item.id} item={item} packType={packType} />
      ))}
    </div>
  );
};

export default ItemGrid;
