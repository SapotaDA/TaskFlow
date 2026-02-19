import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageBackground from './ui/PageBackground';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, LogOut, CheckCircle2,
  AlertCircle, Trash2, ShieldAlert, Eye, EyeOff, User, Mail, Shield, Zap, Terminal, ShieldCheck, Camera, Loader2
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from './ui/ConfirmModal';
import FeedbackCard from './ui/FeedbackCard';
import ImageCropperModal from './ImageCropperModal';

import { useToast } from '../context/ToastContext';

const Profile = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, updateProfile, updateProfilePicture, logout } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState('confirm');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hideEmail, setHideEmail] = useState(true);

  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 10MB for high-res inputs before cropping)
    if (file.size > 10 * 1024 * 1024) {
      setError('Original image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setShowCropper(true);
      // Reset input so same file can be selected again
      e.target.value = null;
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage) => {
    setShowCropper(false);
    setUploading(true);
    try {
      await updateProfilePicture(croppedImage);
      toast.success('Visual identity synchronized.');
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error(err.response?.data?.message || 'Failed to sync image to server');
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

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

    try {
      await api.post('/auth/delete-account', { otp: deleteOtp });
      toast.success('Account purged. Session terminating.');
      setTimeout(() => {
        logout();
        navigate('/register');
      }, 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid verification sequence.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const data = await updateProfile(formData);

      if (data.emailChangePending) {
        toast.info('Parameters saved. Email verification required.');
        setVerifyEmailStep(true);
      } else {
        toast.success('Identity parameters updated successfully.');
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed: Check input parameters.');
    } finally {
      setLoading(false);
    }
  };

  const [resendLoading, setResendLoading] = useState(false);

  const handleResendOtp = async () => {
    if (resendLoading) return;
    try {
      // Re-triggering the profile update with the new email generates a new OTP
      await updateProfile(formData);
      toast.success('Verification code resent to your email.');
    } catch (err) {
      console.error('Resend OTP Error:', err);
      toast.error(err?.response?.data?.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/verify-email-change', { otp: emailOtp.trim() });
      // Update local user context via profile refresh or manual set
      await updateProfile(formData); // Re-fetch or re-set user
      toast.success('Email address verified and updated successfully.');
      setVerifyEmailStep(false);
      setEditing(false);
      setEmailOtp('');
    } catch (err) {
      console.error('Verify Email Error:', err);
      toast.error(err?.response?.data?.message || 'Verification failed. Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteOtp = async () => {
    try {
      await api.post('/auth/delete-account-otp');
      toast.info('Security code dispatched to your email.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Verification sequence failed.');
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
            <span className="text-white font-bold text-lg tracking-tight">My Profile</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Settings</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Profile Details</h1>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Identity Card */}
          <section className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="relative group/avatar">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-28 h-28 rounded-full flex items-center justify-center relative overflow-hidden cursor-pointer transition-all duration-500 ${!user?.profilePicture ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-900'} shadow-2xl border border-white/10 group-hover/avatar:scale-[1.02] group-hover/avatar:border-white/20`}
                >
                  {uploading ? (
                    <div className="absolute inset-0 bg-[#020305]/60 backdrop-blur-sm flex items-center justify-center z-20">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 z-10">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}

                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-white font-bold tracking-tighter">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 bg-emerald-500 rounded-full border-4 border-[#020305] shadow-xl z-20">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
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
                                A verification code has been sent to <strong>{formData.email}</strong>. Entering it will update your email address.
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
                              label="Full Name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                            <Input
                              label="Email Address"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button type="submit" isLoading={loading} className="px-6 py-2.5 !text-[10px]">Save Changes</Button>
                            <button
                              type="button"
                              onClick={() => setEditing(false)}
                              className="px-6 py-2.5 rounded-xl border border-white/10 text-[10px] font-bold text-white/30 uppercase tracking-widest hover:bg-white/5 transition-all"
                            >
                              Cancel
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
                          <Zap className="w-3 h-3" /> Verified
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Role</p>
                        <p className="text-xs font-bold text-white/60 flex items-center gap-2">
                          <Shield className="w-3 h-3" /> Admin
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-1">Security</p>
                        <p className="text-xs font-bold text-white/60 flex items-center gap-2">
                          <Terminal className="w-3 h-3" /> Encrypted
                        </p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* Background flourish */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          </section>

          {/* Security & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-white mb-2 tracking-tight">Account Actions</h4>
                <p className="text-xs text-white/30 leading-relaxed mb-8">Sign out of your account on this device.</p>
              </div>
              <Button onClick={() => setShowLogoutModal(true)} variant="secondary" className="w-full">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </section>

            <section className="p-8 rounded-2xl bg-red-500/[0.01] border border-red-500/10 backdrop-blur-3xl flex flex-col justify-between group hover:border-red-500/20 transition-all">
              <div>
                <h4 className="text-lg font-bold text-red-400 mb-2 tracking-tight">Delete Account</h4>
                <p className="text-xs text-red-400/30 leading-relaxed mb-8">Permanently delete your account and all data. This action cannot be undone.</p>
              </div>

              {deleteStep === 'confirm' ? (
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                </Button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <Input
                    label="Verification Code"
                    placeholder="Enter Code"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="danger" isLoading={deleteLoading} className="w-full">Confirm Delete</Button>
                </form>
              )}
            </section>
          </div>

          <FeedbackCard />
        </div>
      </main>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          requestDeleteOtp();
        }}
        title="Delete Account?"
        message="This will permanently delete your account and all your tasks. This action cannot be reversed."
        confirmText="Send Verification Code"
        variant="danger"
      />

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        variant="danger"
      />
      <AnimatePresence>
        {showCropper && (
          <ImageCropperModal
            image={selectedImage}
            onCropComplete={handleCropComplete}
            onCancel={() => {
              setShowCropper(false);
              setSelectedImage(null);
            }}
          />
        )}
      </AnimatePresence>
    </PageBackground>

  );
};

export default Profile;
