export type CategoryRecord = {
  id: number;
  name: string;
};

const categories: CategoryRecord[] = [
  {
    id: 1,
    name: 'iPhone',
  },
];

export const findAllCategories = async () => {
  return categories;
};