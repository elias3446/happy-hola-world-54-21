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
      categories: {
        Row: {
          activo: boolean
          color: string
          created_at: string
          created_by: string
          deleted_at: string | null
          descripcion: string | null
          icono: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          color?: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          descripcion?: string | null
          icono?: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          color?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          descripcion?: string | null
          icono?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estados: {
        Row: {
          activo: boolean
          color: string
          created_at: string
          created_by: string
          deleted_at: string | null
          descripcion: string
          icono: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          color?: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          descripcion: string
          icono?: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          color?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          descripcion?: string
          icono?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "estados_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          asset: boolean | null
          avatar: string | null
          confirmed: boolean | null
          created_at: string
          deleted_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string[]
          updated_at: string
        }
        Insert: {
          asset?: boolean | null
          avatar?: string | null
          confirmed?: boolean | null
          created_at?: string
          deleted_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string[]
          updated_at?: string
        }
        Update: {
          asset?: boolean | null
          avatar?: string | null
          confirmed?: boolean | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      reporte_historial: {
        Row: {
          assigned_by: string
          assigned_from: string | null
          assigned_to: string | null
          comentario: string | null
          fecha_asignacion: string
          id: string
          reporte_id: string
        }
        Insert: {
          assigned_by: string
          assigned_from?: string | null
          assigned_to?: string | null
          comentario?: string | null
          fecha_asignacion?: string
          id?: string
          reporte_id: string
        }
        Update: {
          assigned_by?: string
          assigned_from?: string | null
          assigned_to?: string | null
          comentario?: string | null
          fecha_asignacion?: string
          id?: string
          reporte_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reporte_historial_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporte_historial_assigned_from_fkey"
            columns: ["assigned_from"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporte_historial_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporte_historial_reporte_id_fkey"
            columns: ["reporte_id"]
            isOneToOne: false
            referencedRelation: "reportes"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes: {
        Row: {
          activo: boolean
          assigned_to: string | null
          categoria_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          descripcion: string
          direccion: string | null
          estado_id: string
          id: string
          imagenes: string[] | null
          latitud: number | null
          longitud: number | null
          nombre: string
          priority: Database["public"]["Enums"]["priority_enum"]
          referencia_direccion: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          assigned_to?: string | null
          categoria_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          descripcion: string
          direccion?: string | null
          estado_id: string
          id?: string
          imagenes?: string[] | null
          latitud?: number | null
          longitud?: number | null
          nombre: string
          priority?: Database["public"]["Enums"]["priority_enum"]
          referencia_direccion?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          assigned_to?: string | null
          categoria_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          descripcion?: string
          direccion?: string | null
          estado_id?: string
          id?: string
          imagenes?: string[] | null
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          priority?: Database["public"]["Enums"]["priority_enum"]
          referencia_direccion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reportes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reportes_estado_id_fkey"
            columns: ["estado_id"]
            isOneToOne: false
            referencedRelation: "estados"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          activo: boolean
          color: string
          created_at: string
          created_by: string
          deleted_at: string | null
          descripcion: string
          icono: string
          id: string
          nombre: string
          permisos: Database["public"]["Enums"]["permission_enum"][]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          color?: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          descripcion: string
          icono?: string
          id?: string
          nombre: string
          permisos?: Database["public"]["Enums"]["permission_enum"][]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          color?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          descripcion?: string
          icono?: string
          id?: string
          nombre?: string
          permisos?: Database["public"]["Enums"]["permission_enum"][]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string
          deleted_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          deleted_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          deleted_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_has_role_permission: {
        Args: {
          permission_name: Database["public"]["Enums"]["permission_enum"]
        }
        Returns: boolean
      }
    }
    Enums: {
      permission_enum:
        | "ver_reporte"
        | "crear_reporte"
        | "editar_reporte"
        | "eliminar_reporte"
        | "ver_usuario"
        | "crear_usuario"
        | "editar_usuario"
        | "eliminar_usuario"
        | "ver_categoria"
        | "crear_categoria"
        | "editar_categoria"
        | "eliminar_categoria"
        | "ver_estado"
        | "crear_estado"
        | "editar_estado"
        | "eliminar_estado"
        | "ver_rol"
        | "crear_rol"
        | "editar_rol"
        | "eliminar_rol"
      priority_enum: "alto" | "medio" | "bajo" | "urgente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      permission_enum: [
        "ver_reporte",
        "crear_reporte",
        "editar_reporte",
        "eliminar_reporte",
        "ver_usuario",
        "crear_usuario",
        "editar_usuario",
        "eliminar_usuario",
        "ver_categoria",
        "crear_categoria",
        "editar_categoria",
        "eliminar_categoria",
        "ver_estado",
        "crear_estado",
        "editar_estado",
        "eliminar_estado",
        "ver_rol",
        "crear_rol",
        "editar_rol",
        "eliminar_rol",
      ],
      priority_enum: ["alto", "medio", "bajo", "urgente"],
    },
  },
} as const
