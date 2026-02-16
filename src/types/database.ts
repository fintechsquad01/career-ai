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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          token_balance: number;
          daily_credits_balance: number;
          last_daily_credit_at: string | null;
          total_tokens_purchased: number;
          total_tokens_spent: number;
          lifetime_deal: boolean;
          lifetime_next_refill: string | null;
          stripe_customer_id: string | null;
          referral_code: string | null;
          referred_by: string | null;
          referral_count: number;
          onboarding_completed: boolean;
          notification_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          token_balance?: number;
          daily_credits_balance?: number;
          last_daily_credit_at?: string | null;
          total_tokens_purchased?: number;
          total_tokens_spent?: number;
          lifetime_deal?: boolean;
          lifetime_next_refill?: string | null;
          stripe_customer_id?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          referral_count?: number;
          onboarding_completed?: boolean;
          notification_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          token_balance?: number;
          daily_credits_balance?: number;
          last_daily_credit_at?: string | null;
          total_tokens_purchased?: number;
          total_tokens_spent?: number;
          lifetime_deal?: boolean;
          lifetime_next_refill?: string | null;
          stripe_customer_id?: string | null;
          referral_code?: string | null;
          referred_by?: string | null;
          referral_count?: number;
          onboarding_completed?: boolean;
          notification_preferences?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      career_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          title: string | null;
          company: string | null;
          industry: string | null;
          location: string | null;
          years_experience: number | null;
          email: string | null;
          linkedin_url: string | null;
          skills: Json;
          skill_gaps: Json;
          resume_score: number | null;
          displacement_score: number | null;
          resume_text: string | null;
          resume_file_path: string | null;
          source: string | null;
          parsed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          title?: string | null;
          company?: string | null;
          industry?: string | null;
          location?: string | null;
          years_experience?: number | null;
          email?: string | null;
          linkedin_url?: string | null;
          skills?: Json;
          skill_gaps?: Json;
          resume_score?: number | null;
          displacement_score?: number | null;
          resume_text?: string | null;
          resume_file_path?: string | null;
          source?: string | null;
          parsed_at?: string | null;
        };
        Update: {
          name?: string | null;
          title?: string | null;
          company?: string | null;
          industry?: string | null;
          location?: string | null;
          years_experience?: number | null;
          email?: string | null;
          linkedin_url?: string | null;
          skills?: Json;
          skill_gaps?: Json;
          resume_score?: number | null;
          displacement_score?: number | null;
          resume_text?: string | null;
          resume_file_path?: string | null;
          source?: string | null;
          parsed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      job_targets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company: string;
          location: string | null;
          salary_range: string | null;
          posted_date: string | null;
          applicant_count: string | null;
          job_url: string | null;
          requirements: Json;
          fit_score: number | null;
          is_active: boolean;
          mission_actions: Json;
          jd_text: string | null;
          source: string | null;
          status: string;
          status_updated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company: string;
          location?: string | null;
          salary_range?: string | null;
          posted_date?: string | null;
          applicant_count?: string | null;
          job_url?: string | null;
          requirements?: Json;
          fit_score?: number | null;
          is_active?: boolean;
          mission_actions?: Json;
          jd_text?: string | null;
          source?: string | null;
          status?: string;
          status_updated_at?: string | null;
        };
        Update: {
          title?: string;
          company?: string;
          location?: string | null;
          salary_range?: string | null;
          posted_date?: string | null;
          applicant_count?: string | null;
          job_url?: string | null;
          requirements?: Json;
          fit_score?: number | null;
          is_active?: boolean;
          mission_actions?: Json;
          jd_text?: string | null;
          source?: string | null;
          status?: string;
          status_updated_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      tool_results: {
        Row: {
          id: string;
          user_id: string;
          job_target_id: string | null;
          tool_id: string;
          tokens_spent: number;
          result: Json;
          summary: string | null;
          metric_value: number | null;
          detail: string | null;
          model_used: string | null;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          latency_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_target_id?: string | null;
          tool_id: string;
          tokens_spent?: number;
          result: Json;
          summary?: string | null;
          metric_value?: number | null;
          detail?: string | null;
          model_used?: string | null;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          latency_ms?: number | null;
        };
        Update: {
          summary?: string | null;
          metric_value?: number | null;
          detail?: string | null;
        };
        Relationships: [];
      };
      resume_variants: {
        Row: {
          id: string;
          user_id: string;
          job_target_id: string | null;
          name: string;
          resume_text: string;
          source: string;
          tool_result_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_target_id?: string | null;
          name: string;
          resume_text: string;
          source?: string;
          tool_result_id?: string | null;
        };
        Update: {
          name?: string;
          resume_text?: string;
          job_target_id?: string | null;
          source?: string;
          tool_result_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      token_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          balance_after: number;
          type: string;
          description: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          tool_result_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          balance_after: number;
          type: string;
          description?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          tool_result_id?: string | null;
        };
        Update: {
          description?: string | null;
        };
        Relationships: [];
      };
      email_captures: {
        Row: {
          id: string;
          email: string;
          context: string | null;
          source_page: string | null;
          converted_to_user: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          context?: string | null;
          source_page?: string | null;
          converted_to_user?: boolean;
        };
        Update: {
          converted_to_user?: boolean;
        };
        Relationships: [];
      };
      shared_scores: {
        Row: {
          id: string;
          hash: string;
          user_id: string | null;
          score_type: string;
          score_value: number | null;
          title: string | null;
          industry: string | null;
          detail: Json | null;
          view_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          hash: string;
          user_id?: string | null;
          score_type: string;
          score_value?: number | null;
          title?: string | null;
          industry?: string | null;
          detail?: Json | null;
          view_count?: number;
        };
        Update: {
          view_count?: number;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string | null;
          tool_id: string;
          nps_score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          tool_id: string;
          nps_score: number;
          comment?: string | null;
        };
        Update: {
          comment?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      spend_tokens: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_tool_id: string;
          p_tool_result_id: string;
        };
        Returns: number;
      };
      add_tokens: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: string;
          p_description: string;
          p_stripe_session_id?: string;
        };
        Returns: number;
      };
      process_referral: {
        Args: {
          p_referrer_id: string;
          p_new_user_id: string;
        };
        Returns: void;
      };
      award_daily_credits: {
        Args: {
          p_user_id: string;
        };
        Returns: Json;
      };
      increment_view_count: {
        Args: {
          p_score_id: string;
        };
        Returns: void;
      };
      set_active_job_target: {
        Args: {
          target_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
