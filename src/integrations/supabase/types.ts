export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      booking_messages: {
        Row: {
          body: string;
          booking_id: string;
          created_at: string;
          id: string;
          read_at: string | null;
          sender_id: string;
          sender_role: string;
        };
        Insert: {
          body: string;
          booking_id: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender_id: string;
          sender_role: string;
        };
        Update: {
          body?: string;
          booking_id?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender_id?: string;
          sender_role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "booking_messages_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_ratings: {
        Row: {
          booking_id: string;
          comment: string | null;
          created_at: string;
          direction: string;
          id: string;
          ratee_id: string;
          rater_id: string;
          stars: number;
        };
        Insert: {
          booking_id: string;
          comment?: string | null;
          created_at?: string;
          direction: string;
          id?: string;
          ratee_id: string;
          rater_id: string;
          stars: number;
        };
        Update: {
          booking_id?: string;
          comment?: string | null;
          created_at?: string;
          direction?: string;
          id?: string;
          ratee_id?: string;
          rater_id?: string;
          stars?: number;
        };
        Relationships: [
          {
            foreignKeyName: "booking_ratings_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          address_line1: string;
          address_line2: string | null;
          audience: string;
          bathrooms: number | null;
          bedrooms: number | null;
          cancel_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          chat_session_id: string | null;
          city: string;
          claimed_at: string | null;
          cleaner_id: string | null;
          created_at: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string | null;
          duration_minutes: number;
          id: string;
          notes: string | null;
          price_cents: number;
          rescheduled_from_at: string | null;
          scheduled_at: string;
          service_slug: string;
          square_feet: number | null;
          state: string;
          status: string;
          updated_at: string;
          user_id: string;
          zip: string;
        };
        Insert: {
          address_line1: string;
          address_line2?: string | null;
          audience: string;
          bathrooms?: number | null;
          bedrooms?: number | null;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          chat_session_id?: string | null;
          city?: string;
          claimed_at?: string | null;
          cleaner_id?: string | null;
          created_at?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string | null;
          duration_minutes: number;
          id?: string;
          notes?: string | null;
          price_cents: number;
          rescheduled_from_at?: string | null;
          scheduled_at: string;
          service_slug: string;
          square_feet?: number | null;
          state?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
          zip: string;
        };
        Update: {
          address_line1?: string;
          address_line2?: string | null;
          audience?: string;
          bathrooms?: number | null;
          bedrooms?: number | null;
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          chat_session_id?: string | null;
          city?: string;
          claimed_at?: string | null;
          cleaner_id?: string | null;
          created_at?: string;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string | null;
          duration_minutes?: number;
          id?: string;
          notes?: string | null;
          price_cents?: number;
          rescheduled_from_at?: string | null;
          scheduled_at?: string;
          service_slug?: string;
          square_feet?: number | null;
          state?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
          zip?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_chat_session_id_fkey";
            columns: ["chat_session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          audience: string | null;
          created_at: string;
          id: string;
          lang: string | null;
          messages: Json;
          quote: Json | null;
          session_token: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          audience?: string | null;
          created_at?: string;
          id?: string;
          lang?: string | null;
          messages?: Json;
          quote?: Json | null;
          session_token: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          audience?: string | null;
          created_at?: string;
          id?: string;
          lang?: string | null;
          messages?: Json;
          quote?: Json | null;
          session_token?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      cleaner_applications: {
        Row: {
          approved_user_id: string | null;
          audiences: string[] | null;
          bio: string | null;
          city: string | null;
          created_at: string;
          email: string;
          full_name: string;
          has_supplies: boolean | null;
          has_transport: boolean | null;
          id: string;
          languages: string[] | null;
          phone: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          updated_at: string;
          years_experience: number | null;
          zips: string[] | null;
        };
        Insert: {
          approved_user_id?: string | null;
          audiences?: string[] | null;
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          has_supplies?: boolean | null;
          has_transport?: boolean | null;
          id?: string;
          languages?: string[] | null;
          phone?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
          years_experience?: number | null;
          zips?: string[] | null;
        };
        Update: {
          approved_user_id?: string | null;
          audiences?: string[] | null;
          bio?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          has_supplies?: boolean | null;
          has_transport?: boolean | null;
          id?: string;
          languages?: string[] | null;
          phone?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          updated_at?: string;
          years_experience?: number | null;
          zips?: string[] | null;
        };
        Relationships: [];
      };
      cleaner_availability: {
        Row: {
          cleaner_id: string;
          created_at: string;
          end_time: string;
          id: string;
          start_time: string;
          weekday: number;
        };
        Insert: {
          cleaner_id: string;
          created_at?: string;
          end_time: string;
          id?: string;
          start_time: string;
          weekday: number;
        };
        Update: {
          cleaner_id?: string;
          created_at?: string;
          end_time?: string;
          id?: string;
          start_time?: string;
          weekday?: number;
        };
        Relationships: [];
      };
      cleaner_profiles: {
        Row: {
          active: boolean;
          audiences: string[];
          bio: string | null;
          created_at: string;
          display_name: string;
          headline: string | null;
          id: string;
          languages: string[];
          photo_url: string | null;
          published: boolean;
          rating: number;
          review_count: number;
          slug: string;
          updated_at: string;
          user_id: string;
          years_experience: number | null;
          zips: string[];
        };
        Insert: {
          active?: boolean;
          audiences?: string[];
          bio?: string | null;
          created_at?: string;
          display_name: string;
          headline?: string | null;
          id?: string;
          languages?: string[];
          photo_url?: string | null;
          published?: boolean;
          rating?: number;
          review_count?: number;
          slug: string;
          updated_at?: string;
          user_id: string;
          years_experience?: number | null;
          zips?: string[];
        };
        Update: {
          active?: boolean;
          audiences?: string[];
          bio?: string | null;
          created_at?: string;
          display_name?: string;
          headline?: string | null;
          id?: string;
          languages?: string[];
          photo_url?: string | null;
          published?: boolean;
          rating?: number;
          review_count?: number;
          slug?: string;
          updated_at?: string;
          user_id?: string;
          years_experience?: number | null;
          zips?: string[];
        };
        Relationships: [];
      };
      cleaner_time_off: {
        Row: {
          cleaner_id: string;
          created_at: string;
          ends_at: string;
          id: string;
          reason: string | null;
          starts_at: string;
        };
        Insert: {
          cleaner_id: string;
          created_at?: string;
          ends_at: string;
          id?: string;
          reason?: string | null;
          starts_at: string;
        };
        Update: {
          cleaner_id?: string;
          created_at?: string;
          ends_at?: string;
          id?: string;
          reason?: string | null;
          starts_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          id: string;
          is_lead: boolean;
          lead_data: Json | null;
          message_count: number;
          quoted_value: number | null;
          session_id: string;
          status: Database["public"]["Enums"]["conversation_status"];
          updated_at: string;
          visitor_lang: string | null;
          visitor_user_agent: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          id?: string;
          is_lead?: boolean;
          lead_data?: Json | null;
          message_count?: number;
          quoted_value?: number | null;
          session_id: string;
          status?: Database["public"]["Enums"]["conversation_status"];
          updated_at?: string;
          visitor_lang?: string | null;
          visitor_user_agent?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string;
          id?: string;
          is_lead?: boolean;
          lead_data?: Json | null;
          message_count?: number;
          quoted_value?: number | null;
          session_id?: string;
          status?: Database["public"]["Enums"]["conversation_status"];
          updated_at?: string;
          visitor_lang?: string | null;
          visitor_user_agent?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          role: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          role: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          locale: string | null;
          source: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          locale?: string | null;
          source?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          locale?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
      services_catalog: {
        Row: {
          active: boolean;
          audience: string;
          base_price_cents: number;
          created_at: string;
          description: string;
          duration_minutes: number;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          audience: string;
          base_price_cents: number;
          created_at?: string;
          description: string;
          duration_minutes: number;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          audience?: string;
          base_price_cents?: number;
          created_at?: string;
          description?: string;
          duration_minutes?: number;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      approve_cleaner_application: {
        Args: { _app_id: string; _user_id: string };
        Returns: undefined;
      };
      can_access_booking: { Args: { _booking_id: string }; Returns: boolean };
      cancel_booking: {
        Args: { _booking_id: string; _reason?: string };
        Returns: undefined;
      };
      claim_job: {
        Args: { _booking_id: string };
        Returns: {
          claimed_at: string;
          cleaner_id: string;
          id: string;
          status: string;
        }[];
      };
      cleaner_rating_summary: {
        Args: { _cleaner_id: string };
        Returns: {
          avg_stars: number;
          review_count: number;
        }[];
      };
      has_cleaner_role: { Args: { _uid: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      list_open_jobs: {
        Args: never;
        Returns: {
          audience: string;
          bathrooms: number;
          bedrooms: number;
          city: string;
          created_at: string;
          duration_minutes: number;
          id: string;
          price_cents: number;
          scheduled_at: string;
          service_slug: string;
          square_feet: number;
          zip: string;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "cleaner";
      conversation_status: "new" | "in_progress" | "quoted" | "scheduled" | "won" | "lost";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "cleaner"],
      conversation_status: ["new", "in_progress", "quoted", "scheduled", "won", "lost"],
    },
  },
} as const;
