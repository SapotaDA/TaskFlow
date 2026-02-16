import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PageBackground from './ui/PageBackground';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowLeft, Key, Lock } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const maskEmail = (val) => {
        if (!val) return '';
        const [name, domain] = val.split('@');
        if (name.length <= 3) return `***@${domain}`;
        return `${name.substring(0, 3)}***@${domain}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        setStatus('loading');
        try {
            let activeToken = token;

            if (!activeToken && otp && email) {
                const verifyRes = await api.post('/auth/verify-otp-identifier', {
                    identifier: email,
                    otp
                });
                activeToken = verifyRes.data.resetToken;
            }

            if (!activeToken) {
                throw new Error('Verification sequence incomplete.');
            }

            await api.post('/auth/reset-password', { token: activeToken, password });

            setStatus('success');
            setMessage('Credentials updated. Initializing redirection.');
            setTimeout(() => navigate('/login'), 2200);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Calibration failure.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    };

    return (
        <PageBackground
            gradient="bg-gradient-to-br from-[#020305] via-[#050608] to-black"
            blob1="bg-blue-600/5"
            blob2="bg-purple-600/5"
            blob3="bg-slate-700/5"
        >
            <div className="min-h-screen flex flex-col md:flex-row">
                {/* Left Side: Visual/Branding (Desktop Only) */}
                <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-slate-950 font-black text-xs">TF</span>
                            </div>
                            <span className="text-white font-bold text-xl tracking-tight">Security Protocol</span>
                        </div>

                        <h2 className="text-5xl font-bold text-white tracking-tighter leading-none mb-6">
                            Recalibrate access <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">credentials.</span>
                        </h2>
                        <p className="text-lg text-white/30 max-w-sm font-medium leading-relaxed">
                            Complete the verification cycle to establish new security tokens for your identity.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-12">
                        <div className="flex items-center gap-4 text-white/20">
                            <ShieldCheck className="w-6 h-6" />
                            <div className="h-8 w-px bg-white/10" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] max-w-[120px]">
                                Cryptographic Multi-Factor Verification
                            </p>
                        </div>
                    </div>

                    {/* Decorations */}
                    <div className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="w-full max-w-sm"
                    >
                        <motion.div variants={itemVariants} className="mb-10">
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Configure Access</h3>
                            <p className="text-xs text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                                Updating access for <span className="text-blue-400">{maskEmail(email)}</span>
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {(status === 'error' || status === 'success') && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 ${status === 'error'
                                            ? 'bg-red-500/5 border-red-500/10 text-red-500'
                                            : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                                        }`}
                                >
                                    {status === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {message}
                                </motion.div>
                            )}

                            {email && !token && (
                                <motion.div variants={itemVariants}>
                                    <Input
                                        id="otp"
                                        label="Verification Sequence"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={6}
                                        rightIcon={<Key className="w-4 h-4 text-white/10" />}
                                    />
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants}>
                                <Input
                                    id="password"
                                    type="password"
                                    label="New Security Sequence"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    rightIcon={<Lock className="w-4 h-4 text-white/10" />}
                                />
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    label="Confirm Sequence"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-4">
                                <Button
                                    type="submit"
                                    isLoading={status === 'loading'}
                                    disabled={status === 'success'}
                                    className="w-full py-3"
                                >
                                    Update Credentials
                                </Button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="text-center pt-8 border-t border-white/5 mt-6">
                                <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Cancel Recalibration
                                </Link>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                </div>
            </div>
        </PageBackground>
    );
};

export default ResetPassword;
