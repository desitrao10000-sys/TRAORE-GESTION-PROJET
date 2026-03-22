'use client'

import { useState, useMemo } from 'react'
import { Task } from '@/types'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react'
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
    'À faire': { icon: ListTodo, color: 'text-gray-300', bg: 'bg-gray-500/30' },
    'En cours': { icon: Clock, color: 'text-blue-300', bg: 'bg-blue-500/30' },
    'En retard': { icon: AlertCircle, color: 'text-red-300', bg: 'bg-red-500/30' },
    'Validé': { icon: CheckCircle2, color: 'text-green-300', bg: 'bg-green-500/30' }
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="space-y-4">
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
                        onClick={(e) => {
                          e.stopPropagation()
                          onTaskClick(task)
                        }}
                        className={`text-xs p-1 rounded truncate ${config.bg} ${config.color} hover:opacity-80 cursor-pointer`}
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

      {/* Tâches du jour sélectionné */}
      {selectedDate && (
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-amber-400">
              {format(selectedDate, 'd MMMM yyyy', { locale: fr })}
            </span>
            <Badge variant="outline" className="border-blue-400 text-blue-200">
              {selectedDateTasks.length} tâche(s)
            </Badge>
          </h3>

          {selectedDateTasks.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune tâche pour ce jour</p>
          ) : (
            <div className="space-y-2">
              {selectedDateTasks.map(task => {
                const config = statusConfig[task.status as keyof typeof statusConfig]
                const Icon = config.icon
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="flex items-center gap-3 p-3 bg-[#0f1c2e]/50 rounded-lg hover:bg-[#0f1c2e] cursor-pointer transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="text-sm text-gray-400">{task.project?.name}</p>
                    </div>
                    <Badge className={`${task.priority === 'Haute' || task.priority === 'Urgente' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                      {task.priority}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
