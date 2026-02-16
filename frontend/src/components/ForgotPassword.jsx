import React, { useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import PageBackground from './ui/PageBackground';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Mail, Command } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    const handleRequest = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post('/auth/send-otp-email', { email });

            setMessage({
                type: 'success',
                text: res.data.message || 'OTP sequence transmitted successfully.'
            });

            setTimeout(() => {
                navigate(`/reset-password?email=${email}`);
            }, 1800);

        } catch (err) {
            console.error('OTP Transmission Error:', err);
            const backendError = err.response?.data?.error;
            const messageText = backendError ? `Transmission Failure: ${backendError}` : (err.response?.data?.message || 'Transmission failure: Verify address.');
            setMessage({
                type: 'error',
                text: messageText
            });
        } finally {
            setStatus('idle');
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
                            <span className="text-white font-bold text-xl tracking-tight">Reset Password</span>
                        </div>

                        <h2 className="text-5xl font-bold text-white tracking-tighter leading-none mb-6">
                            Did you forget your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">password?</span>
                        </h2>
                        <p className="text-lg text-white/30 max-w-sm font-medium leading-relaxed">
                            Don't worry, it happens. We'll help you reset it in no time.
                        </p>
                    </div>

                    <div className="relative z-10 flex gap-12">
                        <div className="flex items-center gap-4 text-white/20">
                            <ShieldAlert className="w-6 h-6" />
                            <div className="h-8 w-px bg-white/10" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] max-w-[120px]">
                                Secure Request
                            </p>
                        </div>
                    </div>

                    {/* Decorations */}
                    <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
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
                            <div className="lg:hidden flex items-center gap-3 mb-8">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-slate-950 font-black text-xs">TF</span>
                                </div>
                                <span className="text-white font-bold text-xl tracking-tight">Recovery</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Forgot Password?</h3>
                            <p className="text-xs text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                                Enter your email address to verify your account.
                            </p>
                        </motion.div>

                        <form onSubmit={handleRequest} className="space-y-6">
                            {message.text && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-3.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 ${message.type === 'error'
                                        ? 'bg-red-500/5 border-red-500/10 text-red-500'
                                        : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                                        }`}
                                >
                                    <Command className="w-4 h-4" />
                                    {message.text}
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants}>
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@nexus.com"
                                    required
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="pt-2">
                                <Button
                                    type="submit"
                                    isLoading={status === 'loading'}
                                    className="w-full py-3"
                                >
                                    Send Reset Code
                                </Button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="text-center pt-8 border-t border-white/5 mt-6">
                                <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors">
                                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                                </Link>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Background decorations */}
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full translate-y-1/2 translate-x-1/2" />
                </div>
            </div>
        </PageBackground>
    );
};

export default ForgotPassword;
