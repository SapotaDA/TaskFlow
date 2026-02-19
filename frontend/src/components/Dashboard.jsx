import React, { useState, useEffect, useContext, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Cache Buster: V1.7.1
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageBackground from './ui/PageBackground';
import Button from './ui/Button';
import {
  Plus, Search, LogOut, LayoutGrid, Activity, BarChart3, Settings2, Bell, User, HelpCircle
} from 'lucide-react';

// Specialized Dashboard Components
import StatCards from './dashboard/StatCards';
import TaskView from './dashboard/TaskView';
import TaskForm from './dashboard/TaskForm';
import Skeleton from './ui/Skeleton';
import NotificationCenter from './NotificationCenter';
import ConfirmModal from './ui/ConfirmModal';
import FeedbackCard from './ui/FeedbackCard';
import OnboardingTour from './ui/OnboardingTour';
import { useToast } from '../context/ToastContext';

// Lazy load ChartSection
const ChartSection = lazy(() => import('./dashboard/ChartSection'));

const Dashboard = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState(7);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const tourShowed = localStorage.getItem('tf_tour_showed');
    if (!tourShowed) {
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('tf_tour_showed', 'true');
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });

  const [viewMode, setViewMode] = useState('grid');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetching Logic
  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get(`/tasks/stats?days=${analyticsRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [analyticsRange]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial Load - Only run once on mount
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchTasks(), fetchStats()]);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, []); // Remove dependencies to prevent re-initializing on every stat change

  // Refetch stats when range changes, without global loading
  useEffect(() => {
    if (!loading) {
      fetchStats();
    }
  }, [analyticsRange, fetchStats]);

  // Handlers
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
        toast.success(`Objective "${formData.title}" synchronized.`);
      } else {
        await api.post('/tasks', formData);
        toast.success(`New sequence "${formData.title}" initialized.`);
      }
      fetchTasks();
      fetchStats();
      setShowForm(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
      });
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Transaction failure: Sequence could not be saved.');
    }
  }, [editingTask, formData, fetchTasks, fetchStats]);

  const handleEdit = useCallback((task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 'medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id) => {
    setTaskToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      toast.success('Target neutralized: Data purged from node.');
      fetchTasks();
      fetchStats();
      setShowDeleteModal(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Purge failure: Sequence aborted.');
    }
  }, [taskToDelete, fetchTasks, fetchStats, toast]);

  const confirmLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchStr = (task.title + task.description).toLowerCase();
      const matchesSearch = searchStr.includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, debouncedSearchTerm, statusFilter, priorityFilter]);

  return (
    <PageBackground
      gradient="bg-gradient-to-br from-[#020305] via-[#050608] to-black"
      blob1="bg-blue-600/5"
      blob2="bg-purple-600/5"
      blob3="bg-slate-700/5"
    >
      <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-2xl bg-[#020305]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-slate-950 font-black text-xs">TF</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">TaskFlow</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="h-6 w-px bg-white/10" />
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 group px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-lg overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-white/70 group-hover:text-white transition-colors capitalize">{user?.name?.split(' ')[0]}</span>
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto pt-24 pb-16 px-6">
        {/* Superior Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Overview</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">My Dashboard</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/5 backdrop-blur-xl">
              <button
                onClick={() => { setShowAnalytics(false); setViewMode('grid'); }}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${!showAnalytics && viewMode === 'grid' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Grid</span><span className="sm:hidden">Grid</span>
              </button>
              <button
                onClick={() => { setShowAnalytics(false); setViewMode('kanban'); }}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${!showAnalytics && viewMode === 'kanban' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <Activity className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Board</span><span className="sm:hidden">Board</span>
              </button>
              <button
                onClick={() => setShowAnalytics(true)}
                className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${showAnalytics ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Analytics</span><span className="sm:hidden">Stats</span>
              </button>
            </div>
            {!showAnalytics && (
              <Button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl text-[10px] sm:text-xs justify-center shadow-2xl">
                <Plus className="w-4 h-4 mr-1" /> New Task
              </Button>
            )}
          </div>
        </div>

        {/* Global Statistics */}
        <StatCards stats={stats} />

        {showAnalytics ? (
          <Suspense fallback={
            <div className="h-[400px] rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center animate-pulse">
              <Activity className="w-8 h-8 text-white/10 mb-4" />
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Loading Analytics...</span>
            </div>
          }>
            <ChartSection
              stats={stats}
              analyticsRange={analyticsRange}
              setAnalyticsRange={setAnalyticsRange}
            />
          </Suspense>
        ) : (
          <>
            {/* Clinical Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-8 p-3 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-2xl">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-transparent text-white placeholder-white/20 focus:outline-none font-bold text-[11px] uppercase tracking-widest transition-all"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/50 focus:outline-none hover:bg-white/10 hover:text-white transition-all cursor-pointer appearance-none min-w-[130px]"
                >
                  <option value="" className="bg-slate-900">All Statuses</option>
                  <option value="pending" className="bg-slate-900">Pending</option>
                  <option value="in-progress" className="bg-slate-900">In Progress</option>
                  <option value="completed" className="bg-slate-900">Completed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/50 focus:outline-none hover:bg-white/10 hover:text-white transition-all cursor-pointer appearance-none min-w-[130px]"
                >
                  <option value="" className="bg-slate-900">All Priorities</option>
                  <option value="low" className="bg-slate-900">Low</option>
                  <option value="medium" className="bg-slate-900">Medium</option>
                  <option value="high" className="bg-slate-900">High</option>
                </select>
              </div>
            </div>

            {/* Render Viewport */}
            <TaskView
              viewMode={viewMode}
              filteredTasks={filteredTasks}
              loading={loading}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          </>
        )}

        <FeedbackCard />
      </main>

      <TaskForm
        showForm={showForm}
        setShowForm={setShowForm}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        editingTask={editingTask}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This cannot be undone."
        confirmText="Yes, Delete"
        variant="danger"
      />

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        variant="danger"
      />

      {showTour && <OnboardingTour onComplete={completeTour} />}

      {/* Floating Tutorial Tab */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={() => setShowTour(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[90] bg-blue-600 hover:bg-blue-500 text-white px-2 py-4 rounded-l-2xl shadow-2xl flex flex-col items-center gap-2 border-l border-t border-b border-white/20 transition-all group"
      >
        <HelpCircle className="w-5 h-5" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-black uppercase tracking-[0.2em]">Tutorial</span>
      </motion.button>
    </PageBackground>
  );
};

export default Dashboard;
