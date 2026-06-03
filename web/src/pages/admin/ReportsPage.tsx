import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DollarSign, ShoppingCart, Users, Package, Download, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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

  const totalRevenue = monthlyReport.reduce((a, b) => a + b.revenue, 0);
  const totalOrders = monthlyReport.reduce((a, b) => a + b.orders, 0);
  const totalCustomers = monthlyReport.reduce((a, b) => a + b.customers, 0);

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Tổng doanh thu', value: formatCompactNumber(totalRevenue), color: 'from-emerald-500 to-teal-600', change: '+12.5%' },
          { icon: ShoppingCart, label: 'Tổng đơn hàng', value: totalOrders.toLocaleString(), color: 'from-blue-500 to-indigo-600', change: '+8.2%' },
          { icon: Users, label: 'Khách hàng', value: totalCustomers.toLocaleString(), color: 'from-purple-500 to-pink-600', change: '+15.3%' },
          { icon: Package, label: 'Tỷ lệ hoàn trả', value: '0.9%', color: 'from-amber-500 to-orange-600', change: '-2.1%' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-[#141414] border border-gray-100 dark:border-white/[0.06] shadow-sm rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs opacity-60">{stat.label}</p>
              </div>
            </div>
            <p className={`text-xs font-medium mt-2 ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.change} so với kỳ trước</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartCard title="Báo cáo theo tháng">
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
                    formatter={(value: number) => [formatCurrency(Number(value || 0)), 'Doanh thu']}
                    labelStyle={{ color: '#ffffff50', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <ChartCard title="Theo danh mục">
            <div className="h-[220px] w-full mt-2">
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
                      // Extract color hex based on tailwind class (approximate for recharts)
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
                    formatter={(value: number) => [formatCurrency(Number(value || 0)), 'Doanh thu']}
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

          <ChartCard title="Theo khu vực (Giao hàng)">
            <div className="space-y-3">
              {regionReport.map((region, i) => (
                <div key={region.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm opacity-80">{region.name}</p>
                    <p className="text-xs opacity-50">{region.orders} đơn</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium opacity-70">{region.percentage}%</p>
                  </div>
                </div>
              ))}
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
