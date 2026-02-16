import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageBackground from './ui/PageBackground';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, LogOut, CheckCircle2,
  AlertCircle, Trash2, ShieldAlert, Eye, EyeOff, User, Mail, Shield, Zap, Terminal, ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from './ui/ConfirmModal';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useContext(AuthContext);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState('confirm');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hideEmail, setHideEmail] = useState(true);

  // Mask email safely
  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    if (name.length <= 3) return `***@${domain}`;
    return `${name.substring(0, 3)}***@${domain}`;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const [verifyEmailStep, setVerifyEmailStep] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteLoading) return;

    setDeleteLoading(true);
    setDeleteError('');

    try {
      await api.post('/auth/delete-account', { otp: deleteOtp });
      setDeleteSuccess('Account purged. Session terminating...');
      setTimeout(() => {
        logout();
        navigate('/register');
      }, 2000);
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Invalid verification sequence.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await updateProfile(formData);

      if (data.emailChangePending) {
        setSuccess('Profile updated. Verification required for new email address.');
        setVerifyEmailStep(true);
      } else {
        setSuccess('Identity parameters updated successfully.');
        setTimeout(() => setSuccess(''), 4000);
        setEditing(false);
      }
    } catch (err) {
      console.error('Update Profile Error Details:', err);
      // Show more specific error if available
      const errorMessage = err?.response?.data?.message || err.message || 'Update failed: Authorization rejected.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const [resendLoading, setResendLoading] = useState(false);

  const handleResendOtp = async () => {
    if (resendLoading) return;
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      // Re-triggering the profile update with the new email generates a new OTP
      await updateProfile(formData);
      setSuccess('Verification code resent to your email.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Resend OTP Error:', err);
      setError(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-email-change', { otp: emailOtp.trim() });
      // Update local user context via profile refresh or manual set
      await updateProfile(formData); // Re-fetch or re-set user
      setSuccess('Email address verified and updated successfully.');
      setVerifyEmailStep(false);
      setEditing(false);
      setEmailOtp('');
    } catch (err) {
      console.error('Verify Email Error:', err);
      setError(err?.response?.data?.message || 'Verification failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteOtp = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    setDeleteStep('otp');

    try {
      await api.post('/auth/delete-account-otp');
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Verification sequence failed.');
      setDeleteStep('confirm');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) return null;

  return (
    <PageBackground
      gradient="bg-gradient-to-br from-[#020305] via-[#050608] to-black"
      blob1="bg-blue-600/5"
      blob2="bg-purple-600/5"
      blob3="bg-slate-700/5"
    >
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-2xl bg-[#020305]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-slate-950 font-black text-xs">TF</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Identity Center</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Return to Dashboard</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Account Management</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Personal Parameters</h1>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Identity Card */}
          <section className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl text-white font-bold shadow-2xl border border-white/10">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl border-4 border-[#020305] shadow-lg">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">
                        {hideEmail ? maskEmail(user?.email) : user?.email}
                      </p>
                      <button onClick={() => setHideEmail(!hideEmail)} className="text-white/20 hover:text-white transition-colors">
                        {hideEmail ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  {!editing && (
                    <Button onClick={() => setEditing(true)} className="px-4 py-2 !text-[10px]">Edit Profile</Button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 pt-4 border-t border-white/5"
                    >
                      {verifyEmailStep ? (
                        <form onSubmit={handleVerifyEmail} className="space-y-4">
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-bold text-white mb-1">Verify New Email</h4>
                              <p className="text-[10px] text-white/60 leading-relaxed">
                                A security code has been sent to <strong>{formData.email}</strong>. Entering it will transfer your identity to this new address.
                              </p>
                            </div>
                          </div>
                          <Input
                            label="Verification Code"
                            placeholder="6-digit code"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            required
                          />
                          <div className="flex gap-3 pt-2">
                            <Button type="submit" isLoading={loading} className="px-6 py-2.5 !text-[10px]">Verify & Update</Button>
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              disabled={resendLoading}
                              className={`px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-bold text-white/30 uppercase tracking-widest hover:bg-white/5 transition-all ${resendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {resendLoading ? 'Resending...' : 'Resend Code'}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setVerifyEmailStep(false); setEditing(false); }}
                              className="px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-bold text-white/30 uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              label="Full Identity Name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                            <Input
                              label="Network Address"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button type="submit" isLoading={loading} className="px-6 py-2.5 !text-[10px]">Commit Changes</Button>
                            <button
                              type="button"
                              onClick={() => setEditing(false)}
                              className="px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-bold text-white/30 uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                              Abort
                            </button>
                          </div>
                        </form>
                      )}
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Verified Operator
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Role</p>
                        <p className="text-xs font-bold text-white/60 flex items-center gap-2">
                          <Shield className="w-3 h-3" /> System Admin
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Authorization</p>
                        <p className="text-xs font-bold text-white/60 flex items-center gap-2">
                          <Terminal className="w-3 h-3" /> Encrypted
                        </p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>

                {success && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {success}
                  </motion.div>
                )}
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle className="w-3.5 h-3.5" /> {error}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Background flourish */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          </section>

          {/* Security & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-2 tracking-tight">System Access</h4>
                <p className="text-xs text-white/30 leading-relaxed mb-8">Terminate your active session and release all allocated resources from the current terminal.</p>
              </div>
              <Button onClick={() => setShowLogoutModal(true)} variant="secondary" className="w-full">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </section>

            <section className="p-8 rounded-2xl bg-red-500/[0.01] border border-red-500/10 backdrop-blur-3xl flex flex-col justify-between group hover:border-red-500/20 transition-all">
              <div>
                <h4 className="text-lg font-bold text-red-400 mb-2 tracking-tight">Danger Zone</h4>
                <p className="text-xs text-red-400/30 leading-relaxed mb-8">Permanently purge your identity and all associated operational data from the central database.</p>
              </div>

              {deleteStep === 'confirm' ? (
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" /> Purge Account
                </Button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <Input
                    label="Verification Code"
                    placeholder="Enter Sequence"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    required
                  />
                  {deleteError && <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{deleteError}</p>}
                  <Button type="submit" variant="danger" isLoading={deleteLoading} className="w-full">Confirm Purge</Button>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          requestDeleteOtp();
        }}
        title="Confirm Data Purge"
        message="This operation will permanently erase your identity and all task history from the network. This cannot be reversed."
        confirmText="Initialize Verification"
        variant="danger"
      />

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
        title="Session Termination"
        message="Are you sure you want to end your secure session?"
        confirmText="Sign Out"
        variant="danger"
      />
    </PageBackground>
  );
};

export default Profile;
