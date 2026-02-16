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
        <div className={`space-y-2.5 ${containerClassName}`}>
            {label && (
                <label htmlFor={id} className="block text-[11px] font-black text-white/40 uppercase tracking-[0.2em] ml-1.5">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    id={id}
                    className={`w-full px-5 py-4 bg-white/[0.03] backdrop-blur-3xl border border-white/5 rounded-2xl text-white placeholder-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 focus:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-500 hover:bg-white/[0.05] hover:border-white/10 ${className}`}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <div className="flex items-center gap-2 mt-1.5 ml-1.5">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    <p className="text-red-400/80 text-[10px] font-black uppercase tracking-widest">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Input;
