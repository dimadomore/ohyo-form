export type Item = {
  id: number;
  name: string;
  image: string;
  smartbillProductName?: any; // Smartbill product data
  stock?: number; // quantity from Smartbill
};

export const items: Item[] = [
  {
    id: 1,
    name: "MANGO",
    image: "mango.png",
    smartbillProductName: "Desert congelat MANGO",
  },
  {
    id: 2,
    name: "CAPSUNA",
    image: "strawberry.png",
    smartbillProductName: "Desert congelat CAPSUNA",
  },
  {
    id: 3,
    name: "FISTIC",
    image: "pistachio.png",
    smartbillProductName: "Desert congelat PREMIUM FISTIC",
  },
  {
    id: 4,
    name: "BANANA CU CIOCOLATA",
    image: "banana-chocolate.png",
    smartbillProductName: "Desert congelat BANANA CU CIOCOLATA",
  },
  {
    id: 5,
    name: "FRUCTE DE PADURE",
    image: "berries.png",
    smartbillProductName: "Desert congelat FRUCTE DE PADURE",
  },
  {
    id: 6,
    name: "FRUCTUL PASIUNII",
    image: "passion.png",
    smartbillProductName: "Desert congelat FRUCTUL PASIUNII",
  },
  {
    id: 7,
    name: "COCOS CU MIGDALE",
    image: "coconut.png",
    smartbillProductName: "Desert congelat PREMIUM COCOS CU MIGDALE",
  },
  {
    id: 8,
    name: "TRUFA CU VISINA",
    image: "cherry-truffle.png",
    smartbillProductName: "Desert congelat  TRUFA CU VISINA",
  },
  {
    id: 9,
    name: "CARAMEL SARAT",
    image: "salted-caramel.png",
    smartbillProductName: "Desert congelat CARAMEL SARAT",
  },
  {
    id: 10,
    name: "CEAI VERDE MACTHA",
    image: "matcha.png",
    smartbillProductName: "Desert congelat PREMIUM CEAI VERDE MATCHA",
  },
  {
    id: 11,
    name: "PANNA COTTA",
    image: "panna-cotta.png",
    smartbillProductName: "Desert congelat PANNA COTTA",
  },
  {
    id: 12,
    name: "RODIE CU MIERE",
    image: "pomegranate.png",
    smartbillProductName: "Desert congelat RODIE CU MIERE",
  },
];
