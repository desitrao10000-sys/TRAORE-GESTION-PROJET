'use client'

import { useState } from 'react'
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
  CheckCircle2,
  Users,
  Flag,
  MessageSquare,
  Target,
  ChevronRight
} from 'lucide-react'
import { Project } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CommentSection } from './CommentSection'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProjectDetailProps {
  project: Project
  onBack: () => void
}

type ProjectTab = 'tasks' | 'team' | 'budget' | 'risks' | 'comments'

// Jalons types
interface Milestone {
  id: string
  title: string
  date: Date | null
  completed: boolean
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>('tasks')

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

  // Extraire les membres de l'équipe depuis les tâches
  const teamMembers = new Map<string, { name: string; taskCount: number; completedTasks: number }>()
  project.tasks?.forEach(task => {
    if (task.assigneeId && task.assigneeName) {
      const existing = teamMembers.get(task.assigneeId)
      if (existing) {
        existing.taskCount++
        if (task.status === 'Validé') existing.completedTasks++
      } else {
        teamMembers.set(task.assigneeId, {
          name: task.assigneeName,
          taskCount: 1,
          completedTasks: task.status === 'Validé' ? 1 : 0
        })
      }
    }
  })

  // Générer les jalons basés sur le projet
  const milestones: Milestone[] = [
    { id: '1', title: 'Démarrage du projet', date: project.startDate, completed: true },
    { id: '2', title: 'Phase de planification', date: null, completed: true },
    { id: '3', title: 'Phase d\'exécution', date: null, completed: project.tasks?.some(t => t.status === 'En cours' || t.status === 'Validé') || false },
    { id: '4', title: 'Tests et validation', date: null, completed: false },
    { id: '5', title: 'Clôture du projet', date: project.endDate, completed: project.status === 'Terminé' }
  ]

  // Onglets du projet
  const tabs: { key: ProjectTab; label: string; icon: React.ReactNode }[] = [
    { key: 'tasks', label: 'Tâches', icon: <CheckSquare className="w-4 h-4" /> },
    { key: 'team', label: 'Équipe', icon: <Users className="w-4 h-4" /> },
    { key: 'budget', label: 'Budget', icon: <Wallet className="w-4 h-4" /> },
    { key: 'risks', label: 'Risques', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'comments', label: 'Commentaires', icon: <MessageSquare className="w-4 h-4" /> }
  ]

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

        {/* Jalons */}
        <div className="mt-6 pt-6 border-t border-blue-400/20">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">Jalons du projet</h3>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center">
                <div className={`
                  flex flex-col items-center p-3 rounded-xl min-w-[120px]
                  ${milestone.completed 
                    ? 'bg-green-500/20 border border-green-400/30' 
                    : 'bg-blue-500/10 border border-blue-400/20'
                  }
                `}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center mb-2
                    ${milestone.completed ? 'bg-green-500' : 'bg-blue-500/30'}
                  `}>
                    {milestone.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium text-center">{milestone.title}</p>
                  {milestone.date && (
                    <p className="text-blue-300 text-xs mt-1">
                      {format(new Date(milestone.date), 'd MMM', { locale: fr })}
                    </p>
                  )}
                </div>
                {index < milestones.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-blue-400/50 mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="flex border-b border-blue-400/20 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-3 font-medium transition-all whitespace-nowrap
                ${activeTab === tab.key 
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' 
                  : 'text-blue-200 hover:text-white hover:bg-blue-400/10'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.key === 'tasks' && (
                <Badge className="bg-blue-500/20 text-blue-300 border-0 ml-1">
                  {project.tasks?.length || 0}
                </Badge>
              )}
              {tab.key === 'risks' && project.risks && project.risks.length > 0 && (
                <Badge className="bg-red-500/20 text-red-300 border-0 ml-1">
                  {project.risks.length}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Contenu Tâches */}
          {activeTab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Tableau des tâches</h3>
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
                              className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-lg p-3 border border-blue-400/10 hover:border-blue-400/30 transition-colors cursor-pointer"
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
          )}

          {/* Contenu Équipe */}
          {activeTab === 'team' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Équipe du projet</h3>
                <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Inviter un membre
                </button>
              </div>
              
              {/* Chef de projet */}
              {project.responsibleName && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/10 to-amber-400/5 rounded-xl border border-amber-400/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{project.responsibleName}</p>
                      <p className="text-amber-300 text-sm">Chef de projet</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Membres de l'équipe */}
              {teamMembers.size > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from(teamMembers.entries()).map(([id, member]) => (
                    <Card key={id} className="bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] border-blue-400/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{member.name}</p>
                            <p className="text-blue-300 text-sm">Membre</p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="bg-blue-500/10 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-white">{member.taskCount}</p>
                            <p className="text-xs text-blue-300">Tâches</p>
                          </div>
                          <div className="bg-green-500/10 rounded-lg p-2 text-center">
                            <p className="text-xl font-bold text-green-400">{member.completedTasks}</p>
                            <p className="text-xs text-green-300">Terminées</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-blue-400/50 mx-auto mb-3" />
                  <p className="text-blue-200">Aucun membre assigné aux tâches</p>
                  <p className="text-blue-300/50 text-sm mt-1">Les membres apparaîtront lorsqu'ils seront assignés à des tâches</p>
                </div>
              )}
            </div>
          )}

          {/* Contenu Budget */}
          {activeTab === 'budget' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
              <div className="mb-6">
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

              {/* Dépenses récentes */}
              {project.expenses && project.expenses.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3">Dépenses récentes</h4>
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
            </div>
          )}

          {/* Contenu Risques */}
          {activeTab === 'risks' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Gestion des risques</h3>
                <button className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  Ajouter un risque
                </button>
              </div>
              
              {project.risks && project.risks.length > 0 ? (
                <div className="space-y-3">
                  {project.risks.map((risk) => (
                    <div key={risk.id} className="bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] rounded-xl p-4 border border-blue-400/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-3 h-3 rounded-full
                            ${risk.severity === 'Critique' ? 'bg-red-500' : 
                              risk.severity === 'Haute' ? 'bg-orange-500' : 
                              risk.severity === 'Moyenne' ? 'bg-yellow-500' : 'bg-green-500'}
                          `} />
                          <p className="text-white font-medium">{risk.title}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            risk.severity === 'Critique' ? 'bg-red-500/30 text-red-300' :
                            risk.severity === 'Haute' ? 'bg-orange-500/30 text-orange-300' :
                            risk.severity === 'Moyenne' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-green-500/30 text-green-300'
                          }`}>
                            {risk.severity}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            risk.status === 'Résolu' ? 'bg-green-500/30 text-green-300' :
                            risk.status === 'En cours de traitement' ? 'bg-blue-500/30 text-blue-300' :
                            'bg-gray-500/30 text-gray-300'
                          }`}>
                            {risk.status}
                          </span>
                        </div>
                      </div>
                      {risk.description && (
                        <p className="text-sm text-blue-200 mb-2">{risk.description}</p>
                      )}
                      {risk.mitigation && (
                        <p className="text-xs text-blue-300/70 bg-blue-500/10 rounded-lg p-2">
                          <span className="text-blue-200 font-medium">Plan d'atténuation:</span> {risk.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                  <p className="text-blue-200">Aucun risque identifié</p>
                  <p className="text-blue-300/50 text-sm mt-1">Ce projet n'a pas de risques documentés</p>
                </div>
              )}
            </div>
          )}

          {/* Contenu Commentaires */}
          {activeTab === 'comments' && (
            <CommentSection projectId={project.id} />
          )}
        </div>
      </div>
    </div>
  )
}
