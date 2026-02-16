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
    const baseStyles = "relative inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-95 whitespace-nowrap";

    const variants = {
        primary: "bg-white text-black shadow-lg hover:shadow-white/10 hover:bg-white/90",
        secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
        danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 hover:border-red-500/40",
        ghost: "text-white/40 hover:text-white hover:bg-white/5"
    };

    return (
        <motion.button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            whileHover={{ y: -1 }}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className={`w-3.5 h-3.5 border-2 rounded-full animate-spin ${variant === 'primary' ? 'border-black/20 border-t-black' : 'border-white/20 border-t-white'}`}></div>
                    <span className="opacity-70 text-xs">Processing...</span>
                </div>
            ) : children}
        </motion.button>
    );
};

export default Button;
