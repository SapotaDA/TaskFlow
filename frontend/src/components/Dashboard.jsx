import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageBackground from './ui/PageBackground';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Edit2, Trash2, X, CheckCircle2,
  Clock, AlertCircle, User, LogOut, Clipboard, Sparkles, Calendar,
  BarChart3, LayoutGrid, Terminal, Activity
} from 'lucide-react';

import Skeleton, { TaskSkeleton } from './ui/Skeleton';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [metrics, setMetrics] = useState({ network: 99.1, load: 24 });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    category: 'general',
    dueDate: ''
  });
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTasks(), fetchStats()]);
    };
    init();

    // Metric Simulation
    const interval = setInterval(() => {
      setMetrics(prev => ({
        network: +(prev.network + (Math.random() * 0.2 - 0.1)).toFixed(1),
        load: Math.floor(prev.load + (Math.random() * 4 - 2))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await api.post('/tasks', formData);
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
        category: 'general',
        dueDate: ''
      });
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority || 'medium',
      category: task.category || 'general',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
        fetchStats();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const StatCard = ({ title, value, icon: Icon, delay }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-3xl relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500"
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">{title}</p>
            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{value}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-500">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PageBackground
      gradient="bg-gradient-to-br from-[#020305] via-slate-900 to-black"
      blob1="bg-blue-600/10"
      blob2="bg-purple-600/10"
      blob3="bg-slate-700/10"
    >
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-[#0a0b0e]/80 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="text-slate-950 font-black text-base">TF</span>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">System Active</span>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-sm font-bold text-white">{user?.name}</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 max-w-7xl mx-auto pt-32 pb-20 px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">Dashboard</h2>
            <p className="text-white/40 text-lg">Manage your tasks and track your project progression.</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="!w-full md:!w-auto !px-8 !py-5 !rounded-2xl !text-lg !font-bold"
          >
            <Plus className="w-5 h-5 mr-2 inline-block" />
            New Task
          </Button>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Tasks" value={stats?.total || 0} icon={Clipboard} delay={0.1} />
          <StatCard title="In Progress" value={stats?.inProgress || 0} icon={Clock} delay={0.2} />
          <StatCard title="Completed" value={stats?.completed || 0} icon={CheckCircle2} delay={0.3} />
          <StatCard title="Overdue" value={stats?.overdue || 0} icon={AlertCircle} delay={0.4} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl">
          <div className="flex-1 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-transparent text-white placeholder-white/20 focus:outline-none font-medium"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold text-white/60 focus:outline-none hover:bg-white/10 transition-all cursor-pointer appearance-none min-w-[140px]"
            >
              <option value="" className="bg-slate-900">All Status</option>
              <option value="pending" className="bg-slate-900">Pending</option>
              <option value="in-progress" className="bg-slate-900 text-amber-300">Active</option>
              <option value="completed" className="bg-slate-900 text-emerald-300">Completed</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold text-white/60 focus:outline-none hover:bg-white/10 transition-all cursor-pointer appearance-none min-w-[140px]"
            >
              <option value="" className="bg-slate-900">All Priority</option>
              <option value="low" className="bg-slate-900 text-blue-300">Low</option>
              <option value="medium" className="bg-slate-900 text-amber-300">Medium</option>
              <option value="high" className="bg-slate-900 text-red-300">High</option>
            </select>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => <TaskSkeleton key={i} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col min-h-[300px] relative overflow-hidden backdrop-blur-3xl shadow-xl hover:shadow-2xl hover:border-white/20">

                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' :
                          task.status === 'in-progress' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]' :
                            'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                          }`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{task.status.replace('-', ' ')}</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => handleEdit(task)} className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-blue-400 border border-white/10 transition-all">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(task._id)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 border border-white/10 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-blue-400 transition-colors">{task.title}</h3>
                    <p className="text-white/40 text-[15px] font-medium leading-relaxed mb-8 flex-grow line-clamp-3">{task.description}</p>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                        <Activity className="w-3.5 h-3.5" />
                        {task.priority || 'Normal'}
                      </div>
                      {task.dueDate && (
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 opacity-40" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 px-6 rounded-[3rem] border-2 border-dashed border-white/10 bg-white/[0.01] mt-12"
          >
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl overflow-hidden group">
              <Clipboard className="w-10 h-10 text-white/10 group-hover:text-blue-400 transition-colors duration-500" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No tasks found</h3>
            <p className="text-white/30 text-lg mb-10 max-w-sm mx-auto">Your task list is empty. Start by creating a new task to track your progress.</p>
          </motion.div>
        )}
      </main>

      {/* Task Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a0b0e] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-12">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight mb-2">
                      {editingTask ? 'Edit Task' : 'New Task'}
                    </h3>
                    <p className="text-sm text-white/40">Fill in the details below to initialize your task.</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/10">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    <Input
                      label="Task Title"
                      placeholder="Enter task title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-white/[0.03] border-white/10 font-medium py-5 px-6 rounded-2xl"
                    />
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-white/60 ml-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all min-h-[140px] resize-none font-medium"
                        placeholder="Describe what needs to be done..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-white/60 ml-2">Priority</label>
                        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                          {['low', 'medium', 'high'].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setFormData({ ...formData, priority: p })}
                              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.priority === p
                                ? 'bg-white text-black shadow-lg scale-[1.02]'
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Input
                        label="Due Date"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="bg-white/[0.03] border-white/10 font-medium py-5 px-6 rounded-2xl [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button type="submit" className="flex-1 !py-5 !rounded-2xl !text-lg !font-bold">
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="w-32 py-5 rounded-2xl bg-white/5 text-white/60 font-bold border border-white/10 hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageBackground>
  );
};

export default Dashboard;
