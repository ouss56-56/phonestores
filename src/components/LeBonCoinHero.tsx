import React from 'react';
import { motion } from 'framer-motion';

const LeBonCoinHero = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-copper-500/5 blur-[80px] rounded-full" />
      </div>

      {/* Content Container */}
      <div className="container relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 px-6">
        
        {/* Left Side: Branding & CTA */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
              LE BON <span className="text-amber-500">COIN</span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-amber-200/60 font-medium max-w-xl">
              Experience the future of mobility. iPhone 17 Pro Max.
              Antigravity engineering, redefined.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-6"
          >
            <button className="px-8 py-4 bg-amber-500 text-black font-bold rounded-full text-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all duration-300">
              Pre-order Now
            </button>
            <button className="px-8 py-4 border border-amber-500/30 text-amber-500 font-bold rounded-full text-lg hover:bg-amber-500/10 transition-all duration-300">
              Watch the Film
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="pt-12 grid grid-cols-3 gap-8 border-t border-amber-500/10"
          >
            <div>
              <p className="text-amber-500 font-mono-tech text-sm uppercase tracking-widest">Gravity</p>
              <p className="text-2xl font-bold text-white uppercase">Zero</p>
            </div>
            <div>
              <p className="text-amber-500 font-mono-tech text-sm uppercase tracking-widest">Optics</p>
              <p className="text-2xl font-bold text-white uppercase">8K Cinematic</p>
            </div>
            <div>
              <p className="text-amber-500 font-mono-tech text-sm uppercase tracking-widest">Process</p>
              <p className="text-2xl font-bold text-white uppercase">A19 Pro</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Video Container */}
        <div className="flex-1 relative flex items-center justify-center w-full max-w-2xl aspect-square">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="video-container relative group"
          >
            {/* Ambient Shadow/Glow behind video */}
            <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full group-hover:bg-amber-500/30 transition-all duration-700" />
            
            <video
              className="relative z-10 w-full h-full object-cover mix-blend-screen"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/hero-iphone.mp4" type="video/mp4" />
            </video>

            {/* Reflection on floor */}
            <div className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 z-20 pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* Subtle UI Decorations */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-amber-500/40">
        <span className="text-xs font-mono-tech uppercase tracking-[0.3em]">Scroll to Explore</span>
        <div className="w-px h-12 bg-gradient-to-b from-amber-500/40 to-transparent" />
      </div>
    </section>
  );
};

export default LeBonCoinHero;
