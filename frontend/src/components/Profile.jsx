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
  LogOut, CheckCircle2, AlertCircle, Trash2
} from 'lucide-react';

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
              <p className="text-white/40 mb-8">{user?.email}</p>

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

            <Button onClick={logout} className="w-full !py-5">
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
                  ">
                    <p className="text-white/40 text-xs mb-2">Email Address</p>
                    <p className="text-2xl text-white font-bold">{user?.email}</p>
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
                Permanently delete your account and all associated data.
              </p>

              <Button variant="danger">
                Delete Account
              </Button>
            </Card>

          </div>
        </div>
      </div>
    </PageBackground>
  );
};

export default Profile;
