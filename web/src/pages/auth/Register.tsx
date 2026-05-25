import React, { useState } from 'react';
import { Link, useRouter } from '@routes/router';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight, Mail, Lock, User as UserIcon, Phone, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const passwordRules = [
    { label: 'Tối thiểu 8 ký tự', test: (p: string) => p.length >= 8 },
    { label: 'Có chữ hoa', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Có chữ số', test: (p: string) => /[0-9]/.test(p) },
];

export const RegisterPage: React.FC = () => {
    const { navigate } = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [agreedTerms, setAgreedTerms] = useState(false);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.password) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }
        if (!agreedTerms) {
            toast.error('Vui lòng đồng ý với điều khoản dịch vụ');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email.');
        setIsLoading(false);
        navigate('/login');
    };

    const passwordStrength = passwordRules.filter(r => r.test(formData.password)).length;

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Brand */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[60%] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />

                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            y: [0, -25, 0],
                            x: [0, 10, 0],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[10%] right-[10%] w-80 h-80 rounded-full bg-gradient-to-br from-white/[0.04] to-transparent blur-sm"
                    />
                    <motion.div
                        animate={{
                            y: [0, 15, 0],
                            x: [0, -8, 0],
                        }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        className="absolute bottom-[15%] left-[5%] w-72 h-72 rounded-full bg-gradient-to-tl from-white/[0.03] to-transparent blur-sm"
                    />

                    {/* Geometric lines */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 800 1000">
                        <motion.line
                            x1="100" y1="0" x2="700" y2="1000"
                            stroke="white" strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 3, ease: 'easeInOut' }}
                        />
                        <motion.line
                            x1="300" y1="0" x2="500" y2="1000"
                            stroke="white" strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 3, ease: 'easeInOut', delay: 0.5 }}
                        />
                    </svg>
                </div>

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
                            <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">Tạo tài khoản</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
                            Gia nhập cộng đồng<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 to-neutral-500">công nghệ Nexphone</span>
                        </h1>
                        <p className="text-neutral-400 text-base leading-relaxed max-w-sm">
                            Tạo tài khoản để nhận ngay voucher giảm 500K cho đơn hàng đầu tiên và nhiều ưu đãi hấp dẫn khác.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="space-y-3">
                            {['Tích điểm đổi quà mỗi đơn hàng', 'Theo dõi đơn hàng realtime', 'Ưu đãi sinh nhật độc quyền'].map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1 + i * 0.15 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 size={12} className="text-emerald-400" />
                                    </div>
                                    <span className="text-neutral-400 text-sm">{text}</span>
                                </motion.div>
                            ))}
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

                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight">
                            Đăng ký
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'fullName' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                <UserIcon size={18} />
                            </div>
                            <input
                                id="register-fullname"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => updateField('fullName', e.target.value)}
                                onFocus={() => setFocusedField('fullName')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Họ và tên"
                                className="w-full h-13 pl-12 pr-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                <Mail size={18} />
                            </div>
                            <input
                                id="register-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Email"
                                className="w-full h-13 pl-12 pr-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                                autoComplete="email"
                            />
                        </div>

                        {/* Phone */}
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'phone' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                <Phone size={18} />
                            </div>
                            <input
                                id="register-phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => updateField('phone', e.target.value)}
                                onFocus={() => setFocusedField('phone')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Số điện thoại (tùy chọn)"
                                className="w-full h-13 pl-12 pr-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                <Lock size={18} />
                            </div>
                            <input
                                id="register-password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Mật khẩu"
                                className="w-full h-13 pl-12 pr-12 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Password Strength */}
                        {formData.password && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2.5"
                            >
                                <div className="flex gap-1.5">
                                    {[1, 2, 3].map(level => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level
                                                ? passwordStrength === 1 ? 'bg-red-500' : passwordStrength === 2 ? 'bg-amber-500' : 'bg-emerald-500'
                                                : 'bg-neutral-200 dark:bg-neutral-800'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                    {passwordRules.map((rule, i) => (
                                        <span key={i} className={`text-xs flex items-center gap-1 transition-colors ${rule.test(formData.password) ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                                            <CheckCircle2 size={11} />
                                            {rule.label}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Confirm Password */}
                        <div className="relative">
                            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'confirm' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                <Lock size={18} />
                            </div>
                            <input
                                id="register-confirm-password"
                                type={showConfirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                                onFocus={() => setFocusedField('confirm')}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Xác nhận mật khẩu"
                                className={`w-full h-13 pl-12 pr-12 bg-neutral-50 dark:bg-neutral-900 border rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200 ${formData.confirmPassword && formData.confirmPassword !== formData.password
                                    ? 'border-red-400 focus:border-red-500'
                                    : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
                                    }`}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                            <div className="relative w-[18px] h-[18px] mt-0.5 flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={agreedTerms}
                                    onChange={(e) => setAgreedTerms(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-full h-full rounded-md border-2 border-neutral-300 dark:border-neutral-600 peer-checked:border-black dark:peer-checked:border-white peer-checked:bg-black dark:peer-checked:bg-white transition-all duration-200" />
                                <svg className="absolute inset-0 w-full h-full text-white dark:text-black opacity-0 peer-checked:opacity-100 transition-opacity p-[3px]" viewBox="0 0 12 12" fill="none">
                                    <path d="M2.5 6L5 8.5L9.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-sm text-neutral-500 leading-relaxed">
                                Tôi đồng ý với{' '}
                                <a href="#" className="text-black dark:text-white font-medium hover:underline">Điều khoản dịch vụ</a>{' '}
                                và{' '}
                                <a href="#" className="text-black dark:text-white font-medium hover:underline">Chính sách bảo mật</a>
                            </span>
                        </label>

                        {/* Submit */}
                        <button
                            id="register-submit"
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full h-13 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden mt-2"
                        >
                            <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                Tạo tài khoản
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                </div>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-neutral-500">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-600 dark:text-blue-600 font-semibold hover:underline underline-offset-4">
                            Đăng nhập
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};
