'use client'

import { CheckCircle2, Clock, AlertCircle, ListTodo, ArrowRight } from 'lucide-react'
import { Task } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardTasksProps {
  tasks: Task[]
  onTaskClick: (projectId: string) => void
}

export function DashboardTasks({ tasks, onTaskClick }: DashboardTasksProps) {
  // Grouper les tâches par statut
  const tasksByStatus = {
    'À faire': tasks.filter(t => t.status === 'À faire'),
    'En cours': tasks.filter(t => t.status === 'En cours'),
    'En retard': tasks.filter(t => t.status === 'En retard'),
    'Validé': tasks.filter(t => t.status === 'Validé')
  }

  const statusConfig = {
    'À faire': { icon: ListTodo, color: 'text-gray-300', bg: 'bg-gray-500/30', count: tasksByStatus['À faire'].length },
    'En cours': { icon: Clock, color: 'text-blue-300', bg: 'bg-blue-500/30', count: tasksByStatus['En cours'].length },
    'En retard': { icon: AlertCircle, color: 'text-red-300', bg: 'bg-red-500/30', count: tasksByStatus['En retard'].length },
    'Validé': { icon: CheckCircle2, color: 'text-green-300', bg: 'bg-green-500/30', count: tasksByStatus['Validé'].length }
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Mes tâches</h1>
        <p className="text-blue-200 mt-1">Gérez et suivez toutes vos tâches</p>
      </div>

      {/* Stats par statut */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon
          return (
            <div key={status} className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 shadow-lg shadow-blue-500/10">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${config.bg} rounded-lg shadow-lg`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{config.count}</p>
                  <p className="text-sm text-blue-200">{status}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Liste des tâches par colonne */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
          const config = statusConfig[status as keyof typeof statusConfig]
          const Icon = config.icon
          
          return (
            <div key={status} className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
              <div className={`flex items-center gap-2 p-3 border-b border-blue-400/20 ${config.bg}`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
                <h3 className="font-medium text-white">{status}</h3>
                <span className="ml-auto text-sm text-blue-200">{statusTasks.length}</span>
              </div>
              <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                {statusTasks.length === 0 ? (
                  <p className="text-blue-300/50 text-sm text-center py-4">Aucune tâche</p>
                ) : (
                  statusTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(task.projectId)}
                      className="w-full bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-lg p-3 text-left hover:from-[#3d5a7f] hover:to-[#2d4a6f] transition-all border border-blue-400/20"
                    >
                      <p className="font-medium text-white text-sm mb-1">{task.title}</p>
                      <p className="text-xs text-blue-200 mb-2">{task.project?.name}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-blue-300/70">
                          {task.dueDate && format(new Date(task.dueDate), 'd MMM', { locale: fr })}
                        </span>
                        {task.priority === 'Haute' && (
                          <span className="px-1.5 py-0.5 bg-red-500/30 text-red-300 rounded text-xs">
                            Priorité haute
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
