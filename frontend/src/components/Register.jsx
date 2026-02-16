import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PageBackground from './ui/PageBackground';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Terminal, ShieldCheck, UserPlus, Globe } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemLoad, setSystemLoad] = useState(14.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => +(prev + (Math.random() * 0.8 - 0.4)).toFixed(1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Sequence mismatch: Passwords do not align');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Complexity failure: Minimum 6 characters required');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Protocol failure: Registration denied');
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
      blob1="bg-purple-600/5"
      blob2="bg-blue-600/5"
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
              Join the elite <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">productivity network.</span>
            </h2>
            <p className="text-lg text-white/30 max-w-sm font-medium leading-relaxed">
              Initialize your profile and gain access to surgical-grade task management orchestration.
            </p>
          </div>

          <div className="relative z-10 flex gap-12">
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Registration Status</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-sm font-bold text-white/60 tabular-nums">OPEN ACCESS</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Core Load</p>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-sm font-bold text-white/60 tabular-nums">{systemLoad}%</span>
              </div>
            </div>
          </div>

          {/* Abstract Decorations */}
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-slate-900 font-black text-xs">TF</span>
                </div>
                <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Protocol Initialization</h3>
              <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Setup your operational identity.</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-3"
              >
                <Terminal className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div variants={itemVariants}>
                <Input
                  label="Full Legal Name"
                  id="name"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Network Identity (Email)"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@nexus.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <Input
                    label="Access Key"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/20 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    }
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Input
                    label="Verify Key"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-white/20 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    }
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="pt-4">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-3"
                >
                  Confirm Identity
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center pt-6 border-t border-white/5 mt-6">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  Existing operator ID?{" "}
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Access Portal
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

export default Register;
