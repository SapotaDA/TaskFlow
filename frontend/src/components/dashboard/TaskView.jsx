import React from 'react';
import { Edit2, Trash2, Calendar, Activity, Clipboard } from 'lucide-react';
import { TaskSkeleton } from '../ui/Skeleton';

const TaskView = ({
    viewMode,
    filteredTasks,
    loading,
    handleEdit,
    handleDelete
}) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {[...Array(6)].map((_, i) => <TaskSkeleton key={i} />)}
            </div>
        );
    }

    if (filteredTasks.length === 0) {
        return (
            <div className="text-center py-20 px-6 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.01] mt-8 animate-fade-in">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl overflow-hidden group">
                    <Clipboard className="w-8 h-8 text-white/10 group-hover:text-blue-400 transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Deployment Empty</h3>
                <p className="text-white/30 text-sm max-w-xs mx-auto">No matching tasks found in the database. Initialize a new sequence to begin.</p>
            </div>
        );
    }

    if (viewMode === 'kanban') {
        return (
            <div className="flex gap-6 mt-6 overflow-x-auto pb-6 no-scrollbar animate-fade-in" style={{ WebkitOverflowScrolling: 'touch' }}>
                {['pending', 'in-progress', 'completed'].map(columnStatus => (
                    <div key={columnStatus} className="flex flex-col gap-4 min-w-[320px] max-w-[320px]">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${columnStatus === 'completed' ? 'bg-emerald-500' : columnStatus === 'in-progress' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">{columnStatus.replace('-', ' ')}</h4>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-white/30">
                                {filteredTasks.filter(t => t.status === columnStatus).length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 min-h-[500px] p-2 rounded-2xl bg-white/[0.01] border border-white/5">
                            {filteredTasks.filter(t => t.status === columnStatus).map((task) => (
                                <div
                                    key={task._id}
                                    className="group p-5 rounded-xl bg-[#0c0d10] border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-xl hover:shadow-2xl"
                                    onClick={() => handleEdit(task)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/10' :
                                            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/10' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/10'
                                            }`}>
                                            {task.priority || 'Normal'}
                                        </div>
                                    </div>
                                    <h5 className="text-white font-bold text-sm mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">{task.title}</h5>
                                    <p className="text-white/20 text-[11px] line-clamp-2 mb-4 leading-relaxed">{task.description}</p>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" />
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                                        </div>
                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-1.5 rounded-lg bg-white/5 hover:text-red-400 transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}>
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Grid View
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 animate-fade-in">
            {filteredTasks.map((task) => (
                <div
                    key={task._id}
                    className="group relative p-6 rounded-2xl bg-[#0c0d10] border border-white/5 backdrop-blur-3xl hover:bg-[#0f1115] transition-all duration-300 flex flex-col min-h-[220px] shadow-xl hover:shadow-2xl hover:border-white/10"
                >
                    <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                                task.status === 'in-progress' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                                    'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]'
                                }`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">{task.status.replace('-', ' ')}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(task); }}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all border border-white/5"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}
                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-all border border-white/5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors line-clamp-1">{task.title}</h3>
                    <p className="text-white/30 text-xs leading-relaxed mb-6 grow line-clamp-2">{task.description}</p>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest border ${task.priority === 'high' ? 'bg-red-500/5 text-red-400/80 border-red-500/10' :
                            task.priority === 'medium' ? 'bg-amber-500/5 text-amber-400/80 border-amber-500/10' :
                                'bg-blue-500/5 text-blue-400/80 border-blue-500/10'
                            }`}>
                            <Activity className="w-3 h-3" />
                            {task.priority || 'Normal'}
                        </div>
                        {task.dueDate && (
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 opacity-40" />
                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(TaskView);
