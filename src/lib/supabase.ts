import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      lists: {
        Row: {
          id: string
          title: string
          position: number
          board_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          position: number
          board_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          position?: number
          board_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          title: string
          description: string | null
          position: number
          due_date: string | null
          list_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          position: number
          due_date?: string | null
          list_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          position?: number
          due_date?: string | null
          list_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}