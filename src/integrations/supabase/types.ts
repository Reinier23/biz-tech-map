export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          actor: string | null
          details: Json
          event_type: string
          id: string
          timestamp: string
        }
        Insert: {
          actor?: string | null
          details: Json
          event_type: string
          id?: string
          timestamp?: string
        }
        Update: {
          actor?: string | null
          details?: Json
          event_type?: string
          id?: string
          timestamp?: string
        }
        Relationships: []
      }
      category_cost_fallbacks: {
        Row: {
          category: string
          cost_basis: string
          created_at: string
          default_cost_mo: number
          updated_at: string
        }
        Insert: {
          category: string
          cost_basis: string
          created_at?: string
          default_cost_mo: number
          updated_at?: string
        }
        Update: {
          category?: string
          cost_basis?: string
          created_at?: string
          default_cost_mo?: number
          updated_at?: string
        }
        Relationships: []
      }
      category_playbooks: {
        Row: {
          category: string
          must_have: boolean
          suggestions: string[]
        }
        Insert: {
          category: string
          must_have?: boolean
          suggestions?: string[]
        }
        Update: {
          category?: string
          must_have?: boolean
          suggestions?: string[]
        }
        Relationships: []
      }
      integrations_catalog: {
        Row: {
          relation_type: string | null
          tool_a: string | null
          tool_b: string | null
        }
        Insert: {
          relation_type?: string | null
          tool_a?: string | null
          tool_b?: string | null
        }
        Update: {
          relation_type?: string | null
          tool_a?: string | null
          tool_b?: string | null
        }
        Relationships: []
      }
      shares: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          payload: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          payload: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          payload?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      tool_cost_defaults: {
        Row: {
          category: string
          cost_basis: string
          cost_mo: number
          created_at: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          category: string
          cost_basis: string
          cost_mo: number
          created_at?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          cost_basis?: string
          cost_mo?: number
          created_at?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tool_suggestions: {
        Row: {
          id: string
          name: string
          processed: boolean
          processed_at: string | null
          processing_error: string | null
          resolved_domain: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          name: string
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          resolved_domain?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          name?: string
          processed?: boolean
          processed_at?: string | null
          processing_error?: string | null
          resolved_domain?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      tools: {
        Row: {
          arch_layer: string | null
          category: string
          confidence: number | null
          confirmed_category: string | null
          connections: Json
          created_at: string
          description: string | null
          domain: string | null
          id: string
          importance_score: number
          logo_url: string | null
          manual_recommendation: string | null
          name: string
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          arch_layer?: string | null
          category: string
          confidence?: number | null
          confirmed_category?: string | null
          connections?: Json
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          importance_score?: number
          logo_url?: string | null
          manual_recommendation?: string | null
          name: string
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          arch_layer?: string | null
          category?: string
          confidence?: number | null
          confirmed_category?: string | null
          connections?: Json
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          importance_score?: number
          logo_url?: string | null
          manual_recommendation?: string | null
          name?: string
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: []
      }
      tools_catalog: {
        Row: {
          aliases: string[] | null
          category: string
          created_at: string
          description: string | null
          domain: string | null
          id: string
          keywords: string[] | null
          logo_url: string | null
          logourl: string | null
          name: string
          popularity: number | null
          updated_at: string
        }
        Insert: {
          aliases?: string[] | null
          category: string
          created_at?: string
          description?: string | null
          domain?: string | null
          id: string
          keywords?: string[] | null
          logo_url?: string | null
          logourl?: string | null
          name: string
          popularity?: number | null
          updated_at?: string
        }
        Update: {
          aliases?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          keywords?: string[] | null
          logo_url?: string | null
          logourl?: string | null
          name?: string
          popularity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ui_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      tools_catalog_search_v: {
        Row: {
          alias: string | null
          category: string | null
          description: string | null
          domain: string | null
          id: string | null
          keyword: string | null
          logo_url: string | null
          name: string | null
          popularity: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      get_gap_questions: {
        Args: { tools_in: string[] }
        Returns: {
          category: string
          suggestions: string[]
        }[]
      }
      get_integrations: {
        Args: { a: string }
        Returns: {
          source: string
          target: string
          relation_type: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      resolve_tool_cost: {
        Args: { name: string; category: string }
        Returns: {
          cost_mo: number
          cost_basis: string
          source: string
        }[]
      }
      search_tools: {
        Args: { q: string; lim?: number }
        Returns: {
          name: string
          domain: string
          category: string
          description: string
          logo_url: string
        }[]
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
