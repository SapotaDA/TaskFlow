import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Trash2, Shield, Activity, Terminal, Zap, Search, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageBackground from './ui/PageBackground';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';
import { useToast } from '../context/ToastContext';

const ActivityLogs = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            const response = await api.get('/activities');
            setLogs(response.data);
        } catch (error) {
            toast.error('Failed to retrieve system logs.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const clearLogs = async () => {
        try {
            await api.delete('/activities');
            setLogs([]);
            toast.success('History purged successfully.');
        } catch (error) {
            toast.error('Failed to clear logs.');
        }
    };

    const getActionStyles = (action) => {
        if (action.includes('PURGED') || action.includes('DELETE')) return 'text-red-400 bg-red-500/10 border-red-500/20';
        if (action.includes('INITIALIZED') || action.includes('CREATE')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (action.includes('SYNC') || action.includes('UPDATE')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        return 'text-white/40 bg-white/5 border-white/10';
    };

    const filteredLogs = logs.filter(log =>
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <PageBackground gradient="bg-gradient-to-br from-[#020305] via-[#050608] to-black">
            <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-2xl bg-[#020305]/80 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-slate-950 font-black text-xs">TF</span>
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">System Logs</span>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                    </button>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto pt-32 pb-20 px-6">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">History</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Recent Activity</h1>
                        <p className="text-white/40 text-sm mt-2 max-w-md leading-relaxed">
                            A simple record of all actions taken on your account.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Find entries..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.05] transition-all w-full md:w-64"
                            />
                        </div>
                        <Button variant="danger" onClick={clearLogs} className="!py-2.5 !px-5 !text-[10px]">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Purge Logs
                        </Button>
                    </div>
                </header>

                <div className="relative">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : filteredLogs.length > 0 ? (
                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {filteredLogs.map((log, index) => (
                                    <motion.div
                                        key={log._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="group p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-all flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 text-white/20 group-hover:text-white/40 transition-colors">
                                            <Terminal className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getActionStyles(log.action)}`}>
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-white/20 font-medium">
                                                    {new Date(log.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/60 font-medium truncate italic">
                                                "{log.details}"
                                            </p>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                                            <span className="text-[9px] font-black text-white/10 uppercase tracking-widest">VERIFIED</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="py-32 text-center border border-dashed border-white/5 rounded-[2.5rem]">
                            <div className="w-16 h-16 bg-white/[0.02] rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-8 h-8 text-white/5" />
                            </div>
                            <h3 className="text-white font-bold text-lg">No activity recorded yet</h3>
                            <p className="text-white/20 text-xs mt-1 max-w-xs mx-auto uppercase tracking-widest leading-loose">Your history is currently empty.</p>
                        </div>
                    )}
                </div>
            </main>
        </PageBackground>
    );
};

export default ActivityLogs;
