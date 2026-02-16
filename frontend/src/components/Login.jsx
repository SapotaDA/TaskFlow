import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PageBackground from './ui/PageBackground';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Terminal, Activity, Eye, EyeOff, Lock, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [metrics, setMetrics] = useState({ network: 99.1, active: 1420 });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        network: +(prev.network + (Math.random() * 0.2 - 0.1)).toFixed(1),
        active: prev.active + Math.floor(Math.random() * 3 - 1)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem('user_identity', email);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Access_Denied: Invalid credentials sequence');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <PageBackground
      gradient="bg-gradient-to-br from-[#020305] via-slate-900 to-black"
      blob1="bg-blue-600/10"
      blob2="bg-purple-600/10"
      blob3="bg-slate-700/10"
    >
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-6xl bg-[#0c0d10]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">

          <div className="flex flex-col md:flex-row">

            {/* LEFT PANEL */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 bg-[#0a0b0e]/60 border-b md:border-b-0 md:border-r border-white/10">

              {/* Logo */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-slate-900 font-black text-lg">TF</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">TaskFlow</h1>
                  <p className="text-xs text-white/40 tracking-widest uppercase">
                    Simplify your workflow
                  </p>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Welcome Back
              </h2>
              <p className="text-white/40 mb-10">
                Login to access your dashboard and manage your workflow.
              </p>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                />

                <Input
                  label="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                />

                {/* Remember + forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-white/60">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>

                  <Link to="/forgot-password" className="text-blue-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-4 rounded-xl text-lg font-semibold bg-white text-black hover:bg-white/90"
                >
                  Login
                </Button>

                <p className="text-center text-white/40 text-sm mt-6">
                  Don’t have an account?{" "}
                  <Link to="/register" className="text-blue-400 hover:underline">
                    Register
                  </Link>
                </p>

              </form>
            </div>

            {/* RIGHT PANEL */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600/10 to-purple-600/10 items-center justify-center p-12">
              <div className="max-w-md">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Manage Tasks Faster
                </h2>
                <p className="text-white/50 leading-relaxed text-lg font-medium">
                  Track projects, collaborate with your team, and stay productive with TaskFlow’s smart workflow management system.
                </p>
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-4 text-white/40">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="font-semibold">Lightning Fast Interface</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/40">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <ShieldCheck className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="font-semibold">Enterprise Grade Security</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Card>
      </div>
    </PageBackground>
  );

};

export default Login;
