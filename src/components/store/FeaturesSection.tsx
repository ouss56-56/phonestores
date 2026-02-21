import { motion } from "framer-motion";
import { Brain, Shield, Zap, Camera, Wifi, Battery, Smartphone } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Intelligence IA",
    description: "L'IA embarquée traite 40 billions d'opérations par seconde pour l'amélioration photo en temps réel et les actions prédictives.",
    accent: "hsl(191 100% 50%)",
    accentBg: "hsla(191,100%,50%,0.1)",
    delay: 0,
  },
  {
    icon: Camera,
    title: "Système Caméra Pro",
    description: "Résolution 200MP avec photographie computationnelle, zoom spatial 30x et enregistrement vidéo 8K à 120fps.",
    accent: "hsl(252 79% 68%)",
    accentBg: "hsla(252,79%,68%,0.1)",
    delay: 0.1,
  },
  {
    icon: Shield,
    title: "Sécurité Militaire",
    description: "Coffre-fort biométrique avec reconnaissance faciale 3D, empreinte ultrasonique et module de sécurité matériel.",
    accent: "hsl(157 100% 50%)",
    accentBg: "hsla(157,100%,50%,0.1)",
    delay: 0.2,
  },
  {
    icon: Battery,
    title: "Endurance Toute la Journée",
    description: "Batterie 5000mAh silicium-carbone avec charge 100W filaire et 50W sans fil. De 0 à 50% en 12 minutes.",
    accent: "hsl(43 100% 50%)",
    accentBg: "hsla(43,100%,50%,0.1)",
    delay: 0.3,
  },
  {
    icon: Wifi,
    title: "Wi-Fi 7 & 5G Ultra",
    description: "Connectivité nouvelle génération avec 46Gbps théoriques, latence ultra-faible et gestion multi-bande.",
    accent: "hsl(191 100% 50%)",
    accentBg: "hsla(191,100%,50%,0.1)",
    delay: 0.4,
  },
  {
    icon: Smartphone,
    title: "Écran ProMotion",
    description: "AMOLED LTPO 6.7\" avec rafraîchissement adaptatif 1-120Hz, luminosité 2800 nits et Always-On.",
    accent: "hsl(252 79% 68%)",
    accentBg: "hsla(252,79%,68%,0.1)",
    delay: 0.5,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-secondary/20 mb-4">
            <Zap className="w-3 h-3 text-secondary" />
            <span className="text-xs font-mono-tech text-secondary tracking-widest uppercase">Caractéristiques</span>
          </div>
          <h2 className="font-grotesk font-bold text-display mb-4">
            <span className="gradient-text">Conçu</span> pour l'Excellence
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Chaque composant, chaque pixel, chaque algorithme — fabriqué avec une précision obsessionnelle.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, accent, accentBg, delay }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className="glass-card rounded-2xl p-6 group cursor-default transition-all duration-400 hover:shadow-hover"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ background: accentBg }}
              >
                <Icon className="w-6 h-6 transition-all duration-300" style={{ color: accent }} />
              </div>
              <h3 className="font-grotesk font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              <div
                className="mt-4 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 glass-card rounded-3xl p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "40T", label: "Ops IA/Seconde", sub: "Neural Engine" },
              { value: "200MP", label: "Résolution", sub: "Quad Camera" },
              { value: "6H", label: "Écran Allumé", sub: "Moyenne Quotidienne" },
              { value: "IP68", label: "Étanchéité", sub: "6m / 30min" },
            ].map(({ value, label, sub }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="text-3xl font-orbitron font-bold gradient-text mb-1">{value}</div>
                <div className="text-sm font-medium text-foreground">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
