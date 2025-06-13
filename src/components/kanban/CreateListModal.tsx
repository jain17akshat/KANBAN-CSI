import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import toast from 'react-hot-toast'

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  boardId: string
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const { createList, lists } = useBoardStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createList({
        title,
        board_id: boardId,
        position: lists.length,
      })
      toast.success('List created successfully!')
      setTitle('')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create list')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New List</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              List Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter list title (e.g., To Do, In Progress, Done)"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                Create List
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}