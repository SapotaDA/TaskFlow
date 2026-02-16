import React from 'react';
import { Clipboard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const StatCard = React.memo(({ title, value, icon: Icon, colorClass }) => {
    return (
        <div
            className="p-4 sm:p-5 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl relative overflow-hidden group hover:bg-white/[0.03] transition-all duration-500 hover:border-white/10"
        >
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-white tracking-tight tabular-nums">{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:scale-105 transition-all duration-500`}>
                    <Icon className={`w-4 h-4 text-white/30 group-hover:${colorClass} transition-colors`} />
                </div>
            </div>
            <div className={`absolute -bottom-6 -right-6 w-20 h-20 opacity-0 group-hover:opacity-10 blur-2xl rounded-full transition-all duration-700 bg-blue-500`} />
        </div>
    );
});

const StatCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard title="Total Tasks" value={stats?.total || 0} icon={Clipboard} colorClass="text-blue-400" />
            <StatCard title="Active" value={stats?.inProgress || 0} icon={Clock} colorClass="text-amber-400" />
            <StatCard title="Completed" value={stats?.completed || 0} icon={CheckCircle2} colorClass="text-emerald-400" />
            <StatCard title="Overdue" value={stats?.overdue || 0} icon={AlertCircle} colorClass="text-red-400" />
        </div>
    );
};

export default React.memo(StatCards);
