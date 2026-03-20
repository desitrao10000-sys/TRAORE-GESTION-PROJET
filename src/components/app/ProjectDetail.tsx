'use client'

import { 
  ArrowLeft, 
  FolderOpen, 
  Calendar, 
  User, 
  Wallet, 
  CheckSquare,
  AlertTriangle,
  Plus,
  ListTodo,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { Project } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CommentSection } from './CommentSection'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  // Formater le montant en CFA
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' CFA'
  }

  // Couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En cours': return 'bg-blue-500/30 text-blue-300'
      case 'Actif': return 'bg-green-500/30 text-green-300'
      case 'Terminé': return 'bg-purple-500/30 text-purple-300'
      case 'En retard': return 'bg-red-500/30 text-red-300'
      case 'À faire': return 'bg-gray-500/30 text-gray-300'
      case 'Validé': return 'bg-green-500/30 text-green-300'
      default: return 'bg-gray-500/30 text-gray-300'
    }
  }

  // Tâches groupées par statut
  const tasksByStatus = {
    'À faire': project.tasks?.filter(t => t.status === 'À faire') || [],
    'En cours': project.tasks?.filter(t => t.status === 'En cours') || [],
    'En retard': project.tasks?.filter(t => t.status === 'En retard') || [],
    'Validé': project.tasks?.filter(t => t.status === 'Validé') || []
  }

  const taskStatusConfig = {
    'À faire': { icon: ListTodo, color: 'text-gray-300', bg: 'bg-gray-500/30' },
    'En cours': { icon: Clock, color: 'text-blue-300', bg: 'bg-blue-500/30' },
    'En retard': { icon: AlertTriangle, color: 'text-red-300', bg: 'bg-red-500/30' },
    'Validé': { icon: CheckCircle2, color: 'text-green-300', bg: 'bg-green-500/30' }
  }

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux projets</span>
        </button>
      </div>

      {/* Titre et infos principales */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-6 shadow-lg shadow-blue-500/10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              {project.folder && (
                <span className="flex items-center gap-1 text-sm text-blue-200">
                  <FolderOpen className="w-4 h-4" />
                  {project.folder.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">{project.name}</h1>
            {project.description && (
              <p className="text-blue-200 mt-2">{project.description}</p>
            )}
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-amber-500/30">
            <Plus className="w-4 h-4" />
            Modifier
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] p-3 rounded-xl border border-blue-400/20">
            <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-200">Responsable</p>
              <p className="text-white font-medium">{project.responsibleName || 'Non assigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] p-3 rounded-xl border border-blue-400/20">
            <div className="p-2 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-200">Date de début</p>
              <p className="text-white font-medium">
                {project.startDate ? format(new Date(project.startDate), 'd MMM yyyy', { locale: fr }) : '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] p-3 rounded-xl border border-blue-400/20">
            <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-200">Date de fin</p>
              <p className="text-white font-medium">
                {project.endDate ? format(new Date(project.endDate), 'd MMM yyyy', { locale: fr }) : '-'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] p-3 rounded-xl border border-blue-400/20">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-200">Tâches</p>
              <p className="text-white font-medium">{project.tasks?.length || 0} tâches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-6 shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Budget</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-4 border border-blue-400/20">
            <p className="text-sm text-blue-200 mb-1">Budget prévu</p>
            <p className="text-xl font-bold text-blue-300">{formatCurrency(project.budgetPlanned)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-400/20">
            <p className="text-sm text-blue-200 mb-1">Dépenses</p>
            <p className="text-xl font-bold text-amber-300">{formatCurrency(project.budgetSpent)}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-400/20">
            <p className="text-sm text-blue-200 mb-1">Reste disponible</p>
            <p className="text-xl font-bold text-green-300">{formatCurrency(project.budgetPlanned - project.budgetSpent)}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-200">Progression budgétaire</span>
            <span className="text-amber-400 font-medium">
              {Math.round((project.budgetSpent / project.budgetPlanned) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-blue-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min((project.budgetSpent / project.budgetPlanned) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tâches */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-6 shadow-lg shadow-blue-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Tâches</h2>
          </div>
          <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Ajouter une tâche
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
            const config = taskStatusConfig[status as keyof typeof taskStatusConfig]
            const Icon = config.icon
            return (
              <div key={status} className="bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl overflow-hidden border border-blue-400/20">
                <div className={`flex items-center gap-2 p-3 border-b border-blue-400/20 ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="font-medium text-white text-sm">{status}</span>
                  <span className="ml-auto text-blue-200 text-xs">{statusTasks.length}</span>
                </div>
                <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                  {statusTasks.length === 0 ? (
                    <p className="text-blue-300/50 text-xs text-center py-4">Aucune tâche</p>
                  ) : (
                    statusTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-lg p-3 border border-blue-400/10"
                      >
                        <p className="text-white text-sm font-medium">{task.title}</p>
                        <div className="flex items-center justify-between mt-2">
                          {task.dueDate && (
                            <span className="text-xs text-blue-300/70">
                              {format(new Date(task.dueDate), 'd MMM', { locale: fr })}
                            </span>
                          )}
                          {task.assigneeName && (
                            <span className="text-xs text-blue-200">{task.assigneeName}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dépenses */}
      {project.expenses && project.expenses.length > 0 && (
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Dépenses récentes</h2>
          </div>
          <div className="divide-y divide-blue-400/20">
            {project.expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{expense.description}</p>
                  <div className="flex items-center gap-2 text-sm text-blue-200">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{format(new Date(expense.date), 'd MMM yyyy', { locale: fr })}</span>
                  </div>
                </div>
                <span className="text-amber-300 font-semibold">{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risques */}
      {project.risks && project.risks.length > 0 && (
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-6 shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Risques identifiés</h2>
          </div>
          <div className="divide-y divide-blue-400/20">
            {project.risks.map((risk) => (
              <div key={risk.id} className="py-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium">{risk.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    risk.severity === 'Critique' ? 'bg-red-500/30 text-red-300' :
                    risk.severity === 'Haute' ? 'bg-orange-500/30 text-orange-300' :
                    'bg-yellow-500/30 text-yellow-300'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                {risk.description && (
                  <p className="text-sm text-blue-200">{risk.description}</p>
                )}
                {risk.mitigation && (
                  <p className="text-xs text-blue-300/70 mt-1">
                    <span className="text-blue-200">Plan d'atténuation:</span> {risk.mitigation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commentaires */}
      <CommentSection projectId={project.id} />
    </div>
  )
}
