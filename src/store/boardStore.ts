import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Board, List, Card, CreateBoardData, CreateListData, CreateCardData, UpdateCardData } from '../types'

interface BoardState {
  boards: Board[]
  currentBoard: Board | null
  lists: List[]
  cards: Card[]
  loading: boolean
  
  // Board actions
  fetchBoards: () => Promise<void>
  createBoard: (data: CreateBoardData) => Promise<Board>
  setCurrentBoard: (board: Board) => void
  
  // List actions
  fetchLists: (boardId: string) => Promise<void>
  createList: (data: CreateListData) => Promise<List>
  
  // Card actions
  fetchCards: (boardId: string) => Promise<void>
  createCard: (data: CreateCardData) => Promise<Card>
  updateCard: (cardId: string, data: UpdateCardData) => Promise<void>
  deleteCard: (cardId: string) => Promise<void>
  moveCard: (cardId: string, newListId: string, newPosition: number) => Promise<void>
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  cards: [],
  loading: false,

  fetchBoards: async () => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ boards: data || [] })
    } catch (error) {
      console.error('Error fetching boards:', error)
    } finally {
      set({ loading: false })
    }
  },

  createBoard: async (data: CreateBoardData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: board, error } = await supabase
      .from('boards')
      .insert([{ ...data, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    set((state) => ({ boards: [board, ...state.boards] }))
    return board
  },

  setCurrentBoard: (board: Board) => {
    set({ currentBoard: board })
  },

  fetchLists: async (boardId: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true })

      if (error) throw error
      set({ lists: data || [] })
    } catch (error) {
      console.error('Error fetching lists:', error)
    } finally {
      set({ loading: false })
    }
  },

  createList: async (data: CreateListData) => {
    const { data: list, error } = await supabase
      .from('lists')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    set((state) => ({ lists: [...state.lists, list] }))
    return list
  },

  fetchCards: async (boardId: string) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select(`
          *,
          lists!inner(board_id)
        `)
        .eq('lists.board_id', boardId)
        .order('position', { ascending: true })

      if (error) throw error
      set({ cards: data || [] })
    } catch (error) {
      console.error('Error fetching cards:', error)
    }
  },

  createCard: async (data: CreateCardData) => {
    const { data: card, error } = await supabase
      .from('cards')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    set((state) => ({ cards: [...state.cards, card] }))
    return card
  },

  updateCard: async (cardId: string, data: UpdateCardData) => {
    const { error } = await supabase
      .from('cards')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', cardId)

    if (error) throw error

    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId ? { ...card, ...data } : card
      ),
    }))
  },

  deleteCard: async (cardId: string) => {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) throw error

    set((state) => ({
      cards: state.cards.filter((card) => card.id !== cardId),
    }))
  },

  moveCard: async (cardId: string, newListId: string, newPosition: number) => {
    const { error } = await supabase
      .from('cards')
      .update({ 
        list_id: newListId, 
        position: newPosition,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)

    if (error) throw error

    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, list_id: newListId, position: newPosition }
          : card
      ),
    }))
  },
}))