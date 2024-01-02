export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      assignments: {
        Row: {
          client_id: string
          created_at: string
          employee_id: string
          id: number
        }
        Insert: {
          client_id: string
          created_at: string
          employee_id: string
          id?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          employee_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'assignments_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'assignments_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      invites: {
        Row: {
          email: string | null
          id: string | null
          role: Database['public']['Enums']['role_enum']
        }
        Insert: {
          email?: string | null
          id?: string | null
          role?: Database['public']['Enums']['role_enum']
        }
        Update: {
          email?: string | null
          id?: string | null
          role?: Database['public']['Enums']['role_enum']
        }
        Relationships: []
      }
      locations: {
        Row: {
          apt_number: string | null
          formatted_address: string | null
          id: number
          latitude: number | null
          longitude: number | null
        }
        Insert: {
          apt_number?: string | null
          formatted_address?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
        }
        Update: {
          apt_number?: string | null
          formatted_address?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: []
      }
      timecards: {
        Row: {
          assignment_id: number | null
          created_at: string | null
          ended_at: string | null
          id: number
          is_active: boolean | null
          location_id: number | null
          started_at: string | null
        }
        Insert: {
          assignment_id?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: number
          is_active?: boolean | null
          location_id?: number | null
          started_at?: string | null
        }
        Update: {
          assignment_id?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: number
          is_active?: boolean | null
          location_id?: number | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'timecards_assignment_id_fkey'
            columns: ['assignment_id']
            isOneToOne: false
            referencedRelation: 'assignments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'timecards_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          location_id: number | null
          middle_name: string | null
          phone_number: string | null
          role: Database['public']['Enums']['role_enum']
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          location_id?: number | null
          middle_name?: string | null
          phone_number?: string | null
          role?: Database['public']['Enums']['role_enum']
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          location_id?: number | null
          middle_name?: string | null
          phone_number?: string | null
          role?: Database['public']['Enums']['role_enum']
        }
        Relationships: [
          {
            foreignKeyName: 'users_location_id_fkey'
            columns: ['location_id']
            isOneToOne: false
            referencedRelation: 'locations'
            referencedColumns: ['id']
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
      role_enum: 'admin' | 'client' | 'employee'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database['public']['Tables'] & Database['public']['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
  Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
  Database['public']['Views'])
    ? (Database['public']['Tables'] &
    Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database['public']['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database['public']['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database['public']['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;
