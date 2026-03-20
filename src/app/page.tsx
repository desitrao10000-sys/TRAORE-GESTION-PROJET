'use client'

// TRAORE GESTION PROJET - Page principale avec authentification
// Version: 2.0 avec système d'authentification

import { useState, useEffect, useCallback } from 'react'
import { useAppStore, useHydration, AuthUser } from '@/store/appStore'
import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { DashboardOverview } from '@/components/app/DashboardOverview'
import { DashboardCalendar } from '@/components/app/DashboardCalendar'
import { UserProfile } from '@/components/app/UserProfile'
import { PersonalTodoList } from '@/components/app/PersonalTodoList'
import { DashboardRisks } from '@/components/app/DashboardRisks'
import { DailyTodoList } from '@/components/app/DailyTodoList'
import { ReportsExport } from '@/components/app/ReportsExport'
import { ProjectsList } from '@/components/app/ProjectsList'
import { ProjectDetail } from '@/components/app/ProjectDetail'
import { ImportPDF } from '@/components/app/ImportPDF'
import { GanttView } from '@/components/app/GanttView'
import { LoginPage } from '@/components/app/LoginPage'
import { Folder, Project, Task, Risk } from '@/types'
import { Settings, Bell } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MembersManagement } from '@/components/app/MembersManagement'

export default function Home() {
  const hydrated = useHydration()
  const {
    user,
    isAuthenticated,
    setUser,
    logout,
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
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setCheckingAuth(false)
      }
    }

    if (hydrated) {
      checkAuth()
    }
  }, [hydrated, setUser])

  // Fetch all data function
  const fetchData = useCallback(async (showLoading = true) => {
    if (!isAuthenticated) return
    
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
  }, [selectedProjectId, isAuthenticated])

  // Fetch all data on mount or when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [fetchData, isAuthenticated])

  // Auto-refresh data when window regains focus (after sleep/wake)
  useEffect(() => {
    if (!isAuthenticated) return
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Window regained focus - refreshing data...')
        fetchData(false)
      }
    }

    const handleFocus = () => {
      console.log('Window focused - refreshing data...')
      fetchData(false)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchData, isAuthenticated])

  // Auto-save to GitHub periodically (every 5 minutes) and before page unload
  useEffect(() => {
    if (!isAuthenticated) return
    
    const autoSaveInterval = setInterval(async () => {
      try {
        await fetch('/api/backup', { method: 'POST' })
        console.log('Auto-save completed')
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, 5 * 60 * 1000)

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      try {
        const res = await fetch('/api/backup')
        const data = await res.json()
        if (data.success && data.hasChanges) {
          fetch('/api/backup', { method: 'POST' })
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
  }, [isAuthenticated])

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

  // Handle login
  const handleLogin = (loggedInUser: AuthUser) => {
    setUser(loggedInUser)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    logout()
  }

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

  // Afficher le loader pendant l'hydratation ou la vérification de l'auth
  if (!hydrated || checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#0f1225] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  // Afficher la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  // Afficher le loader pendant le chargement des données
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#0f1225] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#1e3a5f] to-[#0f1225] flex flex-col">
      {/* Header */}
      <Header 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      
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
          user={user}
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
                  risks={risks}
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
              
              {dashboardTab === 'risks' && (
                <DashboardRisks
                  risks={risks}
                  projects={projects}
                  onProjectClick={handleProjectClick}
                />
              )}
              
              {dashboardTab === 'reports' && (
                <ReportsExport
                  tasks={tasks}
                  projects={projects}
                  risks={risks}
                />
              )}
              {dashboardTab === 'gantt' && (
                <GanttView
                  projects={projects}
                  tasks={tasks}
                  onProjectClick={handleProjectClick}
                />
              )}
              {dashboardTab === 'calendar' && (
                <DashboardCalendar
                  tasks={tasks}
                  projects={projects}
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
          
          {/* Profile */}
          {currentPage === 'profile' && <UserProfile />}
          
          {/* Settings */}
          {currentPage === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">Paramètres</h1>
                <p className="text-blue-200 mt-1">Configuration de l'application</p>
              </div>
              
              {/* Gestion des membres - Seulement pour le gestionnaire */}
              {user?.role === 'gestionnaire' && (
                <MembersManagement />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Paramètres généraux */}
                <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-amber-400" />
                      Général
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-blue-200 mb-1 block">Langue</label>
                      <select className="w-full p-2 bg-white/10 border border-blue-400/30 rounded-lg text-white">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-blue-200 mb-1 block">Fuseau horaire</label>
                      <select className="w-full p-2 bg-white/10 border border-blue-400/30 rounded-lg text-white">
                        <option value="africa/abidjan">Afrique/Abidjan (GMT)</option>
                        <option value="europe/paris">Europe/Paris (CET)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] border-blue-400/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-400" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-blue-200">Rappels par email</span>
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-blue-200">Alertes de retard</span>
                      <input type="checkbox" className="w-4 h-4" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-blue-200">Résumé quotidien</span>
                      <input type="checkbox" className="w-4 h-4" />
                    </label>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {/* Import PDF */}
          {currentPage === 'import-pdf' && <ImportPDF />}
        </main>
      </div>
    </div>
  )
}
