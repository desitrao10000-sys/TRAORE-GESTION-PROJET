'use client'

// NGP - New Gestion Projet - Page principale
// Version: 3.0 - Optimisation anti-flash complète

import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Folder, Project, Task, Risk, PageType } from '@/types'
import { Settings, Bell, Menu } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MembersManagement } from '@/components/app/MembersManagement'

// Composant de chargement mémorisé
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a2744' }}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
      <p style={{ color: '#9ca3af' }}>Chargement...</p>
    </div>
  </div>
)

export default function Home() {
  // État du store
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
    setSelectedProjectId,
    viewingUserId,
    setViewingUserId
  } = useAppStore()

  // State for data
  const [folders, setFolders] = useState<Folder[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Détecter mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Navigation wrapper
  const handleNavigate = useCallback((page: PageType) => {
    setViewingUserId(null)
    setCurrentPage(page)
    if (isMobile) setSidebarOpen(false)
  }, [setCurrentPage, setViewingUserId, isMobile])

  // Safe JSON parse
  const safeJsonParse = async (response: Response) => {
    try {
      const text = await response.text()
      if (!text) return { success: false, data: null }
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        console.error('API returned HTML instead of JSON')
        return { success: false, data: null }
      }
      return JSON.parse(text)
    } catch {
      return { success: false, data: null }
    }
  }

  // Vérifier l'authentification une seule fois
  useEffect(() => {
    if (!hydrated) return
    
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await safeJsonParse(res)
          if (data.success && data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }
    
    checkAuth()
  }, [hydrated, setUser])

  // Charger les données une seule fois après authentification
  useEffect(() => {
    if (!isAuthenticated || dataLoaded) return
    
    const fetchData = async () => {
      try {
        const [foldersRes, projectsRes, tasksRes, risksRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/projects'),
          fetch('/api/tasks'),
          fetch('/api/risks')
        ])

        const [foldersData, projectsData, tasksData, risksData] = await Promise.all([
          safeJsonParse(foldersRes),
          safeJsonParse(projectsRes),
          safeJsonParse(tasksRes),
          safeJsonParse(risksRes)
        ])

        if (foldersData.success) setFolders(foldersData.data)
        if (projectsData.success) setProjects(projectsData.data)
        if (tasksData.success) setTasks(tasksData.data)
        if (risksData.success) setRisks(risksData.data)
        
        setDataLoaded(true)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    fetchData()
  }, [isAuthenticated, dataLoaded])

  // Charger le projet sélectionné
  useEffect(() => {
    // Si pas de projet sélectionné, ne rien faire
    if (!selectedProjectId) {
      return
    }

    let isMounted = true
    
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${selectedProjectId}`)
        const data = await safeJsonParse(res)
        if (data.success && isMounted) {
          setSelectedProject(data.data)
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      }
    }

    fetchProject()
    
    return () => { isMounted = false }
  }, [selectedProjectId])

  // Handlers
  const handleLogin = useCallback((loggedInUser: AuthUser) => {
    setUser(loggedInUser)
  }, [setUser])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    }
    logout()
  }, [logout])

  const handleProjectClick = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
    setCurrentPage('projects')
  }, [setSelectedProjectId, setCurrentPage])

  const handleBackToProjects = useCallback(() => {
    setSelectedProjectId(null)
    setSelectedProject(null)
  }, [setSelectedProjectId])

  const handleFolderSelect = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId)
    setSelectedProjectId(null)
    setSelectedProject(null)
    if (isMobile) setSidebarOpen(false)
  }, [setSelectedFolderId, setSelectedProjectId, isMobile])

  const refreshData = useCallback(async () => {
    try {
      const [foldersRes, projectsRes, tasksRes, risksRes] = await Promise.all([
        fetch('/api/folders'),
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/risks')
      ])

      const [foldersData, projectsData, tasksData, risksData] = await Promise.all([
        safeJsonParse(foldersRes),
        safeJsonParse(projectsRes),
        safeJsonParse(tasksRes),
        safeJsonParse(risksRes)
      ])

      if (foldersData.success) setFolders(foldersData.data)
      if (projectsData.success) setProjects(projectsData.data)
      if (tasksData.success) setTasks(tasksData.data)
      if (risksData.success) setRisks(risksData.data)
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }, [])

  // Stats calculés avec useMemo
  const stats = useMemo(() => ({
    activeProjects: projects.filter(p => p.status === 'Actif' || p.status === 'En cours').length,
    tasksInProgress: tasks.filter(t => t.status === 'En cours').length,
    tasksLate: tasks.filter(t => t.status === 'En retard').length,
    tasksCompleted: tasks.filter(t => t.status === 'Validé').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budgetPlanned, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.budgetSpent, 0),
    remainingBudget: projects.reduce((sum, p) => sum + p.budgetPlanned, 0) - projects.reduce((sum, p) => sum + p.budgetSpent, 0)
  }), [projects, tasks])

  // Projets filtrés avec useMemo
  const filteredProjects = useMemo(() => 
    selectedFolderId ? projects.filter(p => p.folderId === selectedFolderId) : projects,
    [projects, selectedFolderId]
  )

  // Affichage
  if (!hydrated) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
  }

  if (!dataLoaded) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#1a2744' }}>
      {/* Header */}
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          dashboardTab={dashboardTab}
          folders={folders}
          selectedFolderId={selectedFolderId}
          onNavigate={handleNavigate}
          onDashboardTabChange={(tab) => {
            setDashboardTab(tab)
            if (isMobile) setSidebarOpen(false)
          }}
          onFolderSelect={handleFolderSelect}
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 w-full">
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
              {dashboardTab === 'personal-todo' && <PersonalTodoList />}
              {dashboardTab === 'risks' && (
                <DashboardRisks
                  risks={risks}
                  projects={projects}
                  onProjectClick={handleProjectClick}
                />
              )}
              {dashboardTab === 'reports' && (
                <ReportsExport tasks={tasks} projects={projects} risks={risks} />
              )}
              {dashboardTab === 'gantt' && (
                <GanttView projects={projects} tasks={tasks} onProjectClick={handleProjectClick} />
              )}
              {dashboardTab === 'calendar' && <DashboardCalendar tasks={tasks} projects={projects} />}
            </>
          )}
          
          {/* Projects */}
          {currentPage === 'projects' && (
            selectedProjectId && selectedProject ? (
              <ProjectDetail project={selectedProject} onBack={handleBackToProjects} />
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
          {currentPage === 'profile' && !viewingUserId && <UserProfile />}
          {viewingUserId && <UserProfile />}
          
          {/* Settings */}
          {currentPage === 'settings' && !viewingUserId && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">Paramètres</h1>
                <p className="text-blue-200 mt-1">Configuration de l'application</p>
              </div>
              
              <MembersManagement />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      {/* Mobile FAB */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 left-6 z-50 p-4 bg-amber-500 text-black rounded-full shadow-xl hover:bg-amber-600 transition-all hover:scale-105"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
