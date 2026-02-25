// ============================================================
// Zod Validation Schemas
// Centralized input validation for all forms and API calls
// ============================================================
import { z } from 'zod';

// ---- Customer-facing ----

export const checkoutFormSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    phone: z.string().min(8, 'Numéro de téléphone invalide').max(15, 'Numéro trop long'),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    notes: z.string().max(500, 'Notes trop longues').optional().or(z.literal('')),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export const inquiryFormSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    phone: z.string().min(8, 'Numéro de téléphone invalide'),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
    type: z.enum(['inquiry', 'special_request', 'maintenance']),
    product_id: z.string().uuid().optional().or(z.literal('')),
});

export type InquiryFormData = z.infer<typeof inquiryFormSchema>;

// ---- Admin ----

export const productFormSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    brand: z.string().min(1, 'La marque est requise'),
    type: z.enum(['phone', 'accessory', 'spare_part']).default('phone'),
    category_id: z.string().uuid().optional().nullable(),
    purchase_price: z.number().min(0, 'Le prix doit être positif'),
    selling_price: z.number().min(0, 'Le prix doit être positif'),
    quantity: z.number().int().min(0, 'La quantité doit être positive'),
    low_stock_threshold: z.number().int().min(0).default(5),
    description: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    storage_capacity: z.string().optional().nullable(),
    warranty_months: z.number().int().min(0).optional().nullable(),
    image_url: z.string().url().optional().nullable(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export const categoryFormSchema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    slug: z.string().min(1, 'Le slug est requis').regex(/^[a-z0-9-]+$/, 'Slug invalide (lettres minuscules, chiffres et tirets uniquement)'),
    type: z.enum(['phone', 'accessory', 'spare_part']).default('phone'),
    parent_id: z.string().uuid().optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

export const loginFormSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

// ---- Validator utility ----

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
} {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        const key = issue.path.join('.');
        if (!errors[key]) {
            errors[key] = issue.message;
        }
    });
    return { success: false, errors };
}
