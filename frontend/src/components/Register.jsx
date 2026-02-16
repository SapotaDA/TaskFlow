import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PageBackground from './ui/PageBackground';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Cpu, Activity, Database, Eye, EyeOff, CheckCircle2, Globe, Command } from 'lucide-react';

const Register = () => {
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
  const [nodeStats, setNodeStats] = useState({ latency: 12, data: 42.5 });
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodeStats(prev => ({
        latency: Math.max(8, prev.latency + (Math.random() * 2 - 1)),
        data: +(prev.data + (Math.random() * 0.4 - 0.2)).toFixed(1)
      }));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Credentials_Mismatch: Passkey sequence does not correlate');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Complexity_Failure: Security token below target length');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Initialization_Failure: Node creation rejected');
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
      transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
    }
  };

  return (
    <PageBackground
      gradient="bg-gradient-to-br from-[#020305] via-slate-900 to-black"
      blob1="bg-purple-600/10"
      blob2="bg-blue-600/10"
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
                  <p className="text-xs text-white/40 uppercase tracking-widest">
                    Node Genesis
                  </p>
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Create Account
              </h2>
              <p className="text-white/40 mb-10">
                Setup your account and start managing workflows.
              </p>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Full Name"
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                />

                <Input
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
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

                  <Input
                    label="Confirm Password"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border border-white/10 rounded-xl py-4 px-5"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-white/40 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    }
                  />
                </div>

                <Button
                  type="submit"
                  isLoading={loading}
                  className="w-full py-4 rounded-xl text-lg font-semibold bg-white text-black hover:bg-white/90"
                >
                  Create Account
                </Button>

                <p className="text-center text-white/40 text-sm mt-6">
                  Already have an account?{" "}
                  <Link to="/login" className="text-purple-400 hover:underline">
                    Login
                  </Link>
                </p>

              </form>
            </div>

            {/* RIGHT PANEL */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 items-center justify-center p-12">
              <div className="max-w-md">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Join the Future of Work
                </h2>
                <p className="text-white/50 leading-relaxed text-lg font-medium">
                  Experience a seamless task management system designed for modern teams. Secure, fast, and incredibly intuitive.
                </p>
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-4 text-white/40">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Terminal className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="font-semibold">Developer-First Experience</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/40">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="font-semibold">Global Team Collaboration</span>
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


export default Register;
