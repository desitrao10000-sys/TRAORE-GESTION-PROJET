'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Project, Task } from '@/types'
import { format, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, isBefore, isAfter } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar, List, Filter, CheckCircle2, Clock, AlertCircle, PlayCircle } from 'lucide-react'

interface GanttViewProps {
  projects: Project[]
  tasks: Task[]
  onProjectClick?: (projectId: string) => void
}

type ViewMode = 'month' | 'week'

export function GanttView({ projects, tasks, onProjectClick }: GanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const ganttContainerRef = useRef<HTMLDivElement>(null)

  // Calculer la plage de dates à afficher
  const dateRange = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    
    // Toujours calculer les semaines pour l'affichage par semaine
    const weeks: Date[][] = []
    let currentWeek: Date[] = []
    
    const allDays = eachDayOfInterval({ start, end })
    
    allDays.forEach((day, index) => {
      currentWeek.push(day)
      // Fin de semaine (dimanche) ou dernier jour du mois
      if (day.getDay() === 0 || index === allDays.length - 1) {
        if (currentWeek.length > 0) {
          weeks.push([...currentWeek])
          currentWeek = []
        }
      }
    })
    
    return { days: allDays, weeks }
  }, [currentDate])

  // Filtrer les données
  const filteredProjects = useMemo(() => {
    if (selectedProjectId) {
      return projects.filter(p => p.id === selectedProjectId)
    }
    return projects.filter(p => p.status !== 'Terminé' && p.status !== 'Archivé')
  }, [projects, selectedProjectId])

  // Naviguer dans le temps
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  // Couleur selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours':
      case 'Actif':
        return 'bg-blue-500'
      case 'En retard':
        return 'bg-red-500'
      case 'À faire':
      case 'En attente':
        return 'bg-gray-400'
      case 'Validé':
      case 'Terminé':
        return 'bg-green-500'
      default:
        return 'bg-gray-400'
    }
  }

  // Couleur du texte du statut
  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'En cours':
      case 'Actif':
        return 'text-blue-300'
      case 'En retard':
        return 'text-red-300'
      case 'À faire':
      case 'En attente':
        return 'text-gray-300'
      case 'Validé':
      case 'Terminé':
        return 'text-green-300'
      default:
        return 'text-gray-300'
    }
  }

  // Style du texte sur les barres Gantt (très visible)
  const getBarTextStyle = (status: string) => {
    return 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
  }

  // Icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'En cours':
      case 'Actif':
        return <PlayCircle className="w-4 h-4" />
      case 'En retard':
        return <AlertCircle className="w-4 h-4" />
      case 'Validé':
      case 'Terminé':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // Calculer la position et largeur d'une barre Gantt
  const getBarStyle = (startDate: Date | null | string, endDate: Date | null | string, totalDays: number) => {
    // Convertir en Date si nécessaire
    const start = startDate ? (typeof startDate === 'string' ? new Date(startDate) : startDate) : null
    const end = endDate ? (typeof endDate === 'string' ? new Date(endDate) : endDate) : null
    
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null
    }
    
    const viewStart = startOfMonth(currentDate)
    const viewEnd = endOfMonth(currentDate)
    
    // Vérifier si le projet est dans le mois affiché
    if (isBefore(end, viewStart) || isAfter(start, viewEnd)) {
      return null
    }
    
    // Ajuster les dates si elles débordent
    const effectiveStart = isBefore(start, viewStart) ? viewStart : start
    const effectiveEnd = isAfter(end, viewEnd) ? viewEnd : end
    
    const startOffset = differenceInDays(effectiveStart, viewStart)
    const duration = differenceInDays(effectiveEnd, effectiveStart) + 1
    
    // S'assurer que les valeurs sont valides
    if (startOffset < 0 || duration <= 0) return null
    
    // Calcul précis: chaque jour occupe exactement 100/totalDays %
    const left = (startOffset / totalDays) * 100
    const width = Math.max((duration / totalDays) * 100, 2)
    
    return { 
      left: `${left}%`, 
      width: `${width}%`,
    } as React.CSSProperties
  }

  // Calculer la position de la ligne "Aujourd'hui" (même logique que les barres)
  const getTodayLinePosition = (totalDays: number) => {
    const today = new Date()
    const viewStart = startOfMonth(currentDate)
    
    // Vérifier si aujourd'hui est dans le mois affiché
    if (!isWithinInterval(today, { start: startOfMonth(currentDate), end: endOfMonth(currentDate) })) {
      return null
    }
    
    const dayOffset = differenceInDays(today, viewStart)
    const leftPercent = (dayOffset / totalDays) * 100
    
    return leftPercent
  }

  // Vérifier si un jour est aujourd'hui
  const isToday = (day: Date) => isSameDay(day, new Date())

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Vue de Gantt</h1>
        <p className="text-blue-200 mt-1">Visualisation temporelle des projets et tâches</p>
      </div>

      {/* Barre de contrôle */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-4 shadow-lg shadow-blue-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-blue-200" />
            </button>
            <span className="text-lg font-bold text-white min-w-[180px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-blue-200" />
            </button>
          </div>

          {/* Mode de vue */}
          <div className="flex items-center gap-2 bg-blue-900/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-amber-500 text-white'
                  : 'text-blue-200 hover:bg-blue-500/20'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Mois
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-amber-500 text-white'
                  : 'text-blue-200 hover:bg-blue-500/20'
              }`}
            >
              <List className="w-4 h-4 inline mr-2" />
              Semaines
            </button>
          </div>

          {/* Filtre projet */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-200" />
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="bg-blue-900/30 border border-blue-400/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous les projets actifs</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Aujourd'hui */}
          <button
            onClick={() => {
              const today = new Date()
              setCurrentDate(today)
              // Défiler vers aujourd'hui après un court délai
              setTimeout(() => {
                // Trouver l'élément scrollable (celui avec overflow-x-auto)
                const scrollContainer = ganttContainerRef.current?.querySelector('.overflow-x-auto') as HTMLElement
                if (scrollContainer) {
                  // Calculer la position de scroll pour aujourd'hui
                  const viewStart = startOfMonth(today)
                  const viewEnd = endOfMonth(today)
                  const allDays = eachDayOfInterval({ start: viewStart, end: viewEnd })
                  const totalDays = allDays.length
                  const dayOffset = differenceInDays(today, viewStart)
                  
                  // Largeur de la zone scrollable
                  const scrollWidth = scrollContainer.scrollWidth
                  const clientWidth = scrollContainer.clientWidth
                  const projectColumnWidth = 288 // w-72 = 288px
                  
                  // Position d'aujourd'hui en pourcentage puis en pixels
                  const todayPercent = (dayOffset / totalDays)
                  const todayPosition = projectColumnWidth + todayPercent * (scrollWidth - projectColumnWidth)
                  
                  // Scroll pour centrer aujourd'hui
                  const scrollTo = todayPosition - (clientWidth / 2)
                  
                  scrollContainer.scrollTo({
                    left: Math.max(0, scrollTo),
                    behavior: 'smooth'
                  })
                }
              }, 200)
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-all shadow-lg"
          >
            Aujourd&apos;hui
          </button>
        </div>
      </div>

      {/* Diagramme de Gantt */}
      <div ref={ganttContainerRef} className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px] relative">
            {/* En-tête avec les jours */}
            <div className="flex border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
              {/* Colonne projet/tâche */}
              <div className="w-72 min-w-72 p-4 border-r border-blue-400/20">
                <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                  Projets & Tâches
                </span>
              </div>
              
              {/* Jours */}
              <div className="flex-1 flex">
                {viewMode === 'month' ? (
                  // Affichage par jour
                  dateRange.days.map((day, index) => (
                    <div
                      key={index}
                      data-today={isToday(day) ? 'true' : undefined}
                      className={`flex-1 min-w-8 p-1 text-center border-r border-blue-400/10 ${
                        isToday(day) ? 'bg-amber-500/20' : ''
                      } ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-blue-900/30' : ''}`}
                    >
                      <div className="text-xs text-blue-300">
                        {format(day, 'EEE', { locale: fr })}
                      </div>
                      <div className={`text-sm font-semibold ${isToday(day) ? 'text-amber-400' : 'text-white'}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))
                ) : (
                  // Affichage par semaine
                  dateRange.weeks.map((week, index) => (
                    <div
                      key={index}
                      className="flex-1 p-2 text-center border-r border-blue-400/10"
                    >
                      <div className="text-xs text-blue-300">Sem {index + 1}</div>
                      <div className="text-sm text-white">
                        {week[0] ? format(week[0], 'd') : '-'} - {week.length > 0 && week[week.length - 1] ? format(week[week.length - 1], 'd') : '-'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ligne aujourd'hui - positionnée exactement comme les barres */}
            {(() => {
              const todayPercent = getTodayLinePosition(dateRange.days.length)
              if (todayPercent === null) return null
              
              // Ajouter 0.5 jour pour centrer sur le milieu du jour
              // Un jour = 100/totalDays %, donc 0.5 jour = 50/totalDays %
              const halfDayPercent = (0.5 / dateRange.days.length) * 100
              const centeredPercent = todayPercent + halfDayPercent
              
              return (
                <div className="flex items-stretch absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-20">
                  {/* Zone vide pour la colonne projet */}
                  <div className="w-72 min-w-72" />
                  {/* Zone des jours avec la ligne */}
                  <div className="flex-1 relative">
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-amber-500"
                      style={{ left: `${centeredPercent}%` }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-b-lg whitespace-nowrap shadow-lg">
                        Aujourd&apos;hui ({format(new Date(), 'd MMM', { locale: fr })})
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Contenu - Projets et tâches */}
            <div className="divide-y divide-blue-400/10">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-blue-200">Aucun projet à afficher</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Les projets terminés ou archivés ne sont pas affichés par défaut
                  </p>
                </div>
              ) : (
                filteredProjects.map(project => {
                  const projectTasks = tasks.filter(t => t.projectId === project.id)
                  const projectStartDate = project.startDate ? new Date(project.startDate) : null
                  const projectEndDate = project.endDate ? new Date(project.endDate) : null
                  
                  return (
                    <div key={project.id} className="hover:bg-blue-500/5">
                      {/* Ligne projet */}
                      <div className="flex items-stretch">
                        <div 
                          className="w-72 min-w-72 p-3 border-r border-blue-400/20 cursor-pointer"
                          onClick={() => onProjectClick?.(project.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                            <span className="font-semibold text-white truncate">
                              {project.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className={`flex items-center gap-1 ${getStatusTextColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              {project.status}
                            </span>
                            <span className="text-blue-300">
                              {projectTasks.length} tâches
                            </span>
                          </div>
                        </div>
                        
                        {/* Barre Gantt projet */}
                        <div className="flex-1 relative h-16">
                          {(() => {
                            const barStyle = getBarStyle(projectStartDate, projectEndDate, dateRange.days.length)
                            if (!barStyle) {
                              // Projet hors de la plage de dates affichée
                              return (
                                <div className="absolute top-3 h-10 left-0 right-0 flex items-center justify-center">
                                  <span className="text-xs text-gray-500 italic">
                                    {projectStartDate ? `(${format(projectStartDate, 'd MMM yyyy', { locale: fr })} - ${projectEndDate ? format(projectEndDate, 'd MMM yyyy', { locale: fr }) : '?'})` : 'Dates non définies'}
                                  </span>
                                </div>
                              )
                            }
                            const duration = differenceInDays(projectEndDate!, projectStartDate!) + 1
                            return (
                              <div
                                className={`absolute top-3 h-10 rounded-lg ${getStatusColor(project.status)} flex items-center justify-between px-3 shadow-lg cursor-pointer group`}
                                style={barStyle}
                                onClick={() => onProjectClick?.(project.id)}
                                title={`${project.name}: ${format(projectStartDate!, 'd MMM yyyy', { locale: fr })} - ${format(projectEndDate!, 'd MMM yyyy', { locale: fr })} (${duration} jours)`}
                              >
                                <span className={`text-xs truncate ${getBarTextStyle(project.status)}`}>
                                  {project.name}
                                </span>
                                {/* Dates affichées dans la barre - très visibles */}
                                <span className={`text-[11px] ml-2 whitespace-nowrap bg-black/30 px-2 py-0.5 rounded ${getBarTextStyle(project.status)}`}>
                                  {format(projectStartDate!, 'd')} - {format(projectEndDate!, 'd')} {format(projectEndDate!, 'MMM', { locale: fr })}
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      
                      {/* Tâches du projet */}
                      {projectTasks.map(task => {
                        const taskStartDate = task.startedAt ? new Date(task.startedAt) : task.dueDate ? addDays(new Date(task.dueDate), -3) : null
                        const taskEndDate = task.dueDate ? new Date(task.dueDate) : task.completedAt ? new Date(task.completedAt) : null
                        
                        return (
                          <div key={task.id} className="flex items-stretch bg-blue-900/10">
                            <div className="w-72 min-w-72 p-2 pl-8 border-r border-blue-400/20">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                                <span className="text-sm text-blue-200 truncate">
                                  {task.title}
                                </span>
                              </div>
                              {task.dueDate && (
                                <div className="text-xs text-blue-300/70 ml-4 mt-0.5">
                                  Échéance: {format(new Date(task.dueDate), 'd MMM yyyy', { locale: fr })}
                                </div>
                              )}
                            </div>
                            
                            {/* Barre Gantt tâche */}
                            <div className="flex-1 relative h-10">
                              {(() => {
                                const taskBarStyle = getBarStyle(taskStartDate, taskEndDate, dateRange.days.length)
                                if (!taskBarStyle) {
                                  // Tâche hors de la plage
                                  return (
                                    <div className="absolute top-2 h-6 left-0 right-0 flex items-center justify-center">
                                      <span className="text-[10px] text-gray-500 italic">
                                        {taskStartDate ? format(taskStartDate, 'd MMM') : '?'} - {taskEndDate ? format(taskEndDate, 'd MMM') : '?'}
                                      </span>
                                    </div>
                                  )
                                }
                                const taskDuration = taskStartDate && taskEndDate ? differenceInDays(taskEndDate, taskStartDate) + 1 : 0
                                return (
                                  <div
                                    className={`absolute top-2 h-6 rounded ${getStatusColor(task.status)} flex items-center justify-between px-2`}
                                    style={taskBarStyle}
                                    title={`${task.title}: ${taskStartDate ? format(taskStartDate, 'd MMM yyyy', { locale: fr }) : '?'} - ${taskEndDate ? format(taskEndDate, 'd MMM yyyy', { locale: fr }) : '?'} (${taskDuration} jours)`}
                                  >
                                    <span className={`text-[10px] truncate ${getBarTextStyle(task.status)}`}>
                                      {task.title}
                                    </span>
                                    {/* Dates sur la barre tâche - très visibles */}
                                    <span className={`text-[9px] ml-1 bg-black/30 px-1.5 py-0.5 rounded whitespace-nowrap ${getBarTextStyle(task.status)}`}>
                                      {taskStartDate ? format(taskStartDate, 'd') : '?'}-{taskEndDate ? format(taskEndDate, 'd') : '?'}
                                    </span>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-4 shadow-lg shadow-blue-500/10">
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide mb-3">
          Légende
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-sm text-blue-200">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-sm text-blue-200">En retard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-sm text-blue-200">Validé / Terminé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span className="text-sm text-blue-200">À faire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-amber-500" />
            <span className="text-sm text-blue-200">Aujourd&apos;hui</span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{filteredProjects.length}</p>
              <p className="text-sm text-blue-200">Projets affichés</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg">
              <List className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {filteredProjects.reduce((sum, p) => sum + tasks.filter(t => t.projectId === p.id).length, 0)}
              </p>
              <p className="text-sm text-blue-200">Tâches totales</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg shadow-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {filteredProjects.reduce((sum, p) => sum + tasks.filter(t => t.projectId === p.id && t.status === 'En retard').length, 0)}
              </p>
              <p className="text-sm text-blue-200">Tâches en retard</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {filteredProjects.reduce((sum, p) => sum + tasks.filter(t => t.projectId === p.id && t.status === 'Validé').length, 0)}
              </p>
              <p className="text-sm text-blue-200">Tâches validées</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
