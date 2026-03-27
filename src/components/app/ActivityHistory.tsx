'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  History, Clock, CheckCircle2, Edit, Trash2, 
  Plus, ArrowRight, AlertCircle, Loader2, Filter
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ActivityEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  details: string | null
  userId: string | null
  userName: string | null
  taskId: string | null
  createdAt: Date
}

interface ActivityHistoryProps {
  taskId?: string
  projectId?: string
  limit?: number
}

export function ActivityHistory({ taskId, projectId, limit = 20 }: ActivityHistoryProps) {
  const [history, setHistory] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        let url = `/api/history?limit=${limit}`
        if (taskId) url += `&taskId=${taskId}`
        
        const res = await fetch(url)
        const data = await res.json()
        if (data.success) {
          setHistory(data.data)
        }
      } catch (error) {
        console.error('Error fetching history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [taskId, limit])

  // Action config
  const getActionConfig = (action: string) => {
    const configs: Record<string, { icon: React.ElementType; color: string; label: string }> = {
      created: { icon: Plus, color: 'text-green-400', label: 'Créé' },
      updated: { icon: Edit, color: 'text-blue-400', label: 'Modifié' },
      deleted: { icon: Trash2, color: 'text-red-400', label: 'Supprimé' },
      status_changed: { icon: ArrowRight, color: 'text-amber-400', label: 'Statut changé' },
      assigned: { icon: ArrowRight, color: 'text-purple-400', label: 'Assigné' },
      completed: { icon: CheckCircle2, color: 'text-green-400', label: 'Terminé' },
      commented: { icon: Edit, color: 'text-cyan-400', label: 'Commentaire' }
    }
    return configs[action] || { icon: Clock, color: 'text-gray-400', label: action }
  }

  // Entity type config
  const getEntityTypeConfig = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      task: { color: 'border-amber-400/30 text-amber-300', label: 'Tâche' },
      project: { color: 'border-blue-400/30 text-blue-300', label: 'Projet' },
      risk: { color: 'border-red-400/30 text-red-300', label: 'Risque' },
      expense: { color: 'border-green-400/30 text-green-300', label: 'Dépense' }
    }
    return configs[type] || { color: 'border-gray-400/30 text-gray-300', label: type }
  }

  // Filter history
  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(h => h.entityType === filter)

  // Parse details
  const parseDetails = (details: string | null) => {
    if (!details) return null
    try {
      const parsed = JSON.parse(details)
      return parsed
    } catch {
      return { raw: details }
    }
  }

  // Time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return format(new Date(date), 'd MMM', { locale: fr })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          Historique des activités
        </h3>

        {/* Filter */}
        <div className="flex items-center gap-1">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#0f1c2e] border border-blue-400/30 rounded-md px-2 py-1 text-sm text-white"
          >
            <option value="all">Tous</option>
            <option value="task">Tâches</option>
            <option value="project">Projets</option>
            <option value="risk">Risques</option>
          </select>
        </div>
      </div>

      {/* History list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-8 bg-[#1e3a5f]/30 rounded-xl border border-dashed border-blue-400/30">
          <Clock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Aucune activité</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-400/20" />

          {/* Entries */}
          <div className="space-y-3">
            {filteredHistory.map((entry, index) => {
              const actionConfig = getActionConfig(entry.action)
              const entityConfig = getEntityTypeConfig(entry.entityType)
              const Icon = actionConfig.icon
              const details = parseDetails(entry.details)

              return (
                <div key={entry.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-2 top-2 w-4 h-4 rounded-full bg-[#1e3a5f] border-2 ${actionConfig.color.replace('text-', 'border-')} flex items-center justify-center`}>
                    <div className={`w-2 h-2 rounded-full ${actionConfig.color.replace('text-', 'bg-')}`} />
                  </div>

                  {/* Content */}
                  <div className="bg-[#1e3a5f]/50 rounded-lg p-3 border border-blue-400/10 hover:border-blue-400/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className={`w-4 h-4 ${actionConfig.color}`} />
                        <span className="text-white text-sm font-medium">
                          {actionConfig.label}
                        </span>
                        <Badge variant="outline" className={`text-xs ${entityConfig.color}`}>
                          {entityConfig.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {getTimeAgo(entry.createdAt)}
                      </span>
                    </div>

                    {/* Details */}
                    {details && (
                      <div className="mt-2 text-xs text-blue-200/70">
                        {details.title && (
                          <p className="truncate">"{details.title}"</p>
                        )}
                        {details.from && details.to && (
                          <p className="flex items-center gap-1">
                            <span className="text-gray-400">{details.from}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-amber-300">{details.to}</span>
                          </p>
                        )}
                        {details.raw && (
                          <p>{details.raw}</p>
                        )}
                      </div>
                    )}

                    {/* User */}
                    {entry.userName && (
                      <p className="mt-1 text-xs text-gray-500">
                        Par {entry.userName}
                      </p>
                    )}

                    {/* Full date on hover */}
                    <p className="mt-1 text-xs text-gray-500 opacity-0 hover:opacity-100 transition-opacity">
                      {format(new Date(entry.createdAt), "'Le' d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
