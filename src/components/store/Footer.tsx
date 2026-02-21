import { motion } from "framer-motion";
import { ArrowRight, Mail, Twitter, Instagram, Linkedin, Smartphone, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-border/30 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30" />

      <div className="relative border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono-tech text-primary tracking-widest uppercase">Offre Limitée</span>
            </div>
            <h2 className="font-grotesk font-bold text-display gradient-text mb-4">
              Prêt à Découvrir<br />le Futur ?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Commandez aujourd'hui et bénéficiez de la livraison gratuite, garantie 2 ans, et une coque premium offerte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-cyber px-8 py-4 rounded-full text-base font-grotesk font-semibold tracking-wide glow-pulse flex items-center gap-2 justify-center">
                Acheter Maintenant <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-ghost-cyber px-8 py-4 rounded-full text-base font-grotesk font-semibold tracking-wide">
                Nous Contacter
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-background" />
              </div>
              <span className="font-orbitron font-bold text-lg tracking-wider gradient-text">LE BON COIN</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mb-4">
              Votre destination premium pour les smartphones et accessoires de qualité supérieure.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-200">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {[
            { title: "Produits", links: ["iPhone 15 Pro Max", "Samsung Galaxy S24", "Accessoires", "Coques", "Chargeurs"] },
            { title: "Support", links: ["Suivi Commande", "Retours", "Garantie", "Réparation", "Contact"] },
            { title: "Entreprise", links: ["À Propos", "Carrières", "Presse", "Conditions", "Confidentialité"] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-grotesk font-semibold text-sm text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6 mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4 text-primary" />
              <span className="font-grotesk font-semibold text-sm">Restez Informé</span>
            </div>
            <p className="text-xs text-muted-foreground">Offres exclusives et accès anticipé aux nouveautés.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 sm:w-64 bg-muted border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
            />
            <button className="btn-cyber px-5 py-2.5 rounded-full text-sm font-grotesk font-semibold whitespace-nowrap">
              S'abonner
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-grotesk font-semibold text-foreground">Adresse</div>
                <div className="text-xs text-muted-foreground">Centre Commercial, Alger, Algérie</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-grotesk font-semibold text-foreground">Téléphone</div>
                <div className="text-xs text-muted-foreground">+213 555 123 456</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div>
                <div className="text-sm font-grotesk font-semibold text-foreground">Email</div>
                <div className="text-xs text-muted-foreground">contact@leboncoin-phones.dz</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground">
            © 2026 Le Bon Coin. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            {["Conditions", "Confidentialité", "Cookies"].map(link => (
              <a key={link} href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
