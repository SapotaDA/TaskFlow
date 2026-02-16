import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    disabled,
    type = 'button',
    ...props
}) => {
    const baseStyles = "w-full py-3.5 px-6 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.15em] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group";

    const variants = {
        primary: "bg-white text-slate-950 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_20px_60px_-10px_rgba(255,255,255,0.4)] border border-white/20 hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-white/[0.03] border border-white/10 text-white/50 hover:bg-white/[0.08] hover:text-white hover:border-white/20 backdrop-blur-xl",
        danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/40",
        ghost: "text-white/40 hover:text-white hover:bg-white/5"
    };

    return (
        <motion.button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Shimmer Effect for Primary */}
            {variant === 'primary' && !isLoading && (
                <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent skew-x-[-20deg]"
                />
            )}

            <div className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                    <>
                        <div className={`w-4 h-4 border-2 rounded-full animate-spin ${variant === 'primary' ? 'border-slate-950/20 border-t-slate-950' : 'border-white/20 border-t-white'}`}></div>
                        <span>Processing...</span>
                    </>
                ) : (
                    children
                )}
            </div>
        </motion.button>
    );
};

export default Button;
