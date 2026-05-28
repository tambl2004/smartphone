import React, { useState } from 'react';
import { Link, useRouter } from '@routes/router';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authForgotPassword, authVerifyForgot, authResetPassword } from '@services/auth.service';

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
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[60%] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />

                {/* Decorative elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.03, 0.06, 0.03],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[30%] left-[20%] w-96 h-96 rounded-full bg-white/[0.03]"
                    />

                    {/* Concentric rings */}
                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04]">
                        {[200, 250, 300].map((r, i) => (
                            <motion.circle
                                key={i}
                                cx="300" cy="300" r={r}
                                fill="none"
                                stroke="white"
                                strokeWidth="1"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, delay: i * 0.3, ease: 'easeOut' }}
                            />
                        ))}
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
                            <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase">Bảo mật tài khoản</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
                            Đặt lại<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 to-neutral-500">mật khẩu của bạn</span>
                        </h1>
                        <p className="text-neutral-400 text-base leading-relaxed max-w-sm">
                            Chúng tôi sẽ gửi mã xác minh đến email của bạn để đặt lại mật khẩu an toàn.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                            <ShieldCheck size={22} className="text-emerald-400/80" />
                        </div>
                        <div>
                            <div className="text-white text-sm font-semibold">Bảo mật tuyệt đối</div>
                            <div className="text-neutral-500 text-xs mt-0.5">Mã xác minh có hiệu lực trong 10 phút</div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white dark:bg-neutral-950">
                <div className="w-full max-w-[420px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-10">
                        <Link to="/" className="text-2xl font-bold tracking-tighter text-black dark:text-white">
                            NEXPHONE
                        </Link>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Enter Email */}
                        {step === 'email' && (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                            >


                                <div className="mb-8 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
                                        <KeyRound size={24} className="text-neutral-600 dark:text-neutral-400" />
                                    </div>
                                    <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight mb-3">
                                        Quên mật khẩu?
                                    </h2>
                                    <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
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
                                            className="w-full h-13 pl-12 pr-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
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
                                        className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-blue-500 dark:hover:text-blue-500 transition-colors group"
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
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                            >


                                <div className="mb-8 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
                                        <Mail size={24} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight mb-3">
                                        Kiểm tra email
                                    </h2>
                                    <p className="text-neutral-500 text-sm leading-relaxed">
                                        Chúng tôi đã gửi mã xác minh 6 chữ số đến{' '}
                                        <span className="text-black dark:text-white font-medium">{email}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    {/* OTP Inputs */}
                                    <div className="flex gap-2.5 justify-between">
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
                                                className="w-full aspect-square max-w-[56px] text-center text-xl font-bold bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-black dark:text-white outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
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
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="mb-8 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
                                        <ShieldCheck size={24} className="text-neutral-600 dark:text-neutral-400" />
                                    </div>
                                    <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight mb-3">
                                        Tạo mật khẩu mới
                                    </h2>
                                    <p className="text-neutral-500 text-sm leading-relaxed">
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
                                            className="w-full h-13 px-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
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
                                            className="w-full h-13 px-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-neutral-900 transition-all duration-200"
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
                </div>
            </div>
        </div>
    );
};
