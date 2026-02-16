import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`backdrop-blur-3xl bg-slate-950/40 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/[0.08] p-8 relative overflow-hidden group hover:border-white/[0.12] transition-colors duration-500 ${className}`}
            {...props}
        >
            {/* Subtle Inner Glow */}
            <div className="absolute inset-px rounded-[2.4rem] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

            {/* Glass Shimmer Effect */}
            <motion.div
                animate={{
                    x: ['-100%', '200%'],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 10
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent skew-x-[-25deg] pointer-events-none"
            />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default Card;
