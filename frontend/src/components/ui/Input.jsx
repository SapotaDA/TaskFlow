import React from 'react';

const Input = ({
    label,
    id,
    error,
    className = '',
    containerClassName = '',
    rightIcon,
    ...props
}) => {
    return (
        <div className={`space-y-1.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={id} className="block text-[11px] font-bold text-white/40 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    id={id}
                    className={`w-full px-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 transition-all duration-300 hover:bg-white/[0.04] ${className}`}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <div className="flex items-center gap-1.5 mt-1 ml-1">
                    <p className="text-red-400 text-[10px] font-semibold">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Input;
