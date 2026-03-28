'use client'

import { useState, useMemo } from 'react'
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  FileDown,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderOpen,
  Loader2,
  Check,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Layers,
  DollarSign,
  Package
} from 'lucide-react'
import { Task, Project, Risk } from '@/types'
import { format as formatDate } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

interface ReportsExportProps {
  tasks: Task[]
  projects: Project[]
  risks: Risk[]
}

type ExportFormat = 'pdf' | 'excel'

interface ExportFilters {
  projectIds: string[]
  includeTasks: boolean
  includeRisks: boolean
  includeBudget: boolean
  dateFrom: string
  dateTo: string
}

export function ReportsExport({ tasks, projects, risks }: ReportsExportProps) {
  const { toast } = useToast()
  const [exporting, setExporting] = useState<ExportFormat | null>(null)
  const [lastExport, setLastExport] = useState<{ format: ExportFormat; date: Date } | null>(null)
  const [showProjectSelector, setShowProjectSelector] = useState(false)
  
  // Filters state
  const [filters, setFilters] = useState<ExportFilters>({
    projectIds: [], // Empty = all projects
    includeTasks: true,
    includeRisks: true,
    includeBudget: true,
    dateFrom: '',
    dateTo: ''
  })

  // Toggle project selection
  const toggleProject = (projectId: string) => {
    setFilters(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter(id => id !== projectId)
        : [...prev.projectIds, projectId]
    }))
  }

  // Select all projects
  const selectAllProjects = () => {
    setFilters(prev => ({
      ...prev,
      projectIds: []
    }))
  }

  // Clear project selection
  const clearProjectSelection = () => {
    setFilters(prev => ({
      ...prev,
      projectIds: projects.map(p => p.id)
    }))
  }

  // Get selected projects display
  const selectedProjectsDisplay = useMemo(() => {
    if (filters.projectIds.length === 0) {
      return 'Tous les projets'
    }
    if (filters.projectIds.length === 1) {
      const project = projects.find(p => p.id === filters.projectIds[0])
      return project?.name || '1 projet'
    }
    return `${filters.projectIds.length} projets sélectionnés`
  }, [filters.projectIds, projects])

  // Filter data based on selections
  const filteredData = useMemo(() => {
    // Filter by projects
    const filteredProjects = filters.projectIds.length === 0 
      ? projects 
      : projects.filter(p => filters.projectIds.includes(p.id))
    
    const projectIds = filteredProjects.map(p => p.id)
    
    // Filter tasks
    let filteredTasks = tasks.filter(t => projectIds.includes(t.projectId))
    
    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filteredTasks = filteredTasks.filter(t => 
        t.dueDate ? new Date(t.dueDate) >= fromDate : true
      )
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filteredTasks = filteredTasks.filter(t => 
        t.dueDate ? new Date(t.dueDate) <= toDate : true
      )
    }
    
    // Filter risks
    const filteredRisks = risks.filter(r => projectIds.includes(r.projectId))
    
    return {
      projects: filteredProjects,
      tasks: filteredTasks,
      risks: filteredRisks
    }
  }, [filters, projects, tasks, risks])

  // Stats
  const stats = {
    projects: filteredData.projects.length,
    tasks: filteredData.tasks.length,
    risks: filteredData.risks.length,
    totalBudget: filteredData.projects.reduce((sum, p) => sum + p.budgetPlanned, 0),
    totalSpent: filteredData.projects.reduce((sum, p) => sum + p.budgetSpent, 0)
  }

  // Validate filters
  const canExport = filters.includeTasks || filters.includeRisks || filters.includeBudget

  // Export functions
  const exportData = async (format: ExportFormat, isFullReport: boolean = false) => {
    if (!canExport && !isFullReport) {
      toast({ 
        title: '⚠️ Sélection requise', 
        description: 'Veuillez sélectionner au moins un type de données à exporter',
        variant: 'destructive' 
      })
      return
    }

    setExporting(format)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isFullReport ? 'full' : 'filtered',
          format,
          filters: isFullReport ? null : {
            projectIds: filters.projectIds.length === 0 ? 'all' : filters.projectIds,
            includeTasks: isFullReport ? true : filters.includeTasks,
            includeRisks: isFullReport ? true : filters.includeRisks,
            includeBudget: isFullReport ? true : filters.includeBudget,
            dateFrom: filters.dateFrom || null,
            dateTo: filters.dateTo || null
          }
        })
      })

      if (!response.ok) throw new Error('Erreur lors de l\'export')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = isFullReport 
        ? `rapport_complet_${formatDate(new Date(), 'yyyy-MM-dd')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        : `rapport_personnalise_${formatDate(new Date(), 'yyyy-MM-dd')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setLastExport({ format, date: new Date() })
      toast({ 
        title: '✅ Export réussi', 
        description: `Le rapport a été téléchargé en ${format.toUpperCase()}` 
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({ 
        title: '❌ Erreur lors de l\'export', 
        description: 'Veuillez réessayer',
        variant: 'destructive' 
      })
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">Rapports & Exports</h1>
        <p className="text-blue-200 mt-1">Filtrez et exportez vos données</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-blue-200">Projets</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{stats.projects}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-xs text-blue-200">Tâches</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{stats.tasks}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-blue-200">Risques</span>
            </div>
            <p className="text-xl font-bold text-white mt-1">{stats.risks}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-blue-200">Budget (CFA)</span>
            </div>
            <p className="text-lg font-bold text-white mt-1">{stats.totalBudget.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] border-blue-400/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-blue-200">Dépensé (CFA)</span>
            </div>
            <p className="text-lg font-bold text-white mt-1">{stats.totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Dernier export */}
      {lastExport && (
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/10 rounded-xl p-4 border border-green-400/30 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400" />
          <div>
            <span className="text-green-300 font-medium">
              Dernier export: {lastExport.format.toUpperCase()}
            </span>
            <span className="text-green-300/70 text-sm ml-2">
              - {formatDate(lastExport.date, 'dd/MM/yyyy à HH:mm')}
            </span>
          </div>
        </div>
      )}

      {/* Section Filtres */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2744] rounded-xl border border-blue-400/30 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Filtres d'export</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Filtre Projets */}
          <div className="space-y-3">
            <Label className="text-blue-200 font-medium flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-400" />
              Projets
            </Label>
            
            {/* Project selector toggle */}
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#1a2744]/50 border border-blue-400/20 text-white hover:border-amber-400/30 transition-all"
            >
              <span className={filters.projectIds.length === 0 ? 'text-amber-300' : ''}>
                {selectedProjectsDisplay}
              </span>
              {showProjectSelector ? (
                <ChevronUp className="w-4 h-4 text-blue-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-blue-300" />
              )}
            </button>

            {/* Project list dropdown */}
            {showProjectSelector && (
              <div className="bg-[#1a2744] border border-blue-400/30 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                {/* Select all / Clear buttons */}
                <div className="flex gap-2 pb-2 border-b border-blue-400/20">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={selectAllProjects}
                    className="text-xs text-blue-300 hover:text-amber-300"
                  >
                    Tous
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearProjectSelection}
                    className="text-xs text-blue-300 hover:text-amber-300"
                  >
                    Aucun
                  </Button>
                </div>
                
                {/* Project checkboxes */}
                {projects.map(project => (
                  <label 
                    key={project.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-blue-400/10 cursor-pointer"
                  >
                    <Checkbox
                      checked={filters.projectIds.length === 0 || filters.projectIds.includes(project.id)}
                      onCheckedChange={() => toggleProject(project.id)}
                      className="border-blue-400/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <span className="text-sm text-white">{project.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      project.status === 'Actif' ? 'bg-green-500/20 text-green-300' :
                      project.status === 'En cours' ? 'bg-blue-500/20 text-blue-300' :
                      project.status === 'Terminé' ? 'bg-gray-500/20 text-gray-300' :
                      'bg-orange-500/20 text-orange-300'
                    }`}>
                      {project.status}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filtre Type de données */}
          <div className="space-y-3">
            <Label className="text-blue-200 font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Données à inclure
            </Label>
            
            <div className="space-y-3 bg-[#1a2744]/50 border border-blue-400/20 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={filters.includeTasks}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeTasks: !!checked }))}
                  className="border-blue-400/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span className="text-white">Tâches</span>
                <span className="text-blue-300 text-sm ml-auto">{stats.tasks}</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={filters.includeRisks}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeRisks: !!checked }))}
                  className="border-blue-400/50 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                />
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-white">Risques</span>
                <span className="text-blue-300 text-sm ml-auto">{stats.risks}</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={filters.includeBudget}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeBudget: !!checked }))}
                  className="border-blue-400/50 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                />
                <BarChart3 className="w-4 h-4 text-green-400" />
                <span className="text-white">Budget</span>
                <span className="text-blue-300 text-sm ml-auto">{projects.length}</span>
              </label>
            </div>
          </div>

          {/* Filtre Période */}
          <div className="space-y-3">
            <Label className="text-blue-200 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Période concernée
            </Label>
            
            <div className="space-y-3 bg-[#1a2744]/50 border border-blue-400/20 rounded-lg p-4">
              <div className="space-y-2">
                <label className="text-xs text-blue-300">Date de début</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-blue-300">Date de fin</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full bg-[#1a2744] border border-blue-400/30 rounded px-3 py-2 text-white text-sm focus:border-amber-400/50 focus:outline-none"
                />
              </div>
              
              {(filters.dateFrom || filters.dateTo) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))}
                  className="w-full text-xs text-blue-300 hover:text-amber-300"
                >
                  <X className="w-3 h-3 mr-1" />
                  Effacer les dates
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Résumé des filtres actifs */}
        <div className="mt-6 pt-4 border-t border-blue-400/20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-blue-300">Filtres actifs:</span>
            {filters.projectIds.length > 0 && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs">
                {filters.projectIds.length} projet(s)
              </span>
            )}
            {filters.includeTasks && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                Tâches
              </span>
            )}
            {filters.includeRisks && (
              <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                Risques
              </span>
            )}
            {filters.includeBudget && (
              <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                Budget
              </span>
            )}
            {filters.dateFrom && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                Du {formatDate(new Date(filters.dateFrom), 'dd/MM/yyyy')}
              </span>
            )}
            {filters.dateTo && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                Au {formatDate(new Date(filters.dateTo), 'dd/MM/yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Boutons d'export */}
        <div className="mt-6 flex flex-wrap gap-4">
          <Button
            onClick={() => exportData('pdf')}
            disabled={exporting !== null || !canExport}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
          >
            {exporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            Exporter PDF
          </Button>
          
          <Button
            onClick={() => exportData('excel')}
            disabled={exporting !== null || !canExport}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            {exporting === 'excel' ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 mr-2" />
            )}
            Exporter Excel
          </Button>
        </div>
      </div>

      {/* Rapport Complet - Section séparée */}
      <div className="bg-gradient-to-br from-purple-500/20 to-[#1a2744] rounded-xl border border-purple-400/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Rapport Complet</h3>
              <p className="text-purple-200 text-sm">
                Export de toutes les données sans filtre (projets, tâches, risques, budget)
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => exportData('pdf', true)}
              disabled={exporting !== null}
              variant="outline"
              size="sm"
              className="border-red-400/30 text-red-300 hover:bg-red-500/20 min-w-[100px]"
            >
              {exporting === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              PDF
            </Button>
            <Button
              onClick={() => exportData('excel', true)}
              disabled={exporting !== null}
              variant="outline"
              size="sm"
              className="border-green-400/30 text-green-300 hover:bg-green-500/20 min-w-[100px]"
            >
              {exporting === 'excel' ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#1a2744]/50 rounded-xl p-4 border border-red-400/20">
          <div className="flex items-center gap-2 mb-3">
            <FileDown className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-white">Format PDF</h3>
          </div>
          <ul className="space-y-2 text-sm text-blue-200">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Rapport formaté prêt à imprimer
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Idéal pour le partage et l'archivage
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Résumé exécutif inclus
            </li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-br from-[#1e3a5f]/50 to-[#1a2744]/50 rounded-xl p-4 border border-green-400/20">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">Format Excel (CSV)</h3>
          </div>
          <ul className="space-y-2 text-sm text-blue-200">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Compatible Excel, Google Sheets
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Données filtrables et triables
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              Idéal pour l'analyse
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
