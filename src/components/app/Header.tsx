'use client'

import { useState, useEffect } from 'react'
import { PageType } from '@/types'
import { Save, Cloud, Check, AlertCircle, LogOut, User, ChevronDown, Settings } from 'lucide-react'
import { AuthUser } from '@/store/appStore'

interface HeaderProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
  user?: AuthUser | null
  onLogout?: () => void
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

export function Header({ currentPage, onNavigate, user, onLogout }: HeaderProps) {
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Check backup status on mount
  useEffect(() => {
    checkBackupStatus()
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
    <header className="h-16 bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#1e40af] border-b border-blue-400/30 flex items-center justify-between px-6 shadow-lg shadow-blue-500/20 rounded-br-2xl rounded-tr-2xl">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">NGP</span>
          </div>
          <h1 className="text-xl font-bold text-amber-400 tracking-wide drop-shadow-lg">NEW GESTION PROJET</h1>
        </div>
        {backupStatus?.hasChanges && (
          <span className="text-xs text-amber-300 bg-amber-400/20 px-2 py-1 rounded-full">
            {backupStatus.changesCount} modification{backupStatus.changesCount > 1 ? 's' : ''} non sauvegardée{backupStatus.changesCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Navigation & Save */}
      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                px-4 py-2 text-sm font-medium transition-all rounded-xl
                ${currentPage === item.key 
                  ? 'text-amber-400 bg-white/10 backdrop-blur-sm border-b-2 border-amber-400' 
                  : 'text-white hover:text-amber-300 hover:bg-white/10'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Save Button */}
        <div className="flex items-center gap-2">
          {lastSave && (
            <span className="flex items-center gap-1 text-green-400 text-sm animate-pulse">
              <Check className="w-4 h-4" />
              {lastSave}
            </span>
          )}
          {saveError && (
            <span className="flex items-center gap-1 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {saveError}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
              ${backupStatus?.hasChanges 
                ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/30' 
                : 'bg-white/10 hover:bg-white/20 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={backupStatus?.lastBackup ? `Dernière sauvegarde: ${backupStatus.lastBackup.date}` : 'Sauvegarder sur GitHub'}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : backupStatus?.hasChanges ? (
              <>
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4" />
                <span>Synchronisé</span>
              </>
            )}
          </button>
        </div>

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || ''} className="w-8 h-8 rounded-full" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-white">{user.name || 'Utilisateur'}</p>
                <p className="text-xs text-blue-200 capitalize">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-200" />
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
                    <p className="font-medium text-gray-800">{user.name || 'Utilisateur'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
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
