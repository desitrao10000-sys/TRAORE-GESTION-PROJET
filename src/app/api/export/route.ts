import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import os from 'os'

const execAsync = promisify(exec)

interface ExportFilters {
  projectIds: string[] | 'all'
  includeTasks: boolean
  includeRisks: boolean
  includeBudget: boolean
  dateFrom: string | null
  dateTo: string | null
}

// POST /api/export - Export data to PDF or Excel
export async function POST(request: Request) {
  let tempJsonFile: string | null = null
  
  try {
    const body = await request.json()
    const { type, format, filters } = body

    // Fetch all data
    let projects = await db.project.findMany({
      include: {
        Task: true,
        Expense: true,
        Risk: true,
        Folder: true
      }
    })

    let tasks = await db.task.findMany({
      include: {
        Project: { select: { name: true, status: true } }
      }
    })

    let risks = await db.risk.findMany({
      include: {
        Project: { select: { name: true } }
      }
    })

    // Apply filters if provided and type is 'filtered'
    let appliedFilters: ExportFilters | null = null
    if (type === 'filtered' && filters) {
      appliedFilters = filters as ExportFilters

      // Filter by projects
      if (filters.projectIds !== 'all' && Array.isArray(filters.projectIds) && filters.projectIds.length > 0) {
        projects = projects.filter(p => filters.projectIds.includes(p.id))
        const projectIds = filters.projectIds
        tasks = tasks.filter(t => projectIds.includes(t.projectId))
        risks = risks.filter(r => projectIds.includes(r.projectId))
      }

      // Filter by date range (for tasks)
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        tasks = tasks.filter(t => 
          t.dueDate ? new Date(t.dueDate) >= fromDate : true
        )
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        tasks = tasks.filter(t => 
          t.dueDate ? new Date(t.dueDate) <= toDate : true
        )
      }
    }

    // Prepare data for Python script
    const exportData = {
      type,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        budgetPlanned: p.budgetPlanned,
        budgetSpent: p.budgetSpent,
        responsibleName: p.responsibleName,
        startDate: p.startDate,
        endDate: p.endDate,
        tasks: p.Task
      })),
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assigneeName: t.assigneeName,
        dueDate: t.dueDate,
        project: t.Project
      })),
      risks: risks.map(r => ({
        id: r.id,
        title: r.title,
        severity: r.severity,
        probability: r.probability,
        status: r.status,
        mitigation: r.mitigation,
        project: r.Project
      })),
      filters: appliedFilters
    }

    // Create temp files
    const timestamp = Date.now()
    const tempDir = os.tmpdir()
    tempJsonFile = join(tempDir, `export_data_${timestamp}.json`)
    const outputFile = join(tempDir, `rapport_${type}_${timestamp}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)

    // Write JSON data to temp file
    await writeFile(tempJsonFile, JSON.stringify(exportData), 'utf-8')

    // Get the scripts directory path
    const scriptsDir = join(process.cwd(), 'scripts')
    const scriptFile = format === 'pdf' ? 'generate_pdf.py' : 'generate_excel.py'

    // Execute Python script - use venv Python which has the required packages
    const pythonPath = '/home/z/.venv/bin/python3'
    const { stdout, stderr } = await execAsync(
      `${pythonPath} ${join(scriptsDir, scriptFile)} "${tempJsonFile}" "${outputFile}"`,
      { timeout: 30000 }
    )

    if (stderr && !stderr.includes('created:')) {
      console.error('Python stderr:', stderr)
    }

    // Read the generated file
    const fileContent = await readFile(outputFile)
    
    // Cleanup temp files
    try {
      await unlink(tempJsonFile)
      await unlink(outputFile)
    } catch {
      // Ignore cleanup errors
    }

    // Determine content type and filename
    const contentType = format === 'pdf' 
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    
    const filename = type === 'full'
      ? `rapport_complet_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      : `rapport_personnalise_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    
    // Cleanup on error
    if (tempJsonFile) {
      try {
        await unlink(tempJsonFile)
      } catch {
        // Ignore
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'export: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
