'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Send, Trash2, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  projectId?: string
  taskId?: string
}

interface CommentSectionProps {
  projectId?: string
  taskId?: string
  onCommentChange?: () => void
}

export function CommentSection({ projectId, taskId, onCommentChange }: CommentSectionProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (projectId) params.append('projectId', projectId)
        if (taskId) params.append('taskId', taskId)

        const res = await fetch(`/api/comments?${params.toString()}`)
        const data = await res.json()
        if (data.success) {
          setComments(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    if (projectId || taskId) {
      fetchComments()
    }
  }, [projectId, taskId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !author.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer votre nom et un commentaire',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          author: author.trim(),
          projectId,
          taskId
        })
      })
      const data = await res.json()
      if (data.success) {
        setComments(prev => [data.data, ...prev])
        setNewComment('')
        toast({ title: 'Commentaire ajouté' })
        if (onCommentChange) onCommentChange()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le commentaire',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId))
        toast({ title: 'Commentaire supprimé' })
        if (onCommentChange) onCommentChange()
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le commentaire',
        variant: 'destructive'
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="bg-[#1e3a5f]/30 border-blue-400/20 w-full max-w-full overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span className="truncate">Commentaires ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="space-y-3 w-full">
          <Input
            placeholder="Votre nom"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="bg-[#0f1c2e] border-blue-400/30 text-white text-base w-full"
          />
          <div className="flex gap-2 w-full">
            <Input
              placeholder="Écrire un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-[#0f1c2e] border-blue-400/30 text-white text-base flex-1 min-w-0"
            />
            <Button
              type="submit"
              disabled={submitting || !newComment.trim() || !author.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-black flex-shrink-0"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>

        {/* Comments list */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-base text-center py-4">
            Aucun commentaire pour le moment
          </p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto overflow-x-hidden">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 sm:p-4 bg-[#0f1c2e]/50 rounded-lg border border-blue-400/10 w-full overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 text-base min-w-0 flex-wrap">
                    <User className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-amber-300 font-semibold truncate max-w-[100px] sm:max-w-none">{comment.author}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-500 text-sm">{formatDate(comment.createdAt)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    className="h-7 w-7 p-0 text-gray-500 hover:text-red-400 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-300 text-base mt-2 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
