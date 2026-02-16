import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PageBackground from './ui/PageBackground';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

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

            // If we have an OTP and email but no token, verify OTP first
            if (!activeToken && otp && email) {
                const verifyRes = await api.post('/auth/verify-otp-identifier', {
                    identifier: email,
                    otp
                });
                activeToken = verifyRes.data.resetToken;
            }

            if (!activeToken) {
                throw new Error('Verification token or code is missing');
            }

            await api.post('/auth/reset-password', { token: activeToken, password });

            setStatus('success');
            setMessage('Password has been reset successfully');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.message || 'Reset failed. Please try again.');
        }
    };

    return (
        <PageBackground gradient="bg-gradient-to-br from-[#020305] via-slate-900 to-black">
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-4xl"
                >
                    <Card className="w-full bg-[#0c0d10]/95 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden">
                        <div className="flex flex-col md:flex-row min-h-[500px]">

                            {/* LEFT PANEL */}
                            <div className="hidden md:flex w-1/2 flex-col justify-between p-12 bg-white/5 border-r border-white/10">
                                <div>
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                            <span className="text-slate-900 font-black text-sm">TF</span>
                                        </div>
                                        <span className="text-white font-bold tracking-tight">TaskFlow</span>
                                    </div>
                                    <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                                        Secure your <br />account
                                    </h2>
                                    <p className="text-white/40 leading-relaxed font-medium">
                                        Finalize your password reset by entering the verification code and your new credentials.
                                    </p>
                                </div>
                                <div className="text-xs text-white/30 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    End-to-End Encrypted Secure Transfer
                                </div>
                            </div>

                            {/* RIGHT PANEL */}
                            <div className="w-full md:w-1/2 p-10 md:p-14">
                                <div className="mb-10">
                                    <h3 className="text-3xl font-bold text-white mb-2">Setup Password</h3>
                                    <p className="text-white/40 font-medium">
                                        Enter details to update access for <span className="text-blue-400">{maskEmail(email)}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {status === 'error' && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5" />
                                            {message}
                                        </div>
                                    )}

                                    {status === 'success' && (
                                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5" />
                                            {message}
                                        </div>
                                    )}

                                    <div className="space-y-5">
                                        {email && !token && (
                                            <Input
                                                id="otp"
                                                label="Verification Code"
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                                maxLength={6}
                                                className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                                            />
                                        )}

                                        <Input
                                            id="password"
                                            type="password"
                                            label="New Password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                                        />

                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            label="Confirm Password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        isLoading={status === 'loading'}
                                        disabled={status === 'success'}
                                        className="w-full py-4 rounded-xl text-lg font-bold bg-white text-slate-950 hover:bg-white/90 shadow-xl transition-all"
                                    >
                                        Update Password
                                    </Button>

                                    <Link
                                        to="/login"
                                        className="block text-center text-white/30 hover:text-white text-sm font-bold transition-all"
                                    >
                                        Back to login
                                    </Link>
                                </form>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </PageBackground>
    );
};

export default ResetPassword;
