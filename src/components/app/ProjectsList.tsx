'use client'

import { Plus, Search, FolderOpen, Archive, MoreHorizontal } from 'lucide-react'
import { Project, Folder } from '@/types'
import { useState } from 'react'

interface ProjectsListProps {
  projects: Project[]
  folders: Folder[]
  selectedFolderId: string | null
  onProjectClick: (projectId: string) => void
  onFolderSelect: (folderId: string | null) => void
}

export function ProjectsList({ 
  projects, 
  folders, 
  selectedFolderId, 
  onProjectClick,
  onFolderSelect 
}: ProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active')

  // Filtrer les projets
  const filteredProjects = projects.filter(project => {
    // Filtre par dossier
    if (selectedFolderId && project.folderId !== selectedFolderId) return false
    
    // Filtre par statut
    if (statusFilter === 'active' && (project.status === 'Archivé' || project.status === 'Terminé')) return false
    if (statusFilter === 'archived' && project.status !== 'Archivé' && project.status !== 'Terminé') return false
    
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!project.name.toLowerCase().includes(query) && 
          !project.responsibleName?.toLowerCase().includes(query)) {
        return false
      }
    }
    
    return true
  })

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
      case 'Archivé': return 'bg-gray-500/30 text-gray-300'
      default: return 'bg-gray-500/30 text-gray-300'
    }
  }

  // Obtenir le nom du dossier actuel
  const currentFolder = selectedFolderId 
    ? folders.find(f => f.id === selectedFolderId) 
    : null

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">
            {currentFolder ? currentFolder.name : 'Tous les projets'}
          </h1>
          <p className="text-blue-200 mt-1">{filteredProjects.length} projets</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-amber-500/30">
          <Plus className="w-4 h-4" />
          Créer un projet
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
          <input
            type="text"
            placeholder="Rechercher un projet ou un responsable..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border border-blue-400/30 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-blue-300/50 focus:outline-none focus:border-amber-400 shadow-lg shadow-blue-500/10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              statusFilter === 'active' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/30' 
                : 'bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] text-blue-200 hover:from-[#2d4a6f] border border-blue-400/30'
            }`}
          >
            Actifs
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              statusFilter === 'archived' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/30' 
                : 'bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] text-blue-200 hover:from-[#2d4a6f] border border-blue-400/30'
            }`}
          >
            Archivés
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              statusFilter === 'all' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/30' 
                : 'bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] text-blue-200 hover:from-[#2d4a6f] border border-blue-400/30'
            }`}
          >
            Tous
          </button>
        </div>
      </div>

      {/* Liste des projets */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-8 text-center shadow-lg shadow-blue-500/10">
            <FolderOpen className="w-12 h-12 text-blue-300/50 mx-auto mb-4" />
            <p className="text-blue-200">Aucun projet trouvé</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 overflow-hidden hover:border-amber-400/50 transition-all shadow-lg shadow-blue-500/10 hover:shadow-amber-500/20"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <p className="text-sm text-blue-200 mt-1">
                      Responsable: <span className="text-amber-300 hover:underline cursor-pointer">{project.responsibleName}</span>
                    </p>
                  </div>
                  <button className="p-2 hover:bg-blue-400/20 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-blue-300" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-blue-200">Dépensé</p>
                    <p className="text-white font-medium">{formatCurrency(project.budgetSpent)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-200">Reste</p>
                    <p className="text-amber-300 font-medium">{formatCurrency(project.budgetPlanned - project.budgetSpent)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-blue-200">Budget prévu: {formatCurrency(project.budgetPlanned)}</span>
                    <span className="text-amber-400">{Math.round((project.budgetSpent / project.budgetPlanned) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min((project.budgetSpent / project.budgetPlanned) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-blue-400/20">
                  <div className="flex items-center gap-4 text-sm text-blue-200">
                    <span>{project.tasks?.length || 0} tâches</span>
                    {project.folder && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="w-4 h-4" />
                        {project.folder.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onProjectClick(project.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f] hover:from-[#3d5a7f] hover:to-[#2d4a6f] text-white rounded-lg transition-all border border-blue-400/20"
                    >
                      <FolderOpen className="w-4 h-4 text-amber-400" />
                      Ouvrir
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d4a6f] to-[#1e3a5f] hover:from-[#3d5a7f] hover:to-[#2d4a6f] text-purple-300 rounded-lg transition-all border border-blue-400/20">
                      <Archive className="w-4 h-4" />
                      Archiver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
