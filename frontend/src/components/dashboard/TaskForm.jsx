import React from 'react';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const TaskForm = ({
    showForm,
    setShowForm,
    handleSubmit,
    formData,
    setFormData,
    editingTask
}) => {
    return (
        <AnimatePresence>
            {showForm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#020305]/90 backdrop-blur-md"
                        onClick={() => setShowForm(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className="relative w-full max-w-xl bg-[#0a0b0e] rounded-2xl border border-white/10 shadow-3xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 sm:p-8 pb-3 sm:pb-4 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    {editingTask ? 'Edit Objective' : 'New Sequence'}
                                </h3>
                                <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest mt-1">Configure task parameters</p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all border border-white/5"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6 sm:p-8 pt-3 sm:p-4 overflow-y-auto no-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    label="Title"
                                    placeholder="Task identification..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Documentation</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all duration-300 min-h-[120px] resize-none"
                                        placeholder="Provide sequence details..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Priority</label>
                                        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                                            {['low', 'medium', 'high'].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, priority: p })}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${formData.priority === p
                                                        ? 'bg-white text-black shadow-lg scale-[1.02]'
                                                        : 'text-white/30 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">Status</label>
                                        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/5">
                                            {[
                                                { id: 'pending', label: 'PND' },
                                                { id: 'in-progress', label: 'ACT' },
                                                { id: 'completed', label: 'FIN' }
                                            ].map(s => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: s.id })}
                                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${formData.status === s.id
                                                        ? 'bg-white text-black shadow-lg scale-[1.02]'
                                                        : 'text-white/30 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Deadline"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="scheme-dark"
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button type="submit" className="flex-1 py-3 text-xs">
                                        {editingTask ? 'Update Sequence' : 'Initialize Task'}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-3 rounded-xl bg-white/5 text-white/50 font-bold uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/10 transition-all"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default React.memo(TaskForm);
