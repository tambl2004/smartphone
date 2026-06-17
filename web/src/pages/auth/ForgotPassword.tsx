import React, { useState } from 'react';
import { Link, useRouter } from '@routes/router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authForgotPassword, authVerifyForgot, authResetPassword } from '@services/auth.service';
import nenmayBg from '../../assets/nenmay.jpg';
import logoImg from '../../assets/logo_dt.png';

type Step = 'email' | 'sent' | 'reset';

export const ForgotPasswordPage: React.FC = () => {
    const { navigate } = useRouter();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<Step>('email');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const verifiedOtpRef = React.useRef('');

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) { toast.error('Vui lòng nhập email'); return; }
        setIsLoading(true);
        const result = await authForgotPassword(email);
        setIsLoading(false);
        if (!result.ok) { toast.error(result.message ?? 'Lỗi gửi OTP'); return; }
        toast.success('Mã xác minh đã được gửi!');
        setStep('sent');
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) { toast.error('Vui lòng nhập đủ mã xác minh'); return; }
        setIsLoading(true);
        const result = await authVerifyForgot(email, code);
        setIsLoading(false);
        if (!result.ok) { toast.error(result.message ?? 'Mã OTP không đúng hoặc đã hết hạn'); return; }
        verifiedOtpRef.current = code;
        setStep('reset');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) { toast.error('Vui lòng nhập mật khẩu mới'); return; }
        if (newPassword !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
        if (newPassword.length < 8) { toast.error('Mật khẩu phải có ít nhất 8 ký tự'); return; }
        setIsLoading(true);
        const result = await authResetPassword(email, verifiedOtpRef.current, newPassword);
        setIsLoading(false);
        if (!result.ok) { toast.error(result.message ?? 'Đặt lại mật khẩu thất bại'); return; }
        toast.success('Đặt lại mật khẩu thành công!');
        navigate('/login');
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

                <AnimatePresence mode="wait">
                    {/* Step 1: Enter Email */}
                    {step === 'email' && (
                        <motion.div
                            key="email"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center justify-center mb-6 border border-neutral-200/50 dark:border-neutral-800/50">
                                    <KeyRound size={24} className="text-neutral-600 dark:text-neutral-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-3">
                                    Quên mật khẩu?
                                </h2>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-sm">
                                    Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác minh để bạn đặt lại mật khẩu.
                                </p>
                            </div>

                            <form onSubmit={handleSendCode} className="space-y-5">
                                <div className="relative">
                                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${focusedField === 'email' ? 'text-black dark:text-white' : 'text-neutral-400'}`}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        id="forgot-email"
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

                                <button
                                    id="forgot-submit"
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full h-13 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden"
                                >
                                    <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                        Gửi mã xác minh
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                                    </span>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors group"
                                >
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Quay lại đăng nhập
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 2: OTP Verification */}
                    {step === 'sent' && (
                        <motion.div
                            key="sent"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 backdrop-blur-md flex items-center justify-center mb-6 border border-emerald-200/50 dark:border-emerald-800/50">
                                    <Mail size={24} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-3">
                                    Kiểm tra email
                                </h2>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                                    Chúng tôi đã gửi mã xác minh 6 chữ số đến{' '}
                                    <span className="text-black dark:text-white font-medium">{email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                {/* OTP Inputs */}
                                <div className="flex gap-2 justify-between">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className="w-full aspect-square max-w-[50px] text-center text-xl font-bold bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full h-13 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden"
                                >
                                    <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                        Xác minh
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                                    </span>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                        </div>
                                    )}
                                </button>

                                <p className="text-center text-sm text-neutral-500">
                                    Không nhận được mã?{' '}
                                    <button
                                        type="button"
                                        onClick={() => { toast.success('Đã gửi lại mã xác minh!'); }}
                                        className="text-black dark:text-white font-semibold hover:underline underline-offset-4"
                                    >
                                        Gửi lại
                                    </button>
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors group"
                                >
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    Thay đổi email
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 'reset' && (
                        <motion.div
                            key="reset"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-8 flex flex-col items-center text-center">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center justify-center mb-6 border border-neutral-200/50 dark:border-neutral-800/50">
                                    <ShieldCheck size={24} className="text-neutral-600 dark:text-neutral-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-black dark:text-white tracking-tight mb-3">
                                    Tạo mật khẩu mới
                                </h2>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                                    Mật khẩu mới phải khác mật khẩu cũ và chứa ít nhất 8 ký tự.
                                </p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mật khẩu mới"
                                        className="w-full h-13 px-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div className="relative">
                                    <input
                                        id="confirm-new-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Xác nhận mật khẩu mới"
                                        className="w-full h-13 px-4 bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="relative w-full h-13 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group overflow-hidden mt-2"
                                >
                                    <span className={`inline-flex items-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                        Đặt lại mật khẩu
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                                    </span>
                                    {isLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                        </div>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
