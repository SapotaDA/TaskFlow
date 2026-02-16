import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { PieChart as PieChartIcon, TrendingUp, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0c0d10] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mb-1">{payload[0].name}</p>
                <p className="text-white font-bold text-lg">{payload[0].value} <span className="text-[10px] text-white/40 font-medium lowercase">Tasks</span></p>
            </div>
        );
    }
    return null;
};

const ChartSection = ({ stats, analyticsRange, setAnalyticsRange }) => {
    if (!stats) return (
        <div className="h-[400px] flex items-center justify-center text-white/20 font-bold uppercase tracking-widest text-xs">
            Initializing Analytics Engine...
        </div>
    );

    const pieData = [
        { name: 'Pending', value: stats.pending, color: '#3b82f6' },
        { name: 'Active', value: stats.inProgress, color: '#f59e0b' },
        { name: 'Completed', value: stats.completed, color: '#10b981' },
    ].filter(d => d.value > 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 animate-page-fade">
            {/* Activity Chart */}
            <div className="lg:col-span-8 p-6 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl group hover:border-white/10 transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">Activity Analysis</h3>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Submission velocity</p>
                        </div>
                    </div>
                    <select
                        value={analyticsRange}
                        onChange={(e) => setAnalyticsRange(parseInt(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 focus:outline-none hover:bg-white/10 cursor-pointer transition-all appearance-none"
                    >
                        <option value="7" className="bg-slate-900">7D</option>
                        <option value="30" className="bg-slate-900">30D</option>
                        <option value="90" className="bg-slate-900">90D</option>
                    </select>
                </div>

                <div className="h-[280px] w-full mt-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.activity || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#ffffff20', fontSize: 9, fontWeight: 600 }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#ffffff20', fontSize: 9, fontWeight: 600 }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl group hover:border-white/10 transition-all duration-500 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Activity className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white tracking-tight">Status Balance</h3>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Workload distribution</p>
                        </div>
                    </div>
                </div>
                <div className="h-[200px] w-full relative mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={70}
                                paddingAngle={6}
                                dataKey="value"
                                stroke="none"
                                animationDuration={1500}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-white tracking-tight">{stats.total}</span>
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Total</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mt-8">
                    {pieData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{d.name}</span>
                            </div>
                            <span className="text-xs font-bold text-white tracking-tight">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChartSection);
