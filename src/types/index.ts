// Types pour l'application de gestion de projet

export type PageType = 'dashboard' | 'projects' | 'import-pdf'

export type DashboardTab = 'overview' | 'todo' | 'personal-todo' | 'workload' | 'risks' | 'statistics' | 'reports'

export type ProjectStatus = 'Actif' | 'En cours' | 'Terminé' | 'Archivé'

export type TaskStatus = 'À faire' | 'En cours' | 'En retard' | 'Validé'

export type TaskPriority = 'Basse' | 'Moyenne' | 'Haute' | 'Urgente'

export type RiskSeverity = 'Basse' | 'Moyenne' | 'Haute' | 'Critique'

export type RiskProbability = 'Basse' | 'Moyenne' | 'Haute'

export type RiskStatus = 'Identifié' | 'En cours de traitement' | 'Résolu' | 'Accepté'

// Folder (Dossier)
export interface Folder {
  id: string
  name: string
  icon: string | null
  color: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}

// Project (Projet)
export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  budgetPlanned: number
  budgetSpent: number
  responsibleName: string | null
  responsibleId: string | null
  folderId: string | null
  folder?: Folder | null
  tasks?: Task[]
  expenses?: Expense[]
  risks?: Risk[]
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
}

// Task (Tâche)
export interface Task {
  id: string
  title: string
  description: string | null
  objectives: string | null
  constraints: string | null
  solutionProposed: string | null
  status: TaskStatus
  priority: TaskPriority
  priorityScore: number
  dueDate: Date | null
  startedAt: Date | null
  completedAt: Date | null
  projectId: string
  project?: Project
  assigneeId: string | null
  assigneeName: string | null
  budget: number
  budgetSpent: number
  createdAt: Date
  updatedAt: Date
}

// Expense (Dépense)
export interface Expense {
  id: string
  description: string
  amount: number
  category: string | null
  date: Date
  projectId: string
  taskId: string | null
  project?: Project
  task?: Task
  createdAt: Date
  updatedAt: Date
}

// Risk (Risque)
export interface Risk {
  id: string
  title: string
  description: string | null
  severity: RiskSeverity
  probability: RiskProbability
  status: RiskStatus
  mitigation: string | null
  projectId: string
  project?: Project
  createdAt: Date
  updatedAt: Date
}

// User (Utilisateur)
export interface User {
  id: string
  email: string
  name: string | null
  role: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

// Pdf Import
export interface PdfImport {
  id: string
  fileName: string
  filePath: string | null
  status: string
  tasksCount: number
  createdAt: Date
  updatedAt: Date
}

// Dashboard Stats
export interface DashboardStats {
  activeProjects: number
  tasksInProgress: number
  tasksLate: number
  tasksCompleted: number
  totalBudget: number
  totalSpent: number
  remainingBudget: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
