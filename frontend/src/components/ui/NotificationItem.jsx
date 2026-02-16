import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Info, CheckCircle2, Trash2 } from 'lucide-react';

const NotificationItem = ({ notification, onRead, onDelete }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'deadline':
                return <Clock className="w-4 h-4 text-amber-400" />;
            case 'system':
                return <Info className="w-4 h-4 text-blue-400" />;
            case 'task':
                return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            default:
                return <Bell className="w-4 h-4 text-indigo-400" />;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`p-4 rounded-2xl border ${notification.read
                ? 'bg-white/[0.02] border-white/5 opacity-60'
                : 'bg-white/[0.05] border-white/10 shadow-lg'
                } hover:bg-white/[0.08] transition-all group relative mb-3`}
        >
            <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.read ? 'bg-white/5' : 'bg-indigo-500/10 border border-indigo-500/20'
                    }`}>
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0" onClick={() => !notification.read && onRead(notification._id)}>
                    <div className="flex justify-between items-start gap-2">
                        <h4 className={`text-sm font-bold truncate ${notification.read ? 'text-white/40' : 'text-white'}`}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] font-medium text-white/20 whitespace-nowrap mt-0.5">
                            {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${notification.read ? 'text-white/30' : 'text-white/60'}`}>
                        {notification.message}
                    </p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationItem;
