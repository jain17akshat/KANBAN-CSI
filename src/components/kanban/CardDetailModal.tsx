import React, { useState } from 'react'
import { X, Calendar, MessageSquare, Trash2, Save } from 'lucide-react'
import { Card } from '../../types'
import { useBoardStore } from '../../store/boardStore'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface CardDetailModalProps {
  isOpen: boolean
  onClose: () => void
  card: Card
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  isOpen,
  onClose,
  card,
}) => {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dueDate, setDueDate] = useState(
    card.due_date ? format(new Date(card.due_date), 'yyyy-MM-dd') : ''
  )
  const [loading, setLoading] = useState(false)
  const { updateCard, deleteCard } = useBoardStore()

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateCard(card.id, {
        title,
        description: description || null,
        due_date: dueDate || null,
      })
      toast.success('Card updated successfully!')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update card')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return
    
    setLoading(true)
    try {
      await deleteCard(card.id)
      toast.success('Card deleted successfully!')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete card')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Card Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter card title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="inline mr-2" size={16} />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a description..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>Created: {format(new Date(card.created_at), 'PPP')}</p>
            <p>Last updated: {format(new Date(card.updated_at), 'PPP')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete Card
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}