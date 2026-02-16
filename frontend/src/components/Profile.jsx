import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PageBackground from './ui/PageBackground';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Edit3, ArrowLeft, Shield, Calendar,
  LogOut, CheckCircle2, AlertCircle, Trash2, ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import ConfirmModal from './ui/ConfirmModal';


const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState('confirm');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hideEmail, setHideEmail] = useState(true);

  const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 3) return `***@${domain}`;
    return `${name.substring(0, 3)}***@${domain}`;
  };

  const { user, updateProfile, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({ name: user.name, email: user.email });
  }, [user, navigate]);

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
    setSuccess('');
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteOtp = async () => {
    setDeleteStep('otp'); // Switch UI instantly for speed
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.post('/auth/delete-account-otp');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to send verification code');
      setDeleteStep('confirm'); // Revert if call fails
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    if (e) e.preventDefault();
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.post('/auth/delete-account', { otp: deleteOtp });
      setDeleteSuccess('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        logout();
        navigate('/register');
      }, 2000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <PageBackground
      gradient="bg-gradient-to-br from-[#020305] via-slate-900 to-black"
      blob1="bg-blue-600/10"
      blob2="bg-purple-600/10"
      blob3="bg-slate-700/10"
      className="py-12 px-6"
    >
      <div className="max-w-6xl mx-auto pt-20">

        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 text-xs font-bold text-white/40 uppercase tracking-widest hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <h1 className="text-5xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-lg text-white/40">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">

            <Card className="!p-10 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl text-white font-bold mb-6">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">{user?.name}</h2>
              <div className="flex items-center gap-2 justify-center mb-8">
                <p className="text-white/40">{hideEmail ? maskEmail(user?.email) : user?.email}</p>
                <button
                  onClick={() => setHideEmail(!hideEmail)}
                  className="p-1 hover:bg-white/5 rounded-md transition-all"
                >
                  {hideEmail ? <Eye className="w-3 h-3 text-white/20" /> : <EyeOff className="w-3 h-3 text-white/20" />}
                </button>
              </div>

              <div className="pt-6 border-t border-white/5 text-left space-y-3">
                <div className="flex justify-between text-sm text-white/40">
                  <span>Member Since</span>
                  <span>Feb 2024</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-400">
                  <span>Status</span>
                  <span>Active</span>
                </div>
              </div>
            </Card>

            <Button onClick={() => setShowLogoutModal(true)} className="w-full !py-5">
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-8">

            <Card className="!p-12">

              <div className="flex justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-bold text-white">Personal Information</h3>
                  <p className="text-white/40">Update your personal details.</p>
                </div>

                {!editing && (
                  <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                )}
              </div>

              {/* EDIT MODE */}
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* NAME */}
                  <Input
                    label="Full Name"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="
                      !bg-gradient-to-br from-white/[0.06] to-white/[0.02]
                      border border-white/10
                      focus:border-blue-500/50
                      focus:ring-2 focus:ring-blue-500/20
                      text-white
                      placeholder:text-white/30
                      shadow-lg
                      backdrop-blur-xl
                      !py-5 !px-6 !rounded-2xl
                    "
                  />

                  {/* EMAIL (FIXED PREMIUM UI) */}
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />

                    <Input
                      label="Email Address"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="
                        pl-14
                        !bg-gradient-to-br from-white/[0.06] to-white/[0.02]
                        border border-white/10
                        focus:border-blue-500/50
                        focus:ring-2 focus:ring-blue-500/20
                        hover:border-white/20
                        text-white
                        placeholder:text-white/30
                        shadow-lg
                        backdrop-blur-xl
                        !py-5 !px-6 !rounded-2xl
                        transition-all duration-300
                      "
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" isLoading={loading}>
                      Save Changes
                    </Button>

                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 border border-white/10 rounded-xl text-white/40"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (

                /* VIEW MODE EMAIL CARD */
                <div className="grid grid-cols-2 gap-6">

                  <div className="
                    p-8
                    bg-gradient-to-br from-white/[0.06] to-white/[0.02]
                    border border-white/10
                    hover:border-blue-500/30
                    rounded-[2rem]
                    transition-all shadow-xl
                  ">
                    <p className="text-white/40 text-xs mb-2">Full Name</p>
                    <p className="text-2xl text-white font-bold">{user?.name}</p>
                  </div>

                  <div className="
                    p-8
                    bg-gradient-to-br from-white/[0.06] to-white/[0.02]
                    border border-white/10
                    hover:border-blue-500/30
                    rounded-[2rem]
                    transition-all shadow-xl
                    relative group
                  ">
                    <p className="text-white/40 text-xs mb-2">Email Address</p>
                    <p className="text-2xl text-white font-bold">{hideEmail ? maskEmail(user?.email) : user?.email}</p>
                    <button
                      onClick={() => setHideEmail(!hideEmail)}
                      className="absolute top-8 right-8 p-2 bg-white/5 opacity-0 group-hover:opacity-100 rounded-xl transition-all"
                    >
                      {hideEmail ? <Eye className="w-4 h-4 text-white/40" /> : <EyeOff className="w-4 h-4 text-white/40" />}
                    </button>
                  </div>

                </div>
              )}

              {success && (
                <div className="mt-6 text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {success}
                </div>
              )}

              {error && (
                <div className="mt-6 text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

            </Card>

            {/* DELETE ACCOUNT */}
            <Card className="!p-12 mt-8 border-red-500/10 bg-red-500/[0.02]">
              <h3 className="text-2xl text-white mb-4 flex items-center gap-3">
                <Trash2 className="text-red-500" />
                Danger Zone
              </h3>
              <p className="text-white/40 mb-6">
                Permanently delete your account and all associated data. This action is irreversible.
              </p>

              {deleteStep === 'confirm' ? (
                <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Account
                </Button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleDeleteAccount}
                  className="space-y-6"
                >
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6">
                    <p className="text-red-400 text-sm font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      Final Verification Required
                    </p>
                    <p className="text-white/40 text-xs mt-1">We've sent a 6-digit code to {user?.email}. Enter it below to confirm deletion.</p>
                  </div>

                  <Input
                    label="Verification Code"
                    placeholder="Enter 6-digit OTP"
                    value={deleteOtp}
                    onChange={(e) => setDeleteOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="!bg-white/5 border-white/10 text-center text-2xl tracking-[1em] font-black"
                  />

                  {deleteError && <p className="text-red-400 text-sm font-bold">{deleteError}</p>}
                  {deleteSuccess && <p className="text-emerald-400 text-sm font-bold">{deleteSuccess}</p>}

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      variant="danger"
                      isLoading={deleteLoading}
                      className="flex-1"
                    >
                      Confirm Permanent Deletion
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDeleteStep('confirm')}
                      className="px-6 py-3 text-white/40 hover:text-white transition-all text-sm font-bold uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </Card>

            <ConfirmModal
              isOpen={showDeleteConfirm}
              onClose={() => setShowDeleteConfirm(false)}
              onConfirm={() => {
                setShowDeleteConfirm(false);
                requestDeleteOtp();
              }}
              title="Delete Your Account?"
              message="Are you absolutely sure? This will permanently delete your profile, all your tasks, and analytics history. You cannot undo this."
              confirmText="Send verification code"
            />


          </div>
        </div>
      </div>

      {/* Logout Confirmation */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
        title="Sign Out"
        message="Are you sure you want to log out? Your session will be terminated."
        confirmText="Confirm Sign Out"
        variant="danger"
      />
    </PageBackground>
  );
};

export default Profile;
