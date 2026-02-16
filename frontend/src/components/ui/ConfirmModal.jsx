import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#0a0b0e] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border ${type === 'danger'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                    }`}>
                                    <AlertTriangle className="w-7 h-7" />
                                </div>

                                <h3 className="text-xl font-bold text-white tracking-tight mb-2">{title}</h3>
                                <p className="text-white/40 leading-relaxed text-sm font-medium mb-8 tabular-nums">{message}</p>

                                <div className="flex w-full gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-xs font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all opacity-80 hover:opacity-100"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        onClick={onConfirm}
                                        className={`flex-1 !py-3 !rounded-xl !text-xs !font-black !uppercase !tracking-widest ${type === 'danger' ? '!bg-red-500 !text-white' : '!bg-white !text-black'
                                            }`}
                                    >
                                        {confirmText}
                                    </Button>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
