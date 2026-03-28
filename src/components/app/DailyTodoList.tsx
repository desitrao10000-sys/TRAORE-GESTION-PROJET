'use client'

import { useState, useMemo, useEffect, useCallback, memo } from 'react'
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  CheckCircle2, Clock, AlertTriangle, Calendar,
  ChevronDown, Play, ListTodo, Check, X, Loader2, DollarSign, Filter, User, Wallet, Plus, FileText, Pencil, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Task, Project, Risk } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { CommentSection } from './CommentSection'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  taskId?: string | null
}

interface TodoItem {
  id: string
  projectId: string
  projectName: string
  taskId: string
  taskTitle: string
  taskDescription?: string | null
  taskObjectives?: string | null
  status: 'En cours' | 'En retard' | 'À venir' | 'Terminé'
  startDate?: Date | null
  deadline?: Date | null
  responsibleName?: string | null
  constraints?: string | null
  solution?: string | null
  riskId?: string
  riskTitle?: string
  riskSeverity?: string
  budget: number
  budgetSpent: number
  taskExpenses: Expense[]
}

interface DailyTodoListProps {
  tasks: Task[]
  projects: Project[]
  risks: Risk[]
  onTaskUpdate?: () => void
}

type DateFilter = 'en-retard' | 'a-venir' | 'termine' | 'en-cours'

// Composant TodoItem mémorisé pour éviter les re-renders
const TodoItemComponent = memo(function TodoItemComponent({
  todo,
  isCompleted,
  isExpanded,
  isUpdating,
  todoExpenses,
  onToggleExpand,
  onReprogram,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onDeleteTask,
  onSetBudget,
  onEditField,
  onTaskUpdate
}: {
  todo: TodoItem
  isCompleted: boolean
  isExpanded: boolean
  isUpdating: boolean
  todoExpenses: Expense[]
  onToggleExpand: () => void
  onReprogram: () => void
  onAddExpense: () => void
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (expense: Expense) => void
  onDeleteTask: () => void
  onSetBudget: () => void
  onEditField: (field: 'title' | 'description' | 'objectives' | 'constraints' | 'solutionProposed') => void
  onTaskUpdate?: () => void
}) {
  const isOverdue = todo.status === 'En retard' || (todo.deadline && (() => {
    try {
      return isPast(new Date(todo.deadline))
    } catch { return false }
  })())

  return (
    <div 
      className={`rounded-xl border transition-all w-full max-w-full overflow-hidden ${
        todo.status === 'En retard'
          ? 'bg-red-500/10 border-red-400/30' 
          : isCompleted 
          ? 'bg-green-500/10 border-green-400/30'
          : todo.status === 'En cours'
          ? 'bg-blue-500/10 border-blue-400/30'
          : 'bg-[#1e3a5f]/50 border-blue-400/20'
      }`}
    >
      <div className="p-3 md:p-4 w-full max-w-full overflow-hidden">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-2 min-w-0">
              <h3 className={`text-base md:text-lg font-semibold truncate ${isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                {todo.taskTitle}
              </h3>
              <button
                type="button"
                onClick={onToggleExpand}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline" className="text-sm border-blue-400/30 text-blue-200">
                {todo.projectName}
              </Badge>
              {(todo.startDate || todo.deadline) && (
                <span className={`text-sm flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                  <Clock className="w-4 h-4" />
                  {todo.startDate && todo.deadline ? (
                    <>
                      {(() => {
                        try {
                          const start = new Date(todo.startDate)
                          const end = new Date(todo.deadline)
                          return `${format(start, 'd MMM', { locale: fr })} - ${format(end, 'd MMM yyyy', { locale: fr })}`
                        } catch { return '-' }
                      })()}
                    </>
                  ) : todo.startDate ? (
                    (() => {
                      try {
                        const start = new Date(todo.startDate)
                        return `Début: ${format(start, 'd MMM yyyy', { locale: fr })}`
                      } catch { return '-' }
                    })()
                  ) : todo.deadline ? (
                    (() => {
                      try {
                        const d = new Date(todo.deadline)
                        return isToday(d) ? "Aujourd'hui" :
                               isTomorrow(d) ? "Demain" :
                               format(d, 'd MMM yyyy', { locale: fr })
                      } catch { return '-' }
                    })()
                  ) : null}
                </span>
              )}
              {todo.responsibleName && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {todo.responsibleName}
                </span>
              )}
              {todo.riskSeverity && (
                <span className={`text-sm flex items-center gap-1 ${
                  todo.riskSeverity === 'Critique' ? 'text-red-400' :
                  todo.riskSeverity === 'Haute' ? 'text-orange-400' : 'text-yellow-400'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                  {todo.riskTitle}
                </span>
              )}
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4 border-t border-blue-400/10 pt-4 w-full max-w-full overflow-hidden">
                {/* Informations principales */}
                <div className="space-y-3">
                  {/* Tâche */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-amber-400 font-semibold text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">📝 Tâche:</span>
                    <span className="text-white text-sm sm:text-base break-words flex-1">{todo.taskTitle}</span>
                    <button 
                      type="button"
                      onClick={() => onEditField('title')}
                      className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors self-start"
                      title="Modifier la tâche"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Projet */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-blue-400 font-semibold text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">📁 Projet:</span>
                    <span className="text-blue-200 text-sm sm:text-base break-words">{todo.projectName}</span>
                  </div>
                  
                  {/* Description */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-gray-400 font-semibold text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">📄 Description:</span>
                    <span className="text-gray-300 text-sm sm:text-base break-words flex-1">{todo.taskDescription || <span className="text-gray-500 italic">Non renseignée</span>}</span>
                    <button 
                      type="button"
                      onClick={() => onEditField('description')}
                      className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-500/20 rounded transition-colors self-start"
                      title="Modifier la description"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Objectifs */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-green-400 font-semibold text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">🎯 Objectif:</span>
                    <span className="text-green-200 text-sm sm:text-base break-words flex-1">{todo.taskObjectives || <span className="text-gray-500 italic">Non renseigné</span>}</span>
                    <button 
                      type="button"
                      onClick={() => onEditField('objectives')}
                      className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors self-start"
                      title="Modifier l'objectif"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Contraintes */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-orange-400 font-semibold text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">⚠️ Contraintes:</span>
                    <span className="text-orange-200 text-sm sm:text-base break-words flex-1">{todo.constraints || <span className="text-gray-500 italic">Non renseignées</span>}</span>
                    <button 
                      type="button"
                      onClick={() => onEditField('constraints')}
                      className="p-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded transition-colors self-start"
                      title="Modifier les contraintes"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Solution proposée */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="text-emerald-400 font-semibold text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">💡 Solution:</span>
                    <span className="text-emerald-200 text-sm sm:text-base break-words flex-1">{todo.solution || <span className="text-gray-500 italic">Non renseignée</span>}</span>
                    <button 
                      type="button"
                      onClick={() => onEditField('solutionProposed')}
                      className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded transition-colors self-start"
                      title="Modifier la solution"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Budget Section */}
                <div className="p-3 md:p-4 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg border border-green-400/30 w-full overflow-hidden">
                  <h4 className="text-sm md:text-base font-semibold text-green-300 mb-3 flex items-center gap-2">
                    <Wallet className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    Budget de la tâche
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Budget prévu</span>
                      <span className="text-green-300 font-medium">{todo.budget.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Dépenses ({todoExpenses.length})</span>
                      <span className="text-amber-300 font-medium">{todo.budgetSpent.toLocaleString()} FCFA</span>
                    </div>
                    <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          todo.budget > 0 && todo.budgetSpent > todo.budget
                            ? 'bg-gradient-to-r from-red-400 to-red-500'
                            : 'bg-gradient-to-r from-green-400 to-green-500'
                        }`}
                        style={{ 
                          width: `${todo.budget > 0 
                            ? Math.min((todo.budgetSpent / todo.budget) * 100, 100) 
                            : 0}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium pt-2 border-t border-gray-600/50">
                      <span className="text-gray-300">Reste disponible</span>
                      <span className={todo.budget - todo.budgetSpent >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {Math.max(0, todo.budget - todo.budgetSpent).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-green-400/20 w-full">
                    <Button type="button" size="sm" onClick={onReprogram} className="bg-white text-black hover:bg-gray-100 border border-gray-300 text-xs sm:text-sm px-2 sm:px-3">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="ml-1 hidden sm:inline">Reprogrammer</span>
                    </Button>
                    <Button type="button" size="sm" onClick={onAddExpense} className="bg-white text-black hover:bg-gray-100 border border-gray-300 text-xs sm:text-sm px-2 sm:px-3">
                      <DollarSign className="w-3 h-3 flex-shrink-0" />
                      <span className="ml-1 hidden sm:inline">Dépense</span>
                    </Button>
                    <Button type="button" size="sm" onClick={onSetBudget} className="bg-white text-black hover:bg-gray-100 border border-gray-300 text-xs sm:text-sm px-2 sm:px-3">
                      <Wallet className="w-3 h-3 flex-shrink-0" />
                      <span className="ml-1 hidden sm:inline">Budget</span>
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={onDeleteTask} disabled={isUpdating} className="bg-red-600 hover:bg-red-700 text-white border border-red-500 text-xs sm:text-sm px-2 sm:px-3">
                      <Trash2 className="w-3 h-3 flex-shrink-0" />
                      <span className="ml-1 hidden sm:inline">Supprimer</span>
                    </Button>
                  </div>
                </div>
                
                <CommentSection taskId={todo.taskId} onCommentChange={onTaskUpdate} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export function DailyTodoList({ tasks, projects, risks, onTaskUpdate }: DailyTodoListProps) {
  const { toast } = useToast()
  
  // States
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterDates, setFilterDates] = useState<DateFilter[]>([])
  const [expandedTodo, setExpandedTodo] = useState<string | null>(null)
  const [expenseModal, setExpenseModal] = useState<TodoItem | null>(null)
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('Matériaux')
  const [expenseNote, setExpenseNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [projectExpenses, setProjectExpenses] = useState<Expense[]>([])
  const [budgetModal, setBudgetModal] = useState<TodoItem | null>(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [editExpenseModal, setEditExpenseModal] = useState<Expense | null>(null)
  const [editExpenseAmount, setEditExpenseAmount] = useState('')
  const [editExpenseCategory, setEditExpenseCategory] = useState('')
  const [editExpenseNote, setEditExpenseNote] = useState('')
  const [reprogramDialog, setReprogramDialog] = useState<{
    open: boolean
    todo: TodoItem | null
    newDate: string
    newStatus: string
    reason: string
  }>({ open: false, todo: null, newDate: '', newStatus: '', reason: '' })
  const [createTaskModal, setCreateTaskModal] = useState(false)
  const [deleteTaskModal, setDeleteTaskModal] = useState<TodoItem | null>(null)
  const [newTask, setNewTask] = useState({
    title: '', description: '', objectives: '', constraints: '', solutionProposed: '',
    projectId: '', status: 'À faire', priority: 'Moyenne', dueDate: '', startDate: '', assigneeName: '', budget: ''
  })
  const [editTaskModal, setEditTaskModal] = useState<TodoItem | null>(null)
  const [editTaskField, setEditTaskField] = useState<'title' | 'description' | 'objectives' | 'constraints' | 'solutionProposed'>('title')
  const [editTaskValue, setEditTaskValue] = useState('')

  // Convert tasks to todo items - memoized
  const todos = useMemo(() => {
    const projectMap = new Map(projects.map(p => [p.id, p.name]))
    const riskMap = new Map<string, Risk[]>()
    
    risks.forEach(risk => {
      if (!riskMap.has(risk.projectId)) {
        riskMap.set(risk.projectId, [])
      }
      riskMap.get(risk.projectId)!.push(risk)
    })

    return tasks.filter(task => task.status !== 'Annulé').map(task => {
      const projectRisks = riskMap.get(task.projectId) || []
      const activeRisk = projectRisks.find(r => r.status !== 'Résolu' && r.status !== 'Accepté')
      
      let todoStatus: 'En cours' | 'En retard' | 'À venir' | 'Terminé' = 'À venir'
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const startDate = task.startedAt ? new Date(task.startedAt) : null
      const dueDate = task.dueDate ? new Date(task.dueDate) : null
      
      if (startDate) startDate.setHours(0, 0, 0, 0)
      if (dueDate) dueDate.setHours(0, 0, 0, 0)
      
      if (task.status === 'Validé') {
        todoStatus = 'Terminé'
      } else if (dueDate && isPast(dueDate) && !isToday(dueDate)) {
        todoStatus = 'En retard'
      } else if (startDate && (isPast(startDate) || isToday(startDate))) {
        todoStatus = 'En cours'
      } else {
        todoStatus = 'À venir'
      }
      
      return {
        id: `todo-${task.id}`,
        projectId: task.projectId,
        projectName: projectMap.get(task.projectId) || 'Sans projet',
        taskId: task.id,
        taskTitle: task.title,
        taskDescription: task.description,
        taskObjectives: task.objectives,
        status: todoStatus,
        startDate: task.startedAt,
        deadline: task.dueDate,
        responsibleName: task.assigneeName,
        constraints: task.constraints,
        solution: task.solutionProposed,
        riskId: activeRisk?.id,
        riskTitle: activeRisk?.title,
        riskSeverity: activeRisk?.severity,
        budget: task.budget || 0,
        budgetSpent: task.budgetSpent || 0
      } as TodoItem
    })
  }, [tasks, projects, risks])

  // Organize todos - memoized
  const organizedTodos = useMemo(() => {
    const inProgressList: TodoItem[] = []
    const overdueList: TodoItem[] = []
    const upcomingList: TodoItem[] = []
    const completedList: TodoItem[] = []

    todos.forEach(todo => {
      switch (todo.status) {
        case 'Terminé': completedList.push(todo); break
        case 'En cours': inProgressList.push(todo); break
        case 'En retard': overdueList.push(todo); break
        default: upcomingList.push(todo); break
      }
    })

    const sortByDeadline = (a: TodoItem, b: TodoItem) => {
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    }

    return { 
      inProgress: inProgressList.sort(sortByDeadline),
      overdue: overdueList.sort(sortByDeadline), 
      upcoming: upcomingList.sort(sortByDeadline), 
      completed: completedList
    }
  }, [todos])

  // Stats - memoized
  const stats = useMemo(() => ({
    total: todos.length,
    inProgress: todos.filter(t => t.status === 'En cours').length,
    overdue: todos.filter(t => t.status === 'En retard').length,
    upcoming: todos.filter(t => t.status === 'À venir').length,
    completed: todos.filter(t => t.status === 'Terminé').length
  }), [todos])

  // Fetch project expenses
  useEffect(() => {
    if (expandedTodo) {
      const todo = todos.find(t => t.id === expandedTodo)
      if (todo) {
        fetch(`/api/expenses?projectId=${todo.projectId}`)
          .then(res => res.json())
          .then(data => { if (data.success) setProjectExpenses(data.data || []) })
          .catch(console.error)
      }
    }
  }, [expandedTodo, todos])

  // Callbacks - memoized
  const handleTaskUpdate = useCallback(() => {
    if (onTaskUpdate) onTaskUpdate()
  }, [onTaskUpdate])

  const handleReprogram = useCallback(async () => {
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
          status: reprogramDialog.newStatus === 'Terminé' ? 'Validé' :
                  reprogramDialog.newStatus === 'En cours' ? 'En cours' : 
                  reprogramDialog.newStatus === 'En retard' ? 'En retard' : 'À faire'
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: '📅 Tâche reprogrammée avec succès' })
        setReprogramDialog({ open: false, todo: null, newDate: '', newStatus: '', reason: '' })
        handleTaskUpdate()
      } else { throw new Error(data.error) }
    } catch (error) {
      console.error('Error reprogramming:', error)
      toast({ title: 'Erreur lors de la reprogrammation', variant: 'destructive' })
    } finally { setSaving(false) }
  }, [reprogramDialog, toast, handleTaskUpdate])

  const handleAddExpense = useCallback(async () => {
    if (!expenseModal || !expenseAmount) {
      toast({ title: 'Veuillez entrer un montant', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseNote || `Dépense pour: ${expenseModal.taskTitle}`,
          amount: parseFloat(expenseAmount),
          category: expenseCategory,
          projectId: expenseModal.projectId,
          taskId: expenseModal.taskId
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: '💰 Dépense enregistrée', description: `${parseFloat(expenseAmount).toLocaleString()} FCFA` })
        setExpenseModal(null)
        setExpenseAmount('')
        setExpenseNote('')
        handleTaskUpdate()
      } else { throw new Error(data.error) }
    } catch (error) {
      console.error('Error adding expense:', error)
      toast({ title: 'Erreur lors de l\'enregistrement de la dépense', variant: 'destructive' })
    } finally { setSaving(false) }
  }, [expenseModal, expenseAmount, expenseNote, expenseCategory, toast, handleTaskUpdate])

  const handleAddBudget = useCallback(async () => {
    if (!budgetModal || !budgetAmount) {
      toast({ title: 'Veuillez entrer un montant', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: budgetModal.taskId, budget: parseFloat(budgetAmount) })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: '💰 Budget enregistré', description: `${parseFloat(budgetAmount).toLocaleString()} FCFA` })
        setBudgetModal(null)
        setBudgetAmount('')
        handleTaskUpdate()
      } else { throw new Error(data.error) }
    } catch (error) {
      console.error('Error adding budget:', error)
      toast({ title: 'Erreur lors de l\'enregistrement du budget', variant: 'destructive' })
    } finally { setSaving(false) }
  }, [budgetModal, budgetAmount, toast, handleTaskUpdate])

  const handleEditExpense = useCallback(async () => {
    if (!editExpenseModal || !editExpenseAmount) {
      toast({ title: 'Veuillez entrer un montant', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editExpenseModal.id,
          description: editExpenseNote || editExpenseModal.description,
          amount: parseFloat(editExpenseAmount),
          category: editExpenseCategory
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: '✏️ Dépense modifiée', description: `${parseFloat(editExpenseAmount).toLocaleString()} FCFA` })
        setEditExpenseModal(null)
        setEditExpenseAmount('')
        setEditExpenseNote('')
        handleTaskUpdate()
      } else { throw new Error(data.error) }
    } catch (error) {
      console.error('Error editing expense:', error)
      toast({ title: 'Erreur lors de la modification de la dépense', variant: 'destructive' })
    } finally { setSaving(false) }
  }, [editExpenseModal, editExpenseAmount, editExpenseNote, editExpenseCategory, toast, handleTaskUpdate])

  const handleDeleteExpense = useCallback(async (expense: Expense) => {
    if (!confirm(`Supprimer cette dépense de ${expense.amount.toLocaleString()} FCFA ?`)) return
    try {
      const res = await fetch(`/api/expenses?id=${expense.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: '🗑️ Dépense supprimée' })
        handleTaskUpdate()
      } else { throw new Error(data.error) }
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' })
    }
  }, [toast, handleTaskUpdate])

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTaskModal) return
    setUpdatingTaskId(deleteTaskModal.taskId)
    try {
      const res = await fetch(`/api/tasks?id=${deleteTaskModal.taskId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast({ title: '🗑️ Tâche supprimée définitivement' })
        setDeleteTaskModal(null)
        handleTaskUpdate()
      } else { throw new Error(data.error) }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({ title: 'Erreur lors de la suppression de la tâche', variant: 'destructive' })
    } finally { setUpdatingTaskId(null) }
  }, [deleteTaskModal, toast, handleTaskUpdate])

  const handleCreateTask = useCallback(async () => {
    if (!newTask.title?.trim()) {
      toast({ title: 'Veuillez entrer un titre pour la tâche', variant: 'destructive' })
      return
    }
    if (!newTask.projectId) {
      toast({ title: 'Veuillez sélectionner un projet', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title.trim(),
          description: newTask.description?.trim() || null,
          objectives: newTask.objectives?.trim() || null,
          constraints: newTask.constraints?.trim() || null,
          solutionProposed: newTask.solutionProposed?.trim() || null,
          projectId: newTask.projectId,
          status: newTask.status || 'À faire',
          priority: newTask.priority || 'Moyenne',
          dueDate: newTask.dueDate || null,
          startDate: newTask.startDate || null,
          assigneeName: newTask.assigneeName?.trim() || null,
          budget: newTask.budget ? parseFloat(newTask.budget) : 0
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: '✅ Tâche créée avec succès !', description: newTask.title })
        setCreateTaskModal(false)
        setNewTask({ title: '', description: '', objectives: '', constraints: '', solutionProposed: '', projectId: '', status: 'À faire', priority: 'Moyenne', dueDate: '', startDate: '', assigneeName: '', budget: '' })
        handleTaskUpdate()
      } else {
        toast({ title: '❌ Erreur lors de la création', description: data.error || 'Une erreur inconnue s\'est produite', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      toast({ title: '❌ Erreur de connexion', variant: 'destructive' })
    } finally { setSaving(false) }
  }, [newTask, toast, handleTaskUpdate])

  const handleEditTask = useCallback(async () => {
    if (!editTaskModal) return
    if (editTaskField === 'title' && !editTaskValue?.trim()) {
      toast({ title: 'Veuillez entrer un titre', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const updateData: Record<string, string | null> = {
        id: editTaskModal.taskId,
        [editTaskField]: editTaskValue.trim() || null
      }
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      const data = await res.json()
      if (data.success) {
        const fieldNames: Record<string, string> = { 
          title: 'Tâche', 
          description: 'Description', 
          objectives: 'Objectif',
          constraints: 'Contraintes',
          solutionProposed: 'Solution'
        }
        toast({ title: `✅ ${fieldNames[editTaskField]} modifié(e) avec succès !` })
        setEditTaskModal(null)
        setEditTaskValue('')
        handleTaskUpdate()
      } else {
        toast({ title: '❌ Erreur lors de la modification', description: data.error || 'Une erreur inconnue s\'est produite', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      toast({ title: '❌ Erreur de connexion', variant: 'destructive' })
    } finally { setSaving(false) }
  }, [editTaskModal, editTaskField, editTaskValue, toast, handleTaskUpdate])

  // Apply filters
  const applyFilters = useCallback((todoList: TodoItem[], sectionType?: string) => {
    let filtered = todoList
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.projectId === filterProject)
    }
    if (filterDates.length > 0 && sectionType) {
      const sectionMatch: Record<string, DateFilter> = {
        'overdue': 'en-retard', 'upcoming': 'a-venir', 'completed': 'termine', 'inProgress': 'en-cours'
      }
      const filterKey = sectionMatch[sectionType]
      if (filterKey && !filterDates.includes(filterKey)) return []
    }
    return filtered
  }, [filterProject, filterDates])

  // Toggle date filter
  const toggleDateFilter = useCallback((dateFilter: DateFilter) => {
    setFilterDates(prev => prev.includes(dateFilter) ? prev.filter(d => d !== dateFilter) : [...prev, dateFilter])
  }, [])

  // Render todo item with callbacks
  const renderTodoItem = useCallback((todo: TodoItem, sectionType: string, isCompleted: boolean = false) => {
    const isExpanded = expandedTodo === todo.id
    const isUpdating = updatingTaskId === todo.taskId
    const todoExpenses = projectExpenses.filter(e => e.taskId === todo.taskId)

    return (
      <TodoItemComponent
        key={todo.id}
        todo={todo}
        isCompleted={isCompleted}
        isExpanded={isExpanded}
        isUpdating={isUpdating}
        todoExpenses={todoExpenses}
        onToggleExpand={() => setExpandedTodo(isExpanded ? null : todo.id)}
        onReprogram={() => setReprogramDialog({
          open: true, todo,
          newDate: todo.deadline ? format(new Date(todo.deadline), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          newStatus: isCompleted ? 'À venir' : todo.status, reason: ''
        })}
        onAddExpense={() => setExpenseModal(todo)}
        onEditExpense={(expense) => {
          setEditExpenseModal(expense)
          setEditExpenseAmount(expense.amount.toString())
          setEditExpenseCategory(expense.category || '')
          setEditExpenseNote(expense.description)
        }}
        onDeleteExpense={handleDeleteExpense}
        onDeleteTask={() => setDeleteTaskModal(todo)}
        onSetBudget={() => { setBudgetModal(todo); setBudgetAmount(todo.budget ? todo.budget.toString() : '') }}
        onEditField={(field) => {
          setEditTaskModal(todo)
          setEditTaskField(field)
          const values = {
            title: todo.taskTitle || '',
            description: todo.taskDescription || '',
            objectives: todo.taskObjectives || '',
            constraints: todo.constraints || '',
            solutionProposed: todo.solution || ''
          }
          setEditTaskValue(values[field])
        }}
        onTaskUpdate={handleTaskUpdate}
      />
    )
  }, [expandedTodo, updatingTaskId, projectExpenses, handleDeleteExpense, handleTaskUpdate])

  // Render section
  const renderSection = useCallback((title: string, icon: React.ReactNode, items: TodoItem[], titleColor: string, sectionType?: string, isCompleted: boolean = false) => {
    const filtered = applyFilters(items, sectionType)
    if (filtered.length === 0) return null

    return (
      <div className="space-y-4">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${titleColor}`}>
          {icon}
          {title}
          <Badge variant="outline" className="ml-2 bg-transparent text-base">{filtered.length}</Badge>
        </h2>
        <div className="space-y-3">
          {filtered.map(todo => renderTodoItem(todo, sectionType || '', isCompleted))}
        </div>
      </div>
    )
  }, [applyFilters, renderTodoItem])

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 md:w-6 md:h-6 text-amber-400 flex-shrink-0" />
            <span className="truncate">TODO List Projet</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-1">
            {format(new Date(), "'Le' d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateTaskModal(true)} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Création tâche
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-lg"><Play className="w-5 h-5 text-blue-400" /></div>
              <div><p className="text-gray-400 text-sm">En cours</p><p className="text-2xl font-bold text-white">{stats.inProgress}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e3a5f]/30 border-red-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-500/20 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
              <div><p className="text-red-300 text-sm">En retard</p><p className="text-2xl font-bold text-red-400">{stats.overdue}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e3a5f]/30 border-amber-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 rounded-lg"><Calendar className="w-5 h-5 text-amber-400" /></div>
              <div><p className="text-gray-400 text-sm">À venir</p><p className="text-2xl font-bold text-white">{stats.upcoming}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e3a5f]/30 border-green-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500/20 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-400" /></div>
              <div><p className="text-gray-400 text-sm">Terminé</p><p className="text-2xl font-bold text-white">{stats.completed}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gray-500/20 rounded-lg"><ListTodo className="w-5 h-5 text-gray-400" /></div>
              <div><p className="text-gray-400 text-sm">Total</p><p className="text-2xl font-bold text-white">{stats.total}</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-start gap-4 p-4 bg-[#1e3a5f]/30 rounded-xl border border-blue-400/20">
        <Filter className="w-5 h-5 text-gray-400" />
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="px-4 py-2 bg-[#0f1c2e] border border-blue-400/30 rounded-lg text-white">
          <option value="all">Tous les projets</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'en-retard', label: 'En retard', icon: AlertTriangle, color: 'red' },
            { key: 'a-venir', label: 'À venir', icon: Calendar, color: 'amber' },
            { key: 'en-cours', label: 'En cours', icon: Play, color: 'blue' },
            { key: 'termine', label: 'Terminé', icon: CheckCircle2, color: 'green' }
          ].map(({ key, label, icon: Icon, color }) => (
            <button key={key} type="button" onClick={() => toggleDateFilter(key as DateFilter)}
              className={`flex items-center gap-1 px-4 py-2 rounded-md border text-base transition-all ${
                filterDates.includes(key as DateFilter) ? `bg-${color}-500/20 border-${color}-400/50 text-${color}-300` : `border-gray-600 text-gray-400 hover:bg-gray-700/30`
              }`}>
              <Icon className="w-4 h-4" />{label}
              {filterDates.includes(key as DateFilter) && <Check className="w-4 h-4 text-green-400" />}
            </button>
          ))}
          {filterDates.length > 0 && (
            <button type="button" onClick={() => setFilterDates([])} className="flex items-center gap-1 px-4 py-2 rounded-md border border-red-400/30 text-red-400 text-base hover:bg-red-500/20 transition-all">
              <X className="w-4 h-4" />Effacer
            </button>
          )}
        </div>
      </div>

      {/* Todo Lists */}
      {todos.length === 0 ? (
        <div className="text-center py-12 bg-[#1e3a5f]/30 rounded-xl border border-dashed border-blue-400/30">
          <ListTodo className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Aucune tâche à afficher</p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderSection("▶️ En cours", <Play className="w-5 h-5 text-blue-400" />, organizedTodos.inProgress, "text-blue-400", "inProgress")}
          {renderSection("⚠️ En retard", <AlertTriangle className="w-5 h-5 text-red-400" />, organizedTodos.overdue, "text-red-400", "overdue")}
          {renderSection("📅 À venir", <Calendar className="w-5 h-5 text-amber-400" />, organizedTodos.upcoming, "text-amber-400", "upcoming")}
          {renderSection("✅ Terminé", <CheckCircle2 className="w-5 h-5 text-green-400" />, organizedTodos.completed, "text-green-400", "completed", true)}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={reprogramDialog.open} onOpenChange={(open) => setReprogramDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-amber-400/30 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-300"><Calendar className="w-5 h-5" />Reprogrammer la tâche</DialogTitle></DialogHeader>
          {reprogramDialog.todo && (
            <div className="space-y-4 py-4">
              <p className="text-gray-300 text-sm">Tâche: <span className="text-white font-medium">{reprogramDialog.todo.taskTitle}</span></p>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nouvelle date limite *</label>
                <Input type="date" value={reprogramDialog.newDate} onChange={(e) => setReprogramDialog(prev => ({ ...prev, newDate: e.target.value }))} className="bg-[#0f1c2e] border-blue-400/30 text-white [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Nouveau statut</label>
                <select value={reprogramDialog.newStatus} onChange={(e) => setReprogramDialog(prev => ({ ...prev, newStatus: e.target.value }))} className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-2 text-white">
                  <option value="À venir">À venir</option>
                  <option value="En cours">En cours</option>
                  <option value="En retard">En retard</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Raison du changement (optionnel)</label>
                <Input value={reprogramDialog.reason} onChange={(e) => setReprogramDialog(prev => ({ ...prev, reason: e.target.value }))} placeholder="Ex: Retard de livraison" className="bg-[#0f1c2e] border-blue-400/30 text-white" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReprogramDialog({ open: false, todo: null, newDate: '', newStatus: '', reason: '' })} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
            <Button type="button" onClick={handleReprogram} disabled={saving || !reprogramDialog.newDate} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expense Modal - using Dialog instead of fixed overlay */}
      <Dialog open={!!expenseModal} onOpenChange={(open) => { if (!open) { setExpenseModal(null); setExpenseAmount(''); setExpenseNote('') }}}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-amber-400/30 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-amber-300"><DollarSign className="w-5 h-5" />Enregistrer une dépense</DialogTitle></DialogHeader>
          {expenseModal && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-400">Tâche: {expenseModal.taskTitle}</p>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Montant (FCFA) *</label>
                <Input type="number" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="Ex: 50000" className="bg-[#0f1c2e] border-blue-400/30 text-white" autoFocus />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Catégorie</label>
                <Input value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} placeholder="Ex: Matériaux, Main d'œuvre..." className="bg-[#0f1c2e] border-blue-400/30 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Note (optionnel)</label>
                <Input value={expenseNote} onChange={(e) => setExpenseNote(e.target.value)} placeholder="Détails sur la dépense" className="bg-[#0f1c2e] border-blue-400/30 text-white" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={handleAddExpense} disabled={saving || !expenseAmount} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer la dépense'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setExpenseModal(null); setExpenseAmount(''); setExpenseNote('') }} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Budget Modal */}
      <Dialog open={!!budgetModal} onOpenChange={(open) => { if (!open) { setBudgetModal(null); setBudgetAmount('') }}}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-green-400/30 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-green-300"><Wallet className="w-5 h-5" />{budgetModal?.budget ? 'Modifier le budget' : 'Ajouter un budget'}</DialogTitle></DialogHeader>
          {budgetModal && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-400">Tâche: {budgetModal.taskTitle}</p>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Montant du budget (FCFA) *</label>
                <Input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="Ex: 500000" className="bg-[#0f1c2e] border-green-400/30 text-white" autoFocus />
              </div>
              {budgetModal.budget > 0 && (
                <p className="text-xs text-blue-300">Budget actuel: {budgetModal.budget.toLocaleString()} FCFA</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={handleAddBudget} disabled={saving || !budgetAmount} className="bg-green-500 hover:bg-green-600 text-black font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setBudgetModal(null); setBudgetAmount('') }} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Modal */}
      <Dialog open={!!editExpenseModal} onOpenChange={(open) => { if (!open) { setEditExpenseModal(null); setEditExpenseAmount(''); setEditExpenseNote('') }}}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-blue-400/30 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-blue-300"><Pencil className="w-5 h-5" />Modifier la dépense</DialogTitle></DialogHeader>
          {editExpenseModal && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Montant (FCFA) *</label>
                <Input type="number" value={editExpenseAmount} onChange={(e) => setEditExpenseAmount(e.target.value)} className="bg-[#0f1c2e] border-blue-400/30 text-white" autoFocus />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Catégorie</label>
                <Input value={editExpenseCategory} onChange={(e) => setEditExpenseCategory(e.target.value)} className="bg-[#0f1c2e] border-blue-400/30 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Note</label>
                <Input value={editExpenseNote} onChange={(e) => setEditExpenseNote(e.target.value)} className="bg-[#0f1c2e] border-blue-400/30 text-white" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={handleEditExpense} disabled={saving || !editExpenseAmount} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Modifier'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setEditExpenseModal(null); setEditExpenseAmount(''); setEditExpenseNote('') }} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog open={createTaskModal} onOpenChange={setCreateTaskModal}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-green-400/30 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-green-300"><Plus className="w-5 h-5" />Créer une nouvelle tâche</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* Section Tâche */}
            <div className="md:col-span-2 border-b border-blue-400/20 pb-2 mb-2">
              <h3 className="text-amber-400 font-semibold text-lg">📝 Tâche</h3>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 block mb-1">Titre de la tâche *</label>
              <Input value={newTask.title} onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))} placeholder="Ex: Développer la page de connexion" className="bg-[#0f1c2e] border-blue-400/30 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 block mb-1">Description de la tâche</label>
              <textarea value={newTask.description} onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))} placeholder="Décrivez la tâche en détail..." className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-2 text-white min-h-[80px]" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-400 block mb-1">Objectifs de la tâche</label>
              <textarea value={newTask.objectives} onChange={(e) => setNewTask(prev => ({ ...prev, objectives: e.target.value }))} placeholder="Quels sont les objectifs de cette tâche ?" className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-2 text-white min-h-[60px]" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-orange-400 block mb-1">⚠️ Contraintes</label>
              <textarea value={newTask.constraints} onChange={(e) => setNewTask(prev => ({ ...prev, constraints: e.target.value }))} placeholder="Ex: Délai serré, ressources limitées, dépendances techniques..." className="w-full bg-[#0f1c2e] border border-orange-400/30 rounded-md px-3 py-2 text-white min-h-[60px]" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-green-400 block mb-1">💡 Solution proposée</label>
              <textarea value={newTask.solutionProposed} onChange={(e) => setNewTask(prev => ({ ...prev, solutionProposed: e.target.value }))} placeholder="Ex: Utiliser une approche agile, assigner plus de ressources..." className="w-full bg-[#0f1c2e] border border-green-400/30 rounded-md px-3 py-2 text-white min-h-[60px]" />
            </div>
            
            {/* Section Projet */}
            <div className="md:col-span-2 border-b border-blue-400/20 pb-2 mb-2 mt-4">
              <h3 className="text-blue-400 font-semibold text-lg">📁 Projet</h3>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Projet associé *</label>
              <select value={newTask.projectId} onChange={(e) => setNewTask(prev => ({ ...prev, projectId: e.target.value }))} className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-2 text-white">
                <option value="">Sélectionner un projet</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Priorité</label>
              <select value={newTask.priority} onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))} className="w-full bg-[#0f1c2e] border border-blue-400/30 rounded-md px-3 py-2 text-white">
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
                <option value="Critique">Critique</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Date de début</label>
              <Input type="date" value={newTask.startDate} onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))} className="bg-[#0f1c2e] border-blue-400/30 text-white [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Date limite</label>
              <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))} className="bg-[#0f1c2e] border-blue-400/30 text-white [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Responsable</label>
              <Input value={newTask.assigneeName} onChange={(e) => setNewTask(prev => ({ ...prev, assigneeName: e.target.value }))} placeholder="Nom du responsable" className="bg-[#0f1c2e] border-blue-400/30 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Budget (FCFA)</label>
              <Input type="number" value={newTask.budget} onChange={(e) => setNewTask(prev => ({ ...prev, budget: e.target.value }))} placeholder="Ex: 500000" className="bg-[#0f1c2e] border-blue-400/30 text-white" />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button type="button" onClick={handleCreateTask} disabled={saving} className="bg-green-500 hover:bg-green-600 text-black font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Créer la tâche
            </Button>
            <Button type="button" variant="outline" onClick={() => setCreateTaskModal(false)} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Confirmation */}
      <Dialog open={!!deleteTaskModal} onOpenChange={(open) => { if (!open) setDeleteTaskModal(null) }}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-red-400/30 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-red-300"><Trash2 className="w-5 h-5" />Confirmer la suppression</DialogTitle></DialogHeader>
          {deleteTaskModal && (
            <div className="py-4">
              <p className="text-gray-300">Êtes-vous sûr de vouloir supprimer définitivement la tâche :</p>
              <p className="text-white font-semibold mt-2">{deleteTaskModal.taskTitle}</p>
              <p className="text-red-400 text-sm mt-4">⚠️ Cette action est irréversible.</p>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTaskModal(null)} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
            <Button type="button" onClick={handleDeleteTask} disabled={!!updatingTaskId} className="bg-red-500 hover:bg-red-600 text-white font-semibold">
              {updatingTaskId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Field Modal */}
      <Dialog open={!!editTaskModal} onOpenChange={(open) => { if (!open) { setEditTaskModal(null); setEditTaskValue('') }}}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-amber-400/30 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-300">
              <Pencil className="w-5 h-5" />
              {editTaskField === 'title' && 'Modifier la tâche'}
              {editTaskField === 'description' && 'Modifier la description'}
              {editTaskField === 'objectives' && 'Modifier l\'objectif'}
              {editTaskField === 'constraints' && 'Modifier les contraintes'}
              {editTaskField === 'solutionProposed' && 'Modifier la solution'}
            </DialogTitle>
          </DialogHeader>
          {editTaskModal && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {editTaskField === 'title' && '📝 Titre de la tâche'}
                  {editTaskField === 'description' && '📄 Description de la tâche'}
                  {editTaskField === 'objectives' && '🎯 Objectifs de la tâche'}
                  {editTaskField === 'constraints' && '⚠️ Contraintes'}
                  {editTaskField === 'solutionProposed' && '💡 Solution proposée'}
                </label>
                {editTaskField === 'title' ? (
                  <Input 
                    value={editTaskValue} 
                    onChange={(e) => setEditTaskValue(e.target.value)} 
                    placeholder="Ex: Développer la page de connexion" 
                    className="bg-[#0f1c2e] border-amber-400/30 text-white" 
                    autoFocus
                  />
                ) : (
                  <textarea 
                    value={editTaskValue} 
                    onChange={(e) => setEditTaskValue(e.target.value)} 
                    placeholder={
                      editTaskField === 'description' ? "Décrivez la tâche en détail..." : 
                      editTaskField === 'objectives' ? "Quels sont les objectifs de cette tâche ?" :
                      editTaskField === 'constraints' ? "Ex: Délai serré, ressources limitées..." :
                      "Ex: Utiliser une approche agile, assigner plus de ressources..."
                    }
                    className={`w-full bg-[#0f1c2e] border rounded-md px-3 py-2 text-white min-h-[120px] ${
                      editTaskField === 'description' ? 'border-blue-400/30' : 
                      editTaskField === 'objectives' ? 'border-green-400/30' :
                      editTaskField === 'constraints' ? 'border-orange-400/30' :
                      'border-emerald-400/30'
                    }`}
                    autoFocus
                  />
                )}
              </div>
              {/* Info */}
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
                <p className="text-sm text-gray-400">
                  📁 <span className="text-blue-300">Projet:</span> {editTaskModal.projectName}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button type="button" onClick={handleEditTask} disabled={saving} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
            <Button type="button" variant="outline" onClick={() => { setEditTaskModal(null); setEditTaskValue('') }} className="border-blue-400/30 text-blue-200 hover:bg-blue-500/20">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
