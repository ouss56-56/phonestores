import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Smartphone } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative border-t border-black/[0.04]" style={{ background: "#FAFAFA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center">
                <Smartphone style={{ width: 16, height: 16 }} className="text-white" />
              </div>
              <span className="font-semibold text-base tracking-tight text-[#111]">Phone Store</span>
            </div>
            <p className="text-xs text-[#111]/30 leading-relaxed max-w-[200px] mb-4">
              Votre destination premium pour les smartphones et accessoires de qualité supérieure.
            </p>
            <div className="flex gap-2">
              {/* Social icons as simple circles */}
              {["X", "IG", "LI"].map((label) => (
                <button key={label} className="w-8 h-8 rounded-full border border-black/[0.06] flex items-center justify-center text-[11px] font-medium text-[#111]/30 hover:text-[#111] hover:border-black/[0.12] transition-all duration-200">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: t('footer.products'),
              links: ["Smartphones", "Accessoires", "Écouteurs", "Chargeurs", "Coques"],
            },
            {
              title: t('footer.support'),
              links: ["Suivi Commande", "Retours", "Garantie", "Réparation", "Contact"],
            },
            {
              title: t('footer.company'),
              links: ["À Propos", "Carrières", "Presse", "Conditions", "Confidentialité"],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-medium text-sm text-[#111] mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    {link === "Suivi Commande" ? (
                      <a href="/track-order" className="text-xs text-[#111]/30 hover:text-[#111] transition-colors duration-200">
                        {link}
                      </a>
                    ) : (
                      <a href="#" className="text-xs text-[#111]/30 hover:text-[#111] transition-colors duration-200">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-[#F2F2F2] rounded-2xl p-6 mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mail style={{ width: 14, height: 14 }} className="text-[#111]/40" />
              <span className="font-medium text-sm text-[#111]">{t('footer.newsletter')}</span>
            </div>
            <p className="text-xs text-[#111]/30">{t('footer.newsletterDesc')}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder={t('footer.emailPlaceholder')}
              className="ps-input flex-1 sm:w-60 text-sm py-2.5 px-4"
            />
            <button className="ps-btn-primary py-2.5 px-5 text-sm whitespace-nowrap">
              {t('footer.subscribe')}
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#F2F2F2] rounded-2xl p-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <MapPin style={{ width: 18, height: 18 }} className="text-[#111]/30 shrink-0" />
              <div>
                <div className="text-sm font-medium text-[#111]">{t('footer.address')}</div>
                <div className="text-xs text-[#111]/30">{t('footer.addressValue')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone style={{ width: 18, height: 18 }} className="text-[#111]/30 shrink-0" />
              <div>
                <div className="text-sm font-medium text-[#111]">{t('footer.phone')}</div>
                <div className="text-xs text-[#111]/30">{t('footer.phoneValue')}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail style={{ width: 18, height: 18 }} className="text-[#111]/30 shrink-0" />
              <div>
                <div className="text-sm font-medium text-[#111]">{t('footer.emailLabel')}</div>
                <div className="text-xs text-[#111]/30">{t('footer.emailValue')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-black/[0.04]">
          <p className="text-xs text-[#111]/20">{t('footer.rights')}</p>
          <div className="flex gap-4">
            {[t('footer.terms'), t('footer.privacy'), t('footer.cookies')].map((link) => (
              <a key={link} href="#" className="text-xs text-[#111]/20 hover:text-[#111]/50 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
