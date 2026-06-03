import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  filename?: string;
  data: Record<string, unknown>[];
  columns: { header: string; key: string | ((row: Record<string, unknown>) => unknown) }[];
  periodLabel?: string;
  summaryText?: string;
  buttonLabel?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  title = 'Xuất báo cáo',
  filename = 'bao-cao',
  data,
  columns,
  periodLabel,
  summaryText,
  buttonLabel = 'Xuất ngay'
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'xlsx' | 'csv'>('xlsx');

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.error('Không có dữ liệu để xuất!');
      return;
    }

    try {
      const exportData = data.map(row => {
        const newRow: Record<string, unknown> = {};
        columns.forEach(col => {
          newRow[col.header] = typeof col.key === 'function' ? col.key(row) : row[col.key];
        });
        return newRow;
      });

      const dateStr = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}-${dateStr}`;

      if (selectedFormat === 'xlsx') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo cáo');
        XLSX.writeFile(workbook, `${fullFilename}.xlsx`);
        toast.success('Xuất file Excel thành công!');
      } 
      else if (selectedFormat === 'csv') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvOutput], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fullFilename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Xuất file CSV thành công!');
      } 

      onClose();
    } catch (error) {
      console.error('Lỗi khi xuất file:', error);
      toast.error('Có lỗi xảy ra khi xuất báo cáo.');
    }
  };

  const formats = [
    { id: 'xlsx', label: 'Excel (.xlsx)', desc: 'Báo cáo đầy đủ, dễ dàng tính toán', icon: '📊' },
    { id: 'csv', label: 'CSV (.csv)', desc: 'Định dạng nhẹ, dùng cho import hệ thống', icon: '📝' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/[0.08] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06] sticky top-0 bg-white dark:bg-[#1A1A1A] z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all border-none outline-none"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm opacity-60">Chọn định dạng và thông tin xuất báo cáo:</p>
              
              <div className="space-y-2">
                {formats.map(fmt => (
                  <div 
                    key={fmt.id} 
                    onClick={() => setSelectedFormat(fmt.id as 'xlsx' | 'csv')}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedFormat === fmt.id ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500/30' : 'bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-white/[0.06] hover:border-indigo-500/30'}`}
                  >
                    <span className="text-xl">{fmt.icon}</span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${selectedFormat === fmt.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>{fmt.label}</p>
                      <p className="text-xs opacity-50">{fmt.desc}</p>
                    </div>
                    {selectedFormat === fmt.id && <Check size={16} className="text-indigo-500" />}
                  </div>
                ))}
              </div>

              {periodLabel && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                  <p className="text-xs opacity-60">Kỳ báo cáo: <span className="font-medium text-gray-900 dark:text-white">{periodLabel}</span></p>
                </div>
              )}

              {summaryText && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/[0.02]">
                  <p className="text-xs opacity-60">{summaryText}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={onClose} className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-sm opacity-80 hover:opacity-100 transition-all outline-none text-gray-900 dark:text-white">Hủy</button>
              <button onClick={handleExport} className="flex-1 h-10 rounded-lg bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-sm text-white !text-white dark:!text-gray-900 font-medium transition-all outline-none border-none flex items-center justify-center gap-2">
                <Download size={14} /> {buttonLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
