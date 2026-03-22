'use client'

import { useState } from 'react'
import {
  X,
  FolderOpen,
  Calendar,
  User,
  Wallet,
  Target,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  FileText,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import { Folder } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface ProjectFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  folders: Folder[]
}

interface TaskFormData {
  title: string
  description: string
  status: string
  priority: string
  estimatedTime: number
  dueDate: string
  assigneeName: string
  objectives: string
  constraints: string
  solutionProposed: string
  subTasks: { title: string; isCompleted: boolean }[]
  risks: { title: string; severity: string; probability: string; description: string; mitigation: string }[]
  comments: { content: string; authorName: string }[]
}

interface ProjectFormData {
  name: string
  description: string
  status: string
  budgetPlanned: number
  responsibleName: string
  folderId: string
  startDate: string
  endDate: string
  tasks: TaskFormData[]
}

const statusOptions = [
  { value: 'En cours', label: 'En cours' },
  { value: 'Actif', label: 'Actif' },
  { value: 'Terminé', label: 'Terminé' },
  { value: 'Archivé', label: 'Archivé' }
]

const taskStatusOptions = ['À faire', 'En cours', 'En retard', 'Validé']
const priorityOptions = ['Basse', 'Moyenne', 'Haute', 'Urgente']
const severityOptions = ['Basse', 'Moyenne', 'Haute', 'Critique']
const probabilityOptions = ['Basse', 'Moyenne', 'Haute']

const emptyTask: TaskFormData = {
  title: '',
  description: '',
  status: 'À faire',
  priority: 'Moyenne',
  estimatedTime: 0,
  dueDate: '',
  assigneeName: '',
  objectives: '',
  constraints: '',
  solutionProposed: '',
  subTasks: [],
  risks: [],
  comments: []
}

export function ProjectFormModal({ isOpen, onClose, onSave, folders }: ProjectFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [expandedTaskIndex, setExpandedTaskIndex] = useState<number | null>(null)
  const [activeTaskTab, setActiveTaskTab] = useState<'details' | 'risks' | 'comments'>('details')
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'En cours',
    budgetPlanned: 0,
    responsibleName: '',
    folderId: '',
    startDate: '',
    endDate: '',
    tasks: []
  })

  // Handle project field changes
  const handleChange = (field: keyof ProjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Add a new task
  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...emptyTask }]
    }))
    setExpandedTaskIndex(formData.tasks.length)
    setActiveTaskTab('details')
  }

  // Remove a task
  const removeTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }))
    if (expandedTaskIndex === index) setExpandedTaskIndex(null)
  }

  // Update task field
  const updateTask = (index: number, field: keyof TaskFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    }))
  }

  // Add subtask to a task
  const addSubTask = (taskIndex: number, title: string) => {
    if (title.trim()) {
      setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.map((task, i) => 
          i === taskIndex ? { 
            ...task, 
            subTasks: [...task.subTasks, { title: title.trim(), isCompleted: false }] 
          } : task
        )
      }))
    }
  }

  // Remove subtask
  const removeSubTask = (taskIndex: number, subTaskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex ? { 
          ...task, 
          subTasks: task.subTasks.filter((_, j) => j !== subTaskIndex) 
        } : task
      )
    }))
  }

  // Add risk to a task
  const addRisk = (taskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex ? { 
          ...task, 
          risks: [...task.risks, { title: '', severity: 'Moyenne', probability: 'Moyenne', description: '', mitigation: '' }] 
        } : task
      )
    }))
  }

  // Update risk
  const updateRisk = (taskIndex: number, riskIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex ? { 
          ...task, 
          risks: task.risks.map((risk, j) => 
            j === riskIndex ? { ...risk, [field]: value } : risk
          )
        } : task
      )
    }))
  }

  // Remove risk
  const removeRisk = (taskIndex: number, riskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex ? { 
          ...task, 
          risks: task.risks.filter((_, j) => j !== riskIndex) 
        } : task
      )
    }))
  }

  // Add comment to a task
  const addComment = (taskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex ? { 
          ...task, 
          comments: [...task.comments, { content: '', authorName: 'Utilisateur' }] 
        } : task
      )
    }))
  }

  // Update comment
  const updateComment = (taskIndex: number, commentIndex: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex ? { 
          ...task, 
          comments: task.comments.map((comment, j) => 
            j === commentIndex ? { ...comment, [field]: value } : comment
          )
        } : task
      )
    }))
  }

  // Remove comment
  const removeComment = (taskIndex: number, commentIndex: number) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === taskIndex ? { 
          ...task, 
          comments: task.comments.filter((_, j) => j !== commentIndex) 
        } : task
      )
    }))
  }

  // Submit form
  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Create project first
      const projectResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || 'Nouveau projet',
          description: formData.description || null,
          status: formData.status,
          budgetPlanned: formData.budgetPlanned || 0,
          responsibleName: formData.responsibleName || null,
          folderId: formData.folderId || null,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
        })
      })

      const projectData = await projectResponse.json()

      if (!projectData.success) {
        throw new Error(projectData.error)
      }

      const projectId = projectData.data.id

      // Create tasks for this project
      for (const task of formData.tasks) {
        const priorityScoreMap: Record<string, number> = {
          'Urgente': 100,
          'Haute': 75,
          'Moyenne': 50,
          'Basse': 25
        }

        const taskResponse = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title || 'Sans titre',
            description: task.description || null,
            status: task.status,
            priority: task.priority,
            priorityScore: priorityScoreMap[task.priority] || 50,
            estimatedTime: task.estimatedTime || 0,
            dueDate: task.dueDate || null,
            assigneeName: task.assigneeName || null,
            objectives: task.objectives || null,
            constraints: task.constraints || null,
            solutionProposed: task.solutionProposed || null,
            projectId,
            subTasks: task.subTasks,
            risks: task.risks,
            comments: task.comments
          })
        })

        if (!taskResponse.ok) {
          console.error('Error creating task:', task.title)
        }
      }

      toast({
        title: '✅ Projet créé',
        description: `Le projet "${formData.name}" a été créé avec ${formData.tasks.length} tâche(s)`
      })
      
      onSave()
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'En cours',
        budgetPlanned: 0,
        responsibleName: '',
        folderId: '',
        startDate: '',
        endDate: '',
        tasks: []
      })
    } catch (error) {
      console.error('Error saving project:', error)
      toast({
        title: '❌ Erreur',
        description: 'Impossible de créer le projet',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-400/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <FolderOpen className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Nouveau projet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 space-y-6">
          {/* Project Info */}
          <div className="bg-[#0f1c2e]/50 rounded-xl p-4 border border-blue-400/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              Informations du projet
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-blue-300 block mb-1">Nom du projet</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Nom du projet (optionnel)"
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-blue-300 block mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400/50 focus:outline-none"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-blue-300 block mb-1">Dossier</label>
                <select
                  value={formData.folderId}
                  onChange={(e) => handleChange('folderId', e.target.value)}
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400/50 focus:outline-none"
                >
                  <option value="">Aucun dossier</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm text-blue-300 block mb-1 flex items-center gap-2">
                  <User className="w-3 h-3" /> Responsable
                </label>
                <input
                  type="text"
                  value={formData.responsibleName}
                  onChange={(e) => handleChange('responsibleName', e.target.value)}
                  placeholder="Nom du responsable"
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-blue-300 block mb-1 flex items-center gap-2">
                  <Wallet className="w-3 h-3" /> Budget prévu (CFA)
                </label>
                <input
                  type="number"
                  value={formData.budgetPlanned}
                  onChange={(e) => handleChange('budgetPlanned', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-blue-300 block mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date de début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400/50 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-blue-300 block mb-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white focus:border-amber-400/50 focus:outline-none"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm text-blue-300 block mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Description du projet..."
                  rows={2}
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-4 py-2 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-[#0f1c2e]/50 rounded-xl p-4 border border-blue-400/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Tâches du projet ({formData.tasks.length})
              </h3>
              <Button
                type="button"
                onClick={addTask}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une tâche
              </Button>
            </div>

            {formData.tasks.length === 0 ? (
              <p className="text-blue-300/50 text-center py-8">
                Aucune tâche. Cliquez sur "Ajouter une tâche" pour commencer.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="bg-[#1a2744] rounded-xl border border-blue-400/20 overflow-hidden">
                    {/* Task Header */}
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-blue-500/10"
                      onClick={() => setExpandedTaskIndex(expandedTaskIndex === taskIndex ? null : taskIndex)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-blue-300 text-sm font-medium">#{taskIndex + 1}</span>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateTask(taskIndex, 'title', e.target.value)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Titre de la tâche"
                          className="flex-1 bg-transparent text-white placeholder-blue-300/50 focus:outline-none"
                        />
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          task.status === 'Validé' ? 'bg-green-500/30 text-green-300' :
                          task.status === 'En cours' ? 'bg-blue-500/30 text-blue-300' :
                          task.status === 'En retard' ? 'bg-red-500/30 text-red-300' :
                          'bg-gray-500/30 text-gray-300'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.risks.length > 0 && (
                          <span className="text-xs text-orange-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {task.risks.length}
                          </span>
                        )}
                        {task.comments.length > 0 && (
                          <span className="text-xs text-blue-300 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {task.comments.length}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeTask(taskIndex)
                          }}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedTaskIndex === taskIndex ? (
                          <ChevronUp className="w-4 h-4 text-blue-300" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-blue-300" />
                        )}
                      </div>
                    </div>

                    {/* Task Content (Expanded) */}
                    {expandedTaskIndex === taskIndex && (
                      <div className="border-t border-blue-400/20">
                        {/* Task Tabs */}
                        <div className="flex border-b border-blue-400/10">
                          <button
                            onClick={() => setActiveTaskTab('details')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                              activeTaskTab === 'details' 
                                ? 'text-amber-300 border-b-2 border-amber-400' 
                                : 'text-blue-300 hover:text-amber-300'
                            }`}
                          >
                            <FileText className="w-3 h-3" />
                            Détails
                          </button>
                          <button
                            onClick={() => setActiveTaskTab('risks')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                              activeTaskTab === 'risks' 
                                ? 'text-amber-300 border-b-2 border-amber-400' 
                                : 'text-blue-300 hover:text-amber-300'
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Risques ({task.risks.length})
                          </button>
                          <button
                            onClick={() => setActiveTaskTab('comments')}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                              activeTaskTab === 'comments' 
                                ? 'text-amber-300 border-b-2 border-amber-400' 
                                : 'text-blue-300 hover:text-amber-300'
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            Commentaires ({task.comments.length})
                          </button>
                        </div>

                        <div className="p-4 space-y-4">
                          {activeTaskTab === 'details' && (
                            <>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs text-blue-300 block mb-1">Statut</label>
                                  <select
                                    value={task.status}
                                    onChange={(e) => updateTask(taskIndex, 'status', e.target.value)}
                                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                                  >
                                    {taskStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-blue-300 block mb-1">Priorité</label>
                                  <select
                                    value={task.priority}
                                    onChange={(e) => updateTask(taskIndex, 'priority', e.target.value)}
                                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                                  >
                                    {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-blue-300 block mb-1">Temps (min)</label>
                                  <input
                                    type="number"
                                    value={task.estimatedTime}
                                    onChange={(e) => updateTask(taskIndex, 'estimatedTime', parseInt(e.target.value) || 0)}
                                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-blue-300 block mb-1">Date limite</label>
                                  <input
                                    type="date"
                                    value={task.dueDate}
                                    onChange={(e) => updateTask(taskIndex, 'dueDate', e.target.value)}
                                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-blue-300 block mb-1">Assigné à</label>
                                  <input
                                    type="text"
                                    value={task.assigneeName}
                                    onChange={(e) => updateTask(taskIndex, 'assigneeName', e.target.value)}
                                    placeholder="Nom"
                                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-xs text-blue-300 block mb-1">Description</label>
                                <textarea
                                  value={task.description}
                                  onChange={(e) => updateTask(taskIndex, 'description', e.target.value)}
                                  placeholder="Description..."
                                  rows={2}
                                  className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none resize-none"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs text-blue-300 flex items-center gap-1 mb-1">
                                    <Target className="w-3 h-3 text-green-400" /> Objectifs
                                  </label>
                                  <textarea
                                    value={task.objectives}
                                    onChange={(e) => updateTask(taskIndex, 'objectives', e.target.value)}
                                    placeholder="Objectifs..."
                                    rows={2}
                                    className="w-full bg-[#0f1c2e] border border-green-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-green-400/50 focus:outline-none resize-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-blue-300 flex items-center gap-1 mb-1">
                                    <AlertTriangle className="w-3 h-3 text-orange-400" /> Contraintes
                                  </label>
                                  <textarea
                                    value={task.constraints}
                                    onChange={(e) => updateTask(taskIndex, 'constraints', e.target.value)}
                                    placeholder="Contraintes..."
                                    rows={2}
                                    className="w-full bg-[#0f1c2e] border border-orange-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-orange-400/50 focus:outline-none resize-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-blue-300 flex items-center gap-1 mb-1">
                                    <Target className="w-3 h-3 text-amber-400" /> Solution
                                  </label>
                                  <textarea
                                    value={task.solutionProposed}
                                    onChange={(e) => updateTask(taskIndex, 'solutionProposed', e.target.value)}
                                    placeholder="Solution proposée..."
                                    rows={2}
                                    className="w-full bg-[#0f1c2e] border border-amber-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none resize-none"
                                  />
                                </div>
                              </div>

                              {/* Sub-tasks */}
                              <div>
                                <label className="text-xs text-blue-300 block mb-2">Sous-tâches</label>
                                <div className="space-y-2">
                                  {task.subTasks.map((st, stIndex) => (
                                    <div key={stIndex} className="flex items-center gap-2 bg-[#0f1c2e] rounded-lg px-3 py-2">
                                      <span className="text-sm text-white flex-1">{st.title}</span>
                                      <button
                                        onClick={() => removeSubTask(taskIndex, stIndex)}
                                        className="p-1 text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Nouvelle sous-tâche..."
                                      className="flex-1 bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          addSubTask(taskIndex, (e.target as HTMLInputElement).value)
                                          ;(e.target as HTMLInputElement).value = ''
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {activeTaskTab === 'risks' && (
                            <div className="space-y-3">
                              <Button
                                type="button"
                                onClick={() => addRisk(taskIndex)}
                                variant="outline"
                                size="sm"
                                className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Ajouter un risque
                              </Button>

                              {task.risks.length === 0 ? (
                                <p className="text-blue-300/50 text-center py-4 text-sm">Aucun risque</p>
                              ) : (
                                <div className="space-y-2">
                                  {task.risks.map((risk, riskIndex) => (
                                    <div key={riskIndex} className="bg-[#0f1c2e] rounded-lg p-3 space-y-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={risk.title}
                                          onChange={(e) => updateRisk(taskIndex, riskIndex, 'title', e.target.value)}
                                          placeholder="Titre du risque"
                                          className="flex-1 bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-1 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                                        />
                                        <select
                                          value={risk.severity}
                                          onChange={(e) => updateRisk(taskIndex, riskIndex, 'severity', e.target.value)}
                                          className="bg-[#1a2744] border border-blue-400/30 rounded-lg px-2 py-1 text-white text-sm"
                                        >
                                          {severityOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <select
                                          value={risk.probability}
                                          onChange={(e) => updateRisk(taskIndex, riskIndex, 'probability', e.target.value)}
                                          className="bg-[#1a2744] border border-blue-400/30 rounded-lg px-2 py-1 text-white text-sm"
                                        >
                                          {probabilityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <button
                                          onClick={() => removeRisk(taskIndex, riskIndex)}
                                          className="p-1 text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={risk.mitigation}
                                          onChange={(e) => updateRisk(taskIndex, riskIndex, 'mitigation', e.target.value)}
                                          placeholder="Plan d'atténuation..."
                                          className="flex-1 bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-1 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activeTaskTab === 'comments' && (
                            <div className="space-y-3">
                              <Button
                                type="button"
                                onClick={() => addComment(taskIndex)}
                                variant="outline"
                                size="sm"
                                className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Ajouter un commentaire
                              </Button>

                              {task.comments.length === 0 ? (
                                <p className="text-blue-300/50 text-center py-4 text-sm">Aucun commentaire</p>
                              ) : (
                                <div className="space-y-2">
                                  {task.comments.map((comment, commentIndex) => (
                                    <div key={commentIndex} className="bg-[#0f1c2e] rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs">
                                          {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <input
                                          type="text"
                                          value={comment.authorName}
                                          onChange={(e) => updateComment(taskIndex, commentIndex, 'authorName', e.target.value)}
                                          className="bg-transparent text-white text-sm font-medium focus:outline-none"
                                        />
                                        <button
                                          onClick={() => removeComment(taskIndex, commentIndex)}
                                          className="ml-auto p-1 text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <textarea
                                        value={comment.content}
                                        onChange={(e) => updateComment(taskIndex, commentIndex, 'content', e.target.value)}
                                        placeholder="Commentaire..."
                                        rows={2}
                                        className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none resize-none"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-blue-400/20 bg-[#0f1c2e]/50">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Créer le projet
          </Button>
        </div>
      </Card>
    </div>
  )
}
