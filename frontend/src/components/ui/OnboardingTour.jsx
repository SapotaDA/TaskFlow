import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronRight, ChevronLeft, Rocket,
    Target, BarChart3, Bell, Sparkles, CheckCircle2
} from 'lucide-react';
import Button from './Button';

const steps = [
    {
        title: "Welcome to TaskFlow",
        description: "Your new home for organizing tasks. We've designed this to help you get more done with less stress.",
        icon: <Rocket className="w-8 h-8 text-blue-400" />,
        color: "from-blue-500/20 to-indigo-500/20",
        accent: "bg-blue-500"
    },
    {
        title: "Manage Tasks",
        description: "Easily create, edit, and organize your work. Use priority levels and status tags to keep track of what's important.",
        icon: <Target className="w-8 h-8 text-emerald-400" />,
        color: "from-emerald-500/20 to-teal-500/20",
        accent: "bg-emerald-500"
    },
    {
        title: "Track Progress",
        description: "See how well you're doing. Check your completion rates and task trends with our simple charts.",
        icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
        color: "from-purple-500/20 to-pink-500/20",
        accent: "bg-purple-500"
    },
    {
        title: "Stay Notified",
        description: "Never miss a deadline. Our notification system keeps you updated on your tasks and important events.",
        icon: <Bell className="w-8 h-8 text-amber-400" />,
        color: "from-amber-500/20 to-orange-500/20",
        accent: "bg-amber-500"
    },
    {
        title: "Your Profile",
        description: "Personalize your account. Upload a profile picture and manage your security settings easily.",
        icon: <Sparkles className="w-8 h-8 text-blue-400" />,
        color: "from-blue-400/20 to-cyan-400/20",
        accent: "bg-blue-400"
    }
];

const OnboardingTour = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(onComplete, 500);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={handleComplete}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0A0C10] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
                    >
                        {/* Background Accent */}
                        <div className={`absolute top-0 left-0 right-0 h-64 bg-gradient-to-b ${steps[currentStep].color} transition-colors duration-700`} />

                        {/* Close Button */}
                        <button
                            onClick={handleComplete}
                            className="absolute top-8 right-8 p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content Container */}
                        <div className="relative pt-16 pb-12 px-10 text-center flex flex-col items-center">
                            {/* Icon Circle */}
                            <motion.div
                                key={`icon-${currentStep}`}
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-20 h-20 rounded-3xl bg-black border border-white/10 flex items-center justify-center mb-8 shadow-2xl"
                            >
                                {steps[currentStep].icon}
                            </motion.div>

                            {/* Progress Dots */}
                            <div className="flex gap-2 mb-8">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? `w-8 ${steps[currentStep].accent}` : 'w-2 bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Text Animation */}
                            <div className="min-h-[160px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`text-${currentStep}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                                            {steps[currentStep].title}
                                        </h2>
                                        <p className="text-white/50 text-base leading-relaxed max-w-sm mx-auto">
                                            {steps[currentStep].description}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between w-full mt-10 gap-4">
                                <button
                                    onClick={handleBack}
                                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>

                                <Button
                                    onClick={handleNext}
                                    className="px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-2 min-w-[140px] justify-center"
                                >
                                    {currentStep === steps.length - 1 ? (
                                        <>Get Started <CheckCircle2 className="w-4 h-4" /></>
                                    ) : (
                                        <>Continue <ChevronRight className="w-4 h-4" /></>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OnboardingTour;
