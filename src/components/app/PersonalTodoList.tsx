'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle,
  Calendar,
  ListTodo,
  CalendarClock,
  History,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface PersonalTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | null
  completedAt: string | null
  originalDueDate: string | null
  reprogrammed: boolean
  reprogrammedAt: string | null
  reprogramReason: string | null
  reprogramCount: number
  createdAt: string
  updatedAt: string
}

export function PersonalTodoList() {
  const [tasks, setTasks] = useState<PersonalTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isReprogramDialogOpen, setIsReprogramDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<PersonalTask | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Moyenne',
    dueDate: ''
  })
  const [reprogramData, setReprogramData] = useState({
    newDueDate: '',
    reason: ''
  })
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // Charger les tâches depuis l'API
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/personal-todos')
      const data = await res.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (error) {
      console.error('Error fetching personal todos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Ajouter une tâche
  const addTask = async () => {
    if (!newTask.title.trim()) return

    try {
      const res = await fetch('/api/personal-todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title.trim(),
          description: newTask.description.trim() || null,
          priority: newTask.priority,
          dueDate: newTask.dueDate || null
        })
      })
      const data = await res.json()
      if (data.success) {
        setTasks(prev => [data.data, ...prev])
        setNewTask({ title: '', description: '', priority: 'Moyenne', dueDate: '' })
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  // Mettre à jour le statut
  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/personal-todos/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? data.data : t))
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Supprimer une tâche
  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/personal-todos/${taskId}`, { method: 'DELETE' })
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  // Reprogrammer une tâche
  const reprogramTask = async () => {
    if (!selectedTask || !reprogramData.newDueDate) return

    try {
      const res = await fetch(`/api/personal-todos/${selectedTask.id}/reprogram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newDueDate: reprogramData.newDueDate,
          reason: reprogramData.reason || null
        })
      })
      const data = await res.json()
      if (data.success) {
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? data.data : t))
        setIsReprogramDialogOpen(false)
        setSelectedTask(null)
        setReprogramData({ newDueDate: '', reason: '' })
      }
    } catch (error) {
      console.error('Error reprogramming task:', error)
    }
  }

  // Ouvrir le dialog de reprogrammation
  const openReprogramDialog = (task: PersonalTask) => {
    setSelectedTask(task)
    setReprogramData({
      newDueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      reason: ''
    })
    setIsReprogramDialogOpen(true)
  }

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status !== 'Validé'
    if (filter === 'completed') return task.status === 'Validé'
    return true
  })

  // Statistiques
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Validé').length,
    inProgress: tasks.filter(t => t.status === 'En cours').length,
    todo: tasks.filter(t => t.status === 'À faire').length,
    reprogrammed: tasks.filter(t => t.reprogrammed).length
  }

  // Couleurs
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'Haute': return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'Moyenne': return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
      case 'Basse': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'En cours': return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'Validé') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-400" />
      </div>
    )
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
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle tâche
          </Button>
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
                  <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v }))}>
                    <SelectTrigger className="bg-white/10 border-blue-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e3a5f] border-blue-400/30">
                      <SelectItem value="Basse">Basse</SelectItem>
                      <SelectItem value="Moyenne">Moyenne</SelectItem>
                      <SelectItem value="Haute">Haute</SelectItem>
                      <SelectItem value="Urgente">Urgente</SelectItem>
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
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
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-400">{stats.reprogrammed}</div>
            <div className="text-sm text-blue-200">Reprogrammées</div>
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
                    onClick={() => {
                      const newStatus = task.status === 'Validé' ? 'À faire' : 
                                       task.status === 'À faire' ? 'En cours' : 'Validé'
                      updateTaskStatus(task.id, newStatus)
                    }}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
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
                      <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                        {task.priority}
                      </Badge>
                      <Badge className={`${getStatusColor(task.status)} border text-xs`}>
                        {task.status}
                      </Badge>
                      {task.reprogrammed && (
                        <Badge className="text-amber-400 bg-amber-500/20 border border-amber-500/30 text-xs">
                          <CalendarClock className="w-3 h-3 mr-1" />
                          Reprogrammée
                        </Badge>
                      )}
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
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-blue-300/70 flex-wrap">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.dueDate), 'd MMM yyyy', { locale: fr })}
                        </span>
                      )}
                      {task.reprogramCount > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <History className="w-3 h-3" />
                          {task.reprogramCount}x reprogrammée
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.status !== 'Validé' && task.dueDate && (
                      <Button
                        onClick={() => openReprogramDialog(task)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20"
                        title="Reprogrammer"
                      >
                        <CalendarClock className="w-4 h-4" />
                      </Button>
                    )}
                    <Select
                      value={task.status}
                      onValueChange={(v) => updateTaskStatus(task.id, v)}
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

      {/* Dialog Reprogrammation */}
      <Dialog open={isReprogramDialogOpen} onOpenChange={setIsReprogramDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2">
              <CalendarClock className="w-5 h-5" />
              Reprogrammer la tâche
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedTask && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                <p className="font-medium text-white">{selectedTask.title}</p>
                {selectedTask.originalDueDate && (
                  <p className="text-xs text-blue-300 mt-1">
                    Date originale: {format(new Date(selectedTask.originalDueDate), 'd MMMM yyyy', { locale: fr })}
                  </p>
                )}
                {selectedTask.reprogramCount > 0 && (
                  <p className="text-xs text-amber-400">
                    Déjà reprogrammée {selectedTask.reprogramCount} fois
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="text-sm text-blue-200 mb-1 block">Nouvelle date limite *</label>
              <Input
                type="date"
                value={reprogramData.newDueDate}
                onChange={(e) => setReprogramData(prev => ({ ...prev, newDueDate: e.target.value }))}
                className="bg-white/10 border-blue-400/30 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-blue-200 mb-1 block">Raison de la reprogrammation</label>
              <Textarea
                value={reprogramData.reason}
                onChange={(e) => setReprogramData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Pourquoi reprogrammez-vous cette tâche ?"
                className="bg-white/10 border-blue-400/30 text-white placeholder:text-gray-400"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsReprogramDialogOpen(false)}
                variant="outline"
                className="flex-1 border-blue-400/30 text-white hover:bg-white/10"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
              <Button 
                onClick={reprogramTask}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
              >
                <CalendarClock className="w-4 h-4 mr-2" />
                Reprogrammer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
