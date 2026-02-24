import { useRef, useEffect, lazy, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import MagneticButton from "@/components/ui/MagneticButton";

// Lazy load Spline component for performance
const SplineHero = lazy(() => import("./SplineHero"));

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const splineY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  // Luxury Background intelligence
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      // Extremely subtle shift for luxury feel (#FAFAFA base)
      const start = `hsl(0, 0%, ${98 - x * 1}%)`;
      const end = `hsl(0, 0%, ${97 - y * 1}%)`;

      document.documentElement.style.setProperty('--dynamic-bg-start', start);
      document.documentElement.style.setProperty('--dynamic-bg-end', end);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToCategories = () => {
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAFAFA]"
    >
      {/* Subtle Grid Background */}
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          y: bgY
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen py-20">

          {/* Text Content (Left Side) */}
          <motion.div style={{ y: textY }} className="z-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.04] bg-white/50 backdrop-blur-sm mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-black/80 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-black/40">
                  Fashion Tech / Innovation
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.5rem,7vw,5rem)] font-light leading-[1] tracking-tight text-[#111] mb-8"
            >
              <span className="block opacity-40">The Future of</span>
              <span className="block font-normal">Luxury Mobile.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-[#111]/50 max-w-md mb-12 font-light leading-relaxed"
            >
              Experience the perfect harmony between cutting-edge technology and high-fashion aesthetics. Designed for those who demand excellence in every detail.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-6"
            >
              <MagneticButton>
                <button
                  onClick={scrollToCategories}
                  className="px-10 py-5 bg-black text-white rounded-full text-sm font-medium tracking-wide hover:scale-105 transition-transform duration-500 shadow-2xl shadow-black/10 flex items-center gap-3 group"
                >
                  Explore Collection
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                </button>
              </MagneticButton>

              <button className="text-sm font-medium text-black/40 hover:text-black transition-colors">
                Watch the Film
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex gap-12 mt-20 pt-10 border-t border-black/[0.03]"
            >
              {[
                { value: "01", label: "Craftsmanship" },
                { value: "02", label: "Performance" },
                { value: "03", label: "Exclusive" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xl font-medium text-[#111]">{value}</span>
                  <span className="text-[10px] uppercase tracking-widest text-black/30 mt-1">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* 3D Spline Scene (Right Side) */}
          <motion.div
            style={{ y: splineY }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:h-full flex items-center justify-center -mr-16 lg:-mr-32"
          >
            <Suspense fallback={null}>
              <SplineHero />
            </Suspense>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-10 hidden lg:block"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-black/20 vertical-text rotate-180">Scroll</span>
          <div className="w-[1px] h-12 bg-black/5 relative overflow-hidden">
            <motion.div
              animate={{ y: [-48, 48] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-1/2 bg-black/20"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
