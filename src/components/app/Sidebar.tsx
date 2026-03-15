'use client'

import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  AlertTriangle,
  FolderOpen,
  Plus,
  FileUp,
  Clock,
  History,
  ListTodo,
  TrendingUp,
  FileText
} from 'lucide-react'
import { PageType, DashboardTab } from '@/types'

interface Folder {
  id: string
  name: string
  icon: string | null
  color: string | null
  order: number
}

interface SidebarProps {
  currentPage: PageType
  dashboardTab: DashboardTab
  folders: Folder[]
  selectedFolderId: string | null
  onNavigate: (page: PageType) => void
  onDashboardTabChange: (tab: DashboardTab) => void
  onFolderSelect: (folderId: string | null) => void
}

const dashboardMenuItems: { key: DashboardTab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'todo', label: 'TODO List Projet', icon: <ListTodo className="w-4 h-4" /> },
  { key: 'personal-todo', label: 'TODO List Personnel', icon: <CheckSquare className="w-4 h-4" /> },
  { key: 'workload', label: 'Charge de travail', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'risks', label: 'Risques', icon: <AlertTriangle className="w-4 h-4" /> },
  { key: 'statistics', label: 'Statistiques', icon: <TrendingUp className="w-4 h-4" /> },
  { key: 'reports', label: 'Rapports', icon: <FileText className="w-4 h-4" /> }
]

const importMenuItems: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'new', label: 'Nouveau fichier', icon: <FileUp className="w-4 h-4" /> },
  { key: 'drafts', label: 'Brouillons récents', icon: <Clock className="w-4 h-4" /> },
  { key: 'history', label: 'Historique', icon: <History className="w-4 h-4" /> }
]

export function Sidebar({ 
  currentPage, 
  dashboardTab, 
  folders, 
  selectedFolderId,
  onNavigate, 
  onDashboardTabChange,
  onFolderSelect 
}: SidebarProps) {
  return (
    <aside className="w-64 bg-gradient-to-b from-[#1e3a5f] to-[#1a2744] border-r border-blue-400/30 flex flex-col min-h-0 shadow-lg shadow-blue-900/30">
      {/* Dashboard Sidebar - Fond blanc */}
      {currentPage === 'dashboard' && (
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm shadow-xl rounded-r-2xl">
          <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Tableau de bord</h2>
            </div>
          </div>
          <nav className="flex-1 p-2">
            {dashboardMenuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onDashboardTabChange(item.key)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold
                  ${dashboardTab === item.key 
                    ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 shadow-sm' 
                    : 'text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
      
      {/* Projects Sidebar - Fond blanc */}
      {currentPage === 'projects' && (
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm shadow-xl rounded-r-2xl">
          <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Dossiers</h2>
            </div>
          </div>
          <nav className="flex-1 p-2">
            {/* Tous les projets */}
            <button
              onClick={() => onFolderSelect(null)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold
                ${selectedFolderId === null 
                  ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 shadow-sm' 
                  : 'text-gray-800 hover:bg-gray-100'
                }
              `}
            >
              <FolderOpen className="w-4 h-4" />
              Tous les projets
            </button>
            
            {/* Dossiers */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => onFolderSelect(folder.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold
                  ${selectedFolderId === folder.id 
                    ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 shadow-sm' 
                    : 'text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                <FolderOpen className="w-4 h-4" />
                {folder.name}
              </button>
            ))}
            
            {/* Bouton nouveau dossier */}
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 border-2 border-dashed border-amber-300 mt-4 hover:border-amber-500 hover:text-amber-600 transition-all bg-gradient-to-r from-amber-50 to-white font-bold">
              <Plus className="w-4 h-4" />
              Nouveau dossier
            </button>
          </nav>
        </div>
      )}
      
      {/* Import PDF Sidebar - Fond blanc */}
      {currentPage === 'import-pdf' && (
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm shadow-xl rounded-r-2xl">
          <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Import IA</h2>
            </div>
          </div>
          <nav className="flex-1 p-2">
            {importMenuItems.map((item, index) => (
              <button
                key={item.key}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold
                  ${index === 0 
                    ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 shadow-sm' 
                    : 'text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </aside>
  )
}
