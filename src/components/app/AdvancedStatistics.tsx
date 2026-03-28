'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend
} from 'recharts'
import { 
  TrendingUp, TrendingDown, Target, CheckCircle2, Clock, 
  AlertTriangle, BarChart3, PieChart as PieChartIcon, Activity,
  DollarSign, Calendar, Briefcase, Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Project {
  id: string
  name: string
  status: string
  budgetPlanned: number
  budgetSpent: number
  startDate: string | null
  endDate: string | null
  createdAt: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  createdAt: string
  completedAt: string | null
  projectId: string
  project?: { name: string }
}

interface Risk {
  id: string
  title: string
  severity: string
  status: string
  projectId: string
}

interface AdvancedStatisticsProps {
  projects: Project[]
  tasks: Task[]
  risks: Risk[]
}

const COLORS = {
  primary: '#f59e0b',
  secondary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#eab308',
  purple: '#a855f7',
  cyan: '#06b6d4',
  pink: '#ec4899'
}

const STATUS_COLORS: Record<string, string> = {
  'À faire': '#94a3b8',
  'En cours': '#3b82f6',
  'En retard': '#ef4444',
  'Validé': '#22c55e',
  'Annulé': '#6b7280'
}

const PRIORITY_COLORS: Record<string, string> = {
  'Basse': '#94a3b8',
  'Moyenne': '#f59e0b',
  'Haute': '#f97316',
  'Urgente': '#ef4444'
}

export function AdvancedStatistics({ projects, tasks, risks }: AdvancedStatisticsProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'Actif' || p.status === 'En cours').length,
    completedProjects: projects.filter(p => p.status === 'Terminé').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'Validé').length,
    inProgressTasks: tasks.filter(t => t.status === 'En cours').length,
    lateTasks: tasks.filter(t => t.status === 'En retard').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budgetPlanned, 0),
    spentBudget: projects.reduce((sum, p) => sum + p.budgetSpent, 0),
    totalRisks: risks.length,
    criticalRisks: risks.filter(r => r.severity === 'Critique' || r.severity === 'Haute').length
  }

  // Task completion rate
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0

  // Budget utilization rate
  const budgetRate = stats.totalBudget > 0 
    ? Math.round((stats.spentBudget / stats.totalBudget) * 100) 
    : 0

  // Tasks by status for pie chart
  const tasksByStatus = [
    { name: 'À faire', value: tasks.filter(t => t.status === 'À faire').length, color: STATUS_COLORS['À faire'] },
    { name: 'En cours', value: tasks.filter(t => t.status === 'En cours').length, color: STATUS_COLORS['En cours'] },
    { name: 'En retard', value: tasks.filter(t => t.status === 'En retard').length, color: STATUS_COLORS['En retard'] },
    { name: 'Validé', value: tasks.filter(t => t.status === 'Validé').length, color: STATUS_COLORS['Validé'] }
  ].filter(item => item.value > 0)

  // Tasks by priority
  const tasksByPriority = [
    { name: 'Basse', value: tasks.filter(t => t.priority === 'Basse').length, color: PRIORITY_COLORS['Basse'] },
    { name: 'Moyenne', value: tasks.filter(t => t.priority === 'Moyenne').length, color: PRIORITY_COLORS['Moyenne'] },
    { name: 'Haute', value: tasks.filter(t => t.priority === 'Haute').length, color: PRIORITY_COLORS['Haute'] },
    { name: 'Urgente', value: tasks.filter(t => t.priority === 'Urgente').length, color: PRIORITY_COLORS['Urgente'] }
  ].filter(item => item.value > 0)

  // Tasks per project for bar chart
  const tasksPerProject = projects.slice(0, 8).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    total: tasks.filter(t => t.projectId === p.id).length,
    completed: tasks.filter(t => t.projectId === p.id && t.status === 'Validé').length,
    enRetard: tasks.filter(t => t.projectId === p.id && t.status === 'En retard').length
  })).sort((a, b) => b.total - a.total)

  // Budget per project
  const budgetPerProject = projects
    .filter(p => p.budgetPlanned > 0)
    .slice(0, 8)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      prevu: p.budgetPlanned,
      depense: p.budgetSpent,
      reste: Math.max(0, p.budgetPlanned - p.budgetSpent)
    }))
    .sort((a, b) => b.prevu - a.prevu)

  // Task completion over last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const monthName = format(date, 'MMM', { locale: fr })
    
    const completed = tasks.filter(t => 
      t.completedAt && isWithinInterval(new Date(t.completedAt), { start: monthStart, end: monthEnd })
    ).length
    
    const created = tasks.filter(t => 
      isWithinInterval(new Date(t.createdAt), { start: monthStart, end: monthEnd })
    ).length

    return {
      month: monthName,
      creees: created,
      terminees: completed
    }
  })

  // Risk distribution
  const riskDistribution = [
    { name: 'Critique', value: risks.filter(r => r.severity === 'Critique').length, color: '#ef4444' },
    { name: 'Haute', value: risks.filter(r => r.severity === 'Haute').length, color: '#f97316' },
    { name: 'Moyenne', value: risks.filter(r => r.severity === 'Moyenne').length, color: '#f59e0b' },
    { name: 'Basse', value: risks.filter(r => r.severity === 'Basse').length, color: '#22c55e' }
  ].filter(item => item.value > 0)

  // Format number for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-400" />
          Statistiques avancées
        </h2>
        <Badge variant="outline" className="text-amber-300 border-amber-400/30">
          {format(new Date(), 'MMMM yyyy', { locale: fr })}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-200 text-sm">Taux de complétion</p>
                <p className="text-3xl font-bold text-white">{completionRate}%</p>
              </div>
              <div className={`p-2 rounded-full ${completionRate >= 70 ? 'bg-green-500/20' : completionRate >= 40 ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
                {completionRate >= 70 ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Budget utilisé</p>
                <p className="text-3xl font-bold text-white">{budgetRate}%</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-xs text-blue-300 mt-1">{formatCurrency(stats.spentBudget)} / {formatCurrency(stats.totalBudget)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Projets actifs</p>
                <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
              </div>
              <Briefcase className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-xs text-green-300 mt-1">{stats.completedProjects} terminés</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-400/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm">Tâches en retard</p>
                <p className="text-3xl font-bold text-white">{stats.lateTasks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-xs text-red-300 mt-1">{stats.criticalRisks} risques critiques</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-[#1e3a5f]/50 border border-blue-400/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            Tâches
          </TabsTrigger>
          <TabsTrigger value="budget" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            Budget
          </TabsTrigger>
          <TabsTrigger value="risks" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300">
            Risques
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Task completion trend */}
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Évolution sur 6 mois
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={last6Months}>
                    <defs>
                      <linearGradient id="colorTerminees" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCreees" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e3a5f', border: '1px solid #3b82f620', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="creees" stroke="#3b82f6" fill="url(#colorCreees)" name="Créées" />
                    <Area type="monotone" dataKey="terminees" stroke="#22c55e" fill="url(#colorTerminees)" name="Terminées" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tasks by status */}
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-amber-400" />
                  Répartition par statut
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tasksByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {tasksByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e3a5f', border: '1px solid #3b82f620', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tasks per project */}
          <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Tâches par projet</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tasksPerProject} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e3a5f', border: '1px solid #3b82f620', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Terminées" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="enRetard" stackId="a" fill="#ef4444" name="En retard" />
                  <Bar dataKey="total" stackId="a" fill="#3b82f6" name="En cours/À faire" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tasks by priority */}
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Par priorité</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={tasksByPriority}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {tasksByPriority.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Task statistics */}
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Résumé des tâches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1c2e]/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
                  </div>
                  <div className="bg-[#0f1c2e]/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Terminées</p>
                    <p className="text-2xl font-bold text-green-400">{stats.completedTasks}</p>
                  </div>
                  <div className="bg-[#0f1c2e]/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">En cours</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.inProgressTasks}</p>
                  </div>
                  <div className="bg-[#0f1c2e]/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">En retard</p>
                    <p className="text-2xl font-bold text-red-400">{stats.lateTasks}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progression globale</span>
                    <span className="text-white font-medium">{completionRate}%</span>
                  </div>
                  <div className="h-3 bg-[#0f1c2e] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardContent className="p-4">
                <p className="text-gray-400 text-sm">Budget total prévu</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalBudget)}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardContent className="p-4">
                <p className="text-gray-400 text-sm">Total dépensé</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(stats.spentBudget)}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardContent className="p-4">
                <p className="text-gray-400 text-sm">Budget restant</p>
                <p className="text-xl font-bold text-green-400">{formatCurrency(stats.totalBudget - stats.spentBudget)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Budget per project */}
          <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Budget par projet (FCFA)</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetPerProject.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetPerProject}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatNumber} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e3a5f', border: '1px solid #3b82f620', borderRadius: '8px' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="prevu" fill="#3b82f6" name="Prévu" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="depense" fill="#ef4444" name="Dépensé" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Aucun budget défini pour les projets
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk distribution */}
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Par sévérité</CardTitle>
              </CardHeader>
              <CardContent>
                {riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    Aucun risque identifié
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk statistics */}
            <Card className="bg-[#1e3a5f]/30 border-blue-400/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Résumé des risques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0f1c2e]/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total risques</p>
                    <p className="text-2xl font-bold text-white">{stats.totalRisks}</p>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-4 border border-red-400/30">
                    <p className="text-red-300 text-sm">Critiques/Hauts</p>
                    <p className="text-2xl font-bold text-red-400">{stats.criticalRisks}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {['Critique', 'Haute', 'Moyenne', 'Basse'].map(severity => {
                    const count = risks.filter(r => r.severity === severity).length
                    const percentage = stats.totalRisks > 0 ? (count / stats.totalRisks) * 100 : 0
                    const colors: Record<string, string> = {
                      'Critique': 'bg-red-500',
                      'Haute': 'bg-orange-500',
                      'Moyenne': 'bg-amber-500',
                      'Basse': 'bg-green-500'
                    }
                    return (
                      <div key={severity} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{severity}</span>
                          <span className="text-white">{count}</span>
                        </div>
                        <div className="h-2 bg-[#0f1c2e] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colors[severity]} rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
