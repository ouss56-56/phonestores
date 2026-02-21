import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Karim B.",
    role: "Entrepreneur",
    avatar: "K",
    rating: 5,
    comment: "Le meilleur magasin de téléphones à Alger. Service excellent, prix compétitifs et des téléphones 100% authentiques. Je recommande vivement Le Bon Coin !",
    product: "iPhone 15 Pro Max",
    accentColor: "#00D9FF",
    verified: true,
  },
  {
    id: 2,
    name: "Amina S.",
    role: "Étudiante",
    avatar: "A",
    rating: 5,
    comment: "J'ai acheté mon Samsung Galaxy S24 ici et je suis très satisfaite. Le personnel est accueillant et m'a bien conseillé. Garantie incluse !",
    product: "Galaxy S24 Ultra",
    accentColor: "#7B68EE",
    verified: true,
  },
  {
    id: 3,
    name: "Youcef M.",
    role: "Ingénieur IT",
    avatar: "Y",
    rating: 5,
    comment: "Qualité exceptionnelle et service après-vente irréprochable. Le Bon Coin est devenu ma référence pour tout achat tech. Merci pour votre professionnalisme.",
    product: "iPhone 15 Pro",
    accentColor: "#FFB800",
    verified: true,
  },
  {
    id: 4,
    name: "Fatima Z.",
    role: "Photographe",
    avatar: "F",
    rating: 5,
    comment: "En tant que photographe professionnelle, j'étais sceptique sur les caméras de téléphones. Le capteur 200MP m'a bluffée. J'utilise ces photos pour mes projets.",
    product: "Galaxy S24 Ultra",
    accentColor: "#00D9FF",
    verified: true,
  },
  {
    id: 5,
    name: "Mohamed R.",
    role: "Cadre Dirigeant",
    avatar: "M",
    rating: 4,
    comment: "Un service client de qualité supérieure. Les facilités de paiement sont très avantageuses. Je recommande Le Bon Coin à tous mes collègues.",
    product: "iPhone 15 Pro Max",
    accentColor: "#FFB800",
    verified: true,
  },
  {
    id: 6,
    name: "Sara L.",
    role: "Designer UX",
    avatar: "S",
    rating: 5,
    comment: "J'apprécie le soin apporté à chaque détail. L'emballage, la présentation, le suivi — tout est parfait. Le Bon Coin est le Apple Store algérien !",
    product: "iPhone 15 Pro",
    accentColor: "#7B68EE",
    verified: true,
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-secondary/5 blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20 mb-4">
            <Star className="w-3 h-3 text-cyber-amber fill-cyber-amber" />
            <span className="text-xs font-mono-tech text-primary tracking-widest uppercase">Avis Clients</span>
          </div>
          <h2 className="font-grotesk font-bold text-display mb-4 gradient-text">
            Aimé par des Milliers
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Avis réels de clients réels. Plus de 12 400 achats vérifiés.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="text-6xl font-orbitron font-bold gradient-text">4.9</div>
            <div className="flex flex-col items-start gap-1">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 fill-cyber-amber text-cyber-amber" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">Basé sur 12 847 avis</div>
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map(({ id, name, role, avatar, rating, comment, product, accentColor, verified }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-6 flex flex-col gap-4 group cursor-default"
            >
              <Quote className="w-6 h-6 opacity-30" style={{ color: accentColor }} />
              <div className="flex gap-1">
                {[1,2,3,4,5].map(j => (
                  <Star
                    key={j}
                    className="w-3.5 h-3.5"
                    style={{ color: j <= rating ? "#FFB800" : "#333" }}
                    fill={j <= rating ? "#FFB800" : "none"}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{comment}"</p>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-tech w-fit"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: accentColor }} />
                {product}
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-border/30">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-background shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)` }}
                >
                  {avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-grotesk font-semibold text-foreground truncate">{name}</span>
                    {verified && (
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#00D9FF" strokeWidth="2" />
                      </svg>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
