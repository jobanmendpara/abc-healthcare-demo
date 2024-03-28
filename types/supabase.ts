export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignments: {
        Row: {
          client_id: string
          employee_id: string
          id: string
        }
        Insert: {
          client_id: string
          employee_id: string
          id?: string
        }
        Update: {
          client_id?: string
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      geopoints: {
        Row: {
          apt_number: string | null
          formatted_address: string | null
          id: string
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          apt_number?: string | null
          formatted_address?: string | null
          id: string
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          apt_number?: string | null
          formatted_address?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
      invites: {
        Row: {
          email: string
          id: string
          role: Database["public"]["Enums"]["role_enum"]
          token: string | null
        }
        Insert: {
          email: string
          id: string
          role?: Database["public"]["Enums"]["role_enum"]
          token?: string | null
        }
        Update: {
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["role_enum"]
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      timecards: {
        Row: {
          assignment_id: string
          created_at: string
          ended_at: string | null
          id: string
          is_active: boolean
          started_at: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          is_active?: boolean
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timecards_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          id: string
          is_dark_mode: boolean
        }
        Insert: {
          id: string
          is_dark_mode?: boolean
        }
        Update: {
          id?: string
          is_dark_mode?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string
          first_name: string
          geopoint_id: string
          id: string
          is_active: boolean
          last_name: string
          middle_name: string | null
          phone_number: string
          role: Database["public"]["Enums"]["role_enum"]
        }
        Insert: {
          email: string
          first_name: string
          geopoint_id: string
          id?: string
          is_active?: boolean
          last_name: string
          middle_name?: string | null
          phone_number: string
          role?: Database["public"]["Enums"]["role_enum"]
        }
        Update: {
          email?: string
          first_name?: string
          geopoint_id?: string
          id?: string
          is_active?: boolean
          last_name?: string
          middle_name?: string | null
          phone_number?: string
          role?: Database["public"]["Enums"]["role_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "users_geopoint_id_fkey"
            columns: ["geopoint_id"]
            isOneToOne: false
            referencedRelation: "geopoints"
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
      role_enum: "admin" | "client" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
