import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/cart";

interface FloatingCartButtonProps {
  onClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick }) => {
  const totalCount = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0),
  );
  const [show, setShow] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    headerRef.current = document.querySelector("header");
    if (!headerRef.current) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShow(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(headerRef.current);
    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
    };
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={onClick}
      className="fixed z-50 bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center transition-colors focus:outline-none"
      aria-label="Open cart"
      style={{ boxShadow: "0 4px 24px 0 rgba(236, 72, 153, 0.3)" }}
    >
      <ShoppingCart size={32} />
      {totalCount > 0 && (
        <span className="absolute -top-4 -right-4 bg-white text-pink-600 text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center border-4 border-pink-500 shadow-lg">
          {totalCount}
        </span>
      )}
    </button>
  );
};

export default FloatingCartButton;
