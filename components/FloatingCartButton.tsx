import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/cart";

type FloatingCartButtonProps = {
  onClick: () => void;
};

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const totalCount = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  if (totalCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#ee798d] hover:bg-[#e95d75] text-white font-bold rounded-2xl px-5 py-3.5 shadow-lg hover:shadow-xl transition-all"
      aria-label="Open cart"
    >
      <ShoppingCart size={20} strokeWidth={2.5} />
      <span className="text-sm">{totalCount} buc.</span>
    </button>
  );
};

export default FloatingCartButton;
