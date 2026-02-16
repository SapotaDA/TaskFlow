import React from 'react';
import { motion } from 'framer-motion';

const PageBackground = ({
  children,
  className = '',
  gradient = "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
  blob1 = "bg-white/10",
  blob2 = "bg-indigo-500/30",
  blob3 = "bg-pink-500/30"
}) => {
  return (
    <div className={`min-h-screen ${gradient} relative overflow-hidden ${className}`}>
      {/* Noise / Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.25] mix-blend-overlay z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          filter: 'contrast(120%) brightness(100%) grayscale(1)'
        }}
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            x: [-50, 50, -50],
            y: [-50, 50, -50],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] ${blob1} rounded-full blur-[120px]`}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [100, -100, 100],
            y: [100, -100, 100],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className={`absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] ${blob2} rounded-full blur-[150px]`}
        />
        <motion.div
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className={`absolute top-1/2 left-1/2 w-[30rem] h-[30rem] ${blob3} rounded-full blur-[100px] transform -translate-x-1/2 -translate-y-1/2`}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full">
        {children}
      </div>
    </div>
  );
};

export default PageBackground;
