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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      booking_pickup_codes: {
        Row: {
          booking_id: string
          code: string
          created_at: string
        }
        Insert: {
          booking_id: string
          code: string
          created_at?: string
        }
        Update: {
          booking_id?: string
          code?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_pickup_codes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          age_group: string
          center_id: string
          child_name: string
          created_at: string
          end_date: string
          id: string
          notes: string
          parent_id: string
          plan: string
          quantity: number
          start_date: string
          start_time: string
          status: string
          total_price: number
        }
        Insert: {
          age_group: string
          center_id: string
          child_name: string
          created_at?: string
          end_date?: string
          id?: string
          notes?: string
          parent_id: string
          plan: string
          quantity?: number
          start_date: string
          start_time?: string
          status?: string
          total_price?: number
        }
        Update: {
          age_group?: string
          center_id?: string
          child_name?: string
          created_at?: string
          end_date?: string
          id?: string
          notes?: string
          parent_id?: string
          plan?: string
          quantity?: number
          start_date?: string
          start_time?: string
          status?: string
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          bio: string
          center_id: string
          created_at: string
          experience_years: number
          id: string
          name: string
          role: string
          verified: boolean
        }
        Insert: {
          bio?: string
          center_id: string
          created_at?: string
          experience_years?: number
          id?: string
          name: string
          role?: string
          verified?: boolean
        }
        Update: {
          bio?: string
          center_id?: string
          created_at?: string
          experience_years?: number
          id?: string
          name?: string
          role?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "caregivers_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          address: string
          age_groups: string[]
          capacity: number
          certifications: string[]
          city: string
          created_at: string
          daily_price: number
          description: string
          hourly_price: number
          id: string
          image_key: string
          is_24x7: boolean
          monthly_price: number
          name: string
          owner_id: string | null
          rating: number
          safety_measures: string[]
          status: string
          timings: string[]
        }
        Insert: {
          address?: string
          age_groups?: string[]
          capacity?: number
          certifications?: string[]
          city: string
          created_at?: string
          daily_price?: number
          description?: string
          hourly_price?: number
          id?: string
          image_key?: string
          is_24x7?: boolean
          monthly_price?: number
          name: string
          owner_id?: string | null
          rating?: number
          safety_measures?: string[]
          status?: string
          timings?: string[]
        }
        Update: {
          address?: string
          age_groups?: string[]
          capacity?: number
          certifications?: string[]
          city?: string
          created_at?: string
          daily_price?: number
          description?: string
          hourly_price?: number
          id?: string
          image_key?: string
          is_24x7?: boolean
          monthly_price?: number
          name?: string
          owner_id?: string | null
          rating?: number
          safety_measures?: string[]
          status?: string
          timings?: string[]
        }
        Relationships: []
      }
      children: {
        Row: {
          age_group: string
          created_at: string
          date_of_birth: string | null
          id: string
          name: string
          notes: string
          parent_id: string
        }
        Insert: {
          age_group?: string
          created_at?: string
          date_of_birth?: string | null
          id?: string
          name: string
          notes?: string
          parent_id: string
        }
        Update: {
          age_group?: string
          created_at?: string
          date_of_birth?: string | null
          id?: string
          name?: string
          notes?: string
          parent_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          center_id: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          center_id: string
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          center_id?: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          booking_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          booking_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          center_id: string
          comment: string
          created_at: string
          id: string
          parent_id: string
          rating: number
          reviewer_name: string
        }
        Insert: {
          center_id: string
          comment?: string
          created_at?: string
          id?: string
          parent_id: string
          rating: number
          reviewer_name?: string
        }
        Update: {
          center_id?: string
          comment?: string
          created_at?: string
          id?: string
          parent_id?: string
          rating?: number
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
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
      is_booking_party: {
        Args: { _booking_id: string; _user_id: string }
        Returns: boolean
      }
      verify_pickup_code: {
        Args: { _booking_id: string; _code: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "provider" | "parent"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "provider", "parent"],
    },
  },
} as const
