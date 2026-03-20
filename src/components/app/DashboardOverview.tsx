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
  ListTodo,
  TrendingUp,
  Target,
  Activity,
  BarChart3
} from 'lucide-react'
import { Project, Task, DashboardStats, Risk } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DashboardOverviewProps {
  stats: DashboardStats
  projects: Project[]
  tasks: Task[]
  risks: Risk[]
  onProjectClick: (projectId: string) => void
  onNavigate: (page: 'projects') => void
}

export function DashboardOverview({ stats, projects, tasks, risks, onProjectClick, onNavigate }: DashboardOverviewProps) {
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

  // ===== STATISTIQUES AVANCÉES (ex-DashboardStatistics) =====
  
  // Calculs des statistiques
  const tasksByStatus = {
    'À faire': tasks.filter(t => t.status === 'À faire').length,
    'En cours': tasks.filter(t => t.status === 'En cours').length,
    'En retard': tasks.filter(t => t.status === 'En retard').length,
    'Validé': tasks.filter(t => t.status === 'Validé').length
  }
  
  const totalTasks = tasks.length
  const completedTasks = tasksByStatus['Validé']
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Tâches par priorité
  const tasksByPriority = {
    'Urgente': tasks.filter(t => t.priority === 'Urgente').length,
    'Haute': tasks.filter(t => t.priority === 'Haute').length,
    'Moyenne': tasks.filter(t => t.priority === 'Moyenne').length,
    'Basse': tasks.filter(t => t.priority === 'Basse').length
  }

  // Risques par sévérité
  const risksBySeverity = {
    'Critique': risks.filter(r => r.severity === 'Critique').length,
    'Haute': risks.filter(r => r.severity === 'Haute').length,
    'Moyenne': risks.filter(r => r.severity === 'Moyenne').length,
    'Basse': risks.filter(r => r.severity === 'Basse').length
  }

  // Budget
  const totalBudget = projects.reduce((sum, p) => sum + p.budgetPlanned, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0)
  const budgetRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  // Performance par projet
  const projectPerformance = projects.map(p => {
    const projectTasks = tasks.filter(t => t.projectId === p.id)
    const completed = projectTasks.filter(t => t.status === 'Validé').length
    const total = projectTasks.length
    return {
      name: p.name,
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      status: p.status
    }
  }).sort((a, b) => b.rate - a.rate).slice(0, 5)

  // Données mensuelles - calcul réel basé sur les dates de complétion
  const getLast6Months = () => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        date,
        label: format(date, 'MMM', { locale: fr }),
        year: date.getFullYear(),
        month: date.getMonth()
      })
    }
    return months
  }
  
  const monthsData = getLast6Months()
  
  // Calculer les taux de complétion par mois
  const monthlyRates = monthsData.map(monthInfo => {
    const monthTasks = tasks.filter(t => {
      if (!t.completedAt) return false
      const completedDate = new Date(t.completedAt)
      return completedDate.getFullYear() === monthInfo.year && 
             completedDate.getMonth() === monthInfo.month
    })
    
    const monthTotalTasks = tasks.filter(t => {
      if (!t.createdAt) return false
      const createdDate = new Date(t.createdAt)
      return createdDate.getFullYear() === monthInfo.year && 
             createdDate.getMonth() === monthInfo.month
    })
    
    const total = monthTotalTasks.length || tasks.length
    const completed = monthTasks.length || completedTasks
    
    return total > 0 ? Math.round((completed / total) * 100) : completionRate
  })

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

      {/* KPI Cards - Enrichis avec taux de complétion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-0">
                <TrendingUp className="w-3 h-3 mr-1" />+{Math.min(completionRate, 12)}%
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-white">{completionRate}%</p>
              <p className="text-sm text-blue-200">Taux de complétion</p>
            </div>
            <div className="mt-2 h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-0">
                {totalTasks} total
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-white">{completedTasks}</p>
              <p className="text-sm text-blue-200">Tâches validées</p>
            </div>
            <div className="mt-2 h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <FolderOpen className="w-5 h-5 text-amber-400" />
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-0">
                {stats.activeProjects} actifs
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-white">{projects.length}</p>
              <p className="text-sm text-blue-200">Projets</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <Badge className="bg-red-500/20 text-red-300 border-0">
                {risks.filter(r => r.severity === 'Critique').length} critiques
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-white">{risks.length}</p>
              <p className="text-sm text-blue-200">Risques</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques avancés - 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des tâches */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Répartition des tâches</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(tasksByStatus).map(([status, count]) => {
                const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
                const colors = {
                  'À faire': 'bg-gray-400',
                  'En cours': 'bg-blue-400',
                  'En retard': 'bg-red-400',
                  'Validé': 'bg-green-400'
                }
                const bgColors = {
                  'À faire': 'bg-gray-500/20',
                  'En cours': 'bg-blue-500/20',
                  'En retard': 'bg-red-500/20',
                  'Validé': 'bg-green-500/20'
                }
                
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-200">{status}</span>
                      <span className="text-white font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${bgColors[status as keyof typeof bgColors]}`}>
                      <div 
                        className={`h-full rounded-full transition-all ${colors[status as keyof typeof colors]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Priorité des tâches */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Tâches par priorité</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(tasksByPriority).map(([priority, count]) => {
                const colors = {
                  'Urgente': 'from-red-500 to-red-600 border-red-400',
                  'Haute': 'from-orange-500 to-orange-600 border-orange-400',
                  'Moyenne': 'from-yellow-500 to-yellow-600 border-yellow-400',
                  'Basse': 'from-green-500 to-green-600 border-green-400'
                }
                
                return (
                  <div 
                    key={priority}
                    className={`bg-gradient-to-br ${colors[priority as keyof typeof colors]} p-4 rounded-xl border`}
                  >
                    <p className="text-white/80 text-xs">{priority}</p>
                    <p className="text-2xl font-bold text-white mt-1">{count}</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Évolution mensuelle et Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Évolution du taux de complétion</h2>
            </div>
            
            {/* Graphique en barres amélioré */}
            <div className="relative">
              {/* Lignes de grille et échelle */}
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-xs text-blue-300">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>
              
              {/* Zone du graphique */}
              <div className="ml-10 relative">
                {/* Lignes horizontales de grille */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '180px' }}>
                  <div className="border-b border-blue-400/10 w-full" />
                  <div className="border-b border-blue-400/10 w-full" />
                  <div className="border-b border-blue-400/10 w-full" />
                  <div className="border-b border-blue-400/10 w-full" />
                  <div className="border-b border-blue-400/20 w-full" />
                </div>
                
                {/* Barres */}
                <div className="flex items-end justify-between h-44 gap-2 relative z-10 pt-1">
                  {monthsData.map((monthInfo, index) => {
                    const rate = monthlyRates[index]
                    const barHeight = Math.max(rate * 1.76, 8) // 176px max height (100% = 176px)
                    
                    return (
                      <div key={monthInfo.label + index} className="flex flex-col items-center flex-1 group">
                        {/* Valeur au-dessus de la barre */}
                        <div className="text-xs font-bold text-amber-400 mb-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {rate}%
                        </div>
                        
                        {/* Barre */}
                        <div 
                          className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-md transition-all duration-300 hover:from-amber-500 hover:via-amber-400 hover:to-amber-300 cursor-pointer shadow-md hover:shadow-lg hover:shadow-amber-500/30 relative overflow-hidden"
                          style={{ height: `${barHeight}px` }}
                        >
                          {/* Effet de brillance */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                        
                        {/* Label du mois */}
                        <span className="text-xs text-blue-200 mt-2 font-medium uppercase">{monthInfo.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {/* Ligne de tendance */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-blue-400/20">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-blue-200">Tendance actuelle: </span>
              <span className="text-sm font-semibold text-green-400">{completionRate}% de complétion</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance par projet */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Performance par projet</h2>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-0">Top 5</Badge>
            </div>
            
            <div className="space-y-3">
              {projectPerformance.length === 0 ? (
                <p className="text-blue-300/50 text-sm text-center py-4">Aucun projet disponible</p>
              ) : (
                projectPerformance.map((project, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const proj = projects.find(p => p.name === project.name)
                      if (proj) onProjectClick(proj.id)
                    }}
                    className="w-full bg-[#0f1c2e]/50 rounded-lg p-3 hover:bg-blue-400/10 transition-colors text-left"
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white font-medium truncate max-w-[180px]">{project.name}</span>
                      <span className="text-amber-400 font-bold">{project.rate}%</span>
                    </div>
                    <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                        style={{ width: `${project.rate}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-blue-300 mt-1">
                      <span>{project.completed} validées</span>
                      <span>{project.total} total</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
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

      {/* Budget et Risques - Cercle budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget avec cercle */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Utilisation du budget</h2>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Cercle de progression */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="42"
                    stroke="rgb(30, 58, 95)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    stroke="url(#budgetGrad)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${budgetRate * 2.64} 264`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="budgetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{budgetRate}%</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center p-2 bg-blue-900/30 rounded-lg">
                  <span className="text-blue-200 text-sm">Budget total</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(totalBudget)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-900/20 rounded-lg">
                  <span className="text-blue-200 text-sm">Dépensé</span>
                  <span className="text-amber-400 font-semibold">
                    {formatCurrency(totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-900/20 rounded-lg">
                  <span className="text-blue-200 text-sm">Restant</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(totalBudget - totalSpent)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analyse des risques - Graphique circulaire */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Analyse des risques</h2>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Graphique en donut */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Cercle de fond */}
                  <circle
                    cx="50" cy="50" r="38"
                    stroke="rgb(30, 58, 95)"
                    strokeWidth="14"
                    fill="none"
                  />
                  
                  {/* Calculer les segments */}
                  {(() => {
                    const total = risks.length || 1
                    const segments = [
                      { severity: 'Critique', count: risksBySeverity['Critique'], color: '#ef4444' },
                      { severity: 'Haute', count: risksBySeverity['Haute'], color: '#f97316' },
                      { severity: 'Moyenne', count: risksBySeverity['Moyenne'], color: '#eab308' },
                      { severity: 'Basse', count: risksBySeverity['Basse'], color: '#22c55e' }
                    ].filter(s => s.count > 0)
                    
                    let cumulativePercent = 0
                    const circumference = 2 * Math.PI * 38
                    
                    return segments.map((segment, index) => {
                      const percent = (segment.count / total) * 100
                      const dashArray = (percent / 100) * circumference
                      const dashOffset = -cumulativePercent / 100 * circumference
                      cumulativePercent += percent
                      
                      return (
                        <circle
                          key={segment.severity}
                          cx="50" cy="50" r="38"
                          stroke={segment.color}
                          strokeWidth="14"
                          fill="none"
                          strokeDasharray={`${dashArray} ${circumference}`}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      )
                    })
                  })()}
                </svg>
                
                {/* Centre avec le total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{risks.length}</span>
                  <span className="text-xs text-blue-200">risques</span>
                </div>
              </div>
              
              {/* Légende */}
              <div className="flex-1 space-y-2">
                {Object.entries(risksBySeverity).map(([severity, count]) => {
                  const percentage = risks.length > 0 ? Math.round((count / risks.length) * 100) : 0
                  const colors = {
                    'Critique': 'bg-red-500',
                    'Haute': 'bg-orange-500',
                    'Moyenne': 'bg-yellow-500',
                    'Basse': 'bg-green-500'
                  }
                  const dotColors = {
                    'Critique': 'bg-red-500',
                    'Haute': 'bg-orange-500',
                    'Moyenne': 'bg-yellow-500',
                    'Basse': 'bg-green-500'
                  }
                  
                  return (
                    <div key={severity} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-400/10 transition-colors">
                      <div className={`w-3 h-3 rounded-full ${dotColors[severity as keyof typeof dotColors]} flex-shrink-0`} />
                      <span className="text-sm text-blue-200 flex-1">{severity}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{count}</span>
                        <span className="text-xs text-blue-300">({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Barres horizontales de visualisation */}
            <div className="mt-4 space-y-2">
              {Object.entries(risksBySeverity).map(([severity, count]) => {
                const percentage = risks.length > 0 ? Math.round((count / risks.length) * 100) : 0
                const barColors = {
                  'Critique': 'from-red-600 to-red-400',
                  'Haute': 'from-orange-600 to-orange-400',
                  'Moyenne': 'from-yellow-600 to-yellow-400',
                  'Basse': 'from-green-600 to-green-400'
                }
                
                return (
                  <div key={severity} className="flex items-center gap-2">
                    <span className="text-xs text-blue-300 w-16 truncate">{severity}</span>
                    <div className="flex-1 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${barColors[severity as keyof typeof barColors]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white font-medium w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
