'use client'

import { PageType } from '@/types'

interface HeaderProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

const navItems: { key: PageType; label: string }[] = [
  { key: 'dashboard', label: 'Tableau de bord' },
  { key: 'projects', label: 'Projets' },
  { key: 'import-pdf', label: 'Import PDF' }
]

export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className="h-16 bg-gradient-to-r from-[#2563eb] via-[#1d4ed8] to-[#1e40af] border-b border-blue-400/30 flex items-center justify-between px-6 shadow-lg shadow-blue-500/20 rounded-br-2xl rounded-tr-2xl">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-amber-400 tracking-wide drop-shadow-lg">GESTION PROJET</h1>
      </div>
      
      {/* Navigation */}
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
    </header>
  )
}
