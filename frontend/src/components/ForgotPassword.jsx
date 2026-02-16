import React, { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import PageBackground from './ui/PageBackground';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    /* ---------------- SEND OTP VIA EMAIL ---------------- */

    const handleRequest = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post('/auth/send-otp-email', { email });

            setMessage({
                type: 'success',
                text: res.data.message || 'OTP sent to your email.'
            });

            // move to reset password page
            setTimeout(() => {
                navigate(`/reset-password?email=${email}`);
            }, 1500);

        } catch (err) {
            setMessage({
                type: 'error',
                text:
                    err.response?.data?.message ||
                    'Failed to send OTP. Try again.'
            });
        } finally {
            setStatus('idle');
        }
    };

    /* ================= UI ================= */

    return (
        <PageBackground gradient="bg-gradient-to-br from-[#020305] via-slate-900 to-black">
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="w-full max-w-4xl bg-[#0c0d10]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">

                    <div className="flex flex-col md:flex-row">

                        {/* LEFT PANEL */}
                        <div className="hidden md:flex w-1/2 flex-col justify-between p-10 bg-white/5 border-r border-white/10">
                            <div>
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                        <span className="text-black font-bold text-sm">TF</span>
                                    </div>
                                    <span className="text-white font-semibold">TaskFlow</span>
                                </div>

                                <h2 className="text-3xl font-bold text-white mb-4">
                                    Reset your password
                                </h2>
                                <p className="text-white/40">
                                    We'll send a secure OTP to your email to reset your password.
                                </p>
                            </div>

                            <div className="text-xs text-white/30">
                                Secure email verification powered by TaskFlow.
                            </div>
                        </div>

                        {/* RIGHT PANEL */}
                        <div className="w-full md:w-1/2 p-8 md:p-12">

                            <div className="mb-10">
                                <h3 className="text-3xl font-bold text-white mb-2">
                                    Forgot Password
                                </h3>
                                <p className="text-white/40">
                                    Enter your email to receive a verification OTP.
                                </p>
                            </div>

                            <form onSubmit={handleRequest} className="space-y-6">

                                {message.text && (
                                    <div
                                        className={`p-4 rounded-xl text-sm ${message.type === 'error'
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-emerald-500/10 text-emerald-400'
                                            }`}
                                    >
                                        {message.text}
                                    </div>
                                )}

                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@email.com"
                                    className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                                    required
                                />

                                <Button
                                    type="submit"
                                    isLoading={status === 'loading'}
                                    className="w-full py-4 rounded-xl text-lg font-semibold bg-white text-black hover:bg-white/90"
                                >
                                    Send OTP
                                </Button>

                                <Link
                                    to="/login"
                                    className="block text-center text-white/40 hover:text-white text-sm"
                                >
                                    Back to login
                                </Link>
                            </form>

                        </div>
                    </div>
                </Card>
            </div>
        </PageBackground>
    );
};

export default ForgotPassword;
