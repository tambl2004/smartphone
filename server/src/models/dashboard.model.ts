import { getDb } from './mysql.js';

export const getDashboardSummary = async () => {
  const db = getDb();

  // 1. KPI Stats
  const [[{ totalRevenue }]] = await db.query<any>("SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status = 'delivered'");
  const [[{ totalOrders }]] = await db.query<any>("SELECT COUNT(*) AS totalOrders FROM orders");
  const [[{ newCustomers }]] = await db.query<any>("SELECT COUNT(*) AS newCustomers FROM users WHERE role = 'user' AND MONTH(created_at) = MONTH(CURRENT_DATE())");
  const [[{ totalProducts }]] = await db.query<any>("SELECT COUNT(*) AS totalProducts FROM products");

  // 2. Revenue Chart Data (Monthly for current year)
  const [monthlyDataRaw] = await db.query<any>(`
    SELECT 
      MONTH(created_at) AS month,
      SUM(total_amount) AS revenue,
      COUNT(id) AS orders,
      COUNT(DISTINCT customer_id) AS customers
    FROM orders
    WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
    GROUP BY MONTH(created_at)
    ORDER BY month ASC
  `);

  const monthlyReport = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const row = monthlyDataRaw.find((r: any) => r.month === m);
    return {
      month: `Tháng ${m}`,
      revenue: Number(row?.revenue || 0),
      orders: Number(row?.orders || 0),
      customers: Number(row?.customers || 0),
      returns: 0 // Mock returns for now
    };
  });

  // 3. Category Report
  const [categoryDataRaw] = await db.query<any>(`
    SELECT 
      c.name, 
      COALESCE(SUM(oi.line_total), 0) AS revenue,
      COALESCE(SUM(oi.quantity), 0) AS orders
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `);
  
  const totalCatRevenue = categoryDataRaw.reduce((sum: number, c: any) => sum + Number(c.revenue), 0);
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500'];
  const categoryReport = categoryDataRaw.map((c: any, index: number) => ({
    name: c.name,
    revenue: Number(c.revenue),
    orders: Number(c.orders),
    percentage: totalCatRevenue > 0 ? Math.round((Number(c.revenue) / totalCatRevenue) * 100) : 0,
    color: colors[index % colors.length]
  }));

  // 4. Region Report (Simple mock based on shipping_address text parsing)
  const regions = [
    { key: 'Hồ Chí Minh', name: 'TP. Hồ Chí Minh' },
    { key: 'Hà Nội', name: 'Hà Nội' },
    { key: 'Đà Nẵng', name: 'Đà Nẵng' },
    { key: 'Cần Thơ', name: 'Cần Thơ' }
  ];
  
  let regionReport = [];
  let otherOrders = 0;
  let otherRevenue = 0;
  
  const [allOrders] = await db.query<any>("SELECT shipping_address, total_amount FROM orders WHERE status = 'delivered'");
  const totalRegionRevenue = allOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);

  for (const r of regions) {
    const matching = allOrders.filter((o: any) => o.shipping_address.includes(r.key));
    const orders = matching.length;
    const revenue = matching.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
    regionReport.push({
      name: r.name,
      orders,
      revenue,
      percentage: totalRegionRevenue > 0 ? Math.round((revenue / totalRegionRevenue) * 100) : 0
    });
  }
  
  // Calculate "Khác"
  const matchedOrders = regionReport.reduce((sum, r) => sum + r.orders, 0);
  const matchedRevenue = regionReport.reduce((sum, r) => sum + r.revenue, 0);
  regionReport.push({
    name: 'Khác',
    orders: allOrders.length - matchedOrders,
    revenue: totalRegionRevenue - matchedRevenue,
    percentage: totalRegionRevenue > 0 ? Math.round(((totalRegionRevenue - matchedRevenue) / totalRegionRevenue) * 100) : 0
  });
  
  regionReport.sort((a, b) => b.revenue - a.revenue);

  // 5. Top Products
  const [topProductsRaw] = await db.query<any>(`
    SELECT 
      p.id, 
      p.name, 
      c.name AS category, 
      p.stock AS stock,
      COALESCE(SUM(oi.quantity), 0) AS sold,
      COALESCE(SUM(oi.line_total), 0) AS revenue
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id, p.name, c.name, p.stock
    ORDER BY sold DESC
    LIMIT 5
  `);
  
  const topProducts = topProductsRaw.map((p: any) => ({
    ...p,
    sold: Number(p.sold),
    revenue: Number(p.revenue),
    stock: Number(p.stock)
  }));

  // 6. Stock Alerts
  const [stockAlertsRaw] = await db.query<any>(`
    SELECT p.id, p.name, c.name AS category, p.stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.stock < 10
    ORDER BY p.stock ASC
    LIMIT 5
  `);
  const stockAlerts = stockAlertsRaw.map((p: any) => ({
    ...p,
    stock: Number(p.stock),
    threshold: 10
  }));

  // 7. Recent Orders
  const [recentOrdersRaw] = await db.query<any>(`
    SELECT id, order_code AS orderCode, customer_name AS customerName, total_amount AS total, status, created_at AS date
    FROM orders
    ORDER BY created_at DESC
    LIMIT 5
  `);
  const recentOrders = recentOrdersRaw.map((o: any) => ({
    ...o,
    total: Number(o.total)
  }));

  return {
    dashboardStats: {
      revenue: { label: 'Doanh thu tháng', value: Number(totalRevenue), change: 0 },
      orders: { label: 'Đơn hàng', value: Number(totalOrders), change: 0 },
      customers: { label: 'Khách hàng mới', value: Number(newCustomers), change: 0 },
      products: { label: 'Sản phẩm', value: Number(totalProducts), change: 0 },
    },
    monthlyReport,
    categoryReport,
    regionReport,
    topProducts,
    stockAlerts,
    recentOrders
  };
};
