import React, { useState } from "react";
import { useCartStore } from "../store/cart";
import { Minus, Plus } from "lucide-react";

export type Item = {
  id: number;
  name: string;
  image: string;
};

const items: Item[] = [
  { id: 1, name: "Cherry Truffle", image: "cherry-truffle.png" },
  { id: 2, name: "Banana with Chocolate", image: "banana-chocolate.png" },
  { id: 3, name: "Pistachio", image: "pistachio.png" },
  { id: 4, name: "Matcha Green Tea", image: "matcha.png" },
  { id: 5, name: "Passion Fruit", image: "passion.png" },
  { id: 6, name: "Mango", image: "mango.png" },
  { id: 7, name: "Panna Cotta", image: "panna-cotta.png" },
  { id: 8, name: "Salted Caramel", image: "salted-caramel.png" },
  { id: 9, name: "Coconut with Almonds", image: "coconut.png" },
  { id: 10, name: "Berries", image: "berries.png" },
  { id: 11, name: "Pomegranate with Honey", image: "pomegranate.png" },
  { id: 12, name: "Strawberries", image: "strawberry.png" },
];

const ItemCard: React.FC<{ item: Item }> = ({ item }) => {
  const cartItem = useCartStore((state) =>
    state.items.find((i) => i.item.id === item.id),
  );
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const [highlight, setHighlight] = useState(false);
  console.log("highlight:", highlight);

  // Highlight only on add
  const handleAdd = () => {
    addItem(item);
    setHighlight(true);
  };
  const handleIncrement = () => {
    increment(item.id);
    setHighlight(true);
  };

  React.useEffect(() => {
    if (highlight) {
      const timeout = setTimeout(() => setHighlight(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [highlight]);

  return (
    <div
      className={`bg-white rounded-xl shadow p-6 flex flex-col items-center h-full transition-colors duration-300 ${
        highlight ? "bg-green-200" : ""
      }`}
    >
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
            <span className="flex-1 px-4 mx-2 py-1 bg-gray-100 text-lg font-semibold text-center">
              {cartItem.quantity}
            </span>
            <button
              className="w-10 h-10 bg-pink-500 text-white rounded-full text-xl font-bold hover:bg-pink-600 transition-colors flex items-center justify-center"
              onClick={handleIncrement}
              aria-label="Increment"
            >
              <Plus size={20} />
            </button>
          </div>
        ) : (
          <button
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors w-full"
            onClick={handleAdd}
          >
            Adaugă
          </button>
        )}
      </div>
    </div>
  );
};

interface ItemGridProps {
  onAddToCart?: (item: Item) => void;
}

const ItemGrid: React.FC<ItemGridProps> = ({ onAddToCart }) => {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ItemGrid;
