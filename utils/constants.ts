export type PackType = "pack" | "box" | "single";

export type Item = {
  id: number;
  name: string; // Romanian name, used in orders/cart/Smartbill
  label: string; // Display name shown in product grid
  packImage?: string; // /mochi/pack/...
  boxImage?: string; // /mochi/box/...
  singleImage?: string; // /mochi/single/...
  smartbillProductName?: string;
  stock?: number;
};

export function getItemImage(
  item: Item,
  packType: PackType,
): string | undefined {
  switch (packType) {
    case "pack":
      return item.packImage;
    case "box":
      return item.boxImage;
    case "single":
      return item.singleImage;
  }
}

export function getCartItemImage(item: Item): string {
  return item.packImage ?? item.boxImage ?? item.singleImage ?? "";
}

export const items: Item[] = [
  {
    id: 1,
    name: "CAPSUNA",
    label: "Căpșună",
    packImage: "/mochi/pack/pack-strawberry.png",
    boxImage: "/mochi/box/box-strawberry.png",
    singleImage: "/mochi/single/single-strawberry.png",
    smartbillProductName: "Desert congelat CAPSUNA",
  },
  {
    id: 2,
    name: "MANGO",
    label: "Mango",
    packImage: "/mochi/pack/pack-mango.png",
    boxImage: "/mochi/box/box-mango.png",
    singleImage: "/mochi/single/single-mango.png",
    smartbillProductName: "Desert congelat MANGO",
  },
  {
    id: 3,
    name: "FISTIC",
    label: "Fistic",
    packImage: "/mochi/pack/pack-phistachio.png",
    boxImage: "/mochi/box/box-phistachio.png",
    singleImage: "/mochi/single/single-phistachio.png",
    smartbillProductName: "Desert congelat PREMIUM FISTIC",
  },
  {
    id: 4,
    name: "TRUFA CU VISINA",
    label: "Trufă cu vișină",
    packImage: "/mochi/pack/pack-cherry.png",
    boxImage: "/mochi/box/box-cherry.png",
    singleImage: "/mochi/single/single-cherry.png",
    smartbillProductName: "Desert congelat  TRUFA CU VISINA",
  },
  {
    id: 5,
    name: "BANANA CU CIOCOLATA",
    label: "Banană cu ciocolată",
    packImage: "/mochi/pack/pack-banana-chocolate.png",
    boxImage: "/mochi/box/box-banana-chocolate.png",
    singleImage: "/mochi/single/single-banana-chocolate.png",
    smartbillProductName: "Desert congelat BANANA CU CIOCOLATA",
  },
  {
    id: 6,
    name: "CARAMEL SARAT",
    label: "Caramel sărat",
    boxImage: "/mochi/box/box-salted.png",
    singleImage: "/mochi/single/single-salted.png",
    smartbillProductName: "Desert congelat CARAMEL SARAT",
  },
  {
    id: 7,
    name: "FRUCTUL PASIUNII",
    label: "Fructul pasiunii",
    packImage: "/mochi/pack/pack-passion.png",
    boxImage: "/mochi/box/box-passion.png",
    singleImage: "/mochi/single/single-passion.png",
    smartbillProductName: "Desert congelat FRUCTUL PASIUNII",
  },
  {
    id: 8,
    name: "COCOS CU MIGDALE",
    label: "Cocos cu migdale",
    boxImage: "/mochi/box/box-coconut.png",
    singleImage: "/mochi/single/single-coconut.png",
    smartbillProductName: "Desert congelat PREMIUM COCOS CU MIGDALE",
  },
  {
    id: 9,
    name: "FRUCTE DE PADURE",
    label: "Fructe de pădure",
    packImage: "/mochi/pack/pack-wildberries.png",
    boxImage: "/mochi/box/box-wildberries.png",
    singleImage: "/mochi/single/single-wildberries.png",
    smartbillProductName: "Desert congelat FRUCTE DE PADURE",
  },
  {
    id: 10,
    name: "CEAI VERDE MATCHA",
    label: "Ceai verde matcha",
    packImage: "/mochi/pack/pack-matcha.png",
    boxImage: "/mochi/box/box-matcha.png",
    singleImage: "/mochi/single/single-matcha.png",
    smartbillProductName: "Desert congelat PREMIUM CEAI VERDE MATCHA",
  },
  {
    id: 11,
    name: "PANNA COTTA",
    label: "Panna cotta",
    boxImage: "/mochi/box/box-pannacota.png",
    singleImage: "/mochi/single/single-pannacota.png",
    smartbillProductName: "Desert congelat PANNA COTTA",
  },
  {
    id: 12,
    name: "RODIE CU MIERE",
    label: "Rodie cu miere",
    packImage: "/mochi/pack/pack-pomegranate.png",
    boxImage: "/mochi/box/box-pomegranate.png",
    singleImage: "/mochi/single/single-pomegranate.png",
    smartbillProductName: "Desert congelat RODIE CU MIERE",
  },
  {
    id: 13,
    name: "CIOCOLATA DUBAI",
    label: "Ciocolată Dubai",
    boxImage: "/mochi/box/box-dubai-chocolate.png",
    smartbillProductName: "Desert congelat CIOCOLATA DUBAI",
  },
];
