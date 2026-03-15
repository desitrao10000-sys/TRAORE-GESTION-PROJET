'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, useHydration } from '@/store/appStore'
import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { DashboardOverview } from '@/components/app/DashboardOverview'
import { PersonalTodoList } from '@/components/app/PersonalTodoList'
import { DashboardWorkload } from '@/components/app/DashboardWorkload'
import { DashboardRisks } from '@/components/app/DashboardRisks'
import { DailyTodoList } from '@/components/app/DailyTodoList'
import { DashboardStatistics } from '@/components/app/DashboardStatistics'
import { ReportsExport } from '@/components/app/ReportsExport'
import { ProjectsList } from '@/components/app/ProjectsList'
import { ProjectDetail } from '@/components/app/ProjectDetail'
import { ImportPDF } from '@/components/app/ImportPDF'
import { Folder, Project, Task, Risk } from '@/types'

export default function Home() {
  const hydrated = useHydration()
  const {
    currentPage,
    setCurrentPage,
    dashboardTab,
    setDashboardTab,
    selectedFolderId,
    setSelectedFolderId,
    selectedProjectId,
    setSelectedProjectId
  } = useAppStore()

  // State for data
  const [folders, setFolders] = useState<Folder[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch all data function
  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      
      // Fetch folders
      const foldersRes = await fetch('/api/folders')
      const foldersData = await foldersRes.json()
      if (foldersData.success) {
        setFolders(foldersData.data)
      }
      
      // Fetch projects
      const projectsRes = await fetch('/api/projects')
      const projectsData = await projectsRes.json()
      if (projectsData.success) {
        setProjects(projectsData.data)
      }
      
      // Fetch tasks
      const tasksRes = await fetch('/api/tasks')
      const tasksData = await tasksRes.json()
      if (tasksData.success) {
        setTasks(tasksData.data)
      }
      
      // Fetch risks
      const risksRes = await fetch('/api/risks')
      const risksData = await risksRes.json()
      if (risksData.success) {
        setRisks(risksData.data)
      }
      
      // Refresh selected project if one is selected
      if (selectedProjectId) {
        const projectRes = await fetch(`/api/projects/${selectedProjectId}`)
        const projectData = await projectRes.json()
        if (projectData.success) {
          setSelectedProject(projectData.data)
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [selectedProjectId])

  // Fetch all data on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh data when window regains focus (after sleep/wake)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Window regained focus - refreshing data...')
        fetchData(false) // Refresh without showing loading spinner
      }
    }

    const handleFocus = () => {
      console.log('Window focused - refreshing data...')
      fetchData(false)
    }

    // Listen for visibility change (tab switch, wake from sleep)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Listen for window focus
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchData])

  // Auto-save to GitHub periodically (every 5 minutes) and before page unload
  useEffect(() => {
    // Auto-save interval (5 minutes)
    const autoSaveInterval = setInterval(async () => {
      try {
        await fetch('/api/backup', { method: 'POST' })
        console.log('Auto-save completed')
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 5 * 60 * 1000) // 5 minutes

    // Save before page unload (warning: may not complete)
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes
      try {
        const res = await fetch('/api/backup')
        const data = await res.json()
        if (data.success && data.hasChanges) {
          // Trigger save (may not complete in time)
          fetch('/api/backup', { method: 'POST' })
          // Show warning to user
          e.preventDefault()
          e.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
          return e.returnValue
        }
      } catch (error) {
        console.error('Error checking backup status:', error)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(autoSaveInterval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Fetch selected project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!selectedProjectId) {
        setSelectedProject(null)
        return
      }
      
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}`)
        const data = await res.json()
        if (data.success) {
          setSelectedProject(data.data)
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      }
    }
    
    fetchProject()
  }, [selectedProjectId])

  // Calculate stats
  const stats = {
    activeProjects: projects.filter(p => p.status === 'Actif' || p.status === 'En cours').length,
    tasksInProgress: tasks.filter(t => t.status === 'En cours').length,
    tasksLate: tasks.filter(t => t.status === 'En retard').length,
    tasksCompleted: tasks.filter(t => t.status === 'Validé').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budgetPlanned, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.budgetSpent, 0),
    remainingBudget: projects.reduce((sum, p) => sum + p.budgetPlanned, 0) - projects.reduce((sum, p) => sum + p.budgetSpent, 0)
  }

  // Handle project click
  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId)
    setCurrentPage('projects')
  }

  // Handle back to projects
  const handleBackToProjects = () => {
    setSelectedProjectId(null)
    setSelectedProject(null)
  }

  // Handle folder selection
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedProjectId(null)
    setSelectedProject(null)
  }

  // Filter projects by folder
  const filteredProjects = selectedFolderId 
    ? projects.filter(p => p.folderId === selectedFolderId)
    : projects

  // Refresh data (for TODO List updates)
  const refreshData = useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  if (!hydrated || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#0f1225] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#0f1225] flex flex-col">
      {/* Header */}
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          dashboardTab={dashboardTab}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onNavigate={setCurrentPage}
          onDashboardTabChange={setDashboardTab}
          onFolderSelect={handleFolderSelect}
        />
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard */}
          {currentPage === 'dashboard' && (
            <>
              {dashboardTab === 'overview' && (
                <DashboardOverview
                  stats={stats}
                  projects={projects}
                  tasks={tasks}
                  onProjectClick={handleProjectClick}
                  onNavigate={setCurrentPage}
                />
              )}
              {dashboardTab === 'todo' && (
                <DailyTodoList
                  tasks={tasks}
                  projects={projects}
                  risks={risks}
                  onTaskUpdate={refreshData}
                />
              )}
              {dashboardTab === 'personal-todo' && (
                <PersonalTodoList />
              )}
              {dashboardTab === 'workload' && (
                <DashboardWorkload
                  tasks={tasks}
                  projects={projects}
                />
              )}
              {dashboardTab === 'risks' && (
                <DashboardRisks
                  risks={risks}
                  projects={projects}
                  onProjectClick={handleProjectClick}
                />
              )}
              {dashboardTab === 'statistics' && (
                <DashboardStatistics
                  tasks={tasks}
                  projects={projects}
                  risks={risks}
                />
              )}
              {dashboardTab === 'reports' && (
                <ReportsExport
                  tasks={tasks}
                  projects={projects}
                  risks={risks}
                />
              )}
            </>
          )}
          
          {/* Projects */}
          {currentPage === 'projects' && (
            selectedProjectId && selectedProject ? (
              <ProjectDetail
                project={selectedProject}
                onBack={handleBackToProjects}
              />
            ) : (
              <ProjectsList
                projects={filteredProjects}
                folders={folders}
                selectedFolderId={selectedFolderId}
                onProjectClick={handleProjectClick}
                onFolderSelect={handleFolderSelect}
              />
            )
          )}
          
          {/* Import PDF */}
          {currentPage === 'import-pdf' && <ImportPDF />}
        </main>
      </div>
    </div>
  )
}
