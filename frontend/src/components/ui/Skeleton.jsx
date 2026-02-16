import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className = '', variant = 'rect' }) => {
    const variants = {
        rect: 'rounded-xl',
        circle: 'rounded-full',
        text: 'rounded-md h-4 w-full',
    };

    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`bg-white/5 border border-white/5 ${variants[variant]} ${className}`}
        />
    );
};

export const TaskSkeleton = () => (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 h-[280px] flex flex-col">
        <div className="flex justify-between items-start mb-6">
            <Skeleton className="w-24 h-6" />
            <div className="flex gap-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
        </div>
        <Skeleton className="w-3/4 h-8 mb-4" />
        <Skeleton className="w-full h-20 mb-6" />
        <div className="mt-auto flex justify-between items-center">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-16 h-5" />
        </div>
    </div>
);

export default Skeleton;
