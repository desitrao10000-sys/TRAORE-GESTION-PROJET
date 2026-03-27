'use client'

import { useState, useEffect } from 'react'
import { PageType } from '@/types'
import { Save, Cloud, Check, AlertCircle, LogOut, User, ChevronDown, Settings, Menu } from 'lucide-react'
import { AuthUser } from '@/store/appStore'

interface HeaderProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
  user?: AuthUser | null
  onLogout?: () => void
  onMenuClick?: () => void
}

const navItems: { key: PageType; label: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'projects', label: 'Projets' },
  { key: 'import-pdf', label: 'Import PDF' }
]

interface BackupStatus {
  lastBackup: {
    hash: string
    message: string
    date: string
  } | null
  hasChanges: boolean
  changesCount: number
}

export function Header({ currentPage, onNavigate, user, onLogout, onMenuClick }: HeaderProps) {
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    // Ne pas vérifier le backup au démarrage pour éviter les flashs
    // checkBackupStatus()
  }, [])

  const checkBackupStatus = async () => {
    try {
      const res = await fetch('/api/backup')
      const data = await res.json()
      if (data.success) {
        setBackupStatus(data)
      }
    } catch (error) {
      console.error('Error checking backup status:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    
    try {
      const res = await fetch('/api/backup', { method: 'POST' })
      const data = await res.json()
      
      if (data.success) {
        setLastSave(data.message)
        setTimeout(() => setLastSave(null), 3000)
        await checkBackupStatus()
      } else {
        setSaveError(data.error || 'Erreur de sauvegarde')
        setTimeout(() => setSaveError(null), 5000)
      }
    } catch (error) {
      setSaveError('Erreur de connexion')
      setTimeout(() => setSaveError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    setShowUserMenu(false)
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <header className="h-14 md:h-16 bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#1e40af] border-b border-blue-400/30 flex items-center justify-between px-2 sm:px-4 md:px-6 shadow-lg shadow-blue-500/20 flex-shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 flex-shrink-0">
        {/* Menu button - only on mobile/tablet */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs md:text-sm font-bold text-white">NGP</span>
          </div>
          <h1 className="text-sm sm:text-base md:text-xl font-bold text-amber-400 tracking-wide drop-shadow-lg truncate">
            <span className="hidden sm:inline">NEW GESTION PROJET</span>
            <span className="sm:hidden">NGP</span>
          </h1>
        </div>
        
        {/* Changes indicator */}
        {backupStatus?.hasChanges && (
          <span className="hidden md:flex text-xs text-amber-300 bg-amber-400/20 px-2 py-1 rounded-full items-center gap-1 flex-shrink-0">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            {backupStatus.changesCount}
          </span>
        )}
      </div>
      
      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                px-3 py-1.5 text-sm font-medium transition-all rounded-lg whitespace-nowrap
                ${currentPage === item.key 
                  ? 'text-amber-400 bg-white/10' 
                  : 'text-white hover:text-amber-300 hover:bg-white/10'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Save status indicators */}
        {lastSave && (
          <span className="hidden sm:flex items-center gap-1 text-green-400 text-xs animate-pulse flex-shrink-0">
            <Check className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{lastSave}</span>
          </span>
        )}
        {saveError && (
          <span className="hidden sm:flex items-center gap-1 text-red-400 text-xs flex-shrink-0">
            <AlertCircle className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{saveError}</span>
          </span>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium transition-all flex-shrink-0
            ${backupStatus?.hasChanges 
              ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/30' 
              : 'bg-white/10 hover:bg-white/20 text-white'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title={backupStatus?.lastBackup ? `Dernière sauvegarde: ${backupStatus.lastBackup.date}` : 'Sauvegarder'}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="hidden md:inline text-sm">
            {saving ? 'Sauvegarde...' : backupStatus?.hasChanges ? 'Sauvegarder' : 'Sync'}
          </span>
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || ''} className="w-7 h-7 md:w-8 md:h-8 rounded-full" />
                ) : (
                  <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                )}
              </div>
              <div className="text-left hidden md:block min-w-0">
                <p className="text-sm font-medium text-white truncate max-w-[120px]">{user.name || 'Utilisateur'}</p>
                <p className="text-xs text-blue-200 capitalize">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-200 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-medium text-gray-800 truncate">{user.name || 'Utilisateur'}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'gestionnaire' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'gestionnaire' ? 'Gestionnaire' : 'Membre'}
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onNavigate('profile')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Mon profil</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        onNavigate('settings')
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Paramètres</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
