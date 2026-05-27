import { getDb } from './mysql.js';

export type AddressRecord = {
  id: number;
  userId: number;
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

export type AddressPayload = Omit<AddressRecord, 'id' | 'userId'>;

export const findAddressesByUserId = async (userId: number): Promise<AddressRecord[]> => {
  const [rows] = await getDb().query(
    `SELECT id, user_id AS userId, full_name AS fullName, phone,
            province_id AS provinceId, province_name AS provinceName,
            district_id AS districtId, district_name AS districtName,
            ward_id AS wardId, ward_name AS wardName,
            street_address AS streetAddress, is_default AS isDefault
     FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  return (rows as any[]).map(row => ({
    ...row,
    isDefault: Boolean(row.isDefault),
  }));
};

export const createAddress = async (userId: number, payload: AddressPayload): Promise<number> => {
  // If this is the first address or set to default, make sure others are not default
  if (payload.isDefault) {
    await clearDefaultAddress(userId);
  } else {
    // Check if user has no addresses, make this one default anyway
    const existing = await findAddressesByUserId(userId);
    if (existing.length === 0) {
      payload.isDefault = true;
    }
  }

  const [result] = await getDb().execute(
    `INSERT INTO user_addresses (
      user_id, full_name, phone, province_id, province_name, 
      district_id, district_name, ward_id, ward_name, street_address, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, payload.fullName, payload.phone, 
      payload.provinceId, payload.provinceName,
      payload.districtId, payload.districtName,
      payload.wardId, payload.wardName,
      payload.streetAddress, payload.isDefault ? 1 : 0
    ]
  );
  return Number((result as any).insertId);
};

export const updateAddress = async (id: number, userId: number, payload: AddressPayload): Promise<void> => {
  if (payload.isDefault) {
    await clearDefaultAddress(userId);
  }

  await getDb().execute(
    `UPDATE user_addresses SET 
      full_name = ?, phone = ?, province_id = ?, province_name = ?, 
      district_id = ?, district_name = ?, ward_id = ?, ward_name = ?, 
      street_address = ?, is_default = ?
     WHERE id = ? AND user_id = ?`,
    [
      payload.fullName, payload.phone, 
      payload.provinceId, payload.provinceName,
      payload.districtId, payload.districtName,
      payload.wardId, payload.wardName,
      payload.streetAddress, payload.isDefault ? 1 : 0,
      id, userId
    ]
  );
};

export const deleteAddress = async (id: number, userId: number): Promise<void> => {
  await getDb().execute('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId]);
};

export const clearDefaultAddress = async (userId: number): Promise<void> => {
  await getDb().execute('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
};

export const setDefaultAddress = async (id: number, userId: number): Promise<void> => {
  await clearDefaultAddress(userId);
  await getDb().execute('UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [id, userId]);
};
