import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, unlink, writeFile } from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectFilter } = body

    // Fetch data from database
    const whereProject: Record<string, unknown> = {}
    if (projectFilter && projectFilter !== 'all') {
      whereProject.id = projectFilter
    }

    const projects = await db.project.findMany({
      where: whereProject,
      include: {
        Task: {
          include: {
            SubTask: true
          }
        },
        Expense: true,
        Risk: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Generate Excel file using Python
    const tempFile = path.join('/tmp', `rapport_${Date.now()}.xlsx`)
    const dataFile = path.join('/tmp', `data_${Date.now()}.json`)
    
    // Write data to JSON file first
    const dataJson = JSON.stringify({
      projects: projects.map(p => ({
        name: p.name || '',
        status: p.status || '',
        budgetPlanned: p.budgetPlanned || 0,
        budgetSpent: p.budgetSpent || 0,
        startDate: p.startDate || null,
        endDate: p.endDate || null,
        tasks: (p.Task || []).map(t => ({
          title: t.title || '',
          status: t.status || '',
          priority: t.priority || '',
          dueDate: t.dueDate || null,
          estimatedTime: t.estimatedTime || 0,
          actualTime: t.actualTime || 0,
          assigneeName: t.assigneeName || '',
          subTasksCount: t.SubTask?.length || 0
        })),
        risks: (p.Risk || []).map(r => ({
          title: r.title || '',
          severity: r.severity || '',
          probability: r.probability || '',
          riskScore: r.riskScore || 0,
          status: r.status || '',
          mitigation: r.mitigation || ''
        })),
        expenses: (p.Expense || []).map(e => ({
          description: e.description || '',
          amount: e.amount || 0,
          category: e.category || '',
          date: e.date || null
        }))
      }))
    })
    
    await writeFile(dataFile, dataJson)
    
    const pythonScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Load data from JSON file
with open('${dataFile}', 'r', encoding='utf-8') as f:
    data = json.load(f)

projects = data['projects']

# Create workbook
wb = Workbook()

# Styles
header_font = Font(bold=True, color='FFFFFF', size=11)
header_fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
title_font = Font(bold=True, size=14, color='1F4E79')
border = Border(
    left=Side(style='thin'),
    right=Side(style='thin'),
    top=Side(style='thin'),
    bottom=Side(style='thin')
)
center_align = Alignment(horizontal='center', vertical='center')

# Sheet 1: Projets
ws1 = wb.active
ws1.title = 'Projets'

# Title
ws1['A1'] = 'RAPPORT PROJETS - TRAORE GESTION'
ws1['A1'].font = title_font
ws1.merge_cells('A1:H1')

# Headers
headers = ['Nom', 'Statut', 'Budget Prevu', 'Budget Depense', 'Reste', 'Date Debut', 'Date Fin', 'Taches']
for col, header in enumerate(headers, 1):
    cell = ws1.cell(row=3, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = center_align
    cell.border = border

# Data
for row, project in enumerate(projects, 4):
    ws1.cell(row=row, column=1, value=project.get('name', '')).border = border
    ws1.cell(row=row, column=2, value=project.get('status', '')).border = border
    
    budget_prevu = project.get('budgetPlanned', 0)
    budget_depense = project.get('budgetSpent', 0)
    
    ws1.cell(row=row, column=3, value=budget_prevu).border = border
    ws1.cell(row=row, column=4, value=budget_depense).border = border
    ws1.cell(row=row, column=5, value=budget_prevu - budget_depense).border = border
    
    start_date = project.get('startDate', '')
    end_date = project.get('endDate', '')
    ws1.cell(row=row, column=6, value=start_date[:10] if start_date and len(start_date) >= 10 else '-').border = border
    ws1.cell(row=row, column=7, value=end_date[:10] if end_date and len(end_date) >= 10 else '-').border = border
    ws1.cell(row=row, column=8, value=len(project.get('tasks', []))).border = border

# Column widths
for col in range(1, 9):
    ws1.column_dimensions[get_column_letter(col)].width = 18

# Sheet 2: Taches
ws2 = wb.create_sheet('Taches')

# Title
ws2['A1'] = 'LISTE DES TACHES'
ws2['A1'].font = title_font
ws2.merge_cells('A1:I1')

# Headers
task_headers = ['Projet', 'Tache', 'Statut', 'Priorite', 'Echeance', 'Temps Estime (min)', 'Temps Reel (min)', 'Assignee', 'Sous-taches']
for col, header in enumerate(task_headers, 1):
    cell = ws2.cell(row=3, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = center_align
    cell.border = border

# Data
row_num = 4
for project in projects:
    for task in project.get('tasks', []):
        ws2.cell(row=row_num, column=1, value=project.get('name', '')).border = border
        ws2.cell(row=row_num, column=2, value=task.get('title', '')).border = border
        ws2.cell(row=row_num, column=3, value=task.get('status', '')).border = border
        ws2.cell(row=row_num, column=4, value=task.get('priority', '')).border = border
        
        due_date = task.get('dueDate', '')
        ws2.cell(row=row_num, column=5, value=due_date[:10] if due_date and len(due_date) >= 10 else '-').border = border
        
        ws2.cell(row=row_num, column=6, value=task.get('estimatedTime', 0)).border = border
        ws2.cell(row=row_num, column=7, value=task.get('actualTime', 0)).border = border
        ws2.cell(row=row_num, column=8, value=task.get('assigneeName', '-') or '-').border = border
        ws2.cell(row=row_num, column=9, value=task.get('subTasksCount', 0)).border = border
        row_num += 1

for col in range(1, 10):
    ws2.column_dimensions[get_column_letter(col)].width = 16

# Sheet 3: Risques
ws3 = wb.create_sheet('Risques')

ws3['A1'] = 'REGISTRE DES RISQUES'
ws3['A1'].font = title_font
ws3.merge_cells('A1:G1')

risk_headers = ['Projet', 'Risque', 'Severite', 'Probabilite', 'Score', 'Statut', 'Mitigation']
for col, header in enumerate(risk_headers, 1):
    cell = ws3.cell(row=3, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = center_align
    cell.border = border

row_num = 4
for project in projects:
    for risk in project.get('risks', []):
        ws3.cell(row=row_num, column=1, value=project.get('name', '')).border = border
        ws3.cell(row=row_num, column=2, value=risk.get('title', '')).border = border
        ws3.cell(row=row_num, column=3, value=risk.get('severity', '')).border = border
        ws3.cell(row=row_num, column=4, value=risk.get('probability', '')).border = border
        ws3.cell(row=row_num, column=5, value=risk.get('riskScore', 0)).border = border
        ws3.cell(row=row_num, column=6, value=risk.get('status', '')).border = border
        mitigation = risk.get('mitigation', '') or '-'
        ws3.cell(row=row_num, column=7, value=mitigation[:50] if len(mitigation) > 50 else mitigation).border = border
        row_num += 1

for col in range(1, 8):
    ws3.column_dimensions[get_column_letter(col)].width = 18

# Sheet 4: Depenses
ws4 = wb.create_sheet('Depenses')

ws4['A1'] = 'SUIVI DES DEPENSES'
ws4['A1'].font = title_font
ws4.merge_cells('A1:E1')

expense_headers = ['Projet', 'Description', 'Montant', 'Categorie', 'Date']
for col, header in enumerate(expense_headers, 1):
    cell = ws4.cell(row=3, column=col, value=header)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = center_align
    cell.border = border

row_num = 4
for project in projects:
    for expense in project.get('expenses', []):
        ws4.cell(row=row_num, column=1, value=project.get('name', '')).border = border
        ws4.cell(row=row_num, column=2, value=expense.get('description', '')).border = border
        ws4.cell(row=row_num, column=3, value=expense.get('amount', 0)).border = border
        ws4.cell(row=row_num, column=4, value=expense.get('category', '-') or '-').border = border
        
        exp_date = expense.get('date', '')
        ws4.cell(row=row_num, column=5, value=exp_date[:10] if exp_date and len(exp_date) >= 10 else '-').border = border
        row_num += 1

for col in range(1, 6):
    ws4.column_dimensions[get_column_letter(col)].width = 20

# Sheet 5: Resume
ws5 = wb.create_sheet('Resume')

ws5['A1'] = 'RESUME EXECUTIF'
ws5['A1'].font = title_font
ws5.merge_cells('A1:C1')

# Calculate stats
total_projects = len(projects)
total_tasks = sum(len(p.get('tasks', [])) for p in projects)
completed_tasks = sum(1 for p in projects for t in p.get('tasks', []) if t.get('status') == 'Valide')
late_tasks = sum(1 for p in projects for t in p.get('tasks', []) if t.get('status') == 'En retard')
total_risks = sum(len(p.get('risks', [])) for p in projects)
critical_risks = sum(1 for p in projects for r in p.get('risks', []) if r.get('severity') in ['Critique', 'Haute'])
total_budget = sum(p.get('budgetPlanned', 0) for p in projects)
spent_budget = sum(p.get('budgetSpent', 0) for p in projects)

completion_rate = round(completed_tasks/total_tasks*100) if total_tasks > 0 else 0

stats = [
    ['Indicateur', 'Valeur'],
    ['Nombre de projets', total_projects],
    ['Total des taches', total_tasks],
    ['Taches terminees', completed_tasks],
    ['Taches en retard', late_tasks],
    ['Taux de completion', str(completion_rate) + '%'],
    ['Risques identifies', total_risks],
    ['Risques critiques', critical_risks],
    ['Budget total', total_budget],
    ['Budget depense', spent_budget],
    ['Budget restant', total_budget - spent_budget],
]

for row, stat in enumerate(stats, 3):
    for col, value in enumerate(stat, 1):
        cell = ws5.cell(row=row, column=col, value=value)
        cell.border = border
        if row == 3:
            cell.font = header_font
            cell.fill = header_fill
        cell.alignment = center_align

ws5.column_dimensions['A'].width = 25
ws5.column_dimensions['B'].width = 20

# Save
wb.save('${tempFile}')
print('Excel file created successfully')
`

    // Write Python script to temp file
    const scriptPath = path.join('/tmp', `generate_excel_${Date.now()}.py`)
    await writeFile(scriptPath, pythonScript)
    
    // Execute Python script
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" 2>&1`)
    console.log('Python output:', stdout)
    if (stderr) console.error('Python stderr:', stderr)
    
    // Read the generated file
    const fileBuffer = await readFile(tempFile)
    
    // Cleanup
    await unlink(tempFile).catch(() => {})
    await unlink(scriptPath).catch(() => {})
    await unlink(dataFile).catch(() => {})
    
    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Rapport_Projets.xlsx"'
      }
    })
    
  } catch (error) {
    console.error('Error generating Excel:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la generation du fichier Excel: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
