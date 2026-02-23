import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import heroPhone from "@/assets/hero-phone.png";
import { useI18n } from "@/lib/i18n";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useI18n();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const scrollToCategories = () => {
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#FAFAFA" }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-32">
          {/* Text Content */}
          <motion.div style={{ y: textY }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 0.9, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.06] bg-white mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#111]" />
                <span className="text-[11px] font-medium tracking-widest uppercase text-[#111]/50">
                  Phone Store
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 0.9, 0.3, 1] }}
              className="text-[clamp(2.5rem,6vw,4.5rem)] font-light leading-[1.05] tracking-tight text-[#111111] mb-6"
            >
              {t('hero.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 0.9, 0.3, 1] }}
              className="text-lg text-[#111]/40 max-w-md mb-10 font-light leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 0.9, 0.3, 1] }}
              className="flex items-center gap-4"
            >
              <button
                onClick={scrollToCategories}
                className="ps-btn-primary flex items-center gap-2"
              >
                {t('hero.cta')}
                <ArrowDown style={{ width: 16, height: 16 }} />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 0.9, 0.3, 1] }}
              className="flex gap-10 mt-14 pt-8 border-t border-black/[0.04]"
            >
              {[
                { value: "500+", label: "Produits" },
                { value: "2 Ans", label: "Garantie" },
                { value: "24/7", label: "Support" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-2xl font-semibold text-[#111] tracking-tight">{value}</span>
                  <span className="text-xs text-[#111]/30 mt-1 font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Image */}
          <motion.div
            style={{ y: imageY }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 0.9, 0.3, 1] }}
              className="relative"
            >
              {/* Background circle */}
              <div className="absolute inset-0 -m-12 rounded-full bg-gradient-to-br from-[#F2F2F2] to-[#E8E8E8] opacity-60" />
              <img
                src={heroPhone}
                alt="Smartphone Premium"
                className="relative z-10 w-full max-w-[380px] mx-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
                loading="eager"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border border-black/[0.08] flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-[#111]/20" />
        </motion.div>
      </motion.div>
    </section>
  );
}
