// Admin credentials
export const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: '123456',
};

// Dashboard KPI data
export const dashboardStats = {
  revenue: {
    value: 2847500000,
    change: 12.5,
    label: 'Doanh thu tháng',
  },
  orders: {
    value: 1284,
    change: 8.2,
    label: 'Đơn hàng',
  },
  customers: {
    value: 3652,
    change: 15.3,
    label: 'Khách hàng mới',
  },
  products: {
    value: 156,
    change: -2.1,
    label: 'Sản phẩm',
  },
};

// Revenue chart data (last 12 months)
export const revenueChartData = [
  { month: 'T1', revenue: 1850000000, orders: 845 },
  { month: 'T2', revenue: 2120000000, orders: 962 },
  { month: 'T3', revenue: 1980000000, orders: 901 },
  { month: 'T4', revenue: 2340000000, orders: 1054 },
  { month: 'T5', revenue: 2150000000, orders: 978 },
  { month: 'T6', revenue: 2560000000, orders: 1142 },
  { month: 'T7', revenue: 2780000000, orders: 1233 },
  { month: 'T8', revenue: 2430000000, orders: 1087 },
  { month: 'T9', revenue: 2890000000, orders: 1298 },
  { month: 'T10', revenue: 2650000000, orders: 1189 },
  { month: 'T11', revenue: 2740000000, orders: 1245 },
  { month: 'T12', revenue: 2847500000, orders: 1284 },
];

// Top selling products
export const topProducts = [
  { id: 1, name: 'iPhone 15 Pro Max 256GB', sold: 342, revenue: 10236580000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80&auto=format&fit=crop&q=60', trend: 'up' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', sold: 287, revenue: 8318130000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80&auto=format&fit=crop&q=60', trend: 'up' },
  { id: 3, name: 'Xiaomi 14 Ultra 512GB', sold: 198, revenue: 5344020000, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop&q=60', trend: 'down' },
  { id: 4, name: 'AirPods Pro (Gen 2)', sold: 456, revenue: 2730840000, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80&auto=format&fit=crop&q=60', trend: 'up' },
  { id: 5, name: 'iPhone 14 Pro 128GB', sold: 175, revenue: 4023250000, image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=80&auto=format&fit=crop&q=60', trend: 'down' },
];

// Stock alerts
export const stockAlerts = [
  { id: 1, name: 'Xiaomi 14 Ultra 512GB', stock: 8, threshold: 10, status: 'critical' as const },
  { id: 2, name: 'OPPO Find N3 Flip', stock: 10, threshold: 15, status: 'warning' as const },
  { id: 3, name: 'iPad Pro M4 11-inch', stock: 12, threshold: 15, status: 'warning' as const },
  { id: 4, name: 'iPhone 15 Pro Max', stock: 15, threshold: 20, status: 'warning' as const },
];

// Order statuses
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: { name: string; quantity: number; price: number; image: string }[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export const orders: Order[] = [
  {
    id: 'ORD-2024-001',
    customer: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    items: [
      { name: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 29990000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80' },
      { name: 'AirPods Pro (Gen 2)', quantity: 1, price: 5990000, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80' },
    ],
    total: 35980000,
    status: 'delivered',
    paymentMethod: 'Chuyển khoản',
    createdAt: '2024-12-15T08:30:00',
    updatedAt: '2024-12-18T14:20:00',
  },
  {
    id: 'ORD-2024-002',
    customer: 'Trần Thị Bình',
    email: 'binh.tran@yahoo.com',
    phone: '0912345678',
    address: '456 Lê Lợi, Q.3, TP.HCM',
    items: [
      { name: 'Samsung Galaxy S24 Ultra 256GB', quantity: 1, price: 28990000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80' },
    ],
    total: 28990000,
    status: 'shipping',
    paymentMethod: 'COD',
    createdAt: '2024-12-16T10:15:00',
    updatedAt: '2024-12-17T09:00:00',
  },
  {
    id: 'ORD-2024-003',
    customer: 'Lê Minh Cường',
    email: 'cuong.le@hotmail.com',
    phone: '0923456789',
    address: '789 Trần Hưng Đạo, Q.5, TP.HCM',
    items: [
      { name: 'Xiaomi 14 Ultra 512GB', quantity: 1, price: 26990000, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80' },
      { name: 'Sony WH-1000XM5', quantity: 1, price: 7490000, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=80' },
    ],
    total: 34480000,
    status: 'confirmed',
    paymentMethod: 'Thẻ tín dụng',
    createdAt: '2024-12-17T14:45:00',
    updatedAt: '2024-12-17T15:30:00',
  },
  {
    id: 'ORD-2024-004',
    customer: 'Phạm Thị Dung',
    email: 'dung.pham@gmail.com',
    phone: '0934567890',
    address: '321 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM',
    items: [
      { name: 'iPad Pro M4 11-inch Wifi 256GB', quantity: 1, price: 26490000, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=80' },
    ],
    total: 26490000,
    status: 'pending',
    paymentMethod: 'Chuyển khoản',
    createdAt: '2024-12-18T09:00:00',
    updatedAt: '2024-12-18T09:00:00',
  },
  {
    id: 'ORD-2024-005',
    customer: 'Hoàng Văn Em',
    email: 'em.hoang@outlook.com',
    phone: '0945678901',
    address: '654 Nguyễn Đình Chiểu, Q.3, TP.HCM',
    items: [
      { name: 'OPPO Find N3 Flip 256GB', quantity: 1, price: 19990000, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=80' },
    ],
    total: 19990000,
    status: 'cancelled',
    paymentMethod: 'COD',
    createdAt: '2024-12-14T16:20:00',
    updatedAt: '2024-12-15T08:00:00',
  },
  {
    id: 'ORD-2024-006',
    customer: 'Vũ Thị Giang',
    email: 'giang.vu@gmail.com',
    phone: '0956789012',
    address: '987 Cách Mạng Tháng 8, Q.10, TP.HCM',
    items: [
      { name: 'Apple Watch Series 9 GPS 41mm', quantity: 2, price: 9490000, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80' },
    ],
    total: 18980000,
    status: 'delivered',
    paymentMethod: 'Thẻ tín dụng',
    createdAt: '2024-12-12T11:30:00',
    updatedAt: '2024-12-16T10:00:00',
  },
  {
    id: 'ORD-2024-007',
    customer: 'Đỗ Văn Hải',
    email: 'hai.do@gmail.com',
    phone: '0967890123',
    address: '147 Võ Văn Tần, Q.3, TP.HCM',
    items: [
      { name: 'Samsung Galaxy Tab S9 Ultra 5G', quantity: 1, price: 29990000, image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=80' },
      { name: 'AirPods Pro (Gen 2)', quantity: 1, price: 5990000, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80' },
    ],
    total: 35980000,
    status: 'shipping',
    paymentMethod: 'Chuyển khoản',
    createdAt: '2024-12-16T13:45:00',
    updatedAt: '2024-12-18T07:00:00',
  },
  {
    id: 'ORD-2024-008',
    customer: 'Ngô Thị Kiều',
    email: 'kieu.ngo@yahoo.com',
    phone: '0978901234',
    address: '258 Phan Xích Long, Q. Phú Nhuận, TP.HCM',
    items: [
      { name: 'iPhone 14 Pro 128GB', quantity: 1, price: 22990000, image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=80' },
    ],
    total: 22990000,
    status: 'confirmed',
    paymentMethod: 'COD',
    createdAt: '2024-12-18T07:15:00',
    updatedAt: '2024-12-18T10:30:00',
  },
  {
    id: 'ORD-2024-009',
    customer: 'Bùi Văn Long',
    email: 'long.bui@gmail.com',
    phone: '0989012345',
    address: '369 Nguyễn Trãi, Q.1, TP.HCM',
    items: [
      { name: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 29990000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80' },
    ],
    total: 29990000,
    status: 'pending',
    paymentMethod: 'Thẻ tín dụng',
    createdAt: '2024-12-18T15:00:00',
    updatedAt: '2024-12-18T15:00:00',
  },
  {
    id: 'ORD-2024-010',
    customer: 'Đinh Thị Mai',
    email: 'mai.dinh@gmail.com',
    phone: '0990123456',
    address: '741 Lý Tự Trọng, Q.1, TP.HCM',
    items: [
      { name: 'Sony WH-1000XM5', quantity: 1, price: 7490000, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=80' },
      { name: 'AirPods Pro (Gen 2)', quantity: 1, price: 5990000, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80' },
    ],
    total: 13480000,
    status: 'delivered',
    paymentMethod: 'Chuyển khoản',
    createdAt: '2024-12-10T09:30:00',
    updatedAt: '2024-12-14T16:00:00',
  },
];

// Customers data
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  joinDate: string;
  lastOrder: string;
}

export const customers: Customer[] = [
  {
    id: 'CUS-001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60',
    totalOrders: 12,
    totalSpent: 185600000,
    status: 'active',
    joinDate: '2024-01-15',
    lastOrder: '2024-12-15',
  },
  {
    id: 'CUS-002',
    name: 'Trần Thị Bình',
    email: 'binh.tran@yahoo.com',
    phone: '0912345678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60',
    totalOrders: 8,
    totalSpent: 124500000,
    status: 'active',
    joinDate: '2024-03-22',
    lastOrder: '2024-12-16',
  },
  {
    id: 'CUS-003',
    name: 'Lê Minh Cường',
    email: 'cuong.le@hotmail.com',
    phone: '0923456789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=60',
    totalOrders: 5,
    totalSpent: 89750000,
    status: 'active',
    joinDate: '2024-05-10',
    lastOrder: '2024-12-17',
  },
  {
    id: 'CUS-004',
    name: 'Phạm Thị Dung',
    email: 'dung.pham@gmail.com',
    phone: '0934567890',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop&q=60',
    totalOrders: 3,
    totalSpent: 56200000,
    status: 'active',
    joinDate: '2024-07-01',
    lastOrder: '2024-12-18',
  },
  {
    id: 'CUS-005',
    name: 'Hoàng Văn Em',
    email: 'em.hoang@outlook.com',
    phone: '0945678901',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=60',
    totalOrders: 1,
    totalSpent: 19990000,
    status: 'blocked',
    joinDate: '2024-09-15',
    lastOrder: '2024-12-14',
  },
  {
    id: 'CUS-006',
    name: 'Vũ Thị Giang',
    email: 'giang.vu@gmail.com',
    phone: '0956789012',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop&q=60',
    totalOrders: 15,
    totalSpent: 234100000,
    status: 'active',
    joinDate: '2024-02-08',
    lastOrder: '2024-12-12',
  },
  {
    id: 'CUS-007',
    name: 'Đỗ Văn Hải',
    email: 'hai.do@gmail.com',
    phone: '0967890123',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop&q=60',
    totalOrders: 7,
    totalSpent: 112300000,
    status: 'active',
    joinDate: '2024-04-20',
    lastOrder: '2024-12-16',
  },
  {
    id: 'CUS-008',
    name: 'Ngô Thị Kiều',
    email: 'kieu.ngo@yahoo.com',
    phone: '0978901234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60',
    totalOrders: 4,
    totalSpent: 67800000,
    status: 'active',
    joinDate: '2024-06-14',
    lastOrder: '2024-12-18',
  },
];

// Admin product list with more details
export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  stock: number;
  sold: number;
  rating: number;
  status: 'active' | 'draft' | 'outOfStock';
  image: string;
  createdAt: string;
}

export const adminProducts: AdminProduct[] = [
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max 256GB',
    price: 29990000,
    originalPrice: 34990000,
    category: 'Điện thoại',
    brand: 'Apple',
    stock: 15,
    sold: 342,
    rating: 4.8,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-01-10',
  },
  {
    id: 'samsung-galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra 256GB',
    price: 28990000,
    originalPrice: 33990000,
    category: 'Điện thoại',
    brand: 'Samsung',
    stock: 20,
    sold: 287,
    rating: 4.9,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-02-15',
  },
  {
    id: 'xiaomi-14-ultra',
    name: 'Xiaomi 14 Ultra 512GB',
    price: 26990000,
    originalPrice: 29990000,
    category: 'Điện thoại',
    brand: 'Xiaomi',
    stock: 8,
    sold: 198,
    rating: 4.7,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-03-20',
  },
  {
    id: 'ipad-pro-m4',
    name: 'iPad Pro M4 11-inch Wifi 256GB',
    price: 26490000,
    originalPrice: 28990000,
    category: 'Máy tính bảng',
    brand: 'Apple',
    stock: 12,
    sold: 89,
    rating: 4.9,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-04-01',
  },
  {
    id: 'oppo-find-n3-flip',
    name: 'OPPO Find N3 Flip 256GB',
    price: 19990000,
    originalPrice: 22990000,
    category: 'Điện thoại',
    brand: 'OPPO',
    stock: 10,
    sold: 67,
    rating: 4.6,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-05-12',
  },
  {
    id: 'airpods-pro-2',
    name: 'AirPods Pro (Gen 2)',
    price: 5990000,
    originalPrice: 6990000,
    category: 'Phụ kiện',
    brand: 'Apple',
    stock: 50,
    sold: 456,
    rating: 4.8,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-01-05',
  },
  {
    id: 'galaxy-tab-s9-ultra',
    name: 'Samsung Galaxy Tab S9 Ultra 5G',
    price: 29990000,
    originalPrice: 32990000,
    category: 'Máy tính bảng',
    brand: 'Samsung',
    stock: 15,
    sold: 42,
    rating: 4.9,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-06-01',
  },
  {
    id: 'sony-wh-1000xm5',
    name: 'Sony WH-1000XM5',
    price: 7490000,
    originalPrice: 8490000,
    category: 'Phụ kiện',
    brand: 'Sony',
    stock: 25,
    sold: 89,
    rating: 4.7,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-02-28',
  },
  {
    id: 'iphone-14-pro',
    name: 'iPhone 14 Pro 128GB',
    price: 22990000,
    originalPrice: 25990000,
    category: 'Điện thoại',
    brand: 'Apple',
    stock: 40,
    sold: 175,
    rating: 4.8,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-01-20',
  },
  {
    id: 'apple-watch-s9',
    name: 'Apple Watch Series 9 GPS 41mm',
    price: 9490000,
    originalPrice: 10490000,
    category: 'Phụ kiện',
    brand: 'Apple',
    stock: 30,
    sold: 124,
    rating: 4.9,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-03-15',
  },
  {
    id: 'pixel-8-pro',
    name: 'Google Pixel 8 Pro 256GB',
    price: 24990000,
    originalPrice: 27990000,
    category: 'Điện thoại',
    brand: 'Google',
    stock: 0,
    sold: 34,
    rating: 4.5,
    status: 'outOfStock',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-07-01',
  },
  {
    id: 'samsung-buds3-pro',
    name: 'Samsung Galaxy Buds3 Pro',
    price: 5490000,
    originalPrice: 5990000,
    category: 'Phụ kiện',
    brand: 'Samsung',
    stock: 35,
    sold: 156,
    rating: 4.6,
    status: 'draft',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=80&auto=format&fit=crop&q=60',
    createdAt: '2024-08-10',
  },
];

// Format currency helper
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format compact number
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + ' tỷ';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + ' triệu';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
