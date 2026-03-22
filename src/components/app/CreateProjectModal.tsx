'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, Minus, Loader2, Check, Sparkles, LayoutTemplate,
  ChevronRight, ChevronLeft, Target, AlertTriangle, Lightbulb,
  Clock, Calendar, DollarSign, Folder, Users, ListTodo,
  Trash2, CheckCircle2
} from 'lucide-react'
import { Folder as FolderType } from '@/types'
import { useToast } from '@/hooks/use-toast'

interface SubTaskInput {
  id: string
  title: string
  isCompleted: boolean
}

interface TaskInput {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  estimatedTime: number
  objectives: string
  constraints: string
  solutionProposed: string
  assigneeName: string
  subTasks: SubTaskInput[]
}

interface RiskInput {
  id: string
  title: string
  description: string
  severity: string
  probability: string
  mitigation: string
}

interface ProjectTemplate {
  id: string
  name: string
  description: string | null
  defaultBudget: number
  taskTemplates: { id: string; title: string; defaultPriority: string; estimatedDays: number }[]
}

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  folders: FolderType[]
  selectedFolderId: string | null
  onProjectCreated: () => void
}

type Step = 'project' | 'tasks' | 'risks' | 'summary'

const priorityOptions = ['Basse', 'Moyenne', 'Haute', 'Urgente']
const statusOptions = ['À faire', 'En cours', 'En retard', 'Validé']
const severityOptions = ['Basse', 'Moyenne', 'Haute', 'Critique']
const probabilityOptions = ['Basse', 'Moyenne', 'Haute']

export function CreateProjectModal({ 
  open, 
  onClose, 
  folders, 
  selectedFolderId,
  onProjectCreated 
}: CreateProjectModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState<Step>('project')
  
  // Project state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [objectives, setObjectives] = useState('')
  const [constraints, setConstraints] = useState('')
  const [budgetPlanned, setBudgetPlanned] = useState('')
  const [folderId, setFolderId] = useState(selectedFolderId || '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Tasks state
  const [tasks, setTasks] = useState<TaskInput[]>([])

  // Risks state
  const [risks, setRisks] = useState<RiskInput[]>([])

  // Load templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/templates')
        const data = await res.json()
        if (data.success) {
          setTemplates(data.data)
        }
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setTemplatesLoading(false)
      }
    }
    
    if (open) {
      fetchTemplates()
    }
  }, [open])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setObjectives('')
      setConstraints('')
      setBudgetPlanned('')
      setFolderId(selectedFolderId || '')
      setStartDate('')
      setEndDate('')
      setResponsibleName('')
      setSelectedTemplate(null)
      setTasks([])
      setRisks([])
      setCurrentStep('project')
    }
  }, [open, selectedFolderId])

  // Apply template
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        setDescription(template.description || '')
        setBudgetPlanned(template.defaultBudget.toString())
        const templateTasks: TaskInput[] = template.taskTemplates.map(tt => ({
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: tt.title,
          description: '',
          status: 'À faire',
          priority: tt.defaultPriority,
          dueDate: '',
          estimatedTime: tt.estimatedDays * 480,
          objectives: '',
          constraints: '',
          solutionProposed: '',
          assigneeName: '',
          subTasks: []
        }))
        setTasks(templateTasks)
      }
    }
  }, [selectedTemplate, templates])

  // Generate unique ID
  const generateId = () => `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Task management
  const addTask = () => {
    setTasks([...tasks, {
      id: generateId(),
      title: '',
      description: '',
      status: 'À faire',
      priority: 'Moyenne',
      dueDate: '',
      estimatedTime: 0,
      objectives: '',
      constraints: '',
      solutionProposed: '',
      assigneeName: '',
      subTasks: []
    }])
  }

  const removeTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const updateTask = (taskId: string, field: keyof TaskInput, value: unknown) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t))
  }

  // Sub-task management
  const addSubTask = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: [...t.subTasks, { id: generateId(), title: '', isCompleted: false }]
        }
      }
      return t
    }))
  }

  const removeSubTask = (taskId: string, subTaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.filter(st => st.id !== subTaskId)
        }
      }
      return t
    }))
  }

  const updateSubTask = (taskId: string, subTaskId: string, title: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, title } : st)
        }
      }
      return t
    }))
  }

  // Risk management
  const addRisk = () => {
    setRisks([...risks, {
      id: generateId(),
      title: '',
      description: '',
      severity: 'Moyenne',
      probability: 'Moyenne',
      mitigation: ''
    }])
  }

  const removeRisk = (riskId: string) => {
    setRisks(risks.filter(r => r.id !== riskId))
  }

  const updateRisk = (riskId: string, field: keyof RiskInput, value: unknown) => {
    setRisks(risks.map(r => r.id === riskId ? { ...r, [field]: value } : r))
  }

  // Validation
  const isProjectValid = name.trim().length > 0

  // Navigation - always allow to proceed
  const goNext = () => {
    if (currentStep === 'project') {
      if (!name.trim()) {
        toast({ title: 'Erreur', description: 'Le nom du projet est requis', variant: 'destructive' })
        return
      }
      setCurrentStep('tasks')
    } else if (currentStep === 'tasks') {
      setCurrentStep('risks')
    } else if (currentStep === 'risks') {
      setCurrentStep('summary')
    }
  }

  const goPrev = () => {
    if (currentStep === 'tasks') setCurrentStep('project')
    else if (currentStep === 'risks') setCurrentStep('tasks')
    else if (currentStep === 'summary') setCurrentStep('risks')
  }

  // Submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: 'Erreur', description: 'Le nom du projet est requis', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      // Create project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description,
          objectives,
          constraints,
          budgetPlanned: parseFloat(budgetPlanned) || 0,
          folderId: folderId || null,
          templateId: selectedTemplate,
          startDate: startDate || null,
          endDate: endDate || null,
          responsibleName: responsibleName || null
        })
      })

      const projectData = await projectRes.json()
      if (!projectData.success) throw new Error(projectData.error)

      const projectId = projectData.data.id

      // Create tasks
      const validTasks = tasks.filter(t => t.title.trim())
      for (const task of validTasks) {
        const taskRes = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate || null,
            estimatedTime: task.estimatedTime,
            objectives: task.objectives,
            constraints: task.constraints,
            solutionProposed: task.solutionProposed,
            assigneeName: task.assigneeName || null
          })
        })
        const taskData = await taskRes.json()
        
        // Create sub-tasks
        if (taskData.success && task.subTasks.length > 0) {
          for (const subTask of task.subTasks) {
            if (subTask.title.trim()) {
              await fetch('/api/tasks/subtasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  taskId: taskData.data.id,
                  title: subTask.title,
                  isCompleted: false
                })
              })
            }
          }
        }
      }

      // Create risks
      const validRisks = risks.filter(r => r.title.trim())
      for (const risk of validRisks) {
        await fetch('/api/risks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            title: risk.title,
            description: risk.description,
            severity: risk.severity,
            probability: risk.probability,
            mitigation: risk.mitigation
          })
        })
      }

      toast({ 
        title: 'Projet créé', 
        description: `Le projet "${name}" a été créé avec ${validTasks.length} tâche(s) et ${validRisks.length} risque(s)` 
      })
      onProjectCreated()
      onClose()
    } catch (error) {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de créer le projet', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  // Step indicator
  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'project', label: 'Projet', icon: <Folder className="w-4 h-4" /> },
    { key: 'tasks', label: 'Tâches', icon: <ListTodo className="w-4 h-4" /> },
    { key: 'risks', label: 'Risques', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'summary', label: 'Résumé', icon: <Check className="w-4 h-4" /> }
  ]

  const currentStepIndex = steps.findIndex(s => s.key === currentStep)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-blue-400/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            Nouveau Projet Complet
          </DialogTitle>
          <DialogDescription className="text-blue-200">
            Créez un projet complet avec ses tâches et risques
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => {
                  // Only allow going back to previous steps
                  if (index <= currentStepIndex) {
                    setCurrentStep(step.key)
                  }
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  currentStep === step.key 
                    ? 'bg-amber-500 text-black font-bold cursor-pointer' 
                    : index < currentStepIndex
                      ? 'bg-green-500/30 text-green-300 cursor-pointer hover:bg-green-500/40'
                      : 'bg-[#1e3a5f]/50 text-gray-400 cursor-not-allowed'
                }`}
                disabled={index > currentStepIndex}
              >
                {step.icon}
                <span className="text-sm hidden sm:inline">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-500 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {/* STEP 1: Project details */}
          {currentStep === 'project' && (
            <div className="space-y-6">
              {/* Templates */}
              {!templatesLoading && templates.length > 0 && (
                <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-amber-400" />
                    Utiliser un template (optionnel)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setSelectedTemplate(null)
                        setTasks([])
                      }}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedTemplate === null 
                          ? 'border-amber-400 bg-amber-500/20' 
                          : 'border-blue-400/30 hover:border-blue-400/50 bg-[#0f1c2e]/50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="font-medium text-white text-sm">Projet vide</span>
                    </button>
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          selectedTemplate === template.id 
                            ? 'border-amber-400 bg-amber-500/20' 
                            : 'border-blue-400/30 hover:border-blue-400/50 bg-[#0f1c2e]/50'
                        }`}
                      >
                        <span className="font-medium text-white text-sm">{template.name}</span>
                        <p className="text-xs text-gray-400">{template.taskTemplates.length} tâches</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Project fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    Nom du projet *
                  </label>
                  <Input
                    placeholder="Ex: Construction pont Bakamo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-blue-200 mb-1">Description</label>
                  <Textarea
                    placeholder="Décrivez votre projet..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    <Target className="w-3 h-3 inline mr-1" />
                    Objectifs
                  </label>
                  <Textarea
                    placeholder="Objectifs du projet..."
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Contraintes
                  </label>
                  <Textarea
                    placeholder="Contraintes identifiées..."
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    <DollarSign className="w-3 h-3 inline mr-1" />
                    Budget prévu (CFA)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={budgetPlanned}
                    onChange={(e) => setBudgetPlanned(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    <Users className="w-3 h-3 inline mr-1" />
                    Responsable
                  </label>
                  <Input
                    placeholder="Nom du responsable"
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    <Folder className="w-3 h-3 inline mr-1" />
                    Dossier
                  </label>
                  <select
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="w-full p-2 rounded-md bg-[#0f1c2e] border border-blue-400/30 text-white"
                  >
                    <option value="">Aucun dossier</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Date de début
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Date de fin
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-[#0f1c2e] border-blue-400/30 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Tasks */}
          {currentStep === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-amber-400" />
                  Tâches du projet ({tasks.length})
                </h3>
                <Button
                  onClick={addTask}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter une tâche
                </Button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-[#1e3a5f]/30 rounded-xl border border-dashed border-blue-400/30">
                  <ListTodo className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Aucune tâche définie (optionnel)</p>
                  <Button
                    onClick={addTask}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une tâche
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {tasks.map((task, index) => (
                    <div key={task.id} className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="border-amber-400/30 text-amber-300">
                          Tâche {index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(task.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Titre de la tâche *"
                            value={task.title}
                            onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Statut</label>
                          <select
                            value={task.status}
                            onChange={(e) => updateTask(task.id, 'status', e.target.value)}
                            className="w-full p-2 rounded-md bg-[#0f1c2e] border border-blue-400/30 text-white text-sm"
                          >
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Priorité</label>
                          <select
                            value={task.priority}
                            onChange={(e) => updateTask(task.id, 'priority', e.target.value)}
                            className="w-full p-2 rounded-md bg-[#0f1c2e] border border-blue-400/30 text-white text-sm"
                          >
                            {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Échéance
                          </label>
                          <Input
                            type="date"
                            value={task.dueDate}
                            onChange={(e) => updateTask(task.id, 'dueDate', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Temps estimé (min)
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={task.estimatedTime}
                            onChange={(e) => updateTask(task.id, 'estimatedTime', parseInt(e.target.value) || 0)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Assigné à</label>
                          <Input
                            placeholder="Nom de l'assigné"
                            value={task.assigneeName}
                            onChange={(e) => updateTask(task.id, 'assigneeName', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Description</label>
                          <Input
                            placeholder="Description..."
                            value={task.description}
                            onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">
                            <Target className="w-3 h-3 inline mr-1" />
                            Objectifs
                          </label>
                          <Input
                            placeholder="Objectifs..."
                            value={task.objectives}
                            onChange={(e) => updateTask(task.id, 'objectives', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            Contraintes
                          </label>
                          <Input
                            placeholder="Contraintes..."
                            value={task.constraints}
                            onChange={(e) => updateTask(task.id, 'constraints', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            Solution proposée
                          </label>
                          <Input
                            placeholder="Solution..."
                            value={task.solutionProposed}
                            onChange={(e) => updateTask(task.id, 'solutionProposed', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>
                      </div>

                      {/* Sub-tasks */}
                      <div className="mt-4 pt-3 border-t border-blue-400/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-blue-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Sous-tâches ({task.subTasks.length})
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addSubTask(task.id)}
                            className="h-6 text-xs text-amber-300 hover:text-amber-200"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {task.subTasks.map(subTask => (
                            <div key={subTask.id} className="flex items-center gap-2">
                              <Checkbox className="border-blue-400" checked={false} />
                              <Input
                                placeholder="Sous-tâche..."
                                value={subTask.title}
                                onChange={(e) => updateSubTask(task.id, subTask.id, e.target.value)}
                                className="flex-1 h-7 bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubTask(task.id, subTask.id)}
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Risks */}
          {currentStep === 'risks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Risques du projet ({risks.length})
                </h3>
                <Button
                  onClick={addRisk}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter un risque
                </Button>
              </div>

              {risks.length === 0 ? (
                <div className="text-center py-12 bg-[#1e3a5f]/30 rounded-xl border border-dashed border-blue-400/30">
                  <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Aucun risque identifié (optionnel)</p>
                  <Button
                    onClick={addRisk}
                    className="bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un risque
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {risks.map((risk, index) => (
                    <div key={risk.id} className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="border-red-400/30 text-red-300">
                          Risque {index + 1}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRisk(risk.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Titre du risque *"
                            value={risk.title}
                            onChange={(e) => updateRisk(risk.id, 'title', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Sévérité</label>
                          <select
                            value={risk.severity}
                            onChange={(e) => updateRisk(risk.id, 'severity', e.target.value)}
                            className="w-full p-2 rounded-md bg-[#0f1c2e] border border-blue-400/30 text-white text-sm"
                          >
                            {severityOptions.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Probabilité</label>
                          <select
                            value={risk.probability}
                            onChange={(e) => updateRisk(risk.id, 'probability', e.target.value)}
                            className="w-full p-2 rounded-md bg-[#0f1c2e] border border-blue-400/30 text-white text-sm"
                          >
                            {probabilityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Description</label>
                          <Input
                            placeholder="Description..."
                            value={risk.description}
                            onChange={(e) => updateRisk(risk.id, 'description', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-blue-300 mb-1 block">Plan d'atténuation</label>
                          <Input
                            placeholder="Comment atténuer..."
                            value={risk.mitigation}
                            onChange={(e) => updateRisk(risk.id, 'mitigation', e.target.value)}
                            className="bg-[#0f1c2e] border-blue-400/30 text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Summary */}
          {currentStep === 'summary' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                Résumé du projet
              </h3>

              {/* Project summary */}
              <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
                <h4 className="text-lg font-bold text-white mb-2">{name || 'Sans nom'}</h4>
                {description && <p className="text-blue-200 text-sm mb-3">{description}</p>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Budget:</span>
                    <p className="text-amber-300 font-medium">{parseInt(budgetPlanned || '0').toLocaleString()} CFA</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Responsable:</span>
                    <p className="text-white">{responsibleName || 'Non défini'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Début:</span>
                    <p className="text-white">{startDate || 'Non défini'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Fin:</span>
                    <p className="text-white">{endDate || 'Non défini'}</p>
                  </div>
                </div>
              </div>

              {/* Tasks summary */}
              <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-amber-400" />
                  {tasks.filter(t => t.title.trim()).length} Tâche(s)
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tasks.filter(t => t.title.trim()).length === 0 ? (
                    <p className="text-gray-400 text-sm">Aucune tâche définie</p>
                  ) : (
                    tasks.filter(t => t.title.trim()).map((task, i) => (
                      <div key={task.id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{i + 1}. {task.title}</span>
                        <div className="flex items-center gap-2">
                          {task.subTasks.filter(st => st.title.trim()).length > 0 && (
                            <Badge variant="outline" className="text-xs border-blue-400/30 text-blue-200">
                              {task.subTasks.filter(st => st.title.trim()).length} ST
                            </Badge>
                          )}
                          <Badge className={`${
                            task.priority === 'Haute' || task.priority === 'Urgente' 
                              ? 'bg-red-500/30 text-red-300' 
                              : 'bg-blue-500/30 text-blue-300'
                          } border-0 text-xs`}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Risks summary */}
              <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {risks.filter(r => r.title.trim()).length} Risque(s)
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {risks.filter(r => r.title.trim()).length === 0 ? (
                    <p className="text-gray-400 text-sm">Aucun risque identifié</p>
                  ) : (
                    risks.filter(r => r.title.trim()).map((risk, i) => (
                      <div key={risk.id} className="flex items-center justify-between text-sm">
                        <span className="text-white">{i + 1}. {risk.title}</span>
                        <Badge className={`${
                          risk.severity === 'Critique' || risk.severity === 'Haute'
                            ? 'bg-red-500/30 text-red-300'
                            : risk.severity === 'Moyenne'
                              ? 'bg-orange-500/30 text-orange-300'
                              : 'bg-green-500/30 text-green-300'
                        } border-0 text-xs`}>
                          {risk.severity}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t border-blue-400/20 mt-6">
          <Button
            variant="outline"
            onClick={currentStep === 'project' ? onClose : goPrev}
            className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20"
          >
            {currentStep === 'project' ? 'Annuler' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </>
            )}
          </Button>

          {currentStep !== 'summary' ? (
            <Button
              onClick={goNext}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !isProjectValid}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Créer le projet
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
