export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
}
