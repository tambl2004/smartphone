/**
 * Auth Service – kết nối frontend với API backend
 * Lưu trữ token + user trong localStorage
 */

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
};

export type AuthState = {
  token: string;
  user: AuthUser;
};

// ─── Storage helpers ──────────────────────────────────────────────────────────
export const saveAuth = (data: AuthState) => {
  localStorage.setItem('auth_token:v1', data.token);
  localStorage.setItem('auth_user:v1', JSON.stringify(data.user));
  window.dispatchEvent(new Event('storage')); // trigger update
};

export const getAuth = (): AuthState | null => {
  const token = localStorage.getItem('auth_token:v1');
  const userRaw = localStorage.getItem('auth_user:v1');
  if (!token || !userRaw) return null;
  try {
    return { token, user: JSON.parse(userRaw) as AuthUser };
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('auth_token:v1');
  localStorage.removeItem('auth_user:v1');
  window.dispatchEvent(new Event('storage'));
};

export const isAuthenticated = () => !!getAuth();

// ─── API calls ────────────────────────────────────────────────────────────────
async function post<T>(path: string, body: unknown): Promise<{ ok: boolean; data?: T; message?: string }> {
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { success: boolean; message?: string; data?: T };
    return { ok: json.success, data: json.data, message: json.message };
  } catch {
    return { ok: false, message: 'Không thể kết nối đến máy chủ' };
  }
}

async function put<T>(path: string, body: unknown): Promise<{ ok: boolean; data?: T; message?: string }> {
  try {
    const auth = getAuth();
    const res = await fetch(`${API}${path}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(auth ? { 'Authorization': `Bearer ${auth.token}` } : {})
      },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { success: boolean; message?: string; data?: T };
    return { ok: json.success, data: json.data, message: json.message };
  } catch {
    return { ok: false, message: 'Không thể kết nối đến máy chủ' };
  }
}

/** Đăng nhập – trả về token + user, tự lưu vào localStorage */
export const authLogin = async (email: string, password: string) => {
  const result = await post<AuthState>('/auth/login', { email, password });
  if (result.ok && result.data) {
    saveAuth(result.data);
  }
  return result;
};

/** Đăng ký bước 1 – gửi OTP */
export const authRegister = async (payload: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}) => post<null>('/auth/register', payload);

/** Đăng ký bước 2 – xác thực OTP */
export const authVerifyRegister = async (email: string, otp: string) => {
  const result = await post<AuthState>('/auth/register/verify', { email, otp });
  if (result.ok && result.data) {
    saveAuth(result.data);
  }
  return result;
};

/** Quên mật khẩu bước 1 – gửi OTP */
export const authForgotPassword = async (email: string) =>
  post<null>('/auth/forgot-password', { email });

/** Quên mật khẩu bước 2 – xác thực OTP */
export const authVerifyForgot = async (email: string, otp: string) =>
  post<null>('/auth/forgot-password/verify', { email, otp });

/** Quên mật khẩu bước 3 – đặt mật khẩu mới */
export const authResetPassword = async (email: string, otp: string, newPassword: string) =>
  post<null>('/auth/reset-password', { email, otp, newPassword });

/** Cập nhật hồ sơ */
export const updateProfile = async (payload: { fullName: string; phone: string; dateOfBirth?: string | null }) => {
  const result = await put<AuthUser>('/profile', payload);
  if (result.ok && result.data) {
    const auth = getAuth();
    if (auth) {
      saveAuth({ token: auth.token, user: result.data });
    }
  }
  return result;
};

/** Đổi mật khẩu */
export const updatePassword = async (currentPassword: string, newPassword: string) =>
  put<null>('/profile/password', { currentPassword, newPassword });

/** Đổi ảnh đại diện */
export const updateAvatar = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = getAuth()?.token;
    const res = await fetch(`${API}/profile/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const auth = getAuth();
      if (auth) {
        saveAuth({ token: auth.token, user: data.data });
      }
    }
    return { ok: res.ok && data.success, data: data.data, message: data.message };
  } catch {
    return { ok: false, message: 'Lỗi mạng hoặc server' };
  }
};
