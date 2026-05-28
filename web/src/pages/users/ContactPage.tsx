import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from 'lucide-react';
import { STORES } from '@/data/contact';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 pb-28">


      {/* Contact channels */}
      <div className="max-w-[1400px] mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Phone,
              label: 'Hotline',
              value: '1800 6975',
              sub: 'Miễn phí · 8:00 – 22:00 hàng ngày',
              href: 'tel:18006975',
              iconBg: 'bg-blue-50 dark:bg-blue-500/10',
              iconColor: 'text-blue-500 dark:text-blue-400',
              hoverBg: 'group-hover:bg-blue-500',
              hoverColor: 'group-hover:text-white',
              hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-500/50',
            },
            {
              icon: Mail,
              label: 'Email',
              value: 'support@nexphone.vn',
              sub: 'Phản hồi trong vòng 24 giờ',
              href: 'mailto:support@nexphone.vn',
              iconBg: 'bg-rose-50 dark:bg-rose-500/10',
              iconColor: 'text-rose-500 dark:text-rose-400',
              hoverBg: 'group-hover:bg-rose-500',
              hoverColor: 'group-hover:text-white',
              hoverBorder: 'hover:border-rose-500 dark:hover:border-rose-500/50',
            },
            {
              icon: MessageSquare,
              label: 'Live Chat',
              value: 'Chat ngay',
              sub: 'Hỗ trợ trực tiếp từ 8:00 – 21:00',
              href: '#chat',
              iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
              iconColor: 'text-emerald-500 dark:text-emerald-400',
              hoverBg: 'group-hover:bg-emerald-500',
              hoverColor: 'group-hover:text-white',
              hoverBorder: 'hover:border-emerald-500 dark:hover:border-emerald-500/50',
            },
          ].map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group flex items-start gap-5 p-7 rounded-2xl border border-neutral-100 dark:border-neutral-900 ${c.hoverBorder} transition-all duration-300 cursor-pointer`}
            >
              <div className={`w-12 h-12 rounded-xl ${c.iconBg} flex items-center justify-center flex-shrink-0 ${c.hoverBg} transition-colors duration-300`}>
                <c.icon size={20} className={`${c.iconColor} ${c.hoverColor} transition-colors duration-300`} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">{c.label}</div>
                <div className="text-lg font-black text-black dark:text-white tracking-tight mb-0.5">{c.value}</div>
                <div className="text-xs text-neutral-400 font-medium">{c.sub}</div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Main content: Form + Stores */}
      <div className="max-w-[1400px] mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h2 className="text-3xl font-black tracking-tight text-black dark:text-white mb-8">Gửi tin nhắn</h2>
            {sent ? (
              <div className="py-16 text-center rounded-2xl border border-neutral-100 dark:border-neutral-900">
                <div className="w-16 h-16 rounded-full bg-black dark:bg-white flex items-center justify-center mx-auto mb-5">
                  <Send size={24} className="text-white dark:text-black" />
                </div>
                <p className="text-xl font-black text-black dark:text-white mb-2">Đã gửi thành công!</p>
                <p className="text-neutral-400 text-sm font-medium">Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Họ và tên</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-5 py-4 text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-5 py-4 text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Chủ đề</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-5 py-4 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors appearance-none"
                  >
                    <option value="">Chọn chủ đề...</option>
                    <option>Tư vấn sản phẩm</option>
                    <option>Hỗ trợ đơn hàng</option>
                    <option>Bảo hành & sửa chữa</option>
                    <option>Khiếu nại</option>
                    <option>Hợp tác kinh doanh</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Nội dung</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-5 py-4 text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl text-sm tracking-wide hover:opacity-85 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Gửi tin nhắn
                </button>
              </form>
            )}
          </motion.div>

          {/* Stores */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <h2 className="text-3xl font-black tracking-tight text-black dark:text-white mb-8">Hệ thống cửa hàng</h2>
            <div className="space-y-4">
              {STORES.map((store, i) => (
                <div key={i} className="p-6 rounded-2xl border border-neutral-100 dark:border-neutral-900">
                  <h3 className="font-bold text-black dark:text-white mb-3">{store.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 text-sm text-neutral-500">
                      <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                      <Clock size={14} className="flex-shrink-0" />
                      <span>{store.hours}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="mt-6 rounded-2xl overflow-hidden h-64 md:h-[350px] bg-neutral-100 dark:bg-neutral-900 w-full relative">
              <iframe
                title="Bản đồ hệ thống cửa hàng"
                sandbox="allow-scripts allow-same-origin allow-popups"
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2345.425871701574!2d105.81071997383769!3d21.067404516657728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1svi!2s!4v1779723035573!5m2!1svi!2s"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
};
