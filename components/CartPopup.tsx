import React, { useState, useRef, useEffect } from "react";
import { useCartStore } from "../store/cart";
import { submitOrder } from "../utils/api";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Input } from "@nextui-org/input";

const CartPopup: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const searchParams = useSearchParams();
  const client = searchParams.get("client") || "";
  const modalRef = useRef<HTMLFormElement>(null);
  const [clientInput, setClientInput] = useState(client);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCount < 240) {
      toast.error("Comanda minimă este 240 bucăți.");
      return;
    }
    if (!clientInput) {
      toast.error("Introduceti numele clientului");
      return;
    }
    setLoading(true);
    try {
      const order = {
        client: clientInput,
        items: items.map(({ item, quantity }) => ({
          flavor: item.name,
          quantity,
        })),
      };
      await submitOrder(order);
      toast.success("Comanda a fost plasată cu succes!");
      clearCart();
      setOrderSuccess(true);
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

  // Disable background scroll when popup is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

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
        className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-lg relative flex flex-col min-h-[400px] max-h-[80vh]"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-8 pb-0 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 text-2xl"
            onClick={onClose}
            aria-label="Închide coșul"
            type="button"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-4 text-pink-600">Coș</h2>
          {!orderSuccess && (
            <div className="mb-4">
              <Input
                label="Client"
                value={clientInput}
                onValueChange={setClientInput}
                readOnly={!!client}
                placeholder="Nume client"
                errorMessage="Introduceti numele clientului"
                isRequired
                classNames={{ input: "bg-gray-50" }}
              />
            </div>
          )}
        </div>
        {/* List (scrollable) or Success Message */}
        <div className="flex-1 min-h-0 overflow-y-auto px-8 flex flex-col justify-center">
          {orderSuccess ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <span className="text-3xl text-pink-600 font-bold mb-4">
                Mulțumim pentru comandă!
              </span>
              <span className="text-lg text-gray-700 mb-6 text-center">
                Veți fi contactat în curând pentru confirmare.
              </span>
              <button
                className="px-6 py-3 bg-pink-500 text-white rounded-lg font-bold text-lg hover:bg-pink-600 transition-colors mt-2"
                type="button"
                onClick={() => {
                  setOrderSuccess(false);
                  onClose();
                }}
              >
                Închide
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-gray-500 text-center py-8">Coșul este gol</div>
          ) : (
            <ul className="mb-6 divide-y">
              {items.map(({ item, quantity }) => (
                <li key={item.id} className="flex items-center gap-3 py-2">
                  <img
                    src={`/mochi/${item.image}`}
                    alt={item.name}
                    className="w-12 h-8 object-contain"
                  />
                  <div className="flex-1 flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-1 mt-1">
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
          )}
        </div>
        {/* Bottom (fixed) */}
        {!orderSuccess && (
          <div className="flex-shrink-0 px-8 pb-8 pt-2 bg-white rounded-b-2xl">
            {items.length > 0 && (
              <div className="mb-4 text-lg font-semibold text-right">
                Total: {totalCount}
              </div>
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
          </div>
        )}
      </form>
    </div>
  );
};

export default CartPopup;
