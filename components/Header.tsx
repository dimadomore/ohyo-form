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
    <header className="w-full bg-[#e5752d] px-4 sm:px-6 lg:px-12 py-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <img
          src="/mochi-logo.avif"
          alt="MOTI"
          className="h-8 sm:h-10 w-auto object-contain brightness-0 invert"
          loading="eager"
        />
        <button
          onClick={onCartClick}
          className="relative flex items-center gap-2 bg-white rounded-2xl px-4 py-2 text-[#e95d75] font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-shadow"
          aria-label="Open cart"
        >
          <ShoppingCart size={18} strokeWidth={2.5} />
          <span>Coș</span>
          {totalCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-[#e95d75] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
              {totalCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
