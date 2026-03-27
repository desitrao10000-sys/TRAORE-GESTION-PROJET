'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  User,
  Calendar,
  DollarSign,
  FileText,
  Target,
  AlertTriangle,
  Lightbulb,
  ListTodo,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Task, Project } from '@/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardCalendarProps {
  tasks: Task[]
  projects: Project[]
  onTaskClick?: (taskId: string) => void
}

export function DashboardCalendar({ tasks, projects, onTaskClick }: DashboardCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Navigation du calendrier
  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Jours du mois actuel
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Jours à afficher (incluant les jours du mois précédent/suivant pour remplir la grille)
  const startDay = monthStart.getDay() || 7 // 0 = dimanche, on le convertit en 7
  const endPadding = 7 - (days.length + startDay - 1) % 7

  // Tâches groupées par date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd')
        const existing = map.get(dateKey) || []
        map.set(dateKey, [...existing, task])
      }
    })
    
    return map
  }, [tasks])

  // Tâches du jour sélectionné
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate.get(dateKey) || []
  }, [selectedDate, tasksByDate])

  // Couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-500'
      case 'En cours': return 'bg-blue-500'
      case 'En retard': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBgLight = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-green-500/20 text-green-300'
      case 'En cours': return 'bg-blue-500/20 text-blue-300'
      case 'En retard': return 'bg-red-500/20 text-red-300'
      default: return 'bg-gray-500/20 text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Validé': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'En cours': return <Clock className="w-4 h-4 text-blue-500" />
      case 'En retard': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'bg-red-500'
      case 'Haute': return 'bg-orange-500'
      case 'Moyenne': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const getPriorityBgLight = (priority: string) => {
    switch (priority) {
      case 'Urgente': return 'bg-red-500/20 text-red-300'
      case 'Haute': return 'bg-orange-500/20 text-orange-300'
      case 'Moyenne': return 'bg-yellow-500/20 text-yellow-300'
      default: return 'bg-green-500/20 text-green-300'
    }
  }

  // Nom des jours de la semaine
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  // Projets pour lookup
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>()
    projects.forEach(p => map.set(p.id, p))
    return map
  }, [projects])

  // Format monétaire
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Calendrier</h1>
          <p className="text-blue-200 mt-1">Vue planning de vos tâches - Cliquez sur une date pour voir les détails</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <CalendarIcon className="w-5 h-5 text-amber-400" />
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Aujourd&apos;hui
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={previousMonth}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-base font-bold text-blue-300 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="grid grid-cols-7 gap-1">
              {/* Jours vides avant le début du mois */}
              {Array.from({ length: startDay - 1 }).map((_, i) => (
                <div key={`empty-start-${i}`} className="h-24 bg-blue-900/20 rounded-lg" />
              ))}

              {/* Jours du mois */}
              {days.map((day, index) => {
                const dateKey = format(day, 'yyyy-MM-dd')
                const dayTasks = tasksByDate.get(dateKey) || []
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentDay = isToday(day)

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      h-24 p-2 rounded-lg transition-all text-left overflow-hidden
                      ${isSelected 
                        ? 'bg-amber-500/30 border-2 border-amber-400 shadow-lg shadow-amber-500/20' 
                        : isCurrentDay
                          ? 'bg-blue-500/20 border-2 border-blue-400'
                          : 'bg-[#0f1c2e]/50 hover:bg-blue-500/20 border border-transparent hover:border-blue-400/50'
                      }
                    `}
                  >
                    <div className={`
                      text-base font-bold mb-1
                      ${isCurrentDay ? 'text-amber-400' : 'text-white'}
                    `}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className={`text-xs truncate px-1.5 py-0.5 rounded text-white font-medium ${getStatusColor(task.status)}`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-amber-300 px-1.5 font-medium">
                          +{dayTasks.length - 2} autres
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}

              {/* Jours vides après la fin du mois */}
              {endPadding < 7 && Array.from({ length: endPadding }).map((_, i) => (
                <div key={`empty-end-${i}`} className="h-24 bg-blue-900/20 rounded-lg" />
              ))}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-400/20">
              <div className="flex items-center gap-1.5 text-sm text-blue-200">
                <div className="w-4 h-4 rounded-full bg-gray-400" />
                <span>À faire</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-blue-200">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span>En cours</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-blue-200">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span>En retard</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-blue-200">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span>Validé</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panneau latéral - Tâches du jour sélectionné avec TOUS les détails */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardHeader>
            <CardTitle className="text-white text-lg">
              {selectedDate 
                ? `Activités du ${format(selectedDate, 'd MMMM yyyy', { locale: fr })}`
                : 'Sélectionnez une date'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
                <p className="text-blue-200 text-base">Cliquez sur une date pour voir les activités</p>
              </div>
            ) : selectedDateTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                <p className="text-blue-200 text-base">Aucune activité pour cette date</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                {selectedDateTasks.map(task => {
                  const project = projectMap.get(task.projectId)
                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-[#0f1c2e]/70 rounded-xl border border-blue-400/20 space-y-3"
                    >
                      {/* Titre et statut */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="text-white font-bold text-base">{task.title}</span>
                        </div>
                        <Badge className={`${getStatusColor(task.status)} text-white text-xs border-0`}>
                          {task.status}
                        </Badge>
                      </div>

                      {/* Priorité */}
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPriorityBgLight(task.priority)} border-0 text-xs font-medium`}>
                          {task.priority}
                        </Badge>
                      </div>

                      {/* Projet */}
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400">Projet:</span>
                        <span className="text-white font-medium">{project?.name || 'Projet inconnu'}</span>
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
                      <div className="bg-blue-900/30 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
                          <DollarSign className="w-4 h-4" />
                          Budget de la tâche
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Budget prévu:</span>
                            <p className="text-white font-medium">{formatCurrency(task.budget || 0)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Dépenses:</span>
                            <p className="text-red-400 font-medium">{formatCurrency(task.budgetSpent || 0)}</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-400">Reste disponible:</span>
                          <p className={`font-bold ${(task.budget || 0) - (task.budgetSpent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {formatCurrency((task.budget || 0) - (task.budgetSpent || 0))}
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
                          <p className="text-sm text-gray-300 bg-blue-900/20 p-2 rounded whitespace-pre-wrap">
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
                          <p className="text-sm text-gray-300 bg-blue-900/20 p-2 rounded whitespace-pre-wrap">
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
                          <p className="text-sm text-gray-300 bg-blue-900/20 p-2 rounded whitespace-pre-wrap">
                            {task.constraints}
                          </p>
                        </div>
                      )}

                      {/* Solution proposée */}
                      {task.solutionProposed && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-yellow-300">
                            <Lightbulb className="w-4 h-4" />
                            Solution proposée
                          </div>
                          <p className="text-sm text-gray-300 bg-blue-900/20 p-2 rounded whitespace-pre-wrap">
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
                      <div className="flex items-center gap-2 text-sm text-gray-400 pt-2 border-t border-blue-400/10">
                        <MessageSquare className="w-4 h-4" />
                        <span>{task._count?.comments || 0} commentaire(s)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques du mois */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-500/20 rounded-lg">
                <Circle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {tasks.filter(t => t.status === 'À faire').length}
                </p>
                <p className="text-base text-blue-200 font-medium">À faire</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {tasks.filter(t => t.status === 'En cours').length}
                </p>
                <p className="text-base text-blue-200 font-medium">En cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {tasks.filter(t => t.status === 'En retard').length}
                </p>
                <p className="text-base text-blue-200 font-medium">En retard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {tasks.filter(t => t.status === 'Validé').length}
                </p>
                <p className="text-base text-blue-200 font-medium">Validé</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
