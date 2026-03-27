'use client'

import { AlertTriangle, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Risk, Project } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface DashboardRisksProps {
  risks: Risk[]
  projects: Project[]
  onProjectClick: (projectId: string) => void
}

export function DashboardRisks({ risks, projects, onProjectClick }: DashboardRisksProps) {
  // Grouper les risques par sévérité
  const risksBySeverity = {
    'Critique': risks.filter(r => r.severity === 'Critique'),
    'Haute': risks.filter(r => r.severity === 'Haute'),
    'Moyenne': risks.filter(r => r.severity === 'Moyenne'),
    'Basse': risks.filter(r => r.severity === 'Basse')
  }

  const severityConfig = {
    'Critique': { color: 'text-red-400', bg: 'bg-red-500/30', border: 'border-red-500' },
    'Haute': { color: 'text-orange-400', bg: 'bg-orange-500/30', border: 'border-orange-500' },
    'Moyenne': { color: 'text-yellow-400', bg: 'bg-yellow-500/30', border: 'border-yellow-500' },
    'Basse': { color: 'text-green-400', bg: 'bg-green-500/30', border: 'border-green-500' }
  }

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
    'Identifié': { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/30' },
    'En cours de traitement': { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/30' },
    'Résolu': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/30' },
    'Accepté': { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-500/30' }
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Risques</h1>
        <p className="text-blue-200 mt-1">Suivez et gérez les risques de vos projets</p>
      </div>

      {/* Stats par sévérité */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(risksBySeverity).map(([severity, severityRisks]) => {
          const config = severityConfig[severity as keyof typeof severityConfig]
          return (
            <div 
              key={severity} 
              className={`bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-xl p-4 border border-blue-400/30 ${config.bg} shadow-lg shadow-blue-500/10`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg shadow-lg`}>
                  <AlertTriangle className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{severityRisks.length}</p>
                  <p className="text-sm text-blue-200">{severity}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Matrice des risques */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
        <div className="flex items-center gap-2 p-4 border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Tous les risques</h2>
        </div>
        <div className="divide-y divide-blue-400/20">
          {risks.length === 0 ? (
            <p className="text-blue-300/50 text-sm text-center py-8">Aucun risque identifié</p>
          ) : (
            risks.map((risk) => {
              const sevConfig = severityConfig[risk.severity as keyof typeof severityConfig] || { color: 'text-gray-400', bg: 'bg-gray-500/30', border: 'border-gray-500' }
              const statConfig = statusConfig[risk.status] || statusConfig['Identifié']
              const StatusIcon = statConfig.icon
              
              return (
                <button
                  key={risk.id}
                  onClick={() => onProjectClick(risk.projectId)}
                  className="w-full p-4 hover:bg-blue-400/10 transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${sevConfig.bg}`} />
                        <span className="font-medium text-white">{risk.title}</span>
                      </div>
                      <p className="text-sm text-blue-200">{risk.project?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${sevConfig.bg} ${sevConfig.color}`}>
                        {risk.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statConfig.bg} ${statConfig.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {risk.status}
                      </span>
                    </div>
                  </div>
                  {risk.description && (
                    <p className="text-sm text-blue-200 mb-2">{risk.description}</p>
                  )}
                  {risk.mitigation && (
                    <p className="text-xs text-blue-300/70">
                      <span className="text-blue-200">Plan d'atténuation:</span> {risk.mitigation}
                    </p>
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Résumé par projet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden shadow-lg shadow-blue-500/10">
          <div className="flex items-center gap-2 p-4 border-b border-blue-400/20 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f]">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Risques par projet</h2>
          </div>
          <div className="divide-y divide-blue-400/20">
            {projects.map((project) => {
              const projectRisks = risks.filter(r => r.projectId === project.id)
              const criticalRisks = projectRisks.filter(r => r.severity === 'Critique' || r.severity === 'Haute').length
              
              if (projectRisks.length === 0) return null
              
              return (
                <button
                  key={project.id}
                  onClick={() => onProjectClick(project.id)}
                  className="w-full p-4 hover:bg-blue-400/10 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{project.name}</span>
                    <span className="text-amber-400 font-semibold">{projectRisks.length} risques</span>
                  </div>
                  {criticalRisks > 0 && (
                    <span className="text-red-300 text-sm flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {criticalRisks} risque(s) critique(s)
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
