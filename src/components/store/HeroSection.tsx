import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Star, Shield, Cpu, Sparkles, Zap } from "lucide-react";
import heroPhone from "@/assets/hero-phone.png";
import { MagneticButton } from "@/components/ui/animations";

const stats = [
  { icon: Cpu, label: "Processeur", value: "A18 Ultra" },
  { icon: Star, label: "Caméra", value: "200MP" },
  { icon: Shield, label: "Garantie", value: "2 Ans" },
];

export default function HeroSection() {
  const [isFocusing, setIsFocusing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
  const rotateX = useTransform(springY, [-300, 300], [12, -12]);
  const rotateY = useTransform(springX, [-300, 300], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); setIsFocusing(false); };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Warm ambient background */}
      <div className={`absolute inset-0 transition-all duration-1000 ${isFocusing ? "blur-[5px] scale-110 grayscale-[0.3]" : ""}`} style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/3 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-8rem)]">
          <div className={`flex flex-col gap-7 order-2 lg:order-1 transition-all duration-700 ${isFocusing ? "opacity-30 blur-sm scale-95" : "opacity-100 blur-0 scale-100"}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/15 w-fit relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-primary/10 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" />
              <span className="text-xs font-heading text-primary/90 tracking-widest uppercase font-bold neon-text-blue">
                Nouvelle Collection 2026
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <h1 className="font-display font-bold leading-[0.95] mb-3" style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)" }}>
                <span className="text-foreground">L'Art du</span><br />
                <span className="gradient-text italic">Mobile Premium</span>
              </h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                <p className="font-heading font-light text-xl lg:text-2xl text-muted-foreground/80 lowercase tracking-widest">
                  Future is here
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-muted-foreground text-base lg:text-lg max-w-lg leading-relaxed"
            >
              Chez <span className="text-primary font-medium">Le Bon Coin</span>, nous sélectionnons les meilleurs
              smartphones et accessoires pour ceux qui apprécient la qualité sans compromis.
            </motion.p>

            {/* Countdown Heat Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-4 border-primary/20 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-shimmer" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 opacity-70">Offre Limitée</div>
                  <div className="flex gap-3 text-2xl font-mono-tech font-bold text-white">
                    <span className="relative">02<span className="text-[10px] absolute -bottom-3 left-0 text-muted-foreground font-light">JOURS</span></span>
                    <span className="text-primary/50">:</span>
                    <span className="relative">14<span className="text-[10px] absolute -bottom-3 left-0 text-muted-foreground font-light">HEURES</span></span>
                    <span className="text-primary/50">:</span>
                    <span className="relative">58<span className="text-[10px] absolute -bottom-3 left-0 text-muted-foreground font-light">MIN</span></span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full border border-primary/30 flex items-center justify-center animate-bounce">
                  <Zap className="w-5 h-5 text-secondary fill-secondary/20" />
                </div>
              </div>
              {/* Heat blur effect */}
              <div className="absolute -inset-4 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse pointer-events-none" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-3 gap-3"
            >
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="glass-card rounded-2xl p-4 text-center group hover:border-primary/30 transition-all duration-400 hover:bg-primary/5">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-2 group-hover:scale-125 transition-transform" />
                  <div className="font-mono-tech text-sm text-primary font-bold">{value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase mt-1 tracking-tighter">{label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-4"
            >
              <div>
                <div className="text-4xl font-display font-bold gradient-text italic">149 990 DA</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                  ou 12 500 DA/mois · 0% intérêt
                </div>
              </div>
              <div className="flex gap-3 sm:ml-4">
                <MagneticButton className="btn-cyber px-8 py-4 rounded-full text-base font-heading font-bold tracking-wide glow-pulse flex items-center gap-2">
                  Découvrir <ArrowRight className="w-5 h-5" />
                </MagneticButton>
                <MagneticButton className="btn-ghost-cyber px-8 py-4 rounded-full text-base font-heading font-medium">
                  Catalogue
                </MagneticButton>
              </div>
            </motion.div>
          </div>

          <div
            ref={containerRef}
            className="flex justify-center items-center order-1 lg:order-2 relative group cursor-crosshair min-h-[500px]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setIsFocusing(true)}
            style={{ perspective: "1500px" }}
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-[400px] h-[400px] rounded-full transition-all duration-1000 ${isFocusing ? "bg-primary/20 blur-[150px] scale-150" : "bg-primary/8 blur-[100px] scale-100"}`} />
            </div>

            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              animate={{
                y: [0, -20, 0],
                rotateZ: isFocusing ? [0, 5, 0] : [0, 0, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative holographic z-20"
            >
              <img
                src={heroPhone}
                alt="Smartphone Premium Le Bon Coin"
                className={`w-72 sm:w-80 lg:w-96 xl:w-[450px] h-auto object-contain select-none transition-all duration-700 ${isFocusing ? "scale-105 drop-shadow-[0_60px_100px_hsla(15,85%,55%,0.5)]" : "drop-shadow-[0_40px_80px_hsla(15,85%,55%,0.3)]"}`}
                draggable={false}
              />
              {/* Dynamic light reflects on the phone */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-[40px] pointer-events-none holographic transition-opacity duration-1000" style={{ opacity: isFocusing ? 0.8 : 0.4 }} />
            </motion.div>

            {/* Info Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className={`absolute top-10 -right-4 lg:-right-10 glass-card rounded-2xl p-4 w-40 z-30 border-primary/20 transition-all duration-500 ${isFocusing ? "translate-x-4 scale-110" : "translate-x-0 scale-100"}`}
            >
              <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Caméra</div>
              <div className="text-2xl font-display font-bold gradient-text italic">200MP</div>
              <div className="text-[10px] text-primary/80 font-mono-tech mt-1">SENSEUR ISOCELL</div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-2">
                <div className="h-full w-full bg-primary/40 rounded-full" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              className={`absolute bottom-20 -left-4 lg:-left-12 glass-card rounded-2xl p-4 w-44 z-30 border-primary/20 transition-all duration-500 ${isFocusing ? "-translate-x-4 scale-110" : "translate-x-0 scale-100"}`}
            >
              <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Puissance</div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: ["0%", "92%", "88%"] }}
                    transition={{ duration: 3, times: [0, 0.8, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <span className="text-[10px] font-mono-tech text-primary font-bold">92%</span>
              </div>
              <div className="text-[10px] text-primary/80 font-mono-tech">A18 ULTRA CHIP</div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-muted-foreground font-mono-tech tracking-widest uppercase">Défiler</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
