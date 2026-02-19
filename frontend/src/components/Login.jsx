import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PageBackground from './ui/PageBackground';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Zap, ShieldCheck, Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [systemUptime, setSystemUptime] = useState(99.98);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Load remembered identity
  useEffect(() => {
    const savedEmail = localStorage.getItem('user_identity');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemUptime(prev => +(prev + (Math.random() * 0.02 - 0.01)).toFixed(2));
    }, 5000);
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
      } else {
        localStorage.removeItem('user_identity');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization_Denied: Sequence failure');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
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
                <span className="text-slate-900 font-black text-xs">TF</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
            </div>

            <h2 className="text-5xl font-bold text-white tracking-tighter leading-none mb-6">
              Work smarter, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">not harder.</span>
            </h2>
            <p className="text-lg text-white/30 max-w-md font-medium leading-relaxed">
              Organize your tasks efficiently with our simple and powerful dashboard.
            </p>
          </div>

          <div className="relative z-10 flex gap-12">
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Network Status</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-sm font-bold text-white/60 tabular-nums">OPERATIONAL</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">System Uptime</p>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-sm font-bold text-white/60 tabular-nums">{systemUptime}%</span>
              </div>
            </div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-purple-500/10 blur-[100px] rounded-full" />
        </div>

        {/* Right Side: Auth Form */}
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
                  <span className="text-slate-900 font-black text-xs">TF</span>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Welcome Back</h3>
              <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Please sign in to continue.</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-3"
              >
                <Lock className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest cursor-pointer hover:text-white/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20"
                  />
                  Remember me
                </label>

                <Link to="/forgot-password" title="Initialize Recovery" className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-3"
                >
                  Sign In
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center pt-6">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </PageBackground>
  );
};

export default Login;
