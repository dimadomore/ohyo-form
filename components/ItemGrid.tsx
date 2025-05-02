import React, { useState } from "react";
import { useCartStore } from "../store/cart";
import { toast } from "sonner";

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

const ItemCard: React.FC<{ item: Item; onAdd: () => void }> = ({
  item,
  onAdd,
}) => {
  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center h-full">
      <img
        src={`/mochi/${item.image}`}
        alt={item.name}
        className="w-36 h-28 object-contain mb-2"
        loading="lazy"
      />
      <div className="font-semibold text-lg mb-4 text-center">{item.name}</div>
      <div className="mt-auto w-full flex justify-center">
        {added ? (
          <span className="text-green-600 font-bold text-lg">Adăugat</span>
        ) : (
          <button
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors w-full"
            onClick={handleAdd}
          >
            În coș
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
    <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onAdd={() => {
            if (onAddToCart) {
              onAddToCart(item);
            } else {
              addItem(item);
              toast.success(`${item.name} adăugat în coș!`);
            }
          }}
        />
      ))}
    </div>
  );
};

export default ItemGrid;
