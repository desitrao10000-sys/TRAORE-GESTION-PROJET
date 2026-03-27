'use client'

import { BarChart3, Users, TrendingUp } from 'lucide-react'
import { Task, Project } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardWorkloadProps {
  tasks: Task[]
  projects: Project[]
}

export function DashboardWorkload({ tasks, projects }: DashboardWorkloadProps) {
  // Calculer la charge par utilisateur
  const workloadByUser: Record<string, { name: string; tasks: number; highPriority: number; late: number }> = {}
  
  tasks.forEach(task => {
    const assignee = task.assigneeName || 'Non assigné'
    if (!workloadByUser[assignee]) {
      workloadByUser[assignee] = { name: assignee, tasks: 0, highPriority: 0, late: 0 }
    }
    workloadByUser[assignee].tasks++
    if (task.priority === 'Haute' || task.priority === 'Urgente') {
      workloadByUser[assignee].highPriority++
    }
    if (task.status === 'En retard') {
      workloadByUser[assignee].late++
    }
  })

  const users = Object.values(workloadByUser).sort((a, b) => b.tasks - a.tasks)

  // Calculer la charge par projet
  const workloadByProject = projects.map(project => {
    const projectTasks = tasks.filter(t => t.projectId === project.id)
    const activeTasks = projectTasks.filter(t => t.status !== 'Validé').length
    const lateTasks = projectTasks.filter(t => t.status === 'En retard').length
    const progress = project.budgetPlanned > 0 
      ? Math.round((project.budgetSpent / project.budgetPlanned) * 100)
      : 0
    
    return {
      name: project.name,
      activeTasks,
      lateTasks,
      progress,
      responsible: project.responsibleName
    }
  }).sort((a, b) => b.activeTasks - a.activeTasks).slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Charge de travail</h1>
        <p className="text-blue-200 mt-1">Analysez la répartition des tâches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charge par utilisateur */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-2 p-4 border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Charge par utilisateur</h2>
          </div>
          <div className="divide-y divide-blue-400/20">
            {users.length === 0 ? (
              <p className="text-blue-300/50 text-sm text-center py-8">Aucune donnée disponible</p>
            ) : (
              users.map((user, index) => (
                <div key={index} className="p-4 hover:bg-blue-400/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{user.name}</span>
                    <span className="text-amber-400 font-semibold">{user.tasks} tâches</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-red-300 flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {user.late} en retard
                    </span>
                    <span className="text-orange-300 flex items-center gap-1">
                      <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                      {user.highPriority} priorité haute
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-blue-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      style={{ width: `${Math.min((user.tasks / Math.max(...users.map(u => u.tasks))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charge par projet */}
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-2 p-4 border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Projets les plus chargés</h2>
          </div>
          <div className="divide-y divide-blue-400/20">
            {workloadByProject.length === 0 ? (
              <p className="text-blue-300/50 text-sm text-center py-8">Aucune donnée disponible</p>
            ) : (
              workloadByProject.map((project, index) => (
                <div key={index} className="p-4 hover:bg-blue-400/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{project.name}</span>
                    <span className="text-amber-400 font-semibold">{project.activeTasks} tâches actives</span>
                  </div>
                  <p className="text-sm text-blue-200 mb-2">Responsable: {project.responsible}</p>
                  <div className="flex gap-4 text-sm mb-2">
                    {project.lateTasks > 0 && (
                      <span className="text-red-300 flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        {project.lateTasks} en retard
                      </span>
                    )}
                    <span className="text-blue-200">
                      Progression: {project.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Résumé global */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-4 shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Résumé global</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl border border-blue-400/20">
            <p className="text-3xl font-bold text-white">{tasks.length}</p>
            <p className="text-sm text-blue-200 mt-1">Total tâches</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl border border-blue-400/20">
            <p className="text-3xl font-bold text-white">{users.length}</p>
            <p className="text-sm text-blue-200 mt-1">Contributeurs</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl border border-blue-400/20">
            <p className="text-3xl font-bold text-white">{projects.length}</p>
            <p className="text-sm text-blue-200 mt-1">Projets actifs</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl border border-red-400/20">
            <p className="text-3xl font-bold text-red-300">{tasks.filter(t => t.status === 'En retard').length}</p>
            <p className="text-sm text-blue-200 mt-1">Tâches en retard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
