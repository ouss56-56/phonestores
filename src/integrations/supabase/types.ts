export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      imei_records: {
        Row: {
          added_at: string
          batch_number: string | null
          id: string
          imei: string
          product_id: string
          sold_at: string | null
          status: string
        }
        Insert: {
          added_at?: string
          batch_number?: string | null
          id?: string
          imei: string
          product_id: string
          sold_at?: string | null
          status?: string
        }
        Update: {
          added_at?: string
          batch_number?: string | null
          id?: string
          imei?: string
          product_id?: string
          sold_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "imei_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_snapshots: {
        Row: {
          created_at: string
          distribution: Json | null
          id: string
          total_capital: number
          total_items: number
        }
        Insert: {
          created_at?: string
          distribution?: Json | null
          id?: string
          total_capital?: number
          total_items?: number
        }
        Update: {
          created_at?: string
          distribution?: Json | null
          id?: string
          total_capital?: number
          total_items?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          imei_id: string | null
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          imei_id?: string | null
          order_id: string
          product_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          imei_id?: string | null
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_imei_id_fkey"
            columns: ["imei_id"]
            isOneToOne: false
            referencedRelation: "imei_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount_amount: number | null
          id: string
          is_pos_sale: boolean | null
          notes: string | null
          order_number: string
          payment_method: string | null
          pos_reference: string | null
          return_reason: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount_amount?: number | null
          id?: string
          is_pos_sale?: boolean | null
          notes?: string | null
          order_number: string
          payment_method?: string | null
          pos_reference?: string | null
          return_reason?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount_amount?: number | null
          id?: string
          is_pos_sale?: boolean | null
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          pos_reference?: string | null
          return_reason?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          added_at: string
          average_cost: number | null
          avg_daily_sales: number | null
          barcode: string | null
          brand: string
          category_id: string | null
          color: string | null
          compatible_models: string[] | null
          days_to_depletion: number | null
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          imei_required: boolean | null
          is_active: boolean | null
          is_featured: boolean | null
          low_stock_threshold: number
          name: string
          purchase_price: number
          quantity: number
          reorder_threshold: number | null
          selling_price: number
          sku: string | null
          storage_capacity: string | null
          supplier: string | null
          type: string
          updated_at: string
          variants: Json | null
          warranty_months: number | null
        }
        Insert: {
          added_at?: string
          average_cost?: number | null
          avg_daily_sales?: number | null
          barcode?: string | null
          brand: string
          category_id?: string | null
          color?: string | null
          compatible_models?: string[] | null
          days_to_depletion?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          imei_required?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          low_stock_threshold?: number
          name: string
          purchase_price?: number
          quantity?: number
          reorder_threshold?: number | null
          selling_price?: number
          sku?: string | null
          storage_capacity?: string | null
          supplier?: string | null
          type?: string
          updated_at?: string
          variants?: Json | null
          warranty_months?: number | null
        }
        Update: {
          added_at?: string
          average_cost?: number | null
          avg_daily_sales?: number | null
          barcode?: string | null
          brand?: string
          category_id?: string | null
          color?: string | null
          compatible_models?: string[] | null
          days_to_depletion?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          imei_required?: boolean | null
          is_active?: boolean | null
          is_featured?: boolean | null
          low_stock_threshold?: number
          name?: string
          purchase_price?: number
          quantity?: number
          reorder_threshold?: number | null
          selling_price?: number
          sku?: string | null
          storage_capacity?: string | null
          supplier?: string | null
          type?: string
          updated_at?: string
          variants?: Json | null
          warranty_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repairs: {
        Row: {
          cost_actual: number | null
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          device_brand: string
          device_model: string
          device_type: string
          estimated_cost: number | null
          final_cost: number | null
          id: string
          imei: string | null
          issue_description: string
          parts_used: Json | null
          signature_url: string | null
          status: string
          technician_notes: string | null
          tracking_id: string | null
          updated_at: string
        }
        Insert: {
          cost_actual?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          device_brand: string
          device_model: string
          device_type: string
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          imei?: string | null
          issue_description: string
          parts_used?: Json | null
          signature_url?: string | null
          status?: string
          technician_notes?: string | null
          tracking_id?: string | null
          updated_at?: string
        }
        Update: {
          cost_actual?: number | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          device_brand?: string
          device_model?: string
          device_type?: string
          estimated_cost?: number | null
          final_cost?: number | null
          id?: string
          imei?: string | null
          issue_description?: string
          parts_used?: Json | null
          signature_url?: string | null
          status?: string
          technician_notes?: string | null
          tracking_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "repairs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          change: number
          created_at: string
          id: string
          note: string | null
          product_id: string
          reference_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          change: number
          created_at?: string
          id?: string
          note?: string | null
          product_id: string
          reference_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          change?: number
          created_at?: string
          id?: string
          note?: string | null
          product_id?: string
          reference_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          created_at: string
          expected_delivery: string | null
          id: string
          notes: string | null
          po_number: string
          received_at: string | null
          status: string
          supplier_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number: string
          received_at?: string | null
          status?: string
          supplier_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          received_at?: string | null
          status?: string
          supplier_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          po_id: string
          product_id: string
          quantity: number
          received_quantity: number | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          po_id: string
          product_id: string
          quantity?: number
          received_quantity?: number | null
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          po_id?: string
          product_id?: string
          quantity?: number
          received_quantity?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          loyalty_points: number
          name: string
          notes: string | null
          phone: string | null
          segment: string
          total_spent: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name: string
          notes?: string | null
          phone?: string | null
          segment?: string
          total_spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          loyalty_points?: number
          name?: string
          notes?: string | null
          phone?: string | null
          segment?: string
          total_spent?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      finances: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          confidence: number | null
          created_at: string
          feature: string
          id: string
          input_hash: string | null
          input_snapshot: Json | null
          output_summary: string | null
          tokens_used: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          feature: string
          id?: string
          input_hash?: string | null
          input_snapshot?: Json | null
          output_summary?: string | null
          tokens_used?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          feature?: string
          id?: string
          input_hash?: string | null
          input_snapshot?: Json | null
          output_summary?: string | null
          tokens_used?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          coupon_code: string | null
          created_at: string
          current_uses: number | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase: number | null
          name: string
          starts_at: string
          type: string
          updated_at: string
          value: number
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          coupon_code?: string | null
          created_at?: string
          current_uses?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase?: number | null
          name: string
          starts_at?: string
          type: string
          updated_at?: string
          value?: number
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          coupon_code?: string | null
          created_at?: string
          current_uses?: number | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase?: number | null
          name?: string
          starts_at?: string
          type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      order_status_logs: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          note: string | null
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          note?: string | null
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          note?: string | null
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
