'use client'

import { useState, useCallback } from 'react'
import { CheckCircle2, Clock, AlertCircle, ListTodo, ChevronDown, Pencil, Loader2 } from 'lucide-react'
import { Task } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface DashboardTasksProps {
  tasks: Task[]
  onTaskClick: (projectId: string) => void
  onTaskUpdate?: () => void
}

type EditableField = 'title' | 'description' | 'objectives' | 'constraints' | 'solutionProposed'

export function DashboardTasks({ tasks, onTaskClick, onTaskUpdate }: DashboardTasksProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editTaskModal, setEditTaskModal] = useState<{taskId: string, field: EditableField, value: string, taskTitle: string} | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Grouper les tâches par statut
  const tasksByStatus = {
    'À faire': tasks.filter(t => t.status === 'À faire'),
    'En cours': tasks.filter(t => t.status === 'En cours'),
    'En retard': tasks.filter(t => t.status === 'En retard'),
    'Validé': tasks.filter(t => t.status === 'Validé')
  }

  const statusConfig = {
    'À faire': { icon: ListTodo, color: 'text-gray-300', bg: 'bg-gray-500/30', count: tasksByStatus['À faire'].length },
    'En cours': { icon: Clock, color: 'text-blue-300', bg: 'bg-blue-500/30', count: tasksByStatus['En cours'].length },
    'En retard': { icon: AlertCircle, color: 'text-red-300', bg: 'bg-red-500/30', count: tasksByStatus['En retard'].length },
    'Validé': { icon: CheckCircle2, color: 'text-green-300', bg: 'bg-green-500/30', count: tasksByStatus['Validé'].length }
  }

  // Ouvrir le modal d'édition
  const openEditModal = useCallback((task: Task, field: EditableField) => {
    const values: Record<EditableField, string> = {
      title: task.title || '',
      description: task.description || '',
      objectives: task.objectives || '',
      constraints: task.constraints || '',
      solutionProposed: task.solutionProposed || ''
    }
    setEditTaskModal({
      taskId: task.id,
      field,
      value: values[field],
      taskTitle: task.title
    })
  }, [])

  // Modifier un champ de tâche
  const handleEditTask = useCallback(async () => {
    if (!editTaskModal) return
    if (editTaskModal.field === 'title' && !editTaskModal.value?.trim()) {
      toast({ title: 'Le titre est requis', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTaskModal.taskId,
          [editTaskModal.field]: editTaskModal.value.trim() || null
        })
      })
      const data = await res.json()
      if (data.success) {
        const fieldNames: Record<EditableField, string> = { 
          title: 'Tâche', 
          description: 'Description', 
          objectives: 'Objectif',
          constraints: 'Contraintes',
          solutionProposed: 'Solution'
        }
        toast({ title: `✅ ${fieldNames[editTaskModal.field]} modifié(e) avec succès !` })
        setEditTaskModal(null)
        if (onTaskUpdate) onTaskUpdate()
      } else {
        toast({ title: '❌ Erreur lors de la modification', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: '❌ Erreur de connexion', variant: 'destructive' })
    } finally { setSaving(false) }
  }, [editTaskModal, toast, onTaskUpdate])

  // Rendu d'une tâche
  const renderTask = (task: Task) => {
    const isExpanded = expandedTask === task.id

    return (
      <div
        key={task.id}
        className="bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-lg overflow-hidden border border-blue-400/20 hover:border-blue-400/40 transition-all"
      >
        {/* En-tête compact */}
        <div 
          className="p-3 cursor-pointer"
          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">{task.title}</p>
              <p className="text-xs text-blue-200 mt-1">{task.project?.name}</p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                {task.dueDate && (
                  <span className="text-blue-300/70">
                    {format(new Date(task.dueDate), 'd MMM', { locale: fr })}
                  </span>
                )}
                {task.priority === 'Haute' && (
                  <span className="px-1.5 py-0.5 bg-red-500/30 text-red-300 rounded">
                    Priorité haute
                  </span>
                )}
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0">
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Contenu extensible */}
        {isExpanded && (
          <div className="border-t border-blue-400/10 p-3 space-y-3">
            {/* Tâche */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="text-amber-400 font-semibold text-sm min-w-[100px]">📝 Tâche:</span>
              <span className="text-white text-sm break-words flex-1">{task.title}</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); openEditModal(task, 'title'); }}
                className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors self-start"
                title="Modifier la tâche"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Projet */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="text-blue-400 font-semibold text-sm min-w-[100px]">📁 Projet:</span>
              <span className="text-blue-200 text-sm break-words">{task.project?.name || 'Sans projet'}</span>
            </div>

            {/* Description */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="text-gray-400 font-semibold text-sm min-w-[100px]">📄 Description:</span>
              <span className="text-gray-300 text-sm break-words flex-1">{task.description || <span className="text-gray-500 italic">Non renseignée</span>}</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); openEditModal(task, 'description'); }}
                className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-500/20 rounded transition-colors self-start"
                title="Modifier la description"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Objectifs */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="text-green-400 font-semibold text-sm min-w-[100px]">🎯 Objectif:</span>
              <span className="text-green-200 text-sm break-words flex-1">{task.objectives || <span className="text-gray-500 italic">Non renseigné</span>}</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); openEditModal(task, 'objectives'); }}
                className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors self-start"
                title="Modifier l'objectif"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Contraintes */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="text-orange-400 font-semibold text-sm min-w-[100px]">⚠️ Contraintes:</span>
              <span className="text-orange-200 text-sm break-words flex-1">{task.constraints || <span className="text-gray-500 italic">Non renseignées</span>}</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); openEditModal(task, 'constraints'); }}
                className="p-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded transition-colors self-start"
                title="Modifier les contraintes"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Solution proposée */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="text-emerald-400 font-semibold text-sm min-w-[100px]">💡 Solution:</span>
              <span className="text-emerald-200 text-sm break-words flex-1">{task.solutionProposed || <span className="text-gray-500 italic">Non renseignée</span>}</span>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); openEditModal(task, 'solutionProposed'); }}
                className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded transition-colors self-start"
                title="Modifier la solution"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {/* Bouton pour voir le projet */}
            <div className="pt-2 border-t border-blue-400/10">
              <Button 
                size="sm" 
                onClick={() => onTaskClick(task.projectId)}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs"
              >
                Voir le projet
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Mes tâches</h1>
        <p className="text-blue-200 mt-1">Gérez et suivez toutes vos tâches</p>
      </div>

      {/* Stats par statut */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          return (
            <div key={status} className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${config.bg} rounded-lg shadow-lg`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{config.count}</p>
                  <p className="text-sm text-blue-200">{status}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Liste des tâches par colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
          const config = statusConfig[status as keyof typeof statusConfig]
          const Icon = config.icon
          
          return (
            <div key={status} className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
              <div className={`flex items-center gap-2 p-3 border-b border-blue-400/20 ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
                <h3 className="font-medium text-white">{status}</h3>
                <span className="ml-auto text-sm text-blue-200">{statusTasks.length}</span>
              </div>
              <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                {statusTasks.length === 0 ? (
                  <p className="text-blue-300/50 text-sm text-center py-4">Aucune tâche</p>
                ) : (
                  statusTasks.map(renderTask)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dialog d'édition */}
      <Dialog open={!!editTaskModal} onOpenChange={(open) => { if (!open) setEditTaskModal(null) }}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-amber-400/30 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-300">
              <Pencil className="w-5 h-5" />
              {editTaskModal?.field === 'title' && 'Modifier la tâche'}
              {editTaskModal?.field === 'description' && 'Modifier la description'}
              {editTaskModal?.field === 'objectives' && 'Modifier l\'objectif'}
              {editTaskModal?.field === 'constraints' && 'Modifier les contraintes'}
              {editTaskModal?.field === 'solutionProposed' && 'Modifier la solution'}
            </DialogTitle>
          </DialogHeader>
          {editTaskModal && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {editTaskModal.field === 'title' && '📝 Titre de la tâche'}
                  {editTaskModal.field === 'description' && '📄 Description de la tâche'}
                  {editTaskModal.field === 'objectives' && '🎯 Objectifs de la tâche'}
                  {editTaskModal.field === 'constraints' && '⚠️ Contraintes'}
                  {editTaskModal.field === 'solutionProposed' && '💡 Solution proposée'}
                </label>
                {editTaskModal.field === 'title' ? (
                  <Input 
                    value={editTaskModal.value} 
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, value: e.target.value })} 
                    placeholder="Ex: Développer la page de connexion" 
                    className="bg-[#0f1c2e] border-amber-400/30 text-white" 
                    autoFocus
                  />
                ) : (
                  <textarea 
                    value={editTaskModal.value} 
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, value: e.target.value })} 
                    placeholder={
                      editTaskModal.field === 'description' ? "Décrivez la tâche en détail..." : 
                      editTaskModal.field === 'objectives' ? "Quels sont les objectifs de cette tâche ?" :
                      editTaskModal.field === 'constraints' ? "Ex: Délai serré, ressources limitées..." :
                      "Ex: Utiliser une approche agile, assigner plus de ressources..."
                    }
                    className={`w-full bg-[#0f1c2e] border rounded-md px-3 py-2 text-white min-h-[120px] ${
                      editTaskModal.field === 'description' ? 'border-blue-400/30' : 
                      editTaskModal.field === 'objectives' ? 'border-green-400/30' :
                      editTaskModal.field === 'constraints' ? 'border-orange-400/30' :
                      'border-emerald-400/30'
                    }`}
                    autoFocus
                  />
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button type="button" onClick={handleEditTask} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditTaskModal(null)} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
