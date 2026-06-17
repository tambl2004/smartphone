import React, { useState } from 'react';
import { Link, useRouter } from '@routes/router';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authLogin, authGoogleLogin } from '@services/auth.service';
import { useGoogleLogin } from '@react-oauth/google';
import nenmayBg from '../../assets/nenmay.jpg';
import logoImg from '../../assets/logo_dt.png';

export const LoginPage: React.FC = () => {
    const { navigate } = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            const result = await authGoogleLogin(tokenResponse.access_token);
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
        },
        onError: () => {
            toast.error('Đăng nhập bằng Google thất bại');
        }
    });

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
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-cover bg-center select-none"
            style={{ backgroundImage: `url(${nenmayBg})` }}
        >
            {/* Soft dark/light overlay to improve readability over cloud background */}
            <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-950/40" />

            {/* Glowing background circles for depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl"
                />
                <motion.div
                    animate={{
                        y: [0, 20, 0],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-3xl"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-[500px] bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border border-white/40 dark:border-neutral-800/40 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
            >
                {/* Logo */}
                <div className="mb-6 flex justify-center">
                    <Link to="/" className="hover:opacity-80 transition-opacity">
                        <img src={logoImg} alt="Logo" className="h-12 w-auto object-contain" />
                    </Link>
                </div>

                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight">
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
                            className="w-full h-13 pl-12 pr-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
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
                            className="w-full h-13 pl-12 pr-12 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
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
                        <Link to="/forgot-password" className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium">
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
                        <div className="w-full border-t border-neutral-200 dark:border-neutral-800/80" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white/80 dark:bg-neutral-950/80 px-4 py-0.5 text-xs text-neutral-400 font-semibold uppercase tracking-wider rounded-full backdrop-blur-md">Hoặc đăng nhập bằng</span>
                    </div>
                </div>

                {/* Social Login */}
                {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                    <div className="flex flex-col items-center justify-center w-full gap-3">
                        <div className="w-full flex justify-center items-center gap-3 GoogleLoginWrapper">
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                className="flex items-center justify-center gap-2.5 h-10 w-[180px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200 text-sm font-semibold text-[#1f1f1f] dark:text-neutral-200 shadow-sm"
                                style={{ fontFamily: 'Roboto, aria, sans-serif' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => toast.success('Đăng nhập Facebook đang được kết nối...')}
                                className="flex items-center justify-center gap-2.5 h-10 w-[180px] rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200 text-sm font-semibold text-[#1f1f1f] dark:text-neutral-200 shadow-sm"
                                style={{ fontFamily: 'Roboto, aria, sans-serif' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </button>
                        </div>
                    </div>
                )}

                <p className="mt-8 text-center text-sm text-neutral-500">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-blue-600 dark:text-blue-500 font-semibold hover:underline underline-offset-4">
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
    );
};
