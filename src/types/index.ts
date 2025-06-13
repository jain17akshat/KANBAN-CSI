export interface User {
  id: string
  email: string
  created_at: string
}

export interface Board {
  id: string
  title: string
  description: string | null
  created_at: string
  updated_at: string
  user_id: string
}

export interface List {
  id: string
  title: string
  position: number
  board_id: string
  created_at: string
  updated_at: string
  cards?: Card[]
}

export interface Card {
  id: string
  title: string
  description: string | null
  position: number
  due_date: string | null
  list_id: string
  created_at: string
  updated_at: string
}

export interface CreateBoardData {
  title: string
  description?: string
}

export interface CreateListData {
  title: string
  board_id: string
  position: number
}

export interface CreateCardData {
  title: string
  description?: string
  list_id: string
  position: number
  due_date?: string
}

export interface UpdateCardData {
  title?: string
  description?: string
  position?: number
  due_date?: string
  list_id?: string
}