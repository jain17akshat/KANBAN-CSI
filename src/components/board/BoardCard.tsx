import React from 'react'
import { Calendar, FileText } from 'lucide-react'
import { Board } from '../../types'
import { format } from 'date-fns'

interface BoardCardProps {
  board: Board
  onClick: () => void
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 group"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {board.title}
          </h3>
          <FileText className="text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
        </div>
        
        {board.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {board.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} />
          <span>Created {format(new Date(board.created_at), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  )
}