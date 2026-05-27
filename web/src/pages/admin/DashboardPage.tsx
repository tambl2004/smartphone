import React from 'react';
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
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartCard } from '@components/admin/ChartCard';
import { StatusBadge } from '@components/admin/StatusBadge';
import {
  dashboardStats,
  revenueChartData,
  topProducts,
  stockAlerts,
  orders,
  formatCurrency,
  formatCompactNumber,
} from '@data/adminData';

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
  const stats = Object.values(dashboardStats);
  const recentOrders = orders.slice(0, 5);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Tổng quan hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/70 outline-none focus:border-indigo-500/50 appearance-none cursor-pointer">
            <option value="month">Tháng này</option>
            <option value="week">Tuần này</option>
            <option value="year">Năm nay</option>
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
              className="bg-[#141414] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isPositive ? '+' : ''}{stat.change}%
                </div>
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">
                {stat.label === 'Doanh thu tháng' ? formatCompactNumber(stat.value) : stat.value.toLocaleString()}
              </p>
              <p className="text-xs text-white/40 mt-1">{stat.label}</p>
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
              <span className="text-xs text-white/30">12 tháng gần nhất</span>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="month" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactNumber(value)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff15', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
                      labelStyle={{ color: '#ffffff50', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDashboardRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between text-xs text-white/30 pt-2 border-t border-white/[0.04]">
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
                <span className="text-xs font-bold text-white/20 w-4">{i + 1}</span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-9 h-9 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate group-hover:text-white transition-colors">{product.name}</p>
                  <p className="text-xs text-white/30">{product.sold} đã bán</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white/60">{formatCompactNumber(product.revenue)}</p>
                  {product.trend === 'up' ? (
                    <TrendingUp size={12} className="text-emerald-400 ml-auto" />
                  ) : (
                    <TrendingDown size={12} className="text-red-400 ml-auto" />
                  )}
                </div>
              </div>
            ))}
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
              <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors bg-transparent border-none outline-none cursor-pointer">
                Xem tất cả <ArrowUpRight size={12} />
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Mã đơn</th>
                    <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Khách hàng</th>
                    <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Tổng tiền</th>
                    <th className="text-left text-xs font-medium text-white/30 pb-3 pr-4">Trạng thái</th>
                    <th className="text-left text-xs font-medium text-white/30 pb-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <td className="py-3 pr-4">
                        <span className="text-sm font-mono text-indigo-400 group-hover:text-indigo-300 transition-colors">{order.id}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-white/70">{order.customer}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-white/70 font-medium">{formatCurrency(order.total)}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-white/40">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        {/* Stock Alerts */}
        <ChartCard
          title="Cảnh báo tồn kho"
          action={
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <AlertTriangle size={12} />
              {stockAlerts.length} sản phẩm
            </span>
          }
        >
          <div className="space-y-3">
            {stockAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70 font-medium truncate group-hover:text-white transition-colors">{alert.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${alert.status === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
                        style={{ width: `${(alert.stock / alert.threshold) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/30 font-mono">{alert.stock}/{alert.threshold}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <StatusBadge status={alert.status} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
