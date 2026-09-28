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
      analyses: {
        Row: {
          bike_count: number
          created_at: string
          helmet_count: number
          id: string
          no_helmet_count: number
          number_plate_count: number
          original_file_name: string | null
          readable_plate_count: number
          status: Database["public"]["Enums"]["analysis_status"]
          total_objects: number
          type: Database["public"]["Enums"]["analysis_type"]
          updated_at: string
          user_id: string
          violation_count: number
        }
        Insert: {
          bike_count?: number
          created_at?: string
          helmet_count?: number
          id?: string
          no_helmet_count?: number
          number_plate_count?: number
          original_file_name?: string | null
          readable_plate_count?: number
          status?: Database["public"]["Enums"]["analysis_status"]
          total_objects?: number
          type: Database["public"]["Enums"]["analysis_type"]
          updated_at?: string
          user_id: string
          violation_count?: number
        }
        Update: {
          bike_count?: number
          created_at?: string
          helmet_count?: number
          id?: string
          no_helmet_count?: number
          number_plate_count?: number
          original_file_name?: string | null
          readable_plate_count?: number
          status?: Database["public"]["Enums"]["analysis_status"]
          total_objects?: number
          type?: Database["public"]["Enums"]["analysis_type"]
          updated_at?: string
          user_id?: string
          violation_count?: number
        }
        Relationships: []
      }
      detections: {
        Row: {
          analysis_id: string
          class_name: string
          confidence: number | null
          created_at: string
          id: string
          tracking_id: string | null
          user_id: string
          x1: number | null
          x2: number | null
          y1: number | null
          y2: number | null
        }
        Insert: {
          analysis_id: string
          class_name: string
          confidence?: number | null
          created_at?: string
          id?: string
          tracking_id?: string | null
          user_id: string
          x1?: number | null
          x2?: number | null
          y1?: number | null
          y2?: number | null
        }
        Update: {
          analysis_id?: string
          class_name?: string
          confidence?: number | null
          created_at?: string
          id?: string
          tracking_id?: string | null
          user_id?: string
          x1?: number | null
          x2?: number | null
          y1?: number | null
          y2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "detections_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      violations: {
        Row: {
          analysis_id: string
          created_at: string
          detection_confidence: number | null
          first_detected_at: string | null
          helmet_status: string
          id: string
          last_detected_at: string | null
          number_plate: string | null
          number_plate_confidence: number | null
          number_plate_status: Database["public"]["Enums"]["plate_status"]
          source: Database["public"]["Enums"]["analysis_type"]
          tracking_id: string | null
          user_id: string
          vehicle_type: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          detection_confidence?: number | null
          first_detected_at?: string | null
          helmet_status: string
          id?: string
          last_detected_at?: string | null
          number_plate?: string | null
          number_plate_confidence?: number | null
          number_plate_status?: Database["public"]["Enums"]["plate_status"]
          source: Database["public"]["Enums"]["analysis_type"]
          tracking_id?: string | null
          user_id: string
          vehicle_type?: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          detection_confidence?: number | null
          first_detected_at?: string | null
          helmet_status?: string
          id?: string
          last_detected_at?: string | null
          number_plate?: string | null
          number_plate_confidence?: number | null
          number_plate_status?: Database["public"]["Enums"]["plate_status"]
          source?: Database["public"]["Enums"]["analysis_type"]
          tracking_id?: string | null
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "analyses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      analysis_status: "processing" | "completed" | "failed"
      analysis_type: "image" | "video" | "live"
      plate_status: "READABLE" | "NOT_READABLE"
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
      analysis_status: ["processing", "completed", "failed"],
      analysis_type: ["image", "video", "live"],
      plate_status: ["READABLE", "NOT_READABLE"],
    },
  },
} as const
