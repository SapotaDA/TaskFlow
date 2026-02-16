import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, CheckCircle2, MoreHorizontal, Settings, X, Info } from 'lucide-react';
import api from '../services/api';
import NotificationItem from './ui/NotificationItem';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check every 30s for better responsiveness
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className={`relative p-2.5 rounded-xl border border-white/10 transition-all active:scale-95 ${isOpen ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                    }`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-[0_0_12px_rgba(99,102,241,0.5)] border-2 border-[#0a0b0e]"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-[280px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-[#0c0d10]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-3xl z-[200] overflow-hidden"
                    >
                        <div className="p-5 sm:p-8 pb-3 sm:pb-4 flex items-center justify-between border-b border-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Notifications</h3>
                                <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">Latest Updates</p>
                            </div>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                                        title="Mark all as read"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-all border border-white/10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[400px] sm:max-h-[450px] overflow-y-auto p-3 sm:p-4 custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="space-y-1">
                                    {notifications.map((notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onRead={markAsRead}
                                            onDelete={deleteNotification}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <BellOff className="w-8 h-8 text-white/10" />
                                    </div>
                                    <h4 className="text-white font-bold">No notifications yet</h4>
                                    <p className="text-white/20 text-xs mt-1">We'll alert you when tasks need attention.</p>
                                </div>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
