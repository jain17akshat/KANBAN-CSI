import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip } from 'lucide-react'
import { Card } from '../../types'
import { format } from 'date-fns'
import { CardDetailModal } from './CardDetailModal'

interface KanbanCardProps {
  card: Card
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card }) => {
  const [showDetails, setShowDetails] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowDetails(true)}
        className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all duration-200 ${
          isDragging ? 'opacity-50 rotate-2' : ''
        }`}
      >
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {card.title}
        </h4>
        
        {card.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {card.due_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{format(new Date(card.due_date), 'MMM d')}</span>
              </div>
            )}
            
            {card.description && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MessageSquare size={12} />
              </div>
            )}
          </div>
        </div>
      </div>

      <CardDetailModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        card={card}
      />
    </>
  )
}