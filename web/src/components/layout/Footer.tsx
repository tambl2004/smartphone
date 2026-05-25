import { Link } from '@routes/router';

export const Footer = () => {
  return (
    <footer className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 mt-10 pt-16 pb-8">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold tracking-tighter mb-4 text-black dark:text-white">NEXPHONE</h3>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Điểm đến hàng đầu cho các thiết bị flagship. Trải nghiệm tương lai của công nghệ di động ngay hôm nay.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[11px] uppercase tracking-widest text-black dark:text-white">Cửa hàng</h4>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">Tất cả sản phẩm</Link></li>
              <li><Link to="/products?category=apple" className="hover:text-black dark:hover:text-white transition-colors">Apple</Link></li>
              <li><Link to="/products?category=samsung" className="hover:text-black dark:hover:text-white transition-colors">Samsung</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[11px] uppercase tracking-widest text-black dark:text-white">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Vận chuyển & Trả hàng</a></li>
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[11px] uppercase tracking-widest text-black dark:text-white">Pháp lý</h4>
            <ul className="space-y-4 text-sm text-neutral-500 font-medium">
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-black dark:hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-neutral-500">
          <div>&copy; {new Date().getFullYear()} NEXPHONE. Bản quyền đã được bảo lưu.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
