import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Download, Calendar, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartCard } from '@components/admin/ChartCard';
import { formatCurrency, formatCompactNumber, revenueChartData } from '@data/adminData';

const monthlyReport = [
  { month: 'Tháng 1', revenue: 1850000000, orders: 845, customers: 312, returns: 12 },
  { month: 'Tháng 2', revenue: 2120000000, orders: 962, customers: 287, returns: 8 },
  { month: 'Tháng 3', revenue: 1980000000, orders: 901, customers: 345, returns: 15 },
  { month: 'Tháng 4', revenue: 2340000000, orders: 1054, customers: 298, returns: 10 },
  { month: 'Tháng 5', revenue: 2150000000, orders: 978, customers: 356, returns: 7 },
  { month: 'Tháng 6', revenue: 2560000000, orders: 1142, customers: 412, returns: 11 },
  { month: 'Tháng 7', revenue: 2780000000, orders: 1233, customers: 389, returns: 9 },
  { month: 'Tháng 8', revenue: 2430000000, orders: 1087, customers: 367, returns: 14 },
  { month: 'Tháng 9', revenue: 2890000000, orders: 1298, customers: 401, returns: 6 },
  { month: 'Tháng 10', revenue: 2650000000, orders: 1189, customers: 378, returns: 13 },
  { month: 'Tháng 11', revenue: 2740000000, orders: 1245, customers: 423, returns: 8 },
  { month: 'Tháng 12', revenue: 2847500000, orders: 1284, customers: 445, returns: 5 },
];

const categoryReport = [
  { name: 'Điện thoại', revenue: 18500000000, percentage: 62, orders: 5420, color: 'bg-indigo-500' },
  { name: 'Phụ kiện', revenue: 6200000000, percentage: 21, orders: 3890, color: 'bg-purple-500' },
  { name: 'Máy tính bảng', revenue: 3800000000, percentage: 13, orders: 890, color: 'bg-pink-500' },
  { name: 'Đồng hồ', revenue: 1200000000, percentage: 4, orders: 450, color: 'bg-amber-500' },
];

const regionReport = [
  { name: 'TP. Hồ Chí Minh', orders: 4250, revenue: 12800000000, percentage: 43 },
  { name: 'Hà Nội', orders: 3180, revenue: 9500000000, percentage: 32 },
  { name: 'Đà Nẵng', orders: 1250, revenue: 3750000000, percentage: 13 },
  { name: 'Cần Thơ', orders: 680, revenue: 2040000000, percentage: 7 },
  { name: 'Khác', orders: 520, revenue: 1560000000, percentage: 5 },
];

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('year');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const totalRevenue = monthlyReport.reduce((a, b) => a + b.revenue, 0);
  const totalOrders = monthlyReport.reduce((a, b) => a + b.orders, 0);
  const totalCustomers = monthlyReport.reduce((a, b) => a + b.customers, 0);
  const maxMonthRevenue = Math.max(...monthlyReport.map(m => m.revenue));

  const handleExport = () => {
    toast.success('Báo cáo đã được xuất thành công! Đang tải xuống...');
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thống kê & Báo cáo</h1>
          <p className="text-sm opacity-40 mt-1">Phân tích chi tiết hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-2">
          {['month', 'quarter', 'year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-all border-none outline-none ${period === p ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] opacity-50 hover:opacity-100 hover:bg-white/[0.08]'}`}>
              {p === 'month' ? 'Tháng' : p === 'quarter' ? 'Quý' : 'Năm'}
            </button>
          ))}
          <button onClick={() => setIsExportModalOpen(true)} className="h-8 px-3 flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs opacity-60 hover:opacity-100 hover:bg-white/[0.08] transition-all outline-none">
            <Download size={12} /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Tổng doanh thu', value: formatCompactNumber(totalRevenue), color: 'from-emerald-500 to-teal-600', change: '+12.5%' },
          { icon: ShoppingCart, label: 'Tổng đơn hàng', value: totalOrders.toLocaleString(), color: 'from-blue-500 to-indigo-600', change: '+8.2%' },
          { icon: Users, label: 'Khách hàng mới', value: totalCustomers.toLocaleString(), color: 'from-purple-500 to-pink-600', change: '+15.3%' },
          { icon: Package, label: 'Tỷ lệ hoàn trả', value: '0.9%', color: 'from-amber-500 to-orange-600', change: '-2.1%' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-[#141414] border border-white/[0.06] rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs opacity-40">{stat.label}</p>
              </div>
            </div>
            <p className={`text-xs font-medium mt-2 ${stat.change.startsWith('+') ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>{stat.change} so với kỳ trước</p>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="month" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactNumber(value)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff15', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
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
                      const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#ffffff15', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
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

          <ChartCard title="Theo khu vực">
            <div className="space-y-3">
              {regionReport.map((region, i) => (
                <div key={region.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-all">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-500 dark:text-indigo-400">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm opacity-70">{region.name}</p>
                    <p className="text-xs opacity-30">{region.orders} đơn</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium opacity-60">{region.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {isExportModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsExportModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1A1A1A] border border-white/[0.08] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06] sticky top-0 z-10">
                <h3 className="text-lg font-semibold">Xuất báo cáo</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm opacity-60">Chọn định dạng và thông tin xuất báo cáo:</p>
                {[
                  { label: 'Excel (.xlsx)', desc: 'Báo cáo đầy đủ, biểu đồ', icon: '📊' },
                  { label: 'PDF (.pdf)', desc: 'Trình bày trực quan, sẵn sàng in', icon: '📄' },
                ].map(fmt => (
                  <div key={fmt.label} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 cursor-pointer transition-all">
                    <span className="text-xl">{fmt.icon}</span>
                    <div className="flex-1"><p className="text-sm opacity-80 font-medium">{fmt.label}</p><p className="text-xs opacity-30">{fmt.desc}</p></div>
                    <Check size={16} className="text-indigo-500 dark:text-indigo-400" />
                  </div>
                ))}
                <div className="p-3 rounded-lg bg-white/[0.02]">
                  <p className="text-xs opacity-40">Kỳ báo cáo: <span className="opacity-70 font-medium">{period === 'month' ? 'Tháng' : period === 'quarter' ? 'Quý' : 'Năm'}</span></p>
                </div>
              </div>
              <div className="flex gap-3 px-5 pb-5">
                <button onClick={() => setIsExportModalOpen(false)} className="flex-1 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm opacity-70 hover:opacity-100 transition-all outline-none">Hủy</button>
                <button onClick={handleExport} className="flex-1 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white font-medium transition-all outline-none border-none flex items-center justify-center gap-2">
                  <Download size={14} /> Xuất ngay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
