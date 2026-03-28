'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  Flag,
  User,
  Target,
  AlertTriangle,
  Lightbulb,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  MessageSquare,
  Send
} from 'lucide-react'
import { Task, Project, SubTask, Risk, Comment } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  task?: Task | null
  projects: Project[]
  defaultProjectId?: string
}

interface TaskFormData {
  title: string
  description: string
  objectives: string
  constraints: string
  solutionProposed: string
  status: string
  priority: string
  estimatedTime: number
  dueDate: string
  projectId: string
  assigneeName: string
  subTasks: { id?: string; title: string; isCompleted: boolean; isNew: boolean }[]
  risks: { id?: string; title: string; severity: string; probability: string; description: string; mitigation: string; isNew: boolean }[]
  comments: { id?: string; content: string; authorName: string; isNew: boolean }[]
}

const statusOptions = [
  { value: 'À faire', label: 'À faire', color: 'bg-gray-500' },
  { value: 'En cours', label: 'En cours', color: 'bg-blue-500' },
  { value: 'En retard', label: 'En retard', color: 'bg-red-500' },
  { value: 'Validé', label: 'Validé', color: 'bg-green-500' }
]

const priorityOptions = [
  { value: 'Basse', label: 'Basse', color: 'bg-green-500', score: 25 },
  { value: 'Moyenne', label: 'Moyenne', color: 'bg-yellow-500', score: 50 },
  { value: 'Haute', label: 'Haute', color: 'bg-orange-500', score: 75 },
  { value: 'Urgente', label: 'Urgente', color: 'bg-red-500', score: 100 }
]

const severityOptions = ['Basse', 'Moyenne', 'Haute', 'Critique']
const probabilityOptions = ['Basse', 'Moyenne', 'Haute']

export function TaskFormModal({ isOpen, onClose, onSave, task, projects, defaultProjectId }: TaskFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showRisks, setShowRisks] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newSubTask, setNewSubTask] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'risks' | 'comments'>('details')
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    objectives: '',
    constraints: '',
    solutionProposed: '',
    status: 'À faire',
    priority: 'Moyenne',
    estimatedTime: 0,
    dueDate: '',
    projectId: '',
    assigneeName: '',
    subTasks: [],
    risks: [],
    comments: []
  })

  // Load existing risks and comments when editing
  useEffect(() => {
    if (task && isOpen) {
      // Load risks for this task
      const loadTaskData = async () => {
        try {
          const [risksRes, commentsRes] = await Promise.all([
            fetch(`/api/risks?taskId=${task.id}`),
            fetch(`/api/comments?taskId=${task.id}`)
          ])
          
          const risksData = await risksRes.json()
          const commentsData = await commentsRes.json()
          
          setFormData({
            title: task.title || '',
            description: task.description || '',
            objectives: task.objectives || '',
            constraints: task.constraints || '',
            solutionProposed: task.solutionProposed || '',
            status: task.status || 'À faire',
            priority: task.priority || 'Moyenne',
            estimatedTime: task.estimatedTime || 0,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
            projectId: task.projectId,
            assigneeName: task.assigneeName || '',
            subTasks: task.subTasks?.map(st => ({
              id: st.id,
              title: st.title,
              isCompleted: st.isCompleted,
              isNew: false
            })) || [],
            risks: risksData.success ? risksData.data.map((r: Risk) => ({
              id: r.id,
              title: r.title,
              severity: r.severity,
              probability: r.probability,
              description: r.description || '',
              mitigation: r.mitigation || '',
              isNew: false
            })) : [],
            comments: commentsData.success ? commentsData.data.map((c: Comment) => ({
              id: c.id,
              content: c.content,
              authorName: c.authorName,
              isNew: false
            })) : []
          })
        } catch (error) {
          console.error('Error loading task data:', error)
        }
      }
      
      loadTaskData()
      setShowAdvanced(!!(task.objectives || task.constraints || task.solutionProposed))
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        objectives: '',
        constraints: '',
        solutionProposed: '',
        status: 'À faire',
        priority: 'Moyenne',
        estimatedTime: 0,
        dueDate: '',
        projectId: defaultProjectId || projects[0]?.id || '',
        assigneeName: '',
        subTasks: [],
        risks: [],
        comments: []
      })
      setShowAdvanced(false)
    }
  }, [task, projects, defaultProjectId, isOpen])

  // Handle form field changes
  const handleChange = (field: keyof TaskFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Add subtask
  const addSubTask = () => {
    if (newSubTask.trim()) {
      setFormData(prev => ({
        ...prev,
        subTasks: [...prev.subTasks, { title: newSubTask.trim(), isCompleted: false, isNew: true }]
      }))
      setNewSubTask('')
    }
  }

  // Remove subtask
  const removeSubTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subTasks: prev.subTasks.filter((_, i) => i !== index)
    }))
  }

  // Toggle subtask completion
  const toggleSubTask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subTasks: prev.subTasks.map((st, i) => 
        i === index ? { ...st, isCompleted: !st.isCompleted } : st
      )
    }))
  }

  // Add risk
  const addRisk = () => {
    setFormData(prev => ({
      ...prev,
      risks: [...prev.risks, { 
        title: '', 
        severity: 'Moyenne', 
        probability: 'Moyenne', 
        description: '', 
        mitigation: '', 
        isNew: true 
      }]
    }))
  }

  // Update risk
  const updateRisk = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.map((r, i) => 
        i === index ? { ...r, [field]: value } : r
      )
    }))
  }

  // Remove risk
  const removeRisk = (index: number) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index)
    }))
  }

  // Add comment
  const addComment = () => {
    setFormData(prev => ({
      ...prev,
      comments: [...prev.comments, { content: '', authorName: 'Utilisateur', isNew: true }]
    }))
  }

  // Update comment
  const updateComment = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      comments: prev.comments.map((c, i) => 
        i === index ? { ...c, [field]: value } : c
      )
    }))
  }

  // Remove comment
  const removeComment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      comments: prev.comments.filter((_, i) => i !== index)
    }))
  }

  // Submit form
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const priorityData = priorityOptions.find(p => p.value === formData.priority)
      
      const payload = {
        title: formData.title || 'Sans titre',
        description: formData.description || null,
        objectives: formData.objectives || null,
        constraints: formData.constraints || null,
        solutionProposed: formData.solutionProposed || null,
        status: formData.status,
        priority: formData.priority,
        priorityScore: priorityData?.score || 50,
        estimatedTime: formData.estimatedTime || 0,
        dueDate: formData.dueDate || null,
        projectId: formData.projectId,
        assigneeName: formData.assigneeName || null,
        subTasks: formData.subTasks,
        risks: formData.risks.filter(r => r.title), // Only save risks with title
        comments: formData.comments.filter(c => c.content) // Only save comments with content
      }

      const url = task ? `/api/tasks/${task.id}` : '/api/tasks'
      const method = task ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: task ? '✅ Tâche modifiée' : '✅ Tâche créée',
          description: task ? 'Les modifications ont été enregistrées' : 'La nouvelle tâche a été créée'
        })
        onSave()
        onClose()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error saving task:', error)
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'enregistrer la tâche',
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
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-400/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-500/20 text-blue-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-blue-400/20">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details' 
                ? 'text-amber-300 border-b-2 border-amber-400' 
                : 'text-blue-300 hover:text-amber-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Détails
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'risks' 
                ? 'text-amber-300 border-b-2 border-amber-400' 
                : 'text-blue-300 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Risques ({formData.risks.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments' 
                ? 'text-amber-300 border-b-2 border-amber-400' 
                : 'text-blue-300 hover:text-amber-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Commentaires ({formData.comments.length})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-4 space-y-4">
          {activeTab === 'details' && (
            <>
              {/* Titre */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Titre de la tâche (optionnel)"
                  className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
              </div>

              {/* Projet et Statut */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200">Projet</label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => handleChange('projectId', e.target.value)}
                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none"
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-400" />
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priorité et Date limite */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Priorité
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {priorityOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange('priority', option.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          formData.priority === option.value
                            ? `${option.color} text-white`
                            : 'bg-[#0f1c2e] text-blue-300 border border-blue-400/30 hover:border-blue-400/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-200">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Décrivez la tâche..."
                  rows={3}
                  className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none resize-none"
                />
              </div>

              {/* Temps estimé et Assigné */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Temps estimé (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => handleChange('estimatedTime', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    Assigné à
                  </label>
                  <input
                    type="text"
                    value={formData.assigneeName}
                    onChange={(e) => handleChange('assigneeName', e.target.value)}
                    placeholder="Nom de la personne"
                    className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sous-tâches */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Sous-tâches
                </label>
                
                {formData.subTasks.length > 0 && (
                  <div className="space-y-2">
                    {formData.subTasks.map((subTask, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 bg-[#0f1c2e]/50 rounded-lg p-3"
                      >
                        <button
                          type="button"
                          onClick={() => toggleSubTask(index)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            subTask.isCompleted 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-blue-400/50 hover:border-amber-400/50'
                          }`}
                        >
                          {subTask.isCompleted && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`flex-1 text-sm ${subTask.isCompleted ? 'text-blue-300/50 line-through' : 'text-white'}`}>
                          {subTask.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSubTask(index)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubTask}
                    onChange={(e) => setNewSubTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubTask())}
                    placeholder="Ajouter une sous-tâche..."
                    className="flex-1 bg-[#0f1c2e] border border-blue-400/30 rounded-lg px-4 py-2 text-sm text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                  />
                  <Button
                    type="button"
                    onClick={addSubTask}
                    variant="outline"
                    className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Section avancée */}
              <div className="border-t border-blue-400/20 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-blue-300 hover:text-amber-300 transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Champs avancés (objectifs, contraintes, solution)
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-400" />
                        Objectifs
                      </label>
                      <textarea
                        value={formData.objectives}
                        onChange={(e) => handleChange('objectives', e.target.value)}
                        placeholder="Quels sont les objectifs de cette tâche ?"
                        rows={2}
                        className="w-full bg-[#0f1c2e] border border-green-400/30 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:border-green-400/50 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        Contraintes
                      </label>
                      <textarea
                        value={formData.constraints}
                        onChange={(e) => handleChange('constraints', e.target.value)}
                        placeholder="Quelles sont les contraintes à respecter ?"
                        rows={2}
                        className="w-full bg-[#0f1c2e] border border-orange-400/30 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:border-orange-400/50 focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-200 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        Solution proposée
                      </label>
                      <textarea
                        value={formData.solutionProposed}
                        onChange={(e) => handleChange('solutionProposed', e.target.value)}
                        placeholder="Proposition de solution ou approche..."
                        rows={2}
                        className="w-full bg-[#0f1c2e] border border-amber-400/30 rounded-lg px-4 py-3 text-white placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Risques identifiés</h3>
                <Button
                  type="button"
                  onClick={addRisk}
                  variant="outline"
                  className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un risque
                </Button>
              </div>

              {formData.risks.length === 0 ? (
                <p className="text-blue-300/50 text-center py-8">Aucun risque identifié pour cette tâche</p>
              ) : (
                <div className="space-y-3">
                  {formData.risks.map((risk, index) => (
                    <div key={index} className="bg-[#0f1c2e]/50 rounded-xl p-4 border border-blue-400/20">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          value={risk.title}
                          onChange={(e) => updateRisk(index, 'title', e.target.value)}
                          placeholder="Titre du risque"
                          className="bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <select
                            value={risk.severity}
                            onChange={(e) => updateRisk(index, 'severity', e.target.value)}
                            className="flex-1 bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                          >
                            {severityOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <select
                            value={risk.probability}
                            onChange={(e) => updateRisk(index, 'probability', e.target.value)}
                            className="flex-1 bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                          >
                            {probabilityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={risk.description}
                        onChange={(e) => updateRisk(index, 'description', e.target.value)}
                        placeholder="Description du risque..."
                        rows={2}
                        className="w-full bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none resize-none mb-3"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={risk.mitigation}
                          onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                          placeholder="Plan d'atténuation..."
                          className="flex-1 bg-[#1a2744] border border-blue-400/30 rounded-lg px-3 py-2 text-white text-sm placeholder-blue-300/50 focus:border-amber-400/50 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeRisk(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Commentaires</h3>
                <Button
                  type="button"
                  onClick={addComment}
                  variant="outline"
                  className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un commentaire
                </Button>
              </div>

              {formData.comments.length === 0 ? (
                <p className="text-blue-300/50 text-center py-8">Aucun commentaire sur cette tâche</p>
              ) : (
                <div className="space-y-3">
                  {formData.comments.map((comment, index) => (
                    <div key={index} className="bg-[#0f1c2e]/50 rounded-xl p-4 border border-blue-400/10">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={comment.authorName}
                            onChange={(e) => updateComment(index, 'authorName', e.target.value)}
                            placeholder="Auteur"
                            className="bg-transparent text-white text-sm font-medium focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeComment(index)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        value={comment.content}
                        onChange={(e) => updateComment(index, 'content', e.target.value)}
                        placeholder="Écrire un commentaire..."
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
            {task ? 'Enregistrer' : 'Créer la tâche'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
