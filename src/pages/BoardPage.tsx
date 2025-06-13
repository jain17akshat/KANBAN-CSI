import React, { useEffect, useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { ArrowLeft, Plus } from 'lucide-react'
import { Board, Card } from '../types'
import { useBoardStore } from '../store/boardStore'
import { KanbanList } from '../components/kanban/KanbanList'
import { KanbanCard } from '../components/kanban/KanbanCard'
import { CreateListModal } from '../components/kanban/CreateListModal'

interface BoardPageProps {
  board: Board
  onBack: () => void
}

export const BoardPage: React.FC<BoardPageProps> = ({ board, onBack }) => {
  const [showCreateList, setShowCreateList] = useState(false)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const { lists, cards, fetchLists, fetchCards, moveCard } = useBoardStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchLists(board.id)
    fetchCards(board.id)
  }, [board.id, fetchLists, fetchCards])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const card = cards.find(c => c.id === active.id)
    if (card) {
      setActiveCard(card)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over) return

    const activeCard = cards.find(c => c.id === active.id)
    if (!activeCard) return

    const overList = lists.find(l => l.id === over.id)
    const overCard = cards.find(c => c.id === over.id)

    if (overList) {
      // Moving to a different list
      const listCards = cards.filter(c => c.list_id === overList.id)
      const newPosition = listCards.length
      
      if (activeCard.list_id !== overList.id) {
        await moveCard(activeCard.id, overList.id, newPosition)
      }
    } else if (overCard && overCard.list_id !== activeCard.list_id) {
      // Moving to a different position in a different list
      await moveCard(activeCard.id, overCard.list_id, overCard.position)
    }
  }

  // Initialize default lists if none exist
  useEffect(() => {
    if (lists.length === 0 && !showCreateList) {
      const initializeDefaultLists = async () => {
        const defaultLists = ['To Do', 'In Progress', 'Done']
        for (let i = 0; i < defaultLists.length; i++) {
          try {
            await useBoardStore.getState().createList({
              title: defaultLists[i],
              board_id: board.id,
              position: i,
            })
          } catch (error) {
            console.error('Error creating default list:', error)
          }
        }
      }
      
      const timer = setTimeout(initializeDefaultLists, 1000)
      return () => clearTimeout(timer)
    }
  }, [lists.length, board.id, showCreateList])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Boards
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{board.title}</h2>
              {board.description && (
                <p className="text-gray-600">{board.description}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateList(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add List
          </button>
        </div>
      </div>

      <div className="p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-6">
            {lists
              .sort((a, b) => a.position - b.position)
              .map((list) => (
                <KanbanList
                  key={list.id}
                  list={list}
                  cards={cards}
                />
              ))}
          </div>

          <DragOverlay>
            {activeCard ? <KanbanCard card={activeCard} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateListModal
        isOpen={showCreateList}
        onClose={() => setShowCreateList(false)}
        boardId={board.id}
      />
    </div>
  )
}