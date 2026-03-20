'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PageType, DashboardTab } from '@/types'

// Type utilisateur
export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: 'gestionnaire' | 'membre'
  avatar: string | null
  phone?: string | null
  position?: string | null
  department?: string | null
  bio?: string | null
  skills?: string[]
}

interface AppState {
  // Authentication
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
  
  // Navigation
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
  
  // Dashboard tabs
  dashboardTab: DashboardTab
  setDashboardTab: (tab: DashboardTab) => void
  
  // Projects
  selectedFolderId: string | null
  setSelectedFolderId: (folderId: string | null) => void
  
  selectedProjectId: string | null
  setSelectedProjectId: (projectId: string | null) => void
  
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // User preferences
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  
  // Last activity timestamp
  lastActivity: number
  updateLastActivity: () => void

  // Viewing another user's profile (for admin)
  viewingUserId: string | null
  setViewingUserId: (userId: string | null) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Authentication
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, lastActivity: Date.now() }),
      logout: () => set({ user: null, isAuthenticated: false, currentPage: 'dashboard', viewingUserId: null, lastActivity: Date.now() }),
      
      // Navigation
      currentPage: 'dashboard',
      setCurrentPage: (page) => set({ currentPage: page, selectedProjectId: null, lastActivity: Date.now() }),
      
      // Dashboard tabs
      dashboardTab: 'overview',
      setDashboardTab: (tab) => set({ dashboardTab: tab, lastActivity: Date.now() }),
      
      // Projects
      selectedFolderId: null,
      setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId, selectedProjectId: null, lastActivity: Date.now() }),
      
      selectedProjectId: null,
      setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId, lastActivity: Date.now() }),
      
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open, lastActivity: Date.now() }),
      
      // User preferences
      theme: 'dark',
      setTheme: (theme) => set({ theme, lastActivity: Date.now() }),
      
      // Last activity
      lastActivity: Date.now(),
      updateLastActivity: () => set({ lastActivity: Date.now() }),

      // Viewing another user's profile
      viewingUserId: null,
      setViewingUserId: (userId) => set({ viewingUserId: userId, lastActivity: Date.now() }),
    }),
    {
      name: 'traore-gestion-projet-storage', // Nom unique pour localStorage
      partialize: (state) => ({
        // Seulement les données qu'on veut persister
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentPage: state.currentPage,
        dashboardTab: state.dashboardTab,
        selectedFolderId: state.selectedFolderId,
        selectedProjectId: state.selectedProjectId,
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        lastActivity: state.lastActivity,
        viewingUserId: state.viewingUserId,
      }),
    }
  )
)

// Hook pour vérifier si les données sont restaurées
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    // Fonction pour vérifier l'hydratation
    const checkHydration = () => {
      if (useAppStore.persist.hasHydrated()) {
        setHydrated(true)
        return true
      }
      return false
    }
    
    // Vérifier immédiatement
    if (checkHydration()) return
    
    // Sinon attendre l'événement d'hydratation
    const unsub = useAppStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    
    return unsub
  }, [])
  
  return hydrated
}

// Import nécessaire pour le hook
import { useState, useEffect } from 'react'
