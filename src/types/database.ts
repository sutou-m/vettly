export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type CandidateStatus =
  | 'screening'
  | 'reviewing'
  | 'interview'
  | 'offered'
  | 'rejected'
  | 'withdrawn'

export type OcrStatus = 'pending' | 'processing' | 'done' | 'error'

export type NotificationStatus = 'sent' | 'failed'

export interface Database {
  public: {
    Tables: {
      vet_users: {
        Row: {
          id: string
          email: string
          name: string | null
          auth_password: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          auth_password: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          auth_password?: string
          created_at?: string
        }
        Relationships: never[]
      }
      vet_positions: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          required_skills: string[] | null
          preferred_skills: string[] | null
          required_experience: number
          evaluation_criteria: Json | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          required_skills?: string[] | null
          preferred_skills?: string[] | null
          required_experience?: number
          evaluation_criteria?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          required_skills?: string[] | null
          preferred_skills?: string[] | null
          required_experience?: number
          evaluation_criteria?: Json | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: never[]
      }
      vet_documents: {
        Row: {
          id: string
          user_id: string
          storage_path: string
          original_filename: string | null
          file_type: string | null
          ocr_raw_text: string | null
          ocr_status: OcrStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          storage_path: string
          original_filename?: string | null
          file_type?: string | null
          ocr_raw_text?: string | null
          ocr_status?: OcrStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          storage_path?: string
          original_filename?: string | null
          file_type?: string | null
          ocr_raw_text?: string | null
          ocr_status?: OcrStatus
          created_at?: string
        }
        Relationships: never[]
      }
      vet_candidates: {
        Row: {
          id: string
          user_id: string
          position_id: string | null
          document_id: string | null
          name: string | null
          email: string | null
          phone: string | null
          summary: string | null
          skills: string[] | null
          experience_years: number | null
          education: string | null
          score: number | null
          score_breakdown: Json | null
          status: CandidateStatus
          ai_processed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          position_id?: string | null
          document_id?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          summary?: string | null
          skills?: string[] | null
          experience_years?: number | null
          education?: string | null
          score?: number | null
          score_breakdown?: Json | null
          status?: CandidateStatus
          ai_processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          position_id?: string | null
          document_id?: string | null
          name?: string | null
          email?: string | null
          phone?: string | null
          summary?: string | null
          skills?: string[] | null
          experience_years?: number | null
          education?: string | null
          score?: number | null
          score_breakdown?: Json | null
          status?: CandidateStatus
          ai_processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: never[]
      }
      vet_candidate_notes: {
        Row: {
          id: string
          candidate_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: never[]
      }
      vet_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          candidate_id: string | null
          sent_at: string
          status: NotificationStatus
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          candidate_id?: string | null
          sent_at?: string
          status?: NotificationStatus
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          candidate_id?: string | null
          sent_at?: string
          status?: NotificationStatus
        }
        Relationships: never[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
