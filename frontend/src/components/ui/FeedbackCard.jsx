import React from 'react';
import { Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const FeedbackCard = () => {
    const feedbackEmail = 'TaskFlow189@gmail.com';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 backdrop-blur-3xl relative overflow-hidden group"
        >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                    <MessageSquare className="w-8 h-8 text-indigo-400" />
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">System Feedback</h3>
                    <p className="text-sm text-white/40 mt-1 max-w-lg leading-relaxed">
                        Encountered a glitch in the simulation or have a suggestion for the next update? Our engineers are standing by.
                    </p>
                </div>

                <a
                    href={`mailto:${feedbackEmail}?subject=TaskFlow Feedback - System Update`}
                    className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all duration-300 shadow-xl hover:shadow-indigo-500/20 flex items-center justify-center gap-2 group/btn"
                >
                    <Mail className="w-4 h-4" />
                    Send Report
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all" />
                </a>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700" />
        </motion.div>
    );
};

export default FeedbackCard;
