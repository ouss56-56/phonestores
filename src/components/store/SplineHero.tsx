import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

/**
 * Premium Loading Placeholder
 * A soft pulsing glow that matches the white luxury aesthetic.
 */
const SplineLoading = () => (
    <div className="relative w-full h-[500px] flex items-center justify-center">
        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className="w-64 h-64 rounded-full bg-gradient-to-r from-black/[0.02] to-black/[0.05] blur-3xl"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-black/10 animate-pulse" />
        </div>
    </div>
);

const SplineScene = () => {
    return (
        <div className="relative w-full h-[600px] lg:h-[800px] flex items-center justify-center">
            {/* Dynamic Soft Glow Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(250,250,250,0)_70%)] opacity-60" />
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.4, 0.6, 0.4]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(0,0,0,0.03)_0%,rgba(250,250,250,0)_60%)] blur-2xl"
                />
            </div>

            {/* Spline Element */}
            <div className="relative z-10 w-full h-full">
                <Spline
                    scene="https://prod.spline.design/XYRoap4RsksI77dP/scene.splinecode"
                    className="w-full h-full !bg-transparent"
                />
            </div>
        </div>
    );
};

const SplineHero = () => {
    return (
        <Suspense fallback={<SplineLoading />}>
            <SplineScene />
        </Suspense>
    );
};

export default SplineHero;
