import React, { useState, useRef, useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore } from "../store/cart";
import { CartOrder, submitOrder } from "../utils/api";
import { toast } from "sonner";
import { useClientStore } from "../store/client";
import { getCartItemImage } from "../utils/constants";

const CartPopup: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const client = useClientStore((state) => state.client);
  const minOrder = Number(client?.minimalUnitsPerOrder) || 240;

  const modalRef = useRef<HTMLFormElement>(null);
  const [clientInput, setClientInput] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (client) {
      setClientInput(client.name ?? "");
      setSelectedLocation(
        client.locations && client.locations.length > 0
          ? client.locations[0].name
          : undefined,
      );
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInput.trim()) {
      toast.error("Introduceți numele clientului");
      return;
    }
    if (totalCount < minOrder) {
      toast.error(`Comanda minimă este ${minOrder} bucăți.`);
      return;
    }
    setLoading(true);
    try {
      const order: CartOrder = {
        gid: client?.gid as string,
        client: clientInput,
        items: items.map(({ item, quantity }) => ({
          flavor: item.name,
          quantity,
        })),
      };
      if (selectedLocation) order.location = selectedLocation;
      await submitOrder(order);
      toast.success(
        "Comanda a fost plasată! Managerul vă va contacta în curând pentru confirmare.",
        { duration: 6000 },
      );
      clearCart();
      setOrderSuccess(true);
    } catch {
      toast.error("Eroare la trimiterea comenzii.");
    } finally {
      setLoading(false);
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Lock body scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleOverlayClick}
      role="presentation"
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-3xl font-extrabold text-[#e95d75] tracking-wide">
            Coș
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#f7d6de] text-[#e95d75] hover:bg-[#e95d75] hover:text-white transition-colors"
            aria-label="Închide"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {orderSuccess ? (
          /* Success State */
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 text-center gap-4">
            <div className="text-5xl">🎉</div>
            <p className="text-2xl font-extrabold text-[#e95d75]">
              Mulțumim, {clientInput}!
            </p>
            <div className="bg-[#fdf3f5] rounded-2xl px-5 py-4 text-sm text-[#7a4a55] leading-relaxed space-y-2">
              <p className="font-semibold">
                Comanda dumneavoastră a fost înregistrată cu succes și este în
                procesare.
              </p>
              <p>
                Managerul nostru vă va contacta în cel mai scurt timp pentru a
                confirma detaliile comenzii și data livrării.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOrderSuccess(false);
                onClose();
              }}
              className="mt-1 px-8 py-3 bg-[#ee798d] hover:bg-[#e95d75] text-white rounded-2xl font-bold transition-colors"
            >
              Închide
            </button>
          </div>
        ) : (
          <>
            {/* Client Input */}
            <div className="flex-shrink-0 px-6 pb-2 space-y-3">
              <input
                value={clientInput}
                onChange={(e) => setClientInput(e.target.value)}
                readOnly={!!client}
                placeholder="Nume client *"
                required
                className="w-full bg-[#f7d6de]/50 rounded-2xl px-4 py-3 text-sm font-medium text-[#2c2c2c] placeholder-[#c0808a] outline-none focus:ring-2 focus:ring-[#ee798d] read-only:cursor-default"
              />
              {client?.locations && client.locations.length > 1 && (
                <select
                  value={selectedLocation ?? ""}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  required
                  className="w-full bg-[#f7d6de]/50 rounded-2xl px-4 py-3 text-sm font-medium text-[#2c2c2c] outline-none focus:ring-2 focus:ring-[#ee798d]"
                >
                  {client.locations.map((loc) => (
                    <option key={loc.name} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              )}
              {minOrder > 0 && (
                <p className="text-xs text-[#e95d75] font-medium pl-1">
                  Comanda minimă {minOrder} bucăți
                </p>
              )}
            </div>

            {/* Items list */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-2">
              {items.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  Coșul este gol
                </div>
              ) : (
                <ul className="space-y-3">
                  {items.map(({ item, quantity }) => {
                    const canAdd =
                      (item.stock ?? Infinity) - quantity >=
                        (Number(process.env.NEXT_PUBLIC_ORDER_MULTIPLE) ||
                          16) && (item.stock ?? 0) > 0;
                    const imgSrc = getCartItemImage(item);
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 bg-[#fdf3f5] rounded-2xl p-3"
                      >
                        {imgSrc && (
                          <img
                            src={imgSrc}
                            alt={item.label}
                            className="w-14 h-14 object-contain flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-sm text-[#2c2c2c] leading-tight">
                              {item.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="flex-shrink-0 w-7 h-7 bg-[#ee798d] hover:bg-[#e95d75] text-white rounded-lg flex items-center justify-center transition-colors"
                              aria-label="Șterge"
                            >
                              <X size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => decrement(item.id)}
                              className="w-8 h-8 bg-[#ee798d] hover:bg-[#e95d75] text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                              aria-label="Reduce"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="flex-1 text-center font-bold text-sm text-[#be4c5f]">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => canAdd && increment(item.id)}
                              disabled={!canAdd}
                              className="w-8 h-8 bg-[#ee798d] hover:bg-[#e95d75] text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Adaugă"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 pt-3 pb-6 space-y-3">
              {items.length > 0 && (
                <div className="flex items-center justify-between text-[#e95d75] font-bold px-1">
                  <span>Total:</span>
                  <span className="text-xl">{totalCount} buc.</span>
                </div>
              )}
              {!client && (
                <p className="text-center text-xs text-[#e87a7a] font-medium py-1">
                  Accesați pagina printr-un link personal pentru a plasa o
                  comandă.
                </p>
              )}
              <button
                type="submit"
                disabled={
                  !client ||
                  items.length === 0 ||
                  totalCount < minOrder ||
                  loading
                }
                className="w-full py-3.5 bg-[#ee798d] hover:bg-[#e95d75] text-white font-bold uppercase rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
              >
                {loading ? "Se trimite..." : "Plasează comanda"}
              </button>
              {client && totalCount > 0 && totalCount < minOrder && (
                <p className="text-center text-xs text-[#e87a7a]">
                  Mai adăugați {minOrder - totalCount} bucăți pentru comanda
                  minimă
                </p>
              )}
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default CartPopup;
