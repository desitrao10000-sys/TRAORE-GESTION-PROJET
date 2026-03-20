'use client'

import { 
  FolderOpen, 
  Zap, 
  AlertCircle, 
  CheckCircle2,
  PlayCircle,
  Clock,
  CheckCircle,
  Wallet,
  ArrowRight,
  ListTodo
} from 'lucide-react'
import { Project, Task, DashboardStats } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardOverviewProps {
  stats: DashboardStats
  projects: Project[]
  tasks: Task[]
  onProjectClick: (projectId: string) => void
  onNavigate: (page: 'projects') => void
}

export function DashboardOverview({ stats, projects, tasks, onProjectClick, onNavigate }: DashboardOverviewProps) {
  // Tâches prioritaires (en retard ou à faire)
  const priorityTasks = tasks
    .filter(t => t.status === 'En retard' || t.status === 'À faire')
    .slice(0, 4)

  // Séparer les projets par statut
  const projectsEnCours = projects.filter(p => p.status === 'En cours' || p.status === 'Actif')
  const projectsAFaire = projects.filter(p => p.status === 'À faire' || p.status === 'En attente' || (!p.status || p.status === ''))
  const projectsTermines = projects.filter(p => p.status === 'Terminé' || p.status === 'Archivé')

  // Formater le montant en CFA
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA'
  }

  // Couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-blue-500/30 text-blue-300'
      case 'Actif': return 'bg-green-500/30 text-green-300'
      case 'En retard': return 'bg-red-500/30 text-red-300'
      case 'À faire': return 'bg-gray-500/30 text-gray-300'
      case 'Validé': return 'bg-green-500/30 text-green-300'
      case 'Terminé': return 'bg-green-500/30 text-green-300'
      case 'Archivé': return 'bg-gray-500/30 text-gray-300'
      default: return 'bg-gray-500/30 text-gray-300'
    }
  }

  // Rendu d'une carte projet
  const renderProjectCard = (project: Project) => (
    <button
      key={project.id}
      onClick={() => onProjectClick(project.id)}
      className="w-full p-4 hover:bg-blue-400/10 transition-colors text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{project.name}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-blue-200 mb-2">
        <span>{project.tasks?.length || 0} tâches</span>
        <span>{formatCurrency(project.budgetSpent)}</span>
      </div>
      <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
          style={{ width: `${Math.min((project.budgetSpent / project.budgetPlanned) * 100, 100)}%` }}
        />
      </div>
    </button>
  )

  // Rendu d'une section de projets
  const renderProjectSection = (
    title: string, 
    icon: React.ReactNode, 
    titleColor: string,
    bgColor: string,
    projectsList: Project[],
    emptyMessage: string = "Aucun projet dans cette catégorie"
  ) => {
    return (
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="flex items-center justify-between p-4 border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-blue-200">
              {projectsList.length}
            </span>
          </div>
          <button 
            onClick={() => onNavigate('projects')}
            className="text-amber-400 text-sm hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {projectsList.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="divide-y divide-blue-400/20 max-h-80 overflow-y-auto">
            {projectsList.map(renderProjectCard)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Tableau de bord</h1>
        <p className="text-blue-200 mt-1">Vue d'ensemble de vos projets et tâches</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              <p className="text-sm text-blue-200">Projets actifs</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.tasksInProgress}</p>
              <p className="text-sm text-blue-200">Tâches en cours</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg shadow-lg">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.tasksLate}</p>
              <p className="text-sm text-blue-200">Tâches en retard</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.tasksCompleted}</p>
              <p className="text-sm text-blue-200">Tâches validées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projets par statut - 3 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projets en cours */}
        {renderProjectSection(
          'Projets en cours',
          <PlayCircle className="w-5 h-5 text-blue-400" />,
          'text-blue-400',
          'bg-blue-500/10',
          projectsEnCours
        )}

        {/* Projets à faire */}
        {renderProjectSection(
          'Projets à faire',
          <ListTodo className="w-5 h-5 text-amber-400" />,
          'text-amber-400',
          'bg-amber-500/10',
          projectsAFaire
        )}

        {/* Projets terminés */}
        {renderProjectSection(
          'Projets terminés',
          <CheckCircle className="w-5 h-5 text-green-400" />,
          'text-green-400',
          'bg-green-500/10',
          projectsTermines
        )}
      </div>

      {/* Tâches prioritaires */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="flex items-center justify-between p-4 border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">Tâches prioritaires</h2>
          </div>
          <span className="text-amber-400 text-sm">{priorityTasks.length} tâches</span>
        </div>
        <div className="divide-y divide-blue-400/20">
          {priorityTasks.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-blue-200">Aucune tâche prioritaire</p>
            </div>
          ) : (
            priorityTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-blue-400/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{task.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-sm text-blue-200">{task.project?.name}</p>
                {task.dueDate && (
                  <p className="text-xs text-blue-300/70 mt-1">
                    {format(new Date(task.dueDate), 'd MMMM yyyy', { locale: fr })}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Résumé budgétaire */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-2 p-4 border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
          <Wallet className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Résumé budgétaire (CFA)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-400/20">
            <p className="text-sm text-blue-200 mb-1">Budget total prévu</p>
            <p className="text-xl font-bold text-blue-300">{formatCurrency(stats.totalBudget)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-400/20">
            <p className="text-sm text-blue-200 mb-1">Dépenses réelles</p>
            <p className="text-xl font-bold text-amber-300">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-400/20">
            <p className="text-sm text-blue-200 mb-1">Reste disponible</p>
            <p className="text-xl font-bold text-green-300">{formatCurrency(stats.remainingBudget)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
