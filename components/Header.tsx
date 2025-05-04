import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/cart";

type HeaderProps = {
  onCartClick: () => void;
};

const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const totalCount = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white">
      <div className="flex items-center gap-2 text-2xl font-bold text-black">
        OHYO Distribution
      </div>
      <button
        onClick={onCartClick}
        className="relative flex items-center gap-2 px-4 py-2 rounded-full border-2 border-pink-400 bg-pink-50 hover:bg-pink-100 transition-colors shadow-md text-pink-700 font-semibold text-lg"
        aria-label="Open cart"
      >
        <ShoppingCart size={28} />
        <span className="ml-1">Coș</span>
        {totalCount > 0 && (
          <span className="absolute -top-4 -right-4 bg-pink-500 text-white text-sm font-bold rounded-full w-9 h-9 flex items-center justify-center shadow">
            {totalCount}
          </span>
        )}
      </button>
    </header>
  );
};

export default Header;
