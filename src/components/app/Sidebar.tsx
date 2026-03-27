'use client'

import { 
  LayoutDashboard, 
  CheckSquare, 
  AlertTriangle,
  FolderOpen,
  Plus,
  FileUp,
  Clock,
  History,
  ListTodo,
  FileText,
  GanttChart,
  User,
  Calendar,
  X
} from 'lucide-react'
import { PageType, DashboardTab } from '@/types'
import { AuthUser } from '@/store/appStore'

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
  user?: AuthUser | null
  isOpen?: boolean
  onClose?: () => void
}

const allDashboardMenuItems: { key: DashboardTab; label: string; icon: React.ReactNode; roles: ('gestionnaire' | 'membre')[] }[] = [
  { key: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['gestionnaire', 'membre'] },
  { key: 'gantt', label: 'Vue de Gantt', icon: <GanttChart className="w-4 h-4" />, roles: ['gestionnaire'] },
  { key: 'calendar', label: 'Calendrier', icon: <Calendar className="w-4 h-4" />, roles: ['gestionnaire', 'membre'] },
  { key: 'todo', label: 'TODO List Projet', icon: <ListTodo className="w-4 h-4" />, roles: ['gestionnaire', 'membre'] },
  { key: 'personal-todo', label: 'TODO List Personnel', icon: <CheckSquare className="w-4 h-4" />, roles: ['gestionnaire', 'membre'] },
  { key: 'risks', label: 'Risques', icon: <AlertTriangle className="w-4 h-4" />, roles: ['gestionnaire'] },
  { key: 'reports', label: 'Rapports', icon: <FileText className="w-4 h-4" />, roles: ['gestionnaire'] }
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
  onFolderSelect,
  user,
  isOpen = false,
  onClose
}: SidebarProps) {
  const userRole = user?.role || 'membre'
  const dashboardMenuItems = allDashboardMenuItems.filter(item => item.roles.includes(userRole))
  const isGestionnaire = userRole === 'gestionnaire'

  return (
    <>
      {/* Overlay - only visible on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative inset-y-0 left-0
          w-72 lg:w-64 min-w-[250px]
          bg-gradient-to-b from-[#1e3a5f] to-[#1a2744] border-r border-blue-400/30
          flex flex-col shadow-xl shadow-blue-900/30
          z-50 lg:z-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          h-full
        `}
      >
        {/* Close button - only on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Dashboard Sidebar */}
        {currentPage === 'dashboard' && (
          <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Tableau de bord</h2>
              </div>
            </div>
            <nav className="flex-1 p-2 overflow-y-auto">
              {dashboardMenuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onDashboardTabChange(item.key)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold mb-1
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
              
              {userRole === 'membre' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-600">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">Accès Membre</span>
                  </div>
                  <p className="text-xs text-blue-500 mt-1">
                    Vous avez accès aux tâches de vos projets.
                  </p>
                </div>
              )}
            </nav>
          </div>
        )}
        
        {/* Projects Sidebar */}
        {currentPage === 'projects' && (
          <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Dossiers</h2>
              </div>
            </div>
            <nav className="flex-1 p-2 overflow-y-auto">
              <button
                onClick={() => onFolderSelect(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold mb-1
                  ${selectedFolderId === null 
                    ? 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 shadow-sm' 
                    : 'text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                <FolderOpen className="w-4 h-4" />
                Tous les projets
              </button>
              
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => onFolderSelect(folder.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold mb-1
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
              
              {isGestionnaire && (
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 border-2 border-dashed border-amber-300 mt-4 hover:border-amber-500 hover:text-amber-600 transition-all bg-gradient-to-r from-amber-50 to-white font-bold">
                  <Plus className="w-4 h-4" />
                  Nouveau dossier
                </button>
              )}
            </nav>
          </div>
        )}
        
        {/* Import PDF Sidebar */}
        {currentPage === 'import-pdf' && isGestionnaire && (
          <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-50 to-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileUp className="w-5 h-5 text-amber-500" />
                <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Import IA</h2>
              </div>
            </div>
            <nav className="flex-1 p-2 overflow-y-auto">
              {importMenuItems.map((item, index) => (
                <button
                  key={item.key}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-bold mb-1
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
    </>
  )
}
