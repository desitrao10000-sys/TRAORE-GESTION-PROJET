'use client'

import { useState, useEffect } from 'react'
import { PageType } from '@/types'
import { Save, Cloud, CloudOff, Check, AlertCircle } from 'lucide-react'

interface HeaderProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
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

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [saving, setSaving] = useState(false)
  const [lastSave, setLastSave] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)

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
        // Clear success message after 3 seconds
        setTimeout(() => setLastSave(null), 3000)
        // Refresh backup status
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

  return (
    <header className="h-16 bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#1e40af] border-b border-blue-400/30 flex items-center justify-between px-6 shadow-lg shadow-blue-500/20 rounded-br-2xl rounded-tr-2xl">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-amber-400 tracking-wide drop-shadow-lg">GESTION PROJET</h1>
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
      </div>
    </header>
  )
}
