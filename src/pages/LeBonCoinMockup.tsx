import React from 'react';
import LeBonCoinHero from '@/components/LeBonCoinHero';
import { motion } from 'framer-motion';

const LeBonCoinMockup = () => {
    return (
        <div className="bg-black min-h-screen text-white font-sans selection:bg-amber-500 selection:text-black">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-8 py-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <div className="text-2xl font-black tracking-tighter">
                    LE BON <span className="text-amber-500">COIN</span>
                </div>
                <div className="hidden md:flex items-center gap-12 text-sm font-bold uppercase tracking-widest text-white/60">
                    <a href="#" className="hover:text-amber-500 transition-colors">iPhone</a>
                    <a href="#" className="hover:text-amber-500 transition-colors">Mac</a>
                    <a href="#" className="hover:text-amber-500 transition-colors">Watch</a>
                    <a href="#" className="hover:text-amber-500 transition-colors">Accessories</a>
                </div>
                <div>
                    <button className="px-6 py-2 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                        Contact
                    </button>
                </div>
            </nav>

            <LeBonCoinHero />

            {/* Feature Section Placeholder */}
            <section className="py-32 px-8 bg-[#050505]">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center"
                    >
                        <div className="space-y-8">
                            <h2 className="text-5xl font-black tracking-tight uppercase">
                                Floating <br /> <span className="text-amber-500">Architecture</span>
                            </h2>
                            <p className="text-xl text-white/60 leading-relaxed">
                                The iPhone 17 Pro Max components are engineered to exist in a state of suspended animation.
                                Using electromagnetic levitation, were able to dissipate heat 150% more effectively.
                            </p>
                            <div className="flex gap-4">
                                <div className="w-12 h-[2px] bg-amber-500 mt-4" />
                                <p className="font-mono-tech text-amber-500/80 uppercase text-sm tracking-tighter">Tech Specs: A19 Pro Bionic | Carbon-Nano Heat Dissipation</p>
                            </div>
                        </div>
                        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/5 shadow-amber-glow">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                            <div className="flex items-center justify-center h-full">
                                <p className="text-amber-500/20 font-black text-9xl">A19</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 border-t border-white/5 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
                &copy; 2026 Le Bon Coin. All rights reserved. Cinematic Tech Aesthetic.
            </footer>
        </div>
    );
};

export default LeBonCoinMockup;
