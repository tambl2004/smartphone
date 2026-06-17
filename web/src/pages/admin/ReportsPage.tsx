import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, ShoppingCart, Users, Download, Loader2, TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Bar, Line } from 'recharts';
import { ChartCard } from '@components/admin/ChartCard';
import { ExportModal } from '@components/admin/ExportModal';
import { apiClient } from '@services/api-client';
import { getAuth } from '@services/auth.service';
import { formatCurrency, formatCompactNumber } from '@data/adminData';
import type { DashboardData } from './DashboardPage';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('year');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
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
        console.error('Failed to load reports data', error);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const exportColumns = [
    { header: 'Tháng', key: 'month' },
    { header: 'Doanh thu (VND)', key: 'revenue' },
    { header: 'Số đơn hàng', key: 'orders' },
    { header: 'Khách hàng', key: 'customers' }
  ];

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 opacity-50">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p className="text-sm">Đang tải báo cáo phân tích...</p>
      </div>
    );
  }

  const monthlyReport = data.monthlyReport || [];
  const categoryReport = data.categoryReport || [];
  const regionReport = data.regionReport || [];
  const topProducts = data.topProducts || [];
  const stockAlerts = data.stockAlerts || [];

  const totalRevenue = monthlyReport.reduce((a, b) => a + b.revenue, 0);
  const totalOrders = monthlyReport.reduce((a, b) => a + b.orders, 0);
  const totalCustomers = monthlyReport.reduce((a, b) => a + b.customers, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Thống kê & Báo cáo</h1>
          <p className="text-sm opacity-60 mt-1">Phân tích chi tiết hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-2">
          {['month', 'quarter', 'year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-all outline-none ${period === p ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-white/[0.04] text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white'}`}>
              {p === 'month' ? 'Tháng' : p === 'quarter' ? 'Quý' : 'Năm'}
            </button>
          ))}
          <button onClick={() => setIsExportModalOpen(true)} className="h-8 px-3 flex items-center gap-1.5 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg text-xs font-medium opacity-80 hover:opacity-100 shadow-sm transition-all outline-none">
            <Download size={12} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), color: 'from-emerald-500 to-teal-600', change: '+12.5%', isPositive: true },
          { icon: ShoppingCart, label: 'Tổng đơn hàng', value: `${totalOrders.toLocaleString()} đơn`, color: 'from-blue-500 to-indigo-600', change: '+8.2%', isPositive: true },
          { icon: Activity, label: 'AOV (Giá trị TB đơn)', value: formatCurrency(averageOrderValue), color: 'from-amber-500 to-orange-600', change: '+4.1%', isPositive: true },
          { icon: Users, label: 'Tổng khách hàng', value: `${totalCustomers.toLocaleString()} người`, color: 'from-purple-500 to-pink-600', change: '+15.3%', isPositive: true },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] shadow-sm rounded-2xl p-5 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon size={18} color="#ffffff" className="text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
            <p className="text-xs opacity-50 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Row 1: Revenue Trends & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartCard title="Xu hướng doanh thu">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyReport} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactNumber(value)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff15', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: unknown) => [formatCurrency(Number(value as number || 0)), 'Doanh thu']}
                    labelStyle={{ color: '#ffffff50', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Category Breakdown */}
        <div>
          <ChartCard title="Theo danh mục">
            <div className="h-[300px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryReport}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="revenue"
                    stroke="none"
                  >
                    {categoryReport.map((entry, index) => {
                      const colors: Record<string, string> = {
                        'bg-indigo-500': '#6366f1',
                        'bg-purple-500': '#a855f7',
                        'bg-pink-500': '#ec4899',
                        'bg-amber-500': '#f59e0b'
                      };
                      return <Cell key={`cell-${index}`} fill={colors[entry.color] || '#6366f1'} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff15', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: unknown) => [formatCurrency(Number(value as number || 0)), 'Doanh thu']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span style={{ color: 'inherit', fontSize: '12px', opacity: 0.7 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Correlation Chart & Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue vs Orders Correlation */}
        <div className="lg:col-span-2">
          <ChartCard title="Tương quan Doanh thu & Số lượng đơn hàng">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyReport} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="month" stroke="#888888" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#888888" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactNumber(value)} />
                  <YAxis yAxisId="right" orientation="right" stroke="#888888" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff15', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#ffffff50', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar yAxisId="left" dataKey="revenue" name="Doanh thu (VND)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Số đơn hàng" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Regions */}
        <div>
          <ChartCard title="Theo khu vực (Giao hàng)">
            <div className="space-y-3 mt-4">
              {regionReport.map((region, i) => (
                <div key={region.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-transparent dark:border-white/[0.04] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold opacity-90">{region.name}</p>
                    <p className="text-xs opacity-50">{region.orders} đơn hàng</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{region.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 3: Top Products & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Selling Products */}
        <div className="lg:col-span-2">
          <ChartCard title="Sản phẩm bán chạy nhất">
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs font-semibold text-white/40 uppercase tracking-wider">
                    <th className="pb-3 text-left">Sản phẩm</th>
                    <th className="pb-3 text-center">Đã bán</th>
                    <th className="pb-3 text-right">Doanh thu</th>
                    <th className="pb-3 text-right">Tồn kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-sm">
                  {topProducts.slice(0, 5).map((prod) => (
                    <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{prod.name}</p>
                          <p className="text-xs opacity-40">{prod.category}</p>
                        </div>
                      </td>
                      <td className="py-3 text-center font-semibold text-gray-900 dark:text-white">{prod.sold}</td>
                      <td className="py-3 text-right font-bold text-emerald-500">{formatCurrency(prod.revenue)}</td>
                      <td className="py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${prod.stock <= 5 ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60'}`}>
                          {prod.stock} sp
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>

        {/* Stock Alerts */}
        <div>
          <ChartCard title="Cảnh báo tồn kho">
            <div className="space-y-3 mt-4">
              {stockAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs opacity-40">Không có cảnh báo tồn kho</div>
              ) : (
                stockAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-red-500/[0.02] dark:bg-red-500/[0.02] border border-red-500/10 hover:bg-red-500/[0.06] transition-all">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold opacity-90 truncate">{alert.name}</p>
                      <p className="text-xs opacity-50">Ngưỡng: {alert.threshold} sp | Tồn: <span className="font-bold text-red-500">{alert.stock}</span> sp</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Xuất báo cáo doanh thu"
        filename="bao-cao-doanh-thu"
        data={monthlyReport}
        columns={exportColumns}
        periodLabel={period === 'month' ? 'Tháng' : period === 'quarter' ? 'Quý' : 'Năm'}
      />
    </div>
  );
};

