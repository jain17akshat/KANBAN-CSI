import React, { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useBoardStore } from '../store/boardStore'
import { BoardCard } from '../components/board/BoardCard'
import { CreateBoardModal } from '../components/board/CreateBoardModal'
import { Board } from '../types'

interface DashboardPageProps {
  onSelectBoard: (board: Board) => void
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectBoard }) => {
  const [showCreateBoard, setShowCreateBoard] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { boards, loading, fetchBoards } = useBoardStore()

  useEffect(() => {
    fetchBoards()
  }, [fetchBoards])

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Boards</h2>
            <p className="text-gray-600 mt-1">Manage your projects and workflows</p>
          </div>
          
          <button
            onClick={() => setShowCreateBoard(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Create Board
          </button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search boards..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={() => onSelectBoard(board)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No boards found' : 'No boards yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Create your first board to get started with task management'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateBoard(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create Your First Board
              </button>
            )}
          </div>
        )}

        <CreateBoardModal
          isOpen={showCreateBoard}
          onClose={() => setShowCreateBoard(false)}
        />
      </div>
    </div>
  )
}