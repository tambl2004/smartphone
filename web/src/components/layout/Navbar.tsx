import React, { useState, useEffect } from 'react';
import { Link, useRouter } from '@routes/router';
import { useCart } from '@hooks/useCart';
import { useWishlist } from '@hooks/useWishlist';
import { Search, ShoppingBag, Heart, User, Menu, X, LogOut } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { cn } from '@utils/cn';
import { getAuth, clearAuth, type AuthState } from '@services/auth.service';
import logoImg from '../../assets/logo_dt.png';

export const Navbar: React.FC = () => {
  const { cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(getAuth);

  const { scrollY } = useScroll();

  useEffect(() => {
    const handleStorage = () => setAuth(getAuth());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
    navigate('/login');
  };

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled || menuOpen ? "bg-white/95 dark:bg-black/95 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800 py-3 shadow-sm" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">
          {/* Left Block: Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity" onClick={() => setMenuOpen(false)}>
              <img src={logoImg} alt="Logo" className="h-10 w-auto object-contain" />
            </Link>
          </div>

          {/* Middle Block: Navigation Links */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-neutral-600 dark:text-neutral-400">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">
              Sản phẩm
            </Link>
            <Link to="/news" className="hover:text-black dark:hover:text-white transition-colors">
              Tin tức
            </Link>
            <Link to="/contact" className="hover:text-black dark:hover:text-white transition-colors">
              Liên hệ
            </Link>
          </div>

          {/* Right Block: Search & Actions */}
          <div className="flex items-center gap-4 sm:gap-5 text-black dark:text-white">
            <form onSubmit={handleSearch} className="hidden lg:flex relative w-32 xl:w-48">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full bg-neutral-100 dark:bg-neutral-900 border-none rounded-full py-1.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white placeholder:text-neutral-500",
                  scrolled ? "bg-neutral-100 dark:bg-neutral-800" : "bg-white/50 dark:bg-black/50 backdrop-blur-sm"
                )}
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            </form>

            <button className="hover:opacity-60 transition-opacity" onClick={() => { navigate('/wishlist'); setMenuOpen(false); }} title="Danh sách yêu thích">
              <div className="relative">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </button>
            {/* Cart Icon */}
            <button className="hover:opacity-60 transition-opacity" onClick={() => { navigate('/cart'); setMenuOpen(false); }} title="Giỏ hàng">
              <div className="relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
            <button className="md:hidden hover:opacity-60 transition-opacity" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {auth ? (
              <div className="relative group cursor-pointer hidden md:block">
                <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-bold overflow-hidden">
                    {auth.user.avatarUrl ? (
                      <img 
                        src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')}${auth.user.avatarUrl}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      auth.user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-semibold hidden sm:block max-w-[200px] lg:max-w-[300px] truncate">
                    {auth.user.fullName}
                  </span>
                </div>
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-2">
                    <p className="text-sm font-bold text-black dark:text-white truncate">{auth.user.fullName}</p>
                    <p className="text-xs text-neutral-500 truncate">{auth.user.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <User size={16} /> Quản lý hồ sơ
                  </button>
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag size={16} /> Đơn hàng của tôi
                  </button>
                  <button
                    onClick={() => navigate('/addresses')}
                    className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <Heart size={16} /> Địa chỉ của tôi
                  </button>
                  {auth.user.role === 'admin' && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                    >
                      <User size={16} /> Bảng điều khiển
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="hover:opacity-60 transition-opacity text-sm font-semibold whitespace-nowrap hidden md:block"
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
                title="Đăng nhập"
              >
                Đăng nhập
              </button>
            )}


          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white dark:bg-black backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 absolute top-full left-0 right-0 shadow-xl"
            >
              <div className="flex flex-col px-6 py-4 gap-4 max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleSearch} className="relative w-full mb-2">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-100 dark:bg-neutral-900 border-none rounded-lg py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white placeholder:text-neutral-500"
                  />
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                </form>

                <Link to="/" onClick={() => setMenuOpen(false)} className="font-semibold text-lg hover:text-neutral-500 transition-colors py-2 border-b border-neutral-100 dark:border-neutral-800">Trang chủ</Link>
                <Link to="/products" onClick={() => setMenuOpen(false)} className="font-semibold text-lg hover:text-neutral-500 transition-colors py-2 border-b border-neutral-100 dark:border-neutral-800">Sản phẩm</Link>
                <Link to="/news" onClick={() => setMenuOpen(false)} className="font-semibold text-lg hover:text-neutral-500 transition-colors py-2 border-b border-neutral-100 dark:border-neutral-800">Tin tức</Link>
                <Link to="/contact" onClick={() => setMenuOpen(false)} className="font-semibold text-lg hover:text-neutral-500 transition-colors py-2 border-b border-neutral-100 dark:border-neutral-800">Liên hệ</Link>

                <div className="pt-2">
                  {auth ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 py-2 px-1 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center text-sm font-bold">
                          {auth.user.avatarUrl ? (
                            <img 
                              src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')}${auth.user.avatarUrl}`} 
                              alt="Avatar" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            auth.user.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-black dark:text-white">{auth.user.fullName}</p>
                          <p className="text-xs text-neutral-500">{auth.user.email}</p>
                        </div>
                      </div>
                      
                      <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">Quản lý hồ sơ</Link>
                      <Link to="/orders" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">Đơn hàng của tôi</Link>
                      <Link to="/addresses" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white">Địa chỉ của tôi</Link>
                      {auth.user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Bảng điều khiển Admin</Link>
                      )}
                      <button 
                        onClick={() => { handleLogout(); setMenuOpen(false); }}
                        className="w-full text-left py-2 text-sm font-semibold text-red-600 hover:text-red-500"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { navigate('/login'); setMenuOpen(false); }}
                      className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors text-center"
                    >
                      Đăng nhập
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};
