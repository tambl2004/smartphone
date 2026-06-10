import React, { useState } from 'react';
import { Link, useRouter } from '@routes/router';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { authLogin, authGoogleLogin } from '@services/auth.service';
import { GoogleLogin } from '@react-oauth/google';

export const LoginPage: React.FC = () => {
    const { navigate } = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        setIsLoading(true);

        const result = await authLogin(email, password);
        setIsLoading(false);

        if (!result.ok) {
            toast.error(result.message ?? 'Email hoặc mật khẩu không đúng');
            return;
        }

        const user = result.data?.user;
        toast.success(`Chào mừng ${user?.fullName ?? 'bạn'}!`);

        if (user?.role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Brand */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[60%] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />

                {/* Decorative floating elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 5, 0],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[15%] left-[10%] w-72 h-72 rounded-full bg-gradient-to-br from-white/[0.04] to-transparent blur-sm"
                    />
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            rotate: [0, -3, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-gradient-to-tl from-white/[0.03] to-transparent blur-sm"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.03, 0.06, 0.03],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        className="absolute top-[50%] left-[40%] w-64 h-64 rounded-full bg-white/[0.03]"
                    />
                </div>

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
                    <div>
                        <Link to="/" className="text-2xl font-bold tracking-tighter text-white">
                            NEXPHONE
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-md"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-[2px] bg-white/40" />
                            <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">Chào mừng trở lại</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
                            Khám phá thế giới<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 to-neutral-500">công nghệ đỉnh cao</span>
                        </h1>
                        <p className="text-neutral-400 text-base leading-relaxed max-w-sm">
                            Đăng nhập để trải nghiệm mua sắm cá nhân hóa, theo dõi đơn hàng và nhận ưu đãi độc quyền.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Smartphone size={18} className="text-white/60" />
                            </div>
                            <div>
                                <div className="text-white text-sm font-semibold">50K+</div>
                                <div className="text-neutral-500 text-xs">Khách hàng</div>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="text-white/60 text-sm font-bold">★</span>
                            </div>
                            <div>
                                <div className="text-white text-sm font-semibold">4.9/5</div>
                                <div className="text-neutral-500 text-xs">Đánh giá</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-neutral-950">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-[420px]"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-10">
                        <Link to="/" className="text-2xl font-bold tracking-tighter text-black dark:text-white">
                            NEXPHONE
                        </Link>
                    </div>

                    <div className="mb-10 text-center">
                        <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight">
                            Đăng nhập
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                <Mail size={18} />
                            </div>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Email của bạn"
                                className="w-full h-13 pl-12 pr-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                                autoComplete="email"
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                <Lock size={18} />
                            </div>
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Mật khẩu"
                                className="w-full h-13 pl-12 pr-12 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="relative w-[18px] h-[18px]">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-full h-full rounded-md border-2 border-neutral-300 dark:border-neutral-600 peer-checked:border-black dark:peer-checked:border-white peer-checked:bg-black dark:peer-checked:bg-white transition-all duration-200" />
                                    <svg className="absolute inset-0 w-full h-full text-white dark:text-black opacity-0 peer-checked:opacity-100 transition-opacity p-[3px]" viewBox="0 0 12 12" fill="none">
                                        <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-red-500 hover:text-red dark:hover:text-red transition-colors font-medium">
                                Quên mật khẩu?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full h-13 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden"
                        >
                            <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                Đăng nhập
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-neutral-950 px-4 text-xs text-neutral-400 font-medium uppercase tracking-widest">hoặc</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <div className="flex flex-col items-center justify-center w-full gap-3">
                            <div className="w-full flex justify-center GoogleLoginWrapper">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            setIsLoading(true);
                                            const result = await authGoogleLogin(credentialResponse.credential);
                                            setIsLoading(false);
                                            if (!result.ok) {
                                                toast.error(result.message ?? 'Đăng nhập Google thất bại');
                                                return;
                                            }
                                            const user = result.data?.user;
                                            toast.success(`Chào mừng ${user?.fullName ?? 'bạn'}!`);
                                            if (user?.role === 'admin') {
                                                navigate('/admin');
                                            } else {
                                                navigate('/');
                                            }
                                        }
                                    }}
                                    onError={() => {
                                        toast.error('Đăng nhập bằng Google thất bại');
                                    }}
                                    theme="outline"
                                    size="large"
                                    width="372"
                                />
                            </div>
                        </div>
                    )}

                    <p className="mt-8 text-center text-sm text-neutral-500">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-blue-600 dark:text-blue-600 font-semibold hover:underline underline-offset-4">
                            Đăng ký ngay
                        </Link>
                    </p>

                    {/* Footer */}
                    <p className="mt-10 text-center text-xs text-neutral-400">
                        Bằng việc đăng nhập, bạn đồng ý với{' '}
                        <a href="#" className="text-neutral-600 dark:text-neutral-300 hover:underline">Điều khoản dịch vụ</a>{' '}
                        và{' '}
                        <a href="#" className="text-neutral-600 dark:text-neutral-300 hover:underline">Chính sách bảo mật</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
