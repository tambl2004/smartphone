export type ProductRecord = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
};

const products: ProductRecord[] = [
  {
    id: 1,
    name: 'iPhone 16 Pro',
    price: 29990000,
    categoryId: 1,
  },
];

export const findAllProducts = async () => {
  return products;
};