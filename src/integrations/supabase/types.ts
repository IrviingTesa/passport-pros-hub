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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ds160_access_log: {
        Row: {
          accessed_at: string
          ds160_full_name: string | null
          ds160_id: string
          id: string
          user_id: string
        }
        Insert: {
          accessed_at?: string
          ds160_full_name?: string | null
          ds160_id: string
          id?: string
          user_id: string
        }
        Update: {
          accessed_at?: string
          ds160_full_name?: string | null
          ds160_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      ds160_applications: {
        Row: {
          created_at: string
          current_step: number
          edit_token: string
          email: string
          embassy: string | null
          form_data: Json
          full_name: string
          id: string
          purpose_of_trip: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_step?: number
          edit_token?: string
          email: string
          embassy?: string | null
          form_data?: Json
          full_name?: string
          id?: string
          purpose_of_trip?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_step?: number
          edit_token?: string
          email?: string
          embassy?: string | null
          form_data?: Json
          full_name?: string
          id?: string
          purpose_of_trip?: string | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ds160_edit_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          hours_requested: number
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          secretary_id: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          hours_requested?: number
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          secretary_id: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          hours_requested?: number
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          secretary_id?: string
          status?: string
        }
        Relationships: []
      }
      page_visits: {
        Row: {
          city: string | null
          country: string | null
          id: string
          ip_hash: string | null
          region: string | null
          visited_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          ip_hash?: string | null
          region?: string | null
          visited_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          ip_hash?: string | null
          region?: string | null
          visited_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_name: string
          comment: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          photo_url: string | null
          rating: number
          service_related: string | null
          status: string
          updated_at: string
        }
        Insert: {
          client_name: string
          comment: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          photo_url?: string | null
          rating?: number
          service_related?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          comment?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          photo_url?: string | null
          rating?: number
          service_related?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      secretary_edit_permissions: {
        Row: {
          created_at: string
          expires_at: string
          granted_at: string
          granted_by: string
          id: string
          notes: string | null
          revoked_at: string | null
          secretary_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          granted_at?: string
          granted_by: string
          id?: string
          notes?: string | null
          revoked_at?: string | null
          secretary_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          granted_at?: string
          granted_by?: string
          id?: string
          notes?: string | null
          revoked_at?: string | null
          secretary_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          short_description: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          short_description?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          short_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          bio: string | null
          created_at: string
          display_order: number
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          photo_url: string | null
          position: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          position: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          position?: string
          updated_at?: string
          whatsapp_number?: string | null
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
      video_channels: {
        Row: {
          created_at: string
          id: string
          tiktok_profile_url: string | null
          tiktok_video_urls: Json
          updated_at: string
          youtube_channel_id: string | null
          youtube_channel_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          tiktok_profile_url?: string | null
          tiktok_video_urls?: Json
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_channel_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          tiktok_profile_url?: string | null
          tiktok_video_urls?: Json
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_channel_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_ds160_with_token: {
        Args: { _edit_token: string; _id: string }
        Returns: {
          created_at: string
          current_step: number
          edit_token: string
          email: string
          embassy: string | null
          form_data: Json
          full_name: string
          id: string
          purpose_of_trip: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "ds160_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      secretary_has_active_edit_permission: {
        Args: { _user_id: string }
        Returns: boolean
      }
      update_ds160_with_token: {
        Args: {
          _current_step: number
          _edit_token: string
          _email: string
          _embassy: string
          _form_data: Json
          _full_name: string
          _id: string
          _purpose_of_trip: string
          _status: string
        }
        Returns: {
          created_at: string
          current_step: number
          edit_token: string
          email: string
          embassy: string | null
          form_data: Json
          full_name: string
          id: string
          purpose_of_trip: string | null
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "ds160_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "secretary"
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
      app_role: ["admin", "secretary"],
    },
  },
} as const
