export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
};

const users: UserRecord[] = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@example.com',
    password: '123456',
  },
];

export const findAllUsers = async () => {
  return users.map(({ password, ...user }) => user);
};

export const findUserByEmail = async (email: string) => {
  return users.find((user) => user.email === email) ?? null;
};