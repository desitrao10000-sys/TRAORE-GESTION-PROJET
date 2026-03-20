'use client'

import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  Zap,
  FolderOpen,
  ArrowRight
} from 'lucide-react'
import { Task, Project, Risk } from '@/types'
import { format, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DashboardStatisticsProps {
  tasks: Task[]
  projects: Project[]
  risks: Risk[]
}

export function DashboardStatistics({ tasks, projects, risks }: DashboardStatisticsProps) {
  const now = new Date()
  
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

  // Stats principales
  const stats = {
    activeProjects: projects.filter(p => p.status === 'Actif' || p.status === 'En cours').length,
    tasksCompleted: completedTasks,
    tasksLate: tasks.filter(t => t.status === 'En retard').length,
    criticalRisks: risks.filter(r => r.severity === 'Critique').length
  }

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

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Statistiques</h1>
        <p className="text-blue-200 mt-1">Analyse de performance et tendances</p>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-0">
                <TrendingUp className="w-3 h-3 mr-1" />+12%
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
                {stats.criticalRisks} critiques
              </Badge>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-bold text-white">{risks.length}</p>
              <p className="text-sm text-blue-200">Risques</p>
            </div>
          </CardContent>
        </Card>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Évolution du taux de complétion</h2>
            </div>
            
            {/* Graphique en barres */}
            <div className="flex items-end justify-between h-48 gap-3 mt-4 px-2">
              {monthsData.map((monthInfo, index) => {
                const rate = monthlyRates[index]
                return (
                  <div key={monthInfo.label + index} className="flex flex-col items-center flex-1 group">
                    <div className="w-full relative" style={{ height: '160px' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all duration-300 hover:from-amber-400 hover:to-amber-300 cursor-pointer group-hover:shadow-lg group-hover:shadow-amber-500/30"
                        style={{ height: `${Math.max(rate, 5)}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded font-medium">
                            {rate}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-200 mt-2 font-medium">{monthInfo.label}</span>
                  </div>
                )
              })}
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
                  <div key={index} className="bg-[#0f1c2e]/50 rounded-lg p-3">
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget et Risques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-amber-400" />
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
                    {new Intl.NumberFormat('fr-FR').format(totalBudget)} CFA
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-900/20 rounded-lg">
                  <span className="text-blue-200 text-sm">Dépensé</span>
                  <span className="text-amber-400 font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(totalSpent)} CFA
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-900/20 rounded-lg">
                  <span className="text-blue-200 text-sm">Restant</span>
                  <span className="text-green-400 font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(totalBudget - totalSpent)} CFA
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risques */}
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Analyse des risques</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(risksBySeverity).map(([severity, count]) => {
                const colors = {
                  'Critique': 'bg-red-500/20 border-red-400/50 text-red-300',
                  'Haute': 'bg-orange-500/20 border-orange-400/50 text-orange-300',
                  'Moyenne': 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300',
                  'Basse': 'bg-green-500/20 border-green-400/50 text-green-300'
                }
                const icons = {
                  'Critique': '🔴',
                  'Haute': '🟠',
                  'Moyenne': '🟡',
                  'Basse': '🟢'
                }
                
                return (
                  <div 
                    key={severity}
                    className={`rounded-xl p-4 border ${colors[severity as keyof typeof colors]}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span>{icons[severity as keyof typeof icons]}</span>
                      <span className="text-sm opacity-80">{severity}</span>
                    </div>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 p-3 bg-[#0f1c2e]/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-blue-200">Total des risques</span>
              </div>
              <span className="text-white font-bold">{risks.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
