'use client'

import { useState, useMemo } from 'react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  CheckCircle2, Circle, Clock, AlertTriangle, Calendar,
  ChevronDown, Play, ListTodo, Check, X, Loader2, DollarSign, Filter, User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Task, Project, Risk } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { CommentSection } from './CommentSection'

interface TodoItem {
  id: string
  projectId: string
  projectName: string
  taskId: string
  taskTitle: string
  taskDescription?: string | null
  status: 'Non démarré' | 'En cours' | 'Terminé'
  deadline?: Date | null
  responsibleName?: string | null
  constraints?: string | null
  solution?: string | null
  riskId?: string
  riskTitle?: string
  riskSeverity?: string
}

interface DailyTodoListProps {
  tasks: Task[]
  projects: Project[]
  risks: Risk[]
  onTaskUpdate?: () => void
}

type StatusFilter = 'Non démarré' | 'En cours' | 'Terminé'
type DateFilter = 'en-retard' | 'a-venir' | 'termine'

// Function to check if a task is late (only for tasks that haven't started)
const isTaskLate = (task: Task): boolean => {
  if (!task.dueDate) return false
  const dueDate = new Date(task.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  return dueDate < today && task.status === 'À faire'
}

export function DailyTodoList({ tasks, projects, risks, onTaskUpdate }: DailyTodoListProps) {
  const { toast } = useToast()
  
  // States
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterStatuses, setFilterStatuses] = useState<StatusFilter[]>([])
  const [filterDates, setFilterDates] = useState<DateFilter[]>([])
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null)
  const [expenseModal, setExpenseModal] = useState<TodoItem | null>(null)
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('Matériaux')
  const [expenseNote, setExpenseNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  
  // Reprogramming dialog state
  const [reprogramDialog, setReprogramDialog] = useState<{
    open: boolean
    todo: TodoItem | null
    newDate: string
    newStatus: string
    reason: string
  }>({
    open: false,
    todo: null,
    newDate: '',
    newStatus: '',
    reason: ''
  })

  // Convert tasks to todo items (include all tasks including completed)
  const todos = useMemo(() => {
    const projectMap = new Map(projects.map(p => [p.id, p.name]))
    const riskMap = new Map<string, Risk[]>()
    
    // Group risks by project
    risks.forEach(risk => {
      if (!riskMap.has(risk.projectId)) {
        riskMap.set(risk.projectId, [])
      }
      riskMap.get(risk.projectId)!.push(risk)
    })

    return tasks
      .filter(task => task.status !== 'Annulé')
      .map(task => {
        const projectRisks = riskMap.get(task.projectId) || []
        const activeRisk = projectRisks.find(r => r.status !== 'Résolu' && r.status !== 'Accepté')
        
        // Map task status to todo status (3 states)
        let todoStatus: 'Non démarré' | 'En cours' | 'Terminé' = 'Non démarré'
        if (task.status === 'En cours') {
          todoStatus = 'En cours'
        } else if (task.status === 'Validé') {
          todoStatus = 'Terminé'
        }
        // Note: 'En retard' et 'À faire' sont considérés comme 'Non démarré'
        
        return {
          id: `todo-${task.id}`,
          projectId: task.projectId,
          projectName: projectMap.get(task.projectId) || 'Sans projet',
          taskId: task.id,
          taskTitle: task.title,
          taskDescription: task.description,
          status: todoStatus,
          deadline: task.dueDate,
          responsibleName: task.assigneeName,
          constraints: task.constraints,
          solution: task.solutionProposed,
          riskId: activeRisk?.id,
          riskTitle: activeRisk?.title,
          riskSeverity: activeRisk?.severity
        } as TodoItem
      })
  }, [tasks, projects, risks])

  // Update task status
  const updateStatus = async (todo: TodoItem, newStatus: 'Non démarré' | 'En cours' | 'Terminé') => {
    setUpdatingTaskId(todo.taskId)
    try {
      // Map todo status back to task status
      let taskStatus = 'À faire'
      if (newStatus === 'En cours') {
        taskStatus = 'En cours'
      } else if (newStatus === 'Terminé') {
        taskStatus = 'Validé'
      }
      
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: todo.taskId, 
          status: taskStatus
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ 
          title: newStatus === 'Terminé' ? '✅ Tâche terminée !' : 
                newStatus === 'En cours' ? '▶ Tâche démarrée' : '⏸ Tâche réinitialisée'
        })
        if (onTaskUpdate) onTaskUpdate()
      } else {
        toast({ title: 'Erreur: ' + (data.error || 'Impossible de mettre à jour'), variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast({ title: 'Erreur de mise à jour', variant: 'destructive' })
    } finally {
      setUpdatingTaskId(null)
    }
  }

  // Handle reprogramming
  const handleReprogram = async () => {
    if (!reprogramDialog.todo || !reprogramDialog.newDate) {
      toast({ title: 'Veuillez sélectionner une nouvelle date', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reprogramDialog.todo.taskId,
          dueDate: reprogramDialog.newDate,
          status: reprogramDialog.newStatus === 'Non démarré' ? 'À faire' : 
                  reprogramDialog.newStatus === 'En cours' ? 'En cours' : 'À faire',
          notes: reprogramDialog.reason ? `Reprogrammation: ${reprogramDialog.reason}` : undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: '📅 Tâche reprogrammée' })
        setReprogramDialog({ open: false, todo: null, newDate: '', newStatus: '', reason: '' })
        if (onTaskUpdate) onTaskUpdate()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({ title: 'Erreur lors de la reprogrammation', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Add expense
  const addExpense = async () => {
    if (!expenseModal || !expenseAmount) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseNote || `Dépense pour: ${expenseModal.taskTitle}`,
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          projectId: expenseModal.projectId
        })
      })
      const data = await res.json()
      if (data.success) {
        setExpenseModal(null)
        setExpenseAmount('')
        setExpenseNote('')
        toast({ title: '💰 Dépense enregistrée', description: `${parseFloat(expenseAmount).toLocaleString()} FCFA` })
        if (onTaskUpdate) onTaskUpdate()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // Toggle status filter
  const toggleStatusFilter = (status: StatusFilter) => {
    setFilterStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status)
      } else {
        return [...prev, status]
      }
    })
  }

  // Toggle date filter
  const toggleDateFilter = (dateFilter: DateFilter) => {
    setFilterDates(prev => {
      if (prev.includes(dateFilter)) {
        return prev.filter(d => d !== dateFilter)
      } else {
        return [...prev, dateFilter]
      }
    })
  }

  // Organize todos by date
  const organizedTodos = useMemo(() => {
    const todayList: TodoItem[] = []
    const tomorrowList: TodoItem[] = []
    const upcomingList: TodoItem[] = []
    const overdueList: TodoItem[] = []
    const noDateList: TodoItem[] = []
    const completedList: TodoItem[] = []

    // Get completed task IDs
    const completedTaskIds = new Set(
      tasks.filter(t => t.status === 'Validé').map(t => t.id)
    )

    todos.forEach(todo => {
      // Check if task is completed
      if (completedTaskIds.has(todo.taskId)) {
        completedList.push(todo)
        return
      }
      
      if (!todo.deadline) {
        noDateList.push(todo)
        return
      }
      
      try {
        const deadlineDate = new Date(todo.deadline)
        if (isToday(deadlineDate)) {
          todayList.push(todo)
        } else if (isTomorrow(deadlineDate)) {
          tomorrowList.push(todo)
        } else if (isPast(deadlineDate)) {
          overdueList.push(todo)
        } else {
          upcomingList.push(todo)
        }
      } catch {
        noDateList.push(todo)
      }
    })

    // Sort by deadline
    const sortByDeadline = (a: TodoItem, b: TodoItem) => {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }

    return { 
      today: todayList.sort(sortByDeadline), 
      tomorrow: tomorrowList.sort(sortByDeadline), 
      upcoming: upcomingList.sort(sortByDeadline), 
      overdue: overdueList.sort(sortByDeadline), 
      noDate: noDateList,
      completed: completedList
    }
  }, [todos, tasks])

  // Apply filters
  const applyFilters = (todoList: TodoItem[], sectionType?: string) => {
    let filtered = todoList
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.projectId === filterProject)
    }
    if (filterStatuses.length > 0) {
      filtered = filtered.filter(t => filterStatuses.includes(t.status))
    }
    // Apply date filters only if some are selected
    if (filterDates.length > 0 && sectionType) {
      const sectionMatch: Record<string, DateFilter> = {
        'overdue': 'en-retard',
        'upcoming': 'a-venir',
        'completed': 'termine'
      }
      const filterKey = sectionMatch[sectionType]
      if (filterKey && !filterDates.includes(filterKey)) {
        return []
      }
    }
    return filtered
  }

  // Stats
  const stats = useMemo(() => ({
    total: todos.length,
    notStarted: todos.filter(t => t.status === 'Non démarré').length,
    inProgress: todos.filter(t => t.status === 'En cours').length,
    completed: tasks.filter(t => t.status === 'Validé').length,
    overdue: organizedTodos.overdue.length,
    upcoming: organizedTodos.upcoming.length,
    completedList: organizedTodos.completed.length
  }), [todos, tasks, organizedTodos])

  // Status config with 3 states
  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
    'Non démarré': { 
      icon: Circle, 
      color: 'text-gray-300', 
      bg: 'bg-gray-500/20', 
      border: 'border-gray-400',
      label: 'Non démarré' 
    },
    'En cours': { 
      icon: Play, 
      color: 'text-blue-300', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-400',
      label: 'En cours' 
    },
    'Terminé': { 
      icon: CheckCircle2, 
      color: 'text-green-300', 
      bg: 'bg-green-500/20', 
      border: 'border-green-400',
      label: 'Terminé' 
    }
  }

  // Render todo item
  const renderTodoItem = (todo: TodoItem, sectionType: string) => {
    const config = statusConfig[todo.status] || statusConfig['Non démarré']
    const isOverdue = sectionType === 'overdue' || (todo.deadline && (() => {
      try {
        return isPast(new Date(todo.deadline))
      } catch { return false }
    })())
    const isExpanded = expandedTodo === todo.id
    const isUpdating = updatingTaskId === todo.taskId

    return (
      <div 
        key={todo.id}
        className={`rounded-xl border transition-all ${
          isOverdue 
            ? 'bg-red-500/10 border-red-400/30' 
            : 'bg-[#1e3a5f]/50 border-blue-400/20'
        }`}
      >
        <div className="p-4">
          {/* Status selector - 3 buttons horizontal */}
          <div className="flex items-center gap-1 mb-3 p-1 bg-[#0f1c2e]/50 rounded-lg">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                updateStatus(todo, 'Non démarré')
              }}
              disabled={isUpdating}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                todo.status === 'Non démarré' 
                  ? 'bg-gray-500/30 text-white border border-gray-400/50' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-500/10'
              }`}
              title="Tâche non démarrée"
            >
              <Circle className="w-4 h-4" />
              Non démarré
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                updateStatus(todo, 'En cours')
              }}
              disabled={isUpdating}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                todo.status === 'En cours' 
                  ? 'bg-blue-500/30 text-white border border-blue-400/50' 
                  : 'text-gray-400 hover:text-blue-300 hover:bg-blue-500/10'
              }`}
              title="Tâche en cours (a démarré, pas finie)"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              En cours
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                updateStatus(todo, 'Terminé')
              }}
              disabled={isUpdating}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                todo.status === 'Terminé' 
                  ? 'bg-green-500/30 text-white border border-green-400/50' 
                  : 'text-gray-400 hover:text-green-300 hover:bg-green-500/10'
              }`}
              title="Tâche terminée"
            >
              <CheckCircle2 className="w-4 h-4" />
              Terminé
            </button>
          </div>

          {/* Task content */}
          <div className="flex items-start gap-3">
            {/* Task info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-medium ${todo.status === 'Terminé' ? 'line-through text-gray-400' : 'text-white'}`}>
                  {todo.taskTitle}
                </h3>
                <button
                  onClick={() => setExpandedTodo(isExpanded ? null : todo.id)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Quick info row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-blue-400/30 text-blue-200">
                  {todo.projectName}
                </Badge>
                {todo.deadline && (
                  <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                    <Clock className="w-3 h-3" />
                    {(() => {
                      try {
                        const d = new Date(todo.deadline)
                        return isToday(d) ? "Aujourd'hui" :
                               isTomorrow(d) ? "Demain" :
                               format(d, 'd MMM yyyy', { locale: fr })
                      } catch { return '-' }
                    })()}
                  </span>
                )}
                {todo.responsibleName && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {todo.responsibleName}
                  </span>
                )}
                {todo.riskSeverity && (
                  <span className={`text-xs flex items-center gap-1 ${
                    todo.riskSeverity === 'Critique' ? 'text-red-400' :
                    todo.riskSeverity === 'Haute' ? 'text-orange-400' : 'text-yellow-400'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                    {todo.riskTitle}
                  </span>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-4 space-y-3 border-t border-blue-400/10 pt-4">
                  {todo.taskDescription && (
                    <p className="text-sm text-gray-300">{todo.taskDescription}</p>
                  )}
                  {todo.constraints && (
                    <div className="p-2.5 bg-orange-500/10 rounded-lg border border-orange-400/20">
                      <p className="text-xs text-orange-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Contrainte: {todo.constraints}
                      </p>
                    </div>
                  )}
                  {todo.solution && (
                    <div className="p-2.5 bg-green-500/10 rounded-lg border border-green-400/20">
                      <p className="text-xs text-green-300">
                        💡 Solution: {todo.solution}
                      </p>
                    </div>
                  )}
                  
                  {/* Action buttons for overdue tasks */}
                  {isOverdue && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReprogramDialog({
                          open: true,
                          todo,
                          newDate: todo.deadline ? format(new Date(todo.deadline), 'yyyy-MM-dd') : '',
                          newStatus: 'Non démarré',
                          reason: ''
                        })
                      }}
                      className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Reprogrammer
                    </Button>
                  )}
                  
                  {todo.status !== 'Terminé' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpenseModal(todo)}
                      className="border-amber-400/30 text-amber-300 hover:bg-amber-500/20"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Ajouter une dépense
                    </Button>
                  )}
                  
                  {/* Comment section */}
                  <CommentSection taskId={todo.taskId} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render section
  const renderSection = (title: string, icon: React.ReactNode, items: TodoItem[], titleColor: string, sectionType?: string) => {
    const filtered = applyFilters(items, sectionType)
    if (filtered.length === 0) return null

    return (
      <div className="space-y-3">
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${titleColor}`}>
          {icon}
          {title}
          <Badge variant="outline" className="ml-2 bg-transparent">{filtered.length}</Badge>
        </h2>
        <div className="space-y-2">
          {filtered.map(todo => renderTodoItem(todo, sectionType || title.toLowerCase().split(' ')[0]))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ListTodo className="w-6 h-6 text-amber-400" />
          TODO List
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {format(new Date(), "'Le' d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-[#1e3a5f]/30 rounded-lg border border-amber-400/20">
        <p className="text-amber-300 font-medium mb-2">📋 Comment utiliser la TODO List :</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-start gap-2 p-2 bg-gray-500/10 rounded-lg border border-gray-400/20">
            <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Non démarré</p>
              <p className="text-gray-400 text-xs">La tâche n'a pas encore commencé (par défaut)</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-400/20">
            <Play className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">En cours</p>
              <p className="text-gray-400 text-xs">La tâche a démarré mais n'est pas finie</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg border border-green-400/20">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Terminé</p>
              <p className="text-gray-400 text-xs">La tâche est complètement finie</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Circle className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Non démarré</p>
                <p className="text-xl font-bold text-white">{stats.notStarted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Play className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">En cours</p>
                <p className="text-xl font-bold text-white">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e3a5f]/30 border-green-400/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Terminé</p>
                <p className="text-xl font-bold text-white">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e3a5f]/30 border-red-400/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-red-300 text-xs">En retard</p>
                <p className="text-xl font-bold text-red-400">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e3a5f]/30 border-amber-400/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <ListTodo className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total à faire</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-start gap-4 p-4 bg-[#1e3a5f]/30 rounded-xl border border-blue-400/20">
        <Filter className="w-4 h-4 text-gray-400 mt-2" />
        
        {/* Project filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Projet</label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-1.5 text-white text-sm min-w-[180px]"
          >
            <option value="all">Tous les projets</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        
        <div className="h-10 w-px bg-blue-400/20 hidden sm:block" />
        
        {/* Multi-select Status filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">Statut (multi-sélection)</label>
          <div className="flex flex-wrap gap-2">
            {/* Non démarré */}
            <button
              onClick={() => toggleStatusFilter('Non démarré')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${
                filterStatuses.includes('Non démarré') 
                  ? 'bg-gray-500/30 border-gray-400 text-white' 
                  : 'bg-[#0f1c2e] border-blue-400/30 text-gray-400 hover:border-gray-400/50'
              }`}
            >
              <Circle className="w-4 h-4" />
              Non démarré
              {filterStatuses.includes('Non démarré') && <Check className="w-3 h-3 text-green-400" />}
            </button>
            
            {/* En cours */}
            <button
              onClick={() => toggleStatusFilter('En cours')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${
                filterStatuses.includes('En cours') 
                  ? 'bg-blue-500/30 border-blue-400 text-white' 
                  : 'bg-[#0f1c2e] border-blue-400/30 text-gray-400 hover:border-blue-400/50'
              }`}
            >
              <Play className="w-4 h-4" />
              En cours
              {filterStatuses.includes('En cours') && <Check className="w-3 h-3 text-green-400" />}
            </button>
            
            {/* Terminé */}
            <button
              onClick={() => toggleStatusFilter('Terminé')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${
                filterStatuses.includes('Terminé') 
                  ? 'bg-green-500/30 border-green-400 text-white' 
                  : 'bg-[#0f1c2e] border-blue-400/30 text-gray-400 hover:border-green-400/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Terminé
              {filterStatuses.includes('Terminé') && <Check className="w-3 h-3 text-green-400" />}
            </button>
            
            {/* Clear status filters button */}
            {filterStatuses.length > 0 && (
              <button
                onClick={() => setFilterStatuses([])}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-400/30 text-red-400 text-sm hover:bg-red-500/20 transition-all"
              >
                <X className="w-3 h-3" />
                Effacer
              </button>
            )}
          </div>
        </div>
        
        <div className="h-10 w-px bg-blue-400/20 hidden sm:block" />
        
        {/* Multi-select Date filter */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400">Par date (multi-sélection)</label>
          <div className="flex flex-wrap gap-2">
            {/* En retard */}
            <button
              onClick={() => toggleDateFilter('en-retard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${
                filterDates.includes('en-retard') 
                  ? 'bg-red-500/30 border-red-400 text-white' 
                  : 'bg-[#0f1c2e] border-blue-400/30 text-gray-400 hover:border-red-400/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              En retard
              {filterDates.includes('en-retard') && <Check className="w-3 h-3 text-green-400" />}
            </button>
            
            {/* À venir */}
            <button
              onClick={() => toggleDateFilter('a-venir')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${
                filterDates.includes('a-venir') 
                  ? 'bg-blue-500/30 border-blue-400 text-white' 
                  : 'bg-[#0f1c2e] border-blue-400/30 text-gray-400 hover:border-blue-400/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              À venir
              {filterDates.includes('a-venir') && <Check className="w-3 h-3 text-green-400" />}
            </button>
            
            {/* Terminé */}
            <button
              onClick={() => toggleDateFilter('termine')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all ${
                filterDates.includes('termine') 
                  ? 'bg-green-500/30 border-green-400 text-white' 
                  : 'bg-[#0f1c2e] border-blue-400/30 text-gray-400 hover:border-green-400/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Terminé
              {filterDates.includes('termine') && <Check className="w-3 h-3 text-green-400" />}
            </button>
            
            {/* Clear date filters button */}
            {filterDates.length > 0 && (
              <button
                onClick={() => setFilterDates([])}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-400/30 text-red-400 text-sm hover:bg-red-500/20 transition-all"
              >
                <X className="w-3 h-3" />
                Effacer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Todo Lists */}
      {todos.length === 0 ? (
        <div className="text-center py-12 bg-[#1e3a5f]/30 rounded-xl border border-dashed border-blue-400/30">
          <ListTodo className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Aucune tâche à afficher</p>
          <p className="text-gray-500 text-sm mt-2">Toutes les tâches sont terminées ou annulées</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overdue */}
          {renderSection(
            "⚠️ En retard",
            <AlertTriangle className="w-5 h-5 text-red-400" />,
            organizedTodos.overdue,
            "text-red-400",
            "overdue"
          )}

          {/* Today */}
          {renderSection(
            "🔴 Aujourd'hui",
            <Calendar className="w-5 h-5 text-red-400" />,
            organizedTodos.today,
            "text-red-400"
          )}

          {/* Tomorrow */}
          {renderSection(
            "🟠 Demain",
            <Calendar className="w-5 h-5 text-orange-400" />,
            organizedTodos.tomorrow,
            "text-orange-400"
          )}

          {/* Upcoming */}
          {renderSection(
            "📅 À venir",
            <Calendar className="w-5 h-5 text-blue-400" />,
            organizedTodos.upcoming,
            "text-blue-400",
            "upcoming"
          )}

          {/* No date */}
          {renderSection(
            "📌 Sans date limite",
            <Calendar className="w-5 h-5 text-gray-400" />,
            organizedTodos.noDate,
            "text-gray-400"
          )}

          {/* Completed */}
          {renderSection(
            "✅ Terminé",
            <CheckCircle2 className="w-5 h-5 text-green-400" />,
            organizedTodos.completed,
            "text-green-400",
            "completed"
          )}
        </div>
      )}

      {/* Reprogramming Dialog */}
      <Dialog open={reprogramDialog.open} onOpenChange={(open) => 
        setReprogramDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-amber-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-300">
              <Calendar className="w-5 h-5" />
              Reprogrammer la tâche
            </DialogTitle>
          </DialogHeader>
          
          {reprogramDialog.todo && (
            <div className="space-y-4 py-4">
              <p className="text-gray-300 text-sm">
                Tâche: <span className="text-white font-medium">{reprogramDialog.todo.taskTitle}</span>
              </p>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nouvelle date limite *</label>
                <Input
                  type="date"
                  value={reprogramDialog.newDate}
                  onChange={(e) => setReprogramDialog(prev => ({ ...prev, newDate: e.target.value }))}
                  className="bg-[#0f1c2e] border-blue-400/30 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nouveau statut</label>
                <select
                  value={reprogramDialog.newStatus}
                  onChange={(e) => setReprogramDialog(prev => ({ ...prev, newStatus: e.target.value }))}
                  className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-2 text-white"
                >
                  <option value="Non démarré">Non démarré</option>
                  <option value="En cours">En cours</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Raison du changement (optionnel)</label>
                <Input
                  value={reprogramDialog.reason}
                  onChange={(e) => setReprogramDialog(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Ex: Retard de livraison des matériaux"
                  className="bg-[#0f1c2e] border-blue-400/30 text-white"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReprogramDialog({ open: false, todo: null, newDate: '', newStatus: '', reason: '' })}
              className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20"
            >
              Annuler
            </Button>
            <Button
              onClick={handleReprogram}
              disabled={saving || !reprogramDialog.newDate}
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Modal */}
      {expenseModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] rounded-xl border border-amber-400/30 p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Enregistrer une dépense
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Tâche: {expenseModal.taskTitle}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Montant (FCFA) *</label>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Ex: 50000"
                  className="bg-[#0f1c2e] border-blue-400/30 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Catégorie</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-2 text-white"
                >
                  <option value="Matériaux">Matériaux</option>
                  <option value="Main d'œuvre">Main d'œuvre</option>
                  <option value="Équipement">Équipement</option>
                  <option value="Transport">Transport</option>
                  <option value="Études">Études</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Note (optionnel)</label>
                <Input
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  placeholder="Détails sur la dépense"
                  className="bg-[#0f1c2e] border-blue-400/30 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={addExpense}
                disabled={saving || !expenseAmount}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer la dépense'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExpenseModal(null)
                  setExpenseAmount('')
                  setExpenseNote('')
                }}
                className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
