import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Product, Category, FAQ } from '@types';
import { getProducts, getCategories } from '@services/product.service';
import { apiClient } from '../../services/api-client';
import { ProductCard } from '@/components/users/product/ProductCard';
import { ProductQuickView } from '@/components/users/product/ProductQuickView';
import { Link } from '@routes/router';
import { motion } from 'motion/react';
import { ArrowRight, Truck, ShieldCheck, CreditCard, RefreshCw, Star, Clock, Zap, ChevronDown, ChevronUp, Smartphone, Tablet, Headphones } from 'lucide-react';

// Lazy load 3D viewer - splits Three.js (~600KB) into separate chunk
const Hero3DViewer = lazy(() =>
  import('@components/3d/Hero3DViewer').then(m => ({ default: m.Hero3DViewer }))
);

// Brand logos data
const brandPartners = [
  { id: 'apple', name: 'Apple', logo: '/brands/apple.svg' },
  { id: 'samsung', name: 'Samsung', logo: '/brands/samsung.svg' },
  { id: 'oppo', name: 'OPPO', logo: '/brands/oppo.svg' },
  { id: 'xiaomi', name: 'Xiaomi', logo: '/brands/xiaomi.svg' },
  { id: 'vivo', name: 'Vivo', logo: '/brands/vivo.svg' },
  { id: 'realme', name: 'Realme', logo: '/brands/realme.svg' },
  { id: 'oneplus', name: 'OnePlus', logo: '/brands/OnePlus.svg' },
  { id: 'huawei', name: 'Huawei', logo: '/brands/Huawei.svg' },
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Văn Minh',
    avatar: '👨‍💼',
    rating: 5,
    content: 'Mua iPhone 16 Pro Max tại Nexphone, giao hàng nhanh, máy nguyên seal. Giá tốt hơn nhiều nơi khác. Rất hài lòng!',
    product: 'iPhone 16 Pro Max',
  },
  {
    id: 2,
    name: 'Trần Thị Hương',
    avatar: '👩‍🎓',
    rating: 5,
    content: 'Nhân viên tư vấn nhiệt tình, hỗ trợ trả góp 0% nhanh chóng. Đã mua Samsung S24 Ultra rất ưng ý.',
    product: 'Samsung Galaxy S24 Ultra',
  },
  {
    id: 3,
    name: 'Lê Hoàng Nam',
    avatar: '👨‍💻',
    rating: 4,
    content: 'Đặt hàng online, ship COD về tận nhà. Bảo hành 12 tháng chính hãng. Sẽ ủng hộ tiếp!',
    product: 'Xiaomi 14 Ultra',
  },
];



export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);


  useEffect(() => {
    void getProducts({ sortBy: 'id', sortOrder: 'desc', limit: 8 }).then((result) => {
      setFeaturedProducts(result.items);
    });
    void getCategories().then(setCategories);
    void apiClient.getFAQs().then((res) => {
      if (res.success && res.data) {
        setFaqs(res.data.items);
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== 1. HERO BANNER ===== */}
      <section className="relative min-h-[600px] h-[80vh] md:h-screen w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden flex items-center">
        <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Column: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              <Zap size={14} /> Ưu đãi đặc biệt – Giảm đến 15%
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black dark:text-white mb-6 leading-[1.1]">
              iPhone 16 Pro Max<br />
              <span className="text-neutral-500">Đã Có Mặt.</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-4 max-w-md">
              Giá chỉ từ <span className="font-bold text-black dark:text-white">34.990.000đ</span> | Trả góp 0% | Bảo hành 12 tháng chính hãng
            </p>
            <p className="text-sm text-neutral-500 mb-8 max-w-md">
              Tặng kèm ốp lưng chính hãng + Cường lực cao cấp. Số lượng có hạn.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="inline-flex h-12 items-center justify-center bg-black text-white dark:bg-white dark:text-black px-8 font-semibold rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm">
                Mua ngay
              </Link>
              <Link to="/products?category=apple" className="inline-flex h-12 items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-md border border-neutral-300 dark:border-neutral-700 text-black dark:text-white px-8 font-semibold rounded-md hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors gap-2 shadow-sm">
                Khám phá Pro <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 3D Container */}
          <div className="hidden md:block w-full h-[500px] md:h-[700px] lg:h-[80vh] relative overflow-hidden bg-transparent">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-2 border-neutral-300 dark:border-neutral-600 border-t-black dark:border-t-white rounded-full animate-spin" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide uppercase">
                    Đang tải mô hình 3D...
                  </span>
                </div>
              </div>
            }>
              <Hero3DViewer />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ===== 2. TRUST SIGNALS BAR ===== */}
      <section className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 py-5">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
            {[
              { icon: <Truck size={24} className="mb-3 text-blue-500" />, text: 'Giao hàng toàn quốc', subtext: 'Miễn phí đơn từ 5tr' },
              { icon: <ShieldCheck size={24} className="mb-3 text-emerald-500" />, text: 'Bảo hành chính hãng', subtext: 'Lên đến 24 tháng' },
              { icon: <CreditCard size={24} className="mb-3 text-amber-500" />, text: 'Trả góp 0%', subtext: 'Duyệt hồ sơ 15 phút' },
              { icon: <RefreshCw size={24} className="mb-3 text-red-500" />, text: 'Đổi trả 30 ngày', subtext: 'Lỗi là đổi mới' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center text-center px-4 group hover:-translate-y-1 transition-transform duration-300 cursor-default">
                {item.icon}
                <span className="text-black dark:text-white text-sm font-bold tracking-wide uppercase mb-1">{item.text}</span>
                <span className="text-xs text-neutral-500">{item.subtext}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. DANH MỤC ===== */}
      <section className="py-24 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-4">Khám phá theo danh mục</h2>
            <div className="w-16 h-1 bg-black dark:bg-white rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {categories.map((cat, idx) => {
              // Map category slug to professional Lucide icons
              const getIcon = (slug: string) => {
                switch (slug) {
                  case 'smartphones': return <Smartphone size={48} strokeWidth={1.2} />;
                  case 'tablets': return <Tablet size={48} strokeWidth={1.2} />;
                  case 'accessories': return <Headphones size={48} strokeWidth={1.2} />;
                  default: return <Smartphone size={48} strokeWidth={1.2} />;
                }
              };

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={`/products?categoryId=${cat.id}`}
                    className="group relative overflow-hidden flex flex-col items-center justify-center p-10 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:border-black dark:hover:border-white transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="relative z-10 text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-300 mb-6 transform group-hover:scale-110">
                      {getIcon(cat.slug)}
                    </div>
                    <span className="relative z-10 font-bold text-black dark:text-white tracking-widest uppercase text-xs">{cat.name}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== 4. THƯƠNG HIỆU ĐỐI TÁC ===== */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-950 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-10 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-white mb-3">Thương hiệu đối tác</h2>
            <p className="text-sm text-neutral-500">Đại lý ủy quyền chính thức của các thương hiệu hàng đầu</p>
          </motion.div>

          <div className="relative w-full overflow-hidden">
            {/* Ambient edge gradients for premium fade-in/fade-out styling */}
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-neutral-50 dark:from-neutral-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-neutral-50 dark:from-neutral-950 to-transparent z-10 pointer-events-none" />

            <div className="brands-track">
              {/* Duplicate the array multiple times to create a seamless infinite scroll loop */}
              {[...brandPartners, ...brandPartners, ...brandPartners].map((brand, idx) => (
                <Link
                  key={`${brand.id}-${idx}`}
                  to={`/products?brand=${brand.id}`}
                  className="brand-item"
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. FLASH SALE ===== */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Zap size={24} className="text-red-500" />
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white">Flash Sale</h2>
              </div>
              <div className="w-16 h-1 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Clock size={16} className="text-red-500" />
              <span className="text-sm font-medium text-neutral-500">Kết thúc sau:</span>
              <div className="flex gap-1">
                {['02', '14', '36'].map((t, i) => (
                  <React.Fragment key={i}>
                    <span className="bg-black dark:bg-white text-white dark:text-black text-sm font-bold px-2 py-1 rounded">{t}</span>
                    {i < 2 && <span className="text-black dark:text-white font-bold">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="h-full"
              >
                <ProductCard
                  product={prod}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 6. SẢN PHẨM NỔI BẬT ===== */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-4">Sản phẩm nổi bật</h2>
              <div className="w-16 h-1 bg-black dark:bg-white rounded-full"></div>
            </div>
            <Link to="/products" className="text-sm font-semibold hover:underline hidden md:block text-black dark:text-white">
              Xem tất cả sản phẩm &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="h-full"
              >
                <ProductCard
                  product={prod}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/products" className="text-sm font-semibold hover:underline text-black dark:text-white">
              Xem tất cả sản phẩm &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 7. LÝ DO CHỌN CHÚNG TÔI ===== */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-14 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-4">Tại sao chọn Nexphone?</h2>
            <p className="text-neutral-500 max-w-lg">Hơn 50.000 khách hàng đã tin tưởng mua sắm tại Nexphone</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Truck size={32} />, color: '#3b82f6', title: 'Giao hàng siêu tốc', desc: 'Nội thành 1-2 giờ. Toàn quốc 1-3 ngày. Miễn phí đơn từ 5 triệu.' },
              { icon: <ShieldCheck size={32} />, color: '#10b981', title: 'Bảo hành chính hãng', desc: '12 tháng bảo hành chính hãng. Hỗ trợ bảo hành mở rộng 24 tháng.' },
              { icon: <CreditCard size={32} />, color: '#f59e0b', title: 'Trả góp 0% lãi suất', desc: 'Duyệt nhanh 15 phút. Hỗ trợ thẻ tín dụng và công ty tài chính.' },
              { icon: <RefreshCw size={32} />, color: '#ef4444', title: 'Đổi trả 30 ngày', desc: 'Đổi mới nếu lỗi nhà sản xuất. Hoàn tiền 100% trong 7 ngày đầu.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-8 rounded-md border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                  style={{
                    backgroundColor: `${item.color}1A`, /* 10% opacity */
                    color: item.color
                  }}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-3 text-black dark:text-white">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 8. ĐÁNH GIÁ KHÁCH HÀNG ===== */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-14 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-4">Khách hàng nói gì?</h2>
            <p className="text-neutral-500">Đánh giá thực tế từ khách hàng đã mua sắm tại Nexphone</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-neutral-900 p-8 rounded-md border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 italic">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.avatar}</span>
                  <div>
                    <div className="font-bold text-sm text-black dark:text-white">{t.name}</div>
                    <div className="text-xs text-neutral-500">Đã mua {t.product}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 9. FAQ ===== */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="max-w-[800px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-14 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black dark:text-white mb-4">Câu hỏi thường gặp</h2>
            <p className="text-neutral-500">Giải đáp nhanh các thắc mắc phổ biến</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                >
                  <span className="font-semibold text-sm text-black dark:text-white pr-4">{faq.question}</span>
                  {openFaq === idx ? <ChevronUp size={18} className="text-neutral-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-neutral-400 flex-shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ProductQuickView
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
