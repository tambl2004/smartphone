import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { apiClient } from '../../services/api-client';
import { FAQ } from '../../types';
import toast from 'react-hot-toast';


export const FaqsPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  
  // Form State
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const token = localStorage.getItem('auth_token:v1') || undefined;

  const fetchFaqs = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    try {
      const res = await apiClient.getFAQs();
      if (res.success && res.data) {
        setFaqs(res.data.items);
      }
    } catch {
      toast.error('Lỗi khi tải danh sách FAQ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchFaqs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFaqs]);

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setSortOrder(faq.sortOrder);
      setIsActive(faq.isActive);
    } else {
      setEditingFaq(null);
      setQuestion('');
      setAnswer('');
      setSortOrder(faqs.length + 1);
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      const payload = { question, answer, sortOrder, isActive };
      
      if (editingFaq) {
        await apiClient.updateFAQ(editingFaq.id, payload, token);
        toast.success('Cập nhật FAQ thành công');
      } else {
        await apiClient.createFAQ(payload, token);
        toast.success('Thêm FAQ thành công');
      }
      
      handleCloseModal();
      void fetchFaqs();
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Bạn có chắc chắn muốn xóa FAQ này?')) return;
    
    try {
      await apiClient.deleteFAQ(id, token);
      toast.success('Xóa FAQ thành công');
      void fetchFaqs();
    } catch {
      toast.error('Có lỗi xảy ra khi xóa FAQ');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-black">Câu hỏi thường gặp</h1>
          <p className="text-sm text-neutral-500 mt-1">Quản lý danh sách FAQ hiển thị trên trang chủ</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors"
          style={{ color: '#ffffff', backgroundColor: '#4f46e5' }}
        >
          <Plus size={16} color="#ffffff" />
          <span style={{ color: '#ffffff' }}>Thêm FAQ mới</span>
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
              <tr>
                <th className="px-6 py-4 font-bold">Thứ tự</th>
                <th className="px-6 py-4 font-bold">Câu hỏi</th>
                <th className="px-6 py-4 font-bold">Câu trả lời</th>
                <th className="px-6 py-4 font-bold text-center">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                    <div className="flex flex-col items-center gap-2">
                      <HelpCircle size={24} className="text-neutral-300" />
                      <p>Chưa có câu hỏi nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-black">{faq.sortOrder}</td>
                    <td className="px-6 py-4 font-semibold text-black max-w-[200px] truncate">{faq.question}</td>
                    <td className="px-6 py-4 text-neutral-500 max-w-[300px] truncate">{faq.answer}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                          faq.isActive 
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {faq.isActive ? 'Hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(faq)}
                          className="p-2 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-xl font-black text-black">
                {editingFaq ? 'Cập nhật FAQ' : 'Thêm FAQ mới'}
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Câu hỏi</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  placeholder="Nhập câu hỏi..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-1.5">Câu trả lời</label>
                <textarea
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                  placeholder="Nhập câu trả lời chi tiết..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1.5">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    required
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-black mb-1.5">Trạng thái</label>
                  <label className="flex items-center gap-3 mt-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black transition-colors"></div>
                    </div>
                    <span className="text-sm font-semibold text-neutral-600 group-hover:text-black transition-colors">
                      {isActive ? 'Hiển thị' : 'Đã ẩn'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 font-bold text-sm text-black bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
                  style={{ color: '#ffffff', backgroundColor: '#4f46e5' }}
                >
                  <span style={{ color: '#ffffff' }}>{editingFaq ? 'Lưu thay đổi' : 'Thêm mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
