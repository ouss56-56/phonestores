import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if admin already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const adminExists = existingUsers?.users?.some(u => u.email === "admin@gmail.com");

    if (adminExists) {
      return new Response(JSON.stringify({ message: "Admin already exists" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: "admin@gmail.com",
      password: "00000000",
      email_confirm: true,
      user_metadata: { display_name: "Admin Le Bon Coin" },
    });

    if (createError) throw createError;

    // Assign admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: newUser.user.id, role: "admin" });

    if (roleError) throw roleError;

    // Seed categories
    const categories = [
      { name: "Smartphones", slug: "smartphones", type: "phone" },
      { name: "Coques & Étuis", slug: "coques-etuis", type: "accessory" },
      { name: "Chargeurs & Câbles", slug: "chargeurs-cables", type: "accessory" },
      { name: "Écouteurs & Audio", slug: "ecouteurs-audio", type: "accessory" },
      { name: "Protections Écran", slug: "protections-ecran", type: "accessory" },
      { name: "Batteries Externes", slug: "batteries-externes", type: "accessory" },
      { name: "Pièces Détachées", slug: "pieces-detachees", type: "spare_part" },
    ];

    const { data: cats } = await supabase.from("categories").upsert(categories, { onConflict: "slug" }).select();
    const catMap: Record<string, string> = {};
    cats?.forEach(c => { catMap[c.slug] = c.id; });

    // Seed products
    const products = [
      {
        name: "iPhone 15 Pro Max",
        brand: "Apple",
        category_id: catMap["smartphones"],
        type: "phone",
        description: "Le smartphone ultime d'Apple avec puce A17 Pro, caméra 48MP et design en titane.",
        purchase_price: 120000,
        selling_price: 149990,
        quantity: 12,
        color: "Titane Naturel",
        storage_capacity: "256GB",
        warranty_months: 12,
        is_featured: true,
        image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600",
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        category_id: catMap["smartphones"],
        type: "phone",
        description: "Galaxy AI intégré, S Pen, caméra 200MP et écran Dynamic AMOLED 2X.",
        purchase_price: 110000,
        selling_price: 139990,
        quantity: 28,
        color: "Phantom Black",
        storage_capacity: "512GB",
        warranty_months: 12,
        is_featured: true,
        image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600",
      },
      {
        name: "iPhone 15 Pro",
        brand: "Apple",
        category_id: catMap["smartphones"],
        type: "phone",
        description: "Puce A17 Pro, titane, caméra 48MP avec Action Button.",
        purchase_price: 100000,
        selling_price: 129990,
        quantity: 5,
        color: "Or",
        storage_capacity: "128GB",
        warranty_months: 12,
        is_featured: true,
        image_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600",
      },
      {
        name: "Samsung Galaxy A54",
        brand: "Samsung",
        category_id: catMap["smartphones"],
        type: "phone",
        description: "Le meilleur rapport qualité-prix avec écran Super AMOLED et IP67.",
        purchase_price: 35000,
        selling_price: 49990,
        quantity: 45,
        color: "Awesome Violet",
        storage_capacity: "128GB",
        warranty_months: 12,
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
      },
      {
        name: "Xiaomi 14 Ultra",
        brand: "Xiaomi",
        category_id: catMap["smartphones"],
        type: "phone",
        description: "Caméra Leica, Snapdragon 8 Gen 3, charge 90W.",
        purchase_price: 85000,
        selling_price: 109990,
        quantity: 15,
        color: "Noir",
        storage_capacity: "256GB",
        warranty_months: 12,
        is_featured: true,
        image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
      },
      // Accessories
      {
        name: "Coque MagSafe iPhone 15 Pro Max",
        brand: "Apple",
        category_id: catMap["coques-etuis"],
        type: "accessory",
        description: "Protection premium en silicone avec aimants MagSafe intégrés.",
        purchase_price: 800,
        selling_price: 2500,
        quantity: 120,
        compatible_models: ["iPhone 15 Pro Max", "iPhone 15 Pro"],
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600",
      },
      {
        name: "Étui Cuir Galaxy S24 Ultra",
        brand: "Samsung",
        category_id: catMap["coques-etuis"],
        type: "accessory",
        description: "Étui en cuir véritable avec rangement carte.",
        purchase_price: 600,
        selling_price: 1800,
        quantity: 85,
        compatible_models: ["Samsung Galaxy S24 Ultra"],
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1603313011781-9e5e5a49e762?w=600",
      },
      {
        name: "Chargeur USB-C 65W GaN",
        brand: "Anker",
        category_id: catMap["chargeurs-cables"],
        type: "accessory",
        description: "Chargeur rapide GaN compact, compatible tous smartphones.",
        purchase_price: 1200,
        selling_price: 3500,
        quantity: 200,
        compatible_models: ["iPhone 15 Pro Max", "iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Xiaomi 14 Ultra"],
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600",
      },
      {
        name: "Câble USB-C vers Lightning 2m",
        brand: "Baseus",
        category_id: catMap["chargeurs-cables"],
        type: "accessory",
        description: "Câble tressé haute qualité, charge rapide 27W.",
        purchase_price: 300,
        selling_price: 900,
        quantity: 300,
        compatible_models: ["iPhone 15 Pro Max", "iPhone 15 Pro"],
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600",
      },
      {
        name: "AirPods Pro 2",
        brand: "Apple",
        category_id: catMap["ecouteurs-audio"],
        type: "accessory",
        description: "Réduction de bruit active, audio spatial personnalisé, USB-C.",
        purchase_price: 18000,
        selling_price: 29990,
        quantity: 35,
        compatible_models: ["iPhone 15 Pro Max", "iPhone 15 Pro"],
        is_featured: true,
        image_url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600",
      },
      {
        name: "Samsung Galaxy Buds3 Pro",
        brand: "Samsung",
        category_id: catMap["ecouteurs-audio"],
        type: "accessory",
        description: "ANC intelligent, codec SSC Hi-Fi, autonomie 30h.",
        purchase_price: 12000,
        selling_price: 19990,
        quantity: 40,
        compatible_models: ["Samsung Galaxy S24 Ultra", "Samsung Galaxy A54"],
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600",
      },
      {
        name: "Verre Trempé iPhone 15 Pro Max",
        brand: "Spigen",
        category_id: catMap["protections-ecran"],
        type: "accessory",
        description: "Protection 9H, anti-traces, installation facile.",
        purchase_price: 200,
        selling_price: 800,
        quantity: 250,
        compatible_models: ["iPhone 15 Pro Max"],
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1530319067432-f2a729c03db5?w=600",
      },
      {
        name: "PowerBank 20000mAh",
        brand: "Anker",
        category_id: catMap["batteries-externes"],
        type: "accessory",
        description: "Charge rapide 65W, USB-C PD, écran LED.",
        purchase_price: 3000,
        selling_price: 6500,
        quantity: 60,
        compatible_models: ["iPhone 15 Pro Max", "iPhone 15 Pro", "Samsung Galaxy S24 Ultra", "Xiaomi 14 Ultra"],
        is_featured: false,
        image_url: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600",
      },
    ];

    const { error: prodError } = await supabase.from("products").insert(products);
    if (prodError) console.error("Products seed error:", prodError);

    return new Response(JSON.stringify({ success: true, message: "Admin and seed data created" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Setup error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
