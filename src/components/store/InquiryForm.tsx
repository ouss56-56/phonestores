import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { storeApi } from "@/services/storeApi";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function InquiryForm() {
    const { t, locale } = useI18n();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        product_id: "",
        type: "inquiry" as "inquiry" | "special_request" | "maintenance",
        message: "",
    });
    const [success, setSuccess] = useState(false);
    const [honeypot, setHoneypot] = useState(""); // anti-spam

    // Rate limiting
    const submissionTimes = useRef<number[]>([]);

    const { data: products = [] } = useQuery({
        queryKey: ['products', 'inquiry-dropdown'],
        queryFn: () => storeApi.fetchProducts({ limit: 200 }),
        staleTime: 60_000,
    });

    const mutation = useMutation({
        mutationFn: () =>
            storeApi.submitCustomerRequest({
                ...formData,
                lang: locale,
                ref: window.location.pathname,
            }),
        onSuccess: () => {
            setSuccess(true);
            toast.success(t('inquiry.success'));
            setFormData({ name: "", phone: "", email: "", product_id: "", type: "inquiry", message: "" });
            setTimeout(() => setSuccess(false), 5000);
        },
        onError: () => {
            toast.error(t('inquiry.error'));
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot check
        if (honeypot) return;

        // Rate limit: max 3 submissions per 5 minutes
        const now = Date.now();
        submissionTimes.current = submissionTimes.current.filter(t => now - t < 300_000);
        if (submissionTimes.current.length >= 3) {
            toast.warning(t('inquiry.rateLimit'));
            return;
        }
        submissionTimes.current.push(now);

        mutation.mutate();
    };

    const inputClass =
        "ps-input bg-white";

    return (
        <section id="inquiry" className="relative py-24" style={{ background: "#FAFAFA" }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 0.9, 0.3, 1] }}
                    className="text-center mb-12"
                >
                    <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-light tracking-tight text-[#111] mb-3">
                        {t('inquiry.title')}
                    </h2>
                    <p className="text-[#111]/35 text-base font-light">
                        {t('inquiry.subtitle')}
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 0.9, 0.3, 1] }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Honeypot - hidden from real users */}
                    <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
                        <input
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#111]/50 mb-2">{t('inquiry.name')} *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className={inputClass}
                            placeholder={t('inquiry.name')}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-[#111]/50 mb-2">{t('inquiry.phone')} *</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className={inputClass}
                            placeholder="+213..."
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[#111]/50 mb-2">{t('inquiry.email')}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className={inputClass}
                            placeholder="email@exemple.com"
                        />
                    </div>

                    {/* Product Selection */}
                    <div>
                        <label className="block text-sm font-medium text-[#111]/50 mb-2">{t('inquiry.product')}</label>
                        <select
                            value={formData.product_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                            className={inputClass}
                            style={{ appearance: "none" }}
                        >
                            <option value="">{t('inquiry.product')}</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>
                            ))}
                        </select>
                    </div>

                    {/* Request Type */}
                    <div>
                        <label className="block text-sm font-medium text-[#111]/50 mb-2">{t('inquiry.type')}</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                            className={inputClass}
                            style={{ appearance: "none" }}
                        >
                            <option value="inquiry">{t('inquiry.type.inquiry')}</option>
                            <option value="special_request">{t('inquiry.type.special')}</option>
                            <option value="maintenance">{t('inquiry.type.maintenance')}</option>
                        </select>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-[#111]/50 mb-2">{t('inquiry.message')} *</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            className={`${inputClass} resize-none`}
                            placeholder={t('inquiry.message')}
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="ps-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {mutation.isPending ? (
                                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                            ) : success ? (
                                <CheckCircle style={{ width: 16, height: 16 }} />
                            ) : (
                                <Send style={{ width: 16, height: 16 }} />
                            )}
                            {t('inquiry.submit')}
                        </button>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200"
                        >
                            <CheckCircle style={{ width: 18, height: 18 }} className="text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-700 font-medium">{t('inquiry.success')}</p>
                        </motion.div>
                    )}
                </motion.form>
            </div>
        </section>
    );
}
