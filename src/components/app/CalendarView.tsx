'use client'

import { useState, useMemo } from 'react'
import { Task } from '@/types'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, ListTodo, User, Folder, Calendar, DollarSign, FileText, Target, AlertTriangle, Lightbulb, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface CalendarViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [currentDate])

  // Grouper les tâches par date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd')
        if (!grouped[dateKey]) grouped[dateKey] = []
        grouped[dateKey].push(task)
      }
    })
    return grouped
  }, [tasks])

  // Tâches pour la date sélectionnée
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate[dateKey] || []
  }, [selectedDate, tasksByDate])

  // Navigation
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const statusConfig = {
    'À faire': { icon: ListTodo, color: 'text-gray-300', bg: 'bg-gray-500/30', label: 'À faire' },
    'En cours': { icon: Clock, color: 'text-blue-300', bg: 'bg-blue-500/30', label: 'En cours' },
    'En retard': { icon: AlertCircle, color: 'text-red-300', bg: 'bg-red-500/30', label: 'En retard' },
    'Validé': { icon: CheckCircle2, color: 'text-green-300', bg: 'bg-green-500/30', label: 'Validé' }
  }

  const priorityConfig = {
    'Urgente': { color: 'bg-red-500', text: 'text-white' },
    'Haute': { color: 'bg-orange-500', text: 'text-white' },
    'Moyenne': { color: 'bg-yellow-500', text: 'text-black' },
    'Basse': { color: 'bg-green-500', text: 'text-white' }
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  // Formater le budget
  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  return (
    <div className="flex gap-4">
      {/* Calendrier */}
      <div className="flex-1 space-y-4">
        {/* En-tête du calendrier */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border border-blue-400/30 hover:border-blue-400/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border border-blue-400/30 hover:border-blue-400/50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Grille du calendrier */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] rounded-xl border border-blue-400/30 overflow-hidden">
          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-blue-400/20">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-blue-200">
                {day}
              </div>
            ))}
          </div>

          {/* Jours */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] p-2 border-b border-r border-blue-400/10 cursor-pointer transition-all
                    ${!isCurrentMonth ? 'bg-[#0a1628]/50' : 'bg-transparent'}
                    ${isSelected ? 'bg-amber-500/20 border-amber-400/50' : ''}
                    ${isTodayDate ? 'ring-2 ring-amber-400 ring-inset' : ''}
                    hover:bg-blue-500/10`}
                >
                  <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => {
                      const config = statusConfig[task.status as keyof typeof statusConfig]
                      return (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate ${config.bg} ${config.color}`}
                        >
                          {task.title}
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-blue-300/70">
                        +{dayTasks.length - 3} autres
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Panneau des tâches détaillées */}
      {selectedDate && (
        <div className="w-[450px] bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl border border-blue-400/30 overflow-hidden flex flex-col">
          {/* En-tête */}
          <div className="p-4 border-b border-blue-400/20 bg-[#0f1c2e]/50">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400">
                {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
              </span>
            </h3>
            <Badge variant="outline" className="mt-2 border-blue-400 text-blue-200">
              {selectedDateTasks.length} tâche(s) ce jour
            </Badge>
          </div>

          {/* Liste des tâches avec tous les détails */}
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {selectedDateTasks.length === 0 ? (
              <div className="p-8 text-center">
                <ListTodo className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Aucune tâche pour ce jour</p>
              </div>
            ) : (
              <div className="divide-y divide-blue-400/10">
                {selectedDateTasks.map(task => {
                  const config = statusConfig[task.status as keyof typeof statusConfig]
                  const priority = priorityConfig[task.priority as keyof typeof priorityConfig]
                  const Icon = config.icon

                  return (
                    <div key={task.id} className="p-4 space-y-3">
                      {/* Titre et statut */}
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${config.bg}`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-base">{task.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${priority.color} ${priority.text} text-xs`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={`${config.bg} ${config.color} border-0 text-xs`}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Projet */}
                      <div className="flex items-center gap-2 text-sm">
                        <Folder className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">Projet:</span>
                        <span className="text-white font-medium">{task.project?.name || 'N/A'}</span>
                      </div>

                      {/* Responsable */}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400">Responsable:</span>
                        <span className="text-white">{task.assigneeName || 'Non assigné'}</span>
                      </div>

                      {/* Date d'échéance */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span className="text-gray-400">Échéance:</span>
                        <span className="text-white">
                          {task.dueDate ? format(new Date(task.dueDate), 'd MMMM yyyy', { locale: fr }) : 'N/A'}
                        </span>
                      </div>

                      {/* Budget */}
                      <div className="bg-[#0f1c2e]/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
                          <DollarSign className="w-4 h-4" />
                          Budget de la tâche
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Budget prévu:</span>
                            <p className="text-white font-medium">{formatBudget(task.budget || 0)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Dépenses:</span>
                            <p className="text-red-400 font-medium">{formatBudget(task.budgetSpent || 0)}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Reste disponible:</span>
                          <p className={`font-bold ${(task.budget || 0) - (task.budgetSpent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatBudget((task.budget || 0) - (task.budgetSpent || 0))}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-blue-300">
                            <FileText className="w-4 h-4" />
                            Description
                          </div>
                          <p className="text-sm text-gray-300 bg-[#0f1c2e]/30 p-2 rounded">
                            {task.description}
                          </p>
                        </div>
                      )}

                      {/* Objectifs */}
                      {task.objectives && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-green-300">
                            <Target className="w-4 h-4" />
                            Objectifs
                          </div>
                          <p className="text-sm text-gray-300 bg-[#0f1c2e]/30 p-2 rounded">
                            {task.objectives}
                          </p>
                        </div>
                      )}

                      {/* Contraintes */}
                      {task.constraints && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-orange-300">
                            <AlertTriangle className="w-4 h-4" />
                            Contraintes
                          </div>
                          <p className="text-sm text-gray-300 bg-[#0f1c2e]/30 p-2 rounded">
                            {task.constraints}
                          </p>
                        </div>
                      )}

                      {/* Solution proposée */}
                      {task.solutionProposed && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
                            <Lightbulb className="w-4 h-4" />
                            Solution proposée
                          </div>
                          <p className="text-sm text-gray-300 bg-[#0f1c2e]/30 p-2 rounded">
                            {task.solutionProposed}
                          </p>
                        </div>
                      )}

                      {/* Sous-tâches */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-cyan-300">
                            <ListTodo className="w-4 h-4" />
                            Sous-tâches ({task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length})
                          </div>
                          <div className="space-y-1">
                            {task.subtasks.map(sub => (
                              <div key={sub.id} className="flex items-center gap-2 text-sm">
                                <div className={`w-4 h-4 rounded flex items-center justify-center ${sub.isCompleted ? 'bg-green-500' : 'bg-gray-600'}`}>
                                  {sub.isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className={sub.isCompleted ? 'text-gray-400 line-through' : 'text-gray-300'}>
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Commentaires */}
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MessageSquare className="w-4 h-4" />
                        <span>{task._count?.comments || 0} commentaire(s)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
