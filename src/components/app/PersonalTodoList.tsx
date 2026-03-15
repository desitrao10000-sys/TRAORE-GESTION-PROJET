'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle,
  Calendar,
  ListTodo,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface PersonalTask {
  id: string
  title: string
  description?: string
  status: 'À faire' | 'En cours' | 'Validé'
  priority: 'Basse' | 'Moyenne' | 'Haute'
  dueDate?: string
  createdAt: string
  completedAt?: string
}

const STORAGE_KEY = 'traore-personal-todo'

// Function to load initial tasks from localStorage
const loadInitialTasks = (): PersonalTask[] => {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Error loading personal tasks:', e)
      return []
    }
  }
  return []
}

export function PersonalTodoList() {
  const [tasks, setTasks] = useState<PersonalTask[]>(loadInitialTasks)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Moyenne' as 'Basse' | 'Moyenne' | 'Haute',
    dueDate: ''
  })
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks])

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: PersonalTask = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      status: 'À faire',
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      createdAt: new Date().toISOString()
    }

    setTasks(prev => [task, ...prev])
    setNewTask({ title: '', description: '', priority: 'Moyenne', dueDate: '' })
    setIsAddDialogOpen(false)
  }

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === 'Validé' ? 'À faire' : 
                         task.status === 'À faire' ? 'En cours' : 'Validé'
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'Validé' ? new Date().toISOString() : undefined
        }
      }
      return task
    }))
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const updateTaskStatus = (taskId: string, status: 'À faire' | 'En cours' | 'Validé') => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status,
          completedAt: status === 'Validé' ? new Date().toISOString() : undefined
        }
      }
      return task
    }))
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status !== 'Validé'
    if (filter === 'completed') return task.status === 'Validé'
    return true
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Validé').length,
    inProgress: tasks.filter(t => t.status === 'En cours').length,
    todo: tasks.filter(t => t.status === 'À faire').length
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Haute': return 'text-red-400 bg-red-500/20'
      case 'Moyenne': return 'text-amber-400 bg-amber-500/20'
      case 'Basse': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'text-green-400 bg-green-500/20'
      case 'En cours': return 'text-blue-400 bg-blue-500/20'
      case 'À faire': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const isOverdue = (dueDate?: string, status?: string) => {
    if (!dueDate || status === 'Validé') return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-amber-400" />
            TODO List Personnel
          </h1>
          <p className="text-blue-200 mt-1">Vos tâches personnelles indépendantes des projets</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-amber-400">Nouvelle tâche personnelle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-blue-200 mb-1 block">Titre *</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la tâche"
                  className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-sm text-blue-200 mb-1 block">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description optionnelle"
                  className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Priorité</label>
                  <Select value={newTask.priority} onValueChange={(v: 'Basse' | 'Moyenne' | 'Haute') => setNewTask(prev => ({ ...prev, priority: v }))}>
                    <SelectTrigger className="bg-white/10 border-blue-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e3a5f] border-blue-400/30">
                      <SelectItem value="Basse">Basse</SelectItem>
                      <SelectItem value="Moyenne">Moyenne</SelectItem>
                      <SelectItem value="Haute">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-blue-200 mb-1 block">Date limite</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-white/10 border-blue-400/30 text-white"
                  />
                </div>
              </div>
              <Button onClick={addTask} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-blue-200">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-300">{stats.todo}</div>
            <div className="text-sm text-blue-200">À faire</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
            <div className="text-sm text-blue-200">En cours</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-sm text-blue-200">Validées</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          className={filter === 'all' ? 'bg-amber-500 text-black' : 'border-blue-400/30 text-white hover:bg-white/10'}
        >
          Toutes ({stats.total})
        </Button>
        <Button
          onClick={() => setFilter('active')}
          variant={filter === 'active' ? 'default' : 'outline'}
          className={filter === 'active' ? 'bg-amber-500 text-black' : 'border-blue-400/30 text-white hover:bg-white/10'}
        >
          Actives ({stats.todo + stats.inProgress})
        </Button>
        <Button
          onClick={() => setFilter('completed')}
          variant={filter === 'completed' ? 'default' : 'outline'}
          className={filter === 'completed' ? 'bg-amber-500 text-black' : 'border-blue-400/30 text-white hover:bg-white/10'}
        >
          Validées ({stats.completed})
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
            <CardContent className="p-8 text-center">
              <ListTodo className="w-12 h-12 text-blue-400/50 mx-auto mb-4" />
              <p className="text-blue-200">Aucune tâche personnelle</p>
              <p className="text-sm text-blue-300/70 mt-1">Cliquez sur "Nouvelle tâche" pour commencer</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card 
              key={task.id} 
              className={`bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30 transition-all ${
                task.status === 'Validé' ? 'opacity-60' : ''
              } ${isOverdue(task.dueDate, task.status) ? 'border-red-500/50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      task.status === 'Validé' 
                        ? 'bg-green-500 border-green-500' 
                        : task.status === 'En cours'
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-400 hover:border-amber-400'
                    }`}
                  >
                    {task.status === 'Validé' && <Check className="w-3 h-3 text-white" />}
                    {task.status === 'En cours' && <Clock className="w-3 h-3 text-white" />}
                  </button>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-white ${task.status === 'Validé' ? 'line-through' : ''}`}>
                        {task.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      {isOverdue(task.dueDate, task.status) && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          En retard
                        </span>
                      )}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-blue-200 mt-1">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-blue-300/70">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      <span>Créé le {new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={task.status}
                      onValueChange={(v: 'À faire' | 'En cours' | 'Validé') => updateTaskStatus(task.id, v)}
                    >
                      <SelectTrigger className="w-[120px] h-8 bg-white/10 border-blue-400/30 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e3a5f] border-blue-400/30">
                        <SelectItem value="À faire">À faire</SelectItem>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="Validé">Validé</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => deleteTask(task.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
