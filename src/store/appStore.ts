'use client'

import { create } from 'zustand'
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

  // Viewing another user's profile (for admin)
  viewingUserId: string | null
  setViewingUserId: (userId: string | null) => void
}

// Clé de stockage localStorage
const STORAGE_KEY = 'traore-gestion-projet-storage'

// Fonction pour charger l'état depuis localStorage (une seule fois)
function loadStoredState() {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading state from localStorage:', e)
  }
  return null
}

// Fonction pour sauvegarder l'état dans localStorage (avec debounce)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
function saveState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return
  
  // Debounce: attendre 500ms avant de sauvegarder
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  
  saveTimeout = setTimeout(() => {
    try {
      const toSave = {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentPage: state.currentPage,
        dashboardTab: state.dashboardTab,
        selectedFolderId: state.selectedFolderId,
        selectedProjectId: state.selectedProjectId,
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        viewingUserId: state.viewingUserId,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (e) {
      console.error('Error saving state to localStorage:', e)
    }
  }, 500)
}

// Charger l'état initial UNE SEULE FOIS
const initialState = typeof window !== 'undefined' ? loadStoredState() : null

export const useAppStore = create<AppState>()((set) => ({
  // Authentication - restaurer depuis localStorage si disponible
  user: initialState?.user || null,
  isAuthenticated: initialState?.isAuthenticated || false,
  setUser: (user) => {
    const newState = { user, isAuthenticated: !!user }
    set(newState)
    saveState(newState)
  },
  logout: () => {
    const newState = { user: null, isAuthenticated: false, currentPage: 'dashboard' as PageType, viewingUserId: null }
    set(newState)
    saveState(newState)
  },
  
  // Navigation
  currentPage: initialState?.currentPage || 'dashboard',
  setCurrentPage: (page) => {
    const newState = { currentPage: page, selectedProjectId: null }
    set(newState)
    saveState(newState)
  },
  
  // Dashboard tabs
  dashboardTab: initialState?.dashboardTab || 'overview',
  setDashboardTab: (tab) => {
    set({ dashboardTab: tab })
    saveState({ dashboardTab: tab })
  },
  
  // Projects
  selectedFolderId: initialState?.selectedFolderId || null,
  setSelectedFolderId: (folderId) => {
    const newState = { selectedFolderId: folderId, selectedProjectId: null }
    set(newState)
    saveState(newState)
  },
  
  selectedProjectId: initialState?.selectedProjectId || null,
  setSelectedProjectId: (projectId) => {
    set({ selectedProjectId: projectId })
    saveState({ selectedProjectId: projectId })
  },
  
  // UI State
  sidebarOpen: initialState?.sidebarOpen ?? true,
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
    saveState({ sidebarOpen: open })
  },
  
  // User preferences
  theme: initialState?.theme || 'dark',
  setTheme: (theme) => {
    set({ theme })
    saveState({ theme })
  },

  // Viewing another user's profile
  viewingUserId: initialState?.viewingUserId || null,
  setViewingUserId: (userId) => {
    set({ viewingUserId: userId })
    saveState({ viewingUserId: userId })
  },
}))

// Hook simplifié - toujours true côté client
export const useHydration = () => typeof window !== 'undefined'
