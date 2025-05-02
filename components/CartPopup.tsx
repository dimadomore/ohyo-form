import React, { useState, useRef } from "react";
import { useCartStore } from "../store/cart";
import { submitOrder } from "../utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const CartPopup: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const client = searchParams.get("client") || "";
  const modalRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCount < 240) {
      toast.error("Comanda minimă este 240 bucăți.");
      return;
    }
    if (!client) {
      toast.error(
        "Nu am putut identifica clientul. Treceti prin linkul initial pentru a va loga.",
      );
      return;
    }
    setLoading(true);
    try {
      const order = {
        client,
        items: items.map(({ item, quantity }) => ({
          flavor: item.name,
          quantity,
        })),
      };
      await submitOrder(order);
      toast.success("Comanda a fost plasată cu succes!");
      clearCart();
      onClose();
    } catch (err) {
      toast.error("Eroare la trimiterea comenzii.");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleOverlayClick}
      role="presentation"
      tabIndex={-1}
    >
      <form
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
        onSubmit={handleSubmit}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl"
          onClick={onClose}
          aria-label="Închide coșul"
          type="button"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-pink-600">Coș</h2>
        {items.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Coșul este gol</div>
        ) : (
          <>
            <ul className="mb-6 divide-y">
              {items.map(({ item, quantity }) => (
                <li key={item.id} className="flex items-center gap-3 py-2">
                  <img
                    src={`/mochi/${item.image}`}
                    alt={item.name}
                    className="w-12 h-8 object-contain"
                  />
                  <span className="font-medium flex-1">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      className="px-3 py-2 text-2xl bg-gray-200 rounded hover:bg-pink-200"
                      onClick={() => decrement(item.id)}
                      type="button"
                    >
                      -
                    </button>
                    <span className="w-14 text-center text-2xl font-bold">
                      {quantity}
                    </span>
                    <button
                      className="px-3 py-2 text-2xl bg-gray-200 rounded hover:bg-pink-200"
                      onClick={() => increment(item.id)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="ml-4 text-red-500 hover:text-red-700 text-3xl font-bold px-2 py-1"
                    onClick={() => removeItem(item.id)}
                    aria-label="Șterge"
                    type="button"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="mb-4 text-lg font-semibold text-right">
              Total: {totalCount}
            </div>
          </>
        )}
        <button
          className="w-full py-3 bg-pink-500 text-white rounded-lg font-bold text-lg hover:bg-pink-600 transition-colors disabled:opacity-60 mt-2"
          disabled={items.length === 0 || totalCount < 240 || loading}
          type="submit"
        >
          {loading ? "Se trimite..." : "Plasează comanda"}
        </button>
        {totalCount < 240 && items.length > 0 && (
          <div className="text-red-500 text-center mt-2 text-sm">
            Comanda minimă este 240 bucăți.
          </div>
        )}
      </form>
    </div>
  );
};

export default CartPopup;
