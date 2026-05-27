export type JwtRole = 'admin' | 'user';

export type JwtUserPayload = {
  id: number;
  email: string;
  role: JwtRole;
};

export type LoginResponseData = {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
    role: JwtRole;
    status: 'active' | 'blocked';
  };
};
