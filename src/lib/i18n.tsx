import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type Locale = 'fr' | 'ar';
type Dir = 'ltr' | 'rtl';

const translations: Record<Locale, Record<string, string>> = {
    fr: {
        // Nav
        'nav.home': 'Accueil',
        'nav.products': 'Produits',
        'nav.categories': 'Catégories',
        'nav.contact': 'Contact',
        'nav.search': 'Rechercher un produit...',
        'nav.cart': 'Panier',
        'nav.wishlist': 'Favoris',
        'nav.admin': 'Administration',
        'nav.shop': 'Boutique',

        // Hero
        'hero.title': 'L\'excellence mobile',
        'hero.subtitle': 'Découvrez notre sélection exclusive de smartphones et accessoires premium',
        'hero.cta': 'Découvrir',

        // Categories
        'categories.title': 'Nos Catégories',
        'categories.subtitle': 'Explorez notre univers',
        'categories.browse': 'Explorer',
        'categories.products': 'produits',

        // Featured
        'featured.title': 'Collection en vedette',
        'featured.subtitle': 'Sélection exclusive de nos meilleurs produits',
        'featured.quickView': 'Aperçu rapide',
        'featured.addToCart': 'Ajouter',
        'featured.lowStock': 'Plus que {count} en stock',
        'featured.popular': 'Très demandé',
        'featured.outOfStock': 'Rupture de stock',

        // Product Highlight
        'highlight.title': 'Produit en vedette',
        'highlight.selectColor': 'Choisir une couleur',
        'highlight.addToCart': 'Ajouter au panier',
        'highlight.specs': 'Caractéristiques',

        // Inquiry Form
        'inquiry.title': 'Besoin d\'aide ?',
        'inquiry.subtitle': 'Envoyez-nous votre demande et nous vous répondrons rapidement',
        'inquiry.name': 'Nom complet',
        'inquiry.phone': 'Téléphone',
        'inquiry.email': 'Email (optionnel)',
        'inquiry.product': 'Sélectionner un produit',
        'inquiry.type': 'Type de demande',
        'inquiry.type.inquiry': 'Renseignement',
        'inquiry.type.special': 'Demande spéciale',
        'inquiry.type.maintenance': 'Maintenance',
        'inquiry.message': 'Votre message',
        'inquiry.submit': 'Envoyer la demande',
        'inquiry.success': 'Votre demande a été envoyée avec succès !',
        'inquiry.error': 'Une erreur est survenue. Veuillez réessayer.',
        'inquiry.rateLimit': 'Veuillez patienter avant d\'envoyer une nouvelle demande.',

        // Cart
        'cart.title': 'Panier',
        'cart.empty': 'Votre panier est vide',
        'cart.emptyDesc': 'Ajoutez des produits pour commencer',
        'cart.total': 'Total',
        'cart.checkout': 'Passer la commande',
        'cart.clear': 'Vider le panier',
        'cart.currency': 'DA',

        // Wishlist
        'wishlist.title': 'Mes Favoris',
        'wishlist.empty': 'Aucun favori pour le moment',
        'wishlist.emptyDesc': 'Explorez nos produits et ajoutez vos coups de cœur',
        'wishlist.browse': 'Parcourir les produits',

        // Quick View
        'quickView.addToCart': 'Ajouter au panier',
        'quickView.close': 'Fermer',

        // Footer
        'footer.products': 'Produits',
        'footer.support': 'Support',
        'footer.company': 'Entreprise',
        'footer.newsletter': 'Restez informé',
        'footer.newsletterDesc': 'Offres exclusives et accès anticipé aux nouveautés.',
        'footer.subscribe': 'S\'abonner',
        'footer.emailPlaceholder': 'votre@email.com',
        'footer.address': 'Adresse',
        'footer.addressValue': 'Centre Commercial, Alger, Algérie',
        'footer.phone': 'Téléphone',
        'footer.phoneValue': '+213 555 123 456',
        'footer.emailLabel': 'Email',
        'footer.emailValue': 'contact@phonestore.dz',
        'footer.rights': '© 2026 Phone Store. Tous droits réservés.',
        'footer.terms': 'Conditions',
        'footer.privacy': 'Confidentialité',
        'footer.cookies': 'Cookies',

        // General
        'general.loading': 'Chargement...',
        'general.error': 'Erreur',
        'general.retry': 'Réessayer',
    },
    ar: {
        // Nav
        'nav.home': 'الرئيسية',
        'nav.products': 'المنتجات',
        'nav.categories': 'الفئات',
        'nav.contact': 'اتصل بنا',
        'nav.search': 'ابحث عن منتج...',
        'nav.cart': 'سلة التسوق',
        'nav.wishlist': 'المفضلة',
        'nav.admin': 'الإدارة',
        'nav.shop': 'المتجر',

        // Hero
        'hero.title': 'التميز في عالم الهواتف',
        'hero.subtitle': 'اكتشف مجموعتنا الحصرية من الهواتف الذكية والإكسسوارات الفاخرة',
        'hero.cta': 'اكتشف',

        // Categories
        'categories.title': 'فئاتنا',
        'categories.subtitle': 'استكشف عالمنا',
        'categories.browse': 'استكشف',
        'categories.products': 'منتجات',

        // Featured
        'featured.title': 'المجموعة المميزة',
        'featured.subtitle': 'اختيار حصري لأفضل منتجاتنا',
        'featured.quickView': 'عرض سريع',
        'featured.addToCart': 'إضافة',
        'featured.lowStock': 'متبقي {count} فقط',
        'featured.popular': 'مطلوب بشدة',
        'featured.outOfStock': 'نفذ المخزون',

        // Product Highlight
        'highlight.title': 'المنتج المميز',
        'highlight.selectColor': 'اختر لوناً',
        'highlight.addToCart': 'أضف إلى السلة',
        'highlight.specs': 'المواصفات',

        // Inquiry Form
        'inquiry.title': 'تحتاج مساعدة؟',
        'inquiry.subtitle': 'أرسل لنا طلبك وسنرد عليك بسرعة',
        'inquiry.name': 'الاسم الكامل',
        'inquiry.phone': 'الهاتف',
        'inquiry.email': 'البريد الإلكتروني (اختياري)',
        'inquiry.product': 'اختر منتجاً',
        'inquiry.type': 'نوع الطلب',
        'inquiry.type.inquiry': 'استفسار',
        'inquiry.type.special': 'طلب خاص',
        'inquiry.type.maintenance': 'صيانة',
        'inquiry.message': 'رسالتك',
        'inquiry.submit': 'إرسال الطلب',
        'inquiry.success': 'تم إرسال طلبك بنجاح!',
        'inquiry.error': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        'inquiry.rateLimit': 'يرجى الانتظار قبل إرسال طلب جديد.',

        // Cart
        'cart.title': 'سلة التسوق',
        'cart.empty': 'سلتك فارغة',
        'cart.emptyDesc': 'أضف منتجات لتبدأ',
        'cart.total': 'المجموع',
        'cart.checkout': 'إتمام الطلب',
        'cart.clear': 'إفراغ السلة',
        'cart.currency': 'د.ج',

        // Wishlist
        'wishlist.title': 'المفضلة',
        'wishlist.empty': 'لا توجد مفضلات حالياً',
        'wishlist.emptyDesc': 'استكشف منتجاتنا وأضف ما يعجبك',
        'wishlist.browse': 'تصفح المنتجات',

        // Quick View
        'quickView.addToCart': 'أضف إلى السلة',
        'quickView.close': 'إغلاق',

        // Footer
        'footer.products': 'المنتجات',
        'footer.support': 'الدعم',
        'footer.company': 'الشركة',
        'footer.newsletter': 'ابق على اطلاع',
        'footer.newsletterDesc': 'عروض حصرية ووصول مبكر للمنتجات الجديدة.',
        'footer.subscribe': 'اشترك',
        'footer.emailPlaceholder': 'بريدك@الإلكتروني.com',
        'footer.address': 'العنوان',
        'footer.addressValue': 'المركز التجاري، الجزائر',
        'footer.phone': 'الهاتف',
        'footer.phoneValue': '+213 555 123 456',
        'footer.emailLabel': 'البريد',
        'footer.emailValue': 'contact@phonestore.dz',
        'footer.rights': '© 2026 Phone Store. جميع الحقوق محفوظة.',
        'footer.terms': 'الشروط',
        'footer.privacy': 'الخصوصية',
        'footer.cookies': 'ملفات تعريف الارتباط',

        // General
        'general.loading': 'جار التحميل...',
        'general.error': 'خطأ',
        'general.retry': 'إعادة المحاولة',
    },
};

interface I18nContextType {
    locale: Locale;
    dir: Dir;
    t: (key: string, vars?: Record<string, string | number>) => string;
    setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
    locale: 'fr',
    dir: 'ltr',
    t: (key) => key,
    setLocale: () => { },
});

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(() => {
        const saved = localStorage.getItem('ps-locale');
        return (saved === 'ar' ? 'ar' : 'fr') as Locale;
    });

    const dir: Dir = locale === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        localStorage.setItem('ps-locale', locale);
        document.documentElement.lang = locale;
        document.documentElement.dir = dir;
        if (locale === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }, [locale, dir]);

    const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
        let text = translations[locale]?.[key] || translations.fr[key] || key;
        if (vars) {
            Object.entries(vars).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }
        return text;
    }, [locale]);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
    }, []);

    return (
        <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

export const useI18n = () => useContext(I18nContext);
