'use client'

import { create } from 'zustand'
import { PageType, DashboardTab } from '@/types'

interface AppState {
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
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page, selectedProjectId: null }),
  
  // Dashboard tabs
  dashboardTab: 'overview',
  setDashboardTab: (tab) => set({ dashboardTab: tab }),
  
  // Projects
  selectedFolderId: null,
  setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId, selectedProjectId: null }),
  
  selectedProjectId: null,
  setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
  
  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
