import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreHorizontal } from 'lucide-react'
import { List, Card } from '../../types'
import { KanbanCard } from './KanbanCard'
import { CreateCardModal } from './CreateCardModal'

interface KanbanListProps {
  list: List
  cards: Card[]
}

export const KanbanList: React.FC<KanbanListProps> = ({ list, cards }) => {
  const [showCreateCard, setShowCreateCard] = useState(false)
  const { setNodeRef } = useDroppable({ id: list.id })

  const listCards = cards.filter(card => card.list_id === list.id)
    .sort((a, b) => a.position - b.position)

  return (
    <div className="bg-gray-50 rounded-xl p-4 min-w-80 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{list.title}</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {listCards.length}
          </span>
          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
            <MoreHorizontal size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-32"
      >
        <SortableContext items={listCards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {listCards.map((card) => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={() => setShowCreateCard(true)}
        className="mt-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
      >
        <Plus size={16} />
        <span className="text-sm">Add a card</span>
      </button>

      <CreateCardModal
        isOpen={showCreateCard}
        onClose={() => setShowCreateCard(false)}
        listId={list.id}
        position={listCards.length}
      />
    </div>
  )
}