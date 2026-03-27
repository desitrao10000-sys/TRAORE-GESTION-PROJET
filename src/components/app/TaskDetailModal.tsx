'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Play, Pause, Square, Plus, Trash2, Clock, 
  Calendar, Target, AlertTriangle, Lightbulb,
  CheckCircle2, ListTodo, Loader2
} from 'lucide-react'
import { Task, SubTask } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onTaskUpdate: () => void
}

export function TaskDetailModal({ task, open, onClose, onTaskUpdate }: TaskDetailModalProps) {
  const { toast } = useToast()
  const [subTasks, setSubTasks] = useState<SubTask[]>([])
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('')
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [objectives, setObjectives] = useState('')
  const [constraints, setConstraints] = useState('')
  const [solution, setSolution] = useState('')

  // Charger les données de la tâche
  useEffect(() => {
    if (task) {
      setSubTasks(task.subTasks || [])
      setIsTimerRunning(task.timerRunning)
      setTotalTime(task.actualTime * 60)
      setObjectives(task.objectives || '')
      setConstraints(task.constraints || '')
      setSolution(task.solutionProposed || '')
    }
  }, [task])

  // Timer en temps réel
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && task?.timerStartedAt) {
      const start = new Date(task.timerStartedAt).getTime()
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - start) / 1000)
        setTimerSeconds(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, task?.timerStartedAt])

  // Ajouter une sous-tâche
  const addSubTask = async () => {
    if (!task || !newSubTaskTitle.trim()) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/tasks/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, title: newSubTaskTitle.trim() })
      })
      const data = await res.json()
      if (data.success) {
        setSubTasks([...subTasks, data.data])
        setNewSubTaskTitle('')
        toast({ title: 'Sous-tâche ajoutée' })
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'ajouter la sous-tâche', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Toggle sous-tâche
  const toggleSubTask = async (subTask: SubTask) => {
    try {
      const res = await fetch('/api/tasks/subtasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subTask.id, isCompleted: !subTask.isCompleted })
      })
      const data = await res.json()
      if (data.success) {
        setSubTasks(subTasks.map(st => st.id === subTask.id ? data.data : st))
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  // Supprimer sous-tâche
  const deleteSubTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/subtasks?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSubTasks(subTasks.filter(st => st.id !== id))
        toast({ title: 'Sous-tâche supprimée' })
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    }
  }

  // Démarrer/Arrêter le timer
  const toggleTimer = async () => {
    if (!task) return
    
    setLoading(true)
    try {
      if (isTimerRunning) {
        // Arrêter le timer
        const res = await fetch('/api/tasks/timer', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id })
        })
        const data = await res.json()
        if (data.success) {
          setIsTimerRunning(false)
          setTotalTime(data.data.totalDuration || 0)
          toast({ title: 'Timer arrêté', description: `Durée: ${formatTime(data.data.totalDuration)}` })
        }
      } else {
        // Démarrer le timer
        const res = await fetch('/api/tasks/timer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id })
        })
        const data = await res.json()
        if (data.success) {
          setIsTimerRunning(true)
          task.timerStartedAt = new Date()
          toast({ title: 'Timer démarré' })
        }
      }
      onTaskUpdate()
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  // Formater le temps
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Sauvegarder les champs personnalisés
  const saveCustomFields = async () => {
    if (!task) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objectives, constraints, solutionProposed: solution })
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Modifications enregistrées' })
        onTaskUpdate()
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (!task) return null

  const priorityColors = {
    'Basse': 'bg-gray-500',
    'Moyenne': 'bg-blue-500',
    'Haute': 'bg-orange-500',
    'Urgente': 'bg-red-500'
  }

  const statusColors = {
    'À faire': 'bg-gray-500',
    'En cours': 'bg-blue-500',
    'En retard': 'bg-red-500',
    'Validé': 'bg-green-500'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] border-blue-400/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-amber-400" />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={`${statusColors[task.status]} text-white`}>
              {task.status}
            </Badge>
            <Badge className={`${priorityColors[task.priority]} text-white`}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <Badge variant="outline" className="border-blue-400 text-blue-200">
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(task.dueDate), 'd MMMM yyyy', { locale: fr })}
              </Badge>
            )}
          </div>

          {/* Timer */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-4 border border-amber-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isTimerRunning ? 'bg-green-500/30 animate-pulse' : 'bg-gray-500/30'}`}>
                  <Clock className={`w-6 h-6 ${isTimerRunning ? 'text-green-400' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-sm text-amber-200">Timer</p>
                  <p className="text-2xl font-mono font-bold text-white">
                    {isTimerRunning ? formatTime(timerSeconds) : formatTime(totalTime)}
                  </p>
                </div>
              </div>
              <Button
                onClick={toggleTimer}
                disabled={loading}
                className={`${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isTimerRunning ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Arrêter
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Démarrer
                  </>
                )}
              </Button>
            </div>
            {task.estimatedTime > 0 && (
              <p className="text-sm text-amber-300/70 mt-2">
                Temps estimé: {Math.floor(task.estimatedTime / 60)}h {task.estimatedTime % 60}m
              </p>
            )}
          </div>

          {/* Sous-tâches */}
          <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              Sous-tâches ({subTasks.filter(s => s.isCompleted).length}/{subTasks.length})
            </h3>
            
            <div className="space-y-2 mb-3">
              {subTasks.map((subTask) => (
                <div key={subTask.id} className="flex items-center gap-2 group bg-[#0f1c2e]/50 rounded-lg p-2">
                  <Checkbox
                    checked={subTask.isCompleted}
                    onCheckedChange={() => toggleSubTask(subTask)}
                    className="border-blue-400 data-[state=checked]:bg-amber-500"
                  />
                  <span className={`flex-1 ${subTask.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>
                    {subTask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSubTask(subTask.id)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Nouvelle sous-tâche..."
                value={newSubTaskTitle}
                onChange={(e) => setNewSubTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSubTask()}
                className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500"
              />
              <Button onClick={addSubTask} disabled={loading || !newSubTaskTitle.trim()} className="bg-amber-500 hover:bg-amber-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Champs personnalisés */}
          <div className="space-y-4">
            <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                Objectifs
              </h3>
              <Textarea
                placeholder="Définissez les objectifs de cette tâche..."
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
              />
            </div>

            <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Contraintes
              </h3>
              <Textarea
                placeholder="Listez les contraintes identifiées..."
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
              />
            </div>

            <div className="bg-[#1e3a5f]/50 rounded-xl p-4 border border-blue-400/20">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Solution proposée
              </h3>
              <Textarea
                placeholder="Proposez une solution..."
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="bg-[#0f1c2e] border-blue-400/30 text-white placeholder:text-gray-500 min-h-[80px]"
              />
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <Button 
            onClick={saveCustomFields} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Enregistrer les modifications
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
