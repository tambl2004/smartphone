import { getAuth } from './auth.service';

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

export type Address = {
  id: number;
  fullName: string;
  phone: string;
  provinceId: string;
  provinceName: string;
  districtId: string;
  districtName: string;
  wardId: string;
  wardName: string;
  streetAddress: string;
  isDefault: boolean;
};

export type LocationItem = {
  id: string;
  name: string;
  type: string;
};

async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<{ ok: boolean; data?: T; message?: string }> {
  const auth = getAuth();
  if (!auth) return { ok: false, message: 'Chưa đăng nhập' };

  try {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
        ...options.headers,
      },
    });
    const json = await res.json() as { success: boolean; data?: T; message?: string };
    return { ok: json.success, data: json.data, message: json.message };
  } catch {
    return { ok: false, message: 'Lỗi kết nối máy chủ' };
  }
}

async function fetchPublic<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API}${path}`);
    const json = await res.json() as { success: boolean; data?: T[] };
    return json.success && json.data ? json.data : [];
  } catch {
    return [];
  }
}

// Location APIs
export const getProvinces = () => fetchPublic<LocationItem>('/locations/provinces');
export const getDistricts = (provinceId: string) => fetchPublic<LocationItem>(`/locations/provinces/${provinceId}/districts`);
export const getWards = (provinceId: string, districtId: string) => fetchPublic<LocationItem>(`/locations/provinces/${provinceId}/districts/${districtId}/wards`);

// Address APIs
export const getMyAddresses = () => fetchWithAuth<Address[]>('/addresses');
export const addAddress = (payload: Omit<Address, 'id'>) => fetchWithAuth<{ id: number }>('/addresses', {
  method: 'POST',
  body: JSON.stringify(payload),
});
export const updateAddress = (id: number, payload: Omit<Address, 'id'>) => fetchWithAuth<null>(`/addresses/${id}`, {
  method: 'PUT',
  body: JSON.stringify(payload),
});
export const deleteAddress = (id: number) => fetchWithAuth<null>(`/addresses/${id}`, {
  method: 'DELETE',
});
export const setDefaultAddress = (id: number) => fetchWithAuth<null>(`/addresses/${id}/default`, {
  method: 'PATCH',
});
