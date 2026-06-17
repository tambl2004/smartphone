import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from '@components/admin/ChartCard';
import { StatusBadge } from '@components/admin/StatusBadge';
import { apiClient } from '@services/api-client';
import { getAuth } from '@services/auth.service';
import { formatCurrency, formatCompactNumber } from '@data/adminData';
import type { OrderStatus } from '@data/adminData';

export interface DashboardData {
  dashboardStats: Record<string, { label: string; value: number; change: number }>;
  monthlyReport: { month: string; revenue: number; orders: number; customers: number; returns: number }[];
  categoryReport: { name: string; revenue: number; orders: number; percentage: number; color: string }[];
  regionReport: { name: string; orders: number; revenue: number; percentage: number }[];
  topProducts: { id: number; name: string; category: string; stock: number; sold: number; revenue: number }[];
  stockAlerts: { id: number; name: string; category: string; stock: number; threshold: number; status?: 'critical' | 'warning' | 'good' }[];
  recentOrders: { id: number; orderCode: string; customerName: string; total: number; status: OrderStatus; date: string }[];
}

const statIcons = {
  'Doanh thu tháng': DollarSign,
  'Đơn hàng': ShoppingCart,
  'Khách hàng mới': Users,
  'Sản phẩm': Package,
};

const statColors = {
  'Doanh thu tháng': 'from-emerald-500 to-teal-600',
  'Đơn hàng': 'from-blue-500 to-indigo-600',
  'Khách hàng mới': 'from-purple-500 to-pink-600',
  'Sản phẩm': 'from-amber-500 to-orange-600',
};

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const auth = getAuth();
      if (!auth?.token) return;
      try {
        const res = await apiClient.getDashboardData(auth.token);
        if (res.success) {
          setData(res.data as unknown as DashboardData);
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 opacity-50">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p className="text-sm">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  const stats = Object.values(data.dashboardStats);
  const revenueChartData = data.monthlyReport;
  const topProducts = data.topProducts;
  const stockAlerts = data.stockAlerts;
  const recentOrders = data.recentOrders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm opacity-60 mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 bg-transparent border border-gray-200 dark:border-white/[0.08] rounded-lg text-sm text-gray-900 dark:text-white/70 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
            <option value="month" className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">Tháng này</option>
            <option value="week" className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">Tuần này</option>
            <option value="year" className="bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white">Năm nay</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[stat.label as keyof typeof statIcons] || Package;
          const gradient = statColors[stat.label as keyof typeof statColors] || 'from-gray-500 to-gray-600';
          const isPositive = stat.change >= 0;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm hover:shadow-md dark:shadow-none hover:border-gray-200 dark:hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon size={18} color="#ffffff" className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isPositive ? '+' : ''}{stat.change}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {stat.label === 'Doanh thu tháng' ? formatCompactNumber(stat.value) : stat.value.toLocaleString()}
              </p>
              <p className="text-xs opacity-60 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Biểu đồ doanh thu"
            action={
              <span className="text-xs opacity-50">Năm hiện tại</span>
            }
          >
            <div className="space-y-3">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" strokeOpacity={0.5} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactNumber(value)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff15', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: unknown) => [formatCurrency(Number(value as number || 0)), 'Doanh thu']}
                      labelStyle={{ color: '#ffffff50', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDashboardRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-xs opacity-50 pt-2 border-t border-gray-100 dark:border-white/[0.04]">
                <span>Tổng: {formatCompactNumber(revenueChartData.reduce((a, b) => a + b.revenue, 0))}</span>
                <span>TB/tháng: {formatCompactNumber(revenueChartData.reduce((a, b) => a + b.revenue, 0) / 12)}</span>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Top Products */}
        <ChartCard title="Top sản phẩm bán chạy">
          <div className="space-y-4">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-3 group cursor-pointer">
                <span className="text-xs font-bold opacity-30 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate opacity-80 group-hover:opacity-100 transition-colors">{product.name}</p>
                  <p className="text-xs opacity-50">{product.sold} đã bán</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold opacity-70">{formatCompactNumber(product.revenue)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-sm opacity-50 text-center py-4">Chưa có dữ liệu</p>}
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Đơn hàng gần đây"
            action={
              <button className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors bg-transparent border-none outline-none cursor-pointer">
                Xem tất cả <ArrowUpRight size={12} />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.04]">
                    <th className="text-left text-xs font-medium opacity-50 pb-3 pr-4">Mã đơn</th>
                    <th className="text-left text-xs font-medium opacity-50 pb-3 pr-4">Khách hàng</th>
                    <th className="text-left text-xs font-medium opacity-50 pb-3 pr-4">Tổng tiền</th>
                    <th className="text-left text-xs font-medium opacity-50 pb-3 pr-4">Trạng thái</th>
                    <th className="text-left text-xs font-medium opacity-50 pb-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <td className="py-3 pr-4">
                        <span className="text-sm font-mono text-indigo-500">{order.orderCode}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm opacity-80">{order.customerName}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm opacity-90 font-medium">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3">
                        <span className="text-sm opacity-60">{new Date(order.date).toLocaleDateString('vi-VN')}</span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-sm opacity-50">Chưa có đơn hàng nào</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        {/* Stock Alerts */}
        <ChartCard
          title="Cảnh báo tồn kho"
          action={
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <AlertTriangle size={12} />
              {stockAlerts.length} sản phẩm
            </span>
          }
        >
          <div className="space-y-3">
            {stockAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] hover:border-gray-200 dark:hover:border-white/[0.08] transition-all cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate opacity-80 group-hover:opacity-100 transition-colors">{alert.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${alert.stock < 5 ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${(alert.stock / alert.threshold) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs opacity-50 font-mono">{alert.stock}/{alert.threshold}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${alert.stock < 5 ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                    {alert.stock < 5 ? 'Nguy cấp' : 'Sắp hết'}
                  </span>
                </div>
              </div>
            ))}
            {stockAlerts.length === 0 && <p className="text-sm opacity-50 text-center py-4">Tồn kho ổn định</p>}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
