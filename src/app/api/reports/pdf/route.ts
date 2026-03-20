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
        tasks: {
          include: {
            subTasks: true
          }
        },
        expenses: true,
        risks: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalProjects = projects.length
    const totalTasks = projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0)
    const completedTasks = projects.reduce((sum, p) => sum + (p.tasks?.filter(t => t.status === 'Validé').length || 0), 0)
    const lateTasks = projects.reduce((sum, p) => sum + (p.tasks?.filter(t => t.status === 'En retard').length || 0), 0)
    const inProgressTasks = projects.reduce((sum, p) => sum + (p.tasks?.filter(t => t.status === 'En cours').length || 0), 0)
    const totalRisks = projects.reduce((sum, p) => sum + (p.risks?.length || 0), 0)
    const criticalRisks = projects.reduce((sum, p) => sum + (p.risks?.filter(r => r.severity === 'Critique' || r.severity === 'Haute').length || 0), 0)
    const totalBudget = projects.reduce((sum, p) => sum + p.budgetPlanned, 0)
    const spentBudget = projects.reduce((sum, p) => sum + p.budgetSpent, 0)

    // Generate PDF file using Python
    const tempFile = path.join('/tmp', `rapport_${Date.now()}.pdf`)
    const dataFile = path.join('/tmp', `data_${Date.now()}.json`)
    
    // Write data to JSON file first
    const dataJson = JSON.stringify({
      projects: projects.map(p => ({
        name: p.name || '',
        status: p.status || '',
        budgetPlanned: p.budgetPlanned || 0,
        budgetSpent: p.budgetSpent || 0,
        tasks: (p.tasks || []).map(t => ({
          title: t.title || '',
          status: t.status || '',
          priority: t.priority || '',
          dueDate: t.dueDate || null
        })),
        risks: (p.risks || []).map(r => ({
          title: r.title || '',
          severity: r.severity || '',
          probability: r.probability || '',
          status: r.status || ''
        }))
      })),
      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        lateTasks,
        inProgressTasks,
        totalRisks,
        criticalRisks,
        totalBudget,
        spentBudget
      }
    })
    
    await writeFile(dataFile, dataJson)

    const pythonScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.units import cm

# Load data from JSON file
with open('${dataFile}', 'r', encoding='utf-8') as f:
    data = json.load(f)

projects = data['projects']
stats = data['stats']

# Create PDF
doc = SimpleDocTemplate(
    '${tempFile}',
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=24,
    alignment=TA_CENTER,
    spaceAfter=30,
    textColor=colors.HexColor('#1F4E79')
)

subtitle_style = ParagraphStyle(
    'CustomSubtitle',
    parent=styles['Normal'],
    fontSize=14,
    alignment=TA_CENTER,
    textColor=colors.gray
)

heading_style = ParagraphStyle(
    'CustomHeading',
    parent=styles['Heading2'],
    fontSize=16,
    textColor=colors.HexColor('#1F4E79'),
    spaceBefore=20,
    spaceAfter=10
)

normal_style = ParagraphStyle(
    'CustomNormal',
    parent=styles['Normal'],
    fontSize=10
)

story = []

# Cover page
story.append(Spacer(1, 3*cm))
story.append(Paragraph('TRAORE GESTION PROJET', title_style))
story.append(Spacer(1, 1*cm))
story.append(Paragraph('Rapport d Activite', subtitle_style))
story.append(Spacer(1, 0.5*cm))
current_date = datetime.now().strftime('%d/%m/%Y a %H:%M')
story.append(Paragraph('Genere le ' + current_date, subtitle_style))
story.append(PageBreak())

# Executive Summary
story.append(Paragraph('Resume Executif', heading_style))

completion_rate = round(stats['completedTasks']/stats['totalTasks']*100) if stats['totalTasks'] > 0 else 0

summary_data = [
    ['Indicateur', 'Valeur'],
    ['Projets analyses', str(stats['totalProjects'])],
    ['Total des taches', str(stats['totalTasks'])],
    ['Taches terminees', str(stats['completedTasks'])],
    ['Taches en cours', str(stats['inProgressTasks'])],
    ['Taches en retard', str(stats['lateTasks'])],
    ['Taux de completion', str(completion_rate) + '%'],
    ['Risques identifies', str(stats['totalRisks'])],
    ['Risques critiques', str(stats['criticalRisks'])],
    ['Budget total (FCFA)', '{:,.0f}'.format(stats['totalBudget']).replace(',', ' ')],
    ['Budget depense (FCFA)', '{:,.0f}'.format(stats['spentBudget']).replace(',', ' ')],
    ['Budget restant (FCFA)', '{:,.0f}'.format(stats['totalBudget'] - stats['spentBudget']).replace(',', ' ')],
]

summary_table = Table(summary_data, colWidths=[10*cm, 6*cm])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('TOPPADDING', (0, 0), (-1, 0), 12),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
]))
story.append(summary_table)
story.append(PageBreak())

# Projects section
story.append(Paragraph('Details des Projets', heading_style))

for project in projects:
    # Project name may contain special chars, escape them
    proj_name = project.get('name', '').replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')
    story.append(Paragraph('<b>' + proj_name + '</b>', normal_style))
    story.append(Paragraph('Statut: ' + project.get('status', ''), normal_style))
    
    budget_prev = '{:,.0f}'.format(project.get('budgetPlanned', 0)).replace(',', ' ')
    budget_dep = '{:,.0f}'.format(project.get('budgetSpent', 0)).replace(',', ' ')
    story.append(Paragraph('Budget: ' + budget_prev + ' FCFA prevu / ' + budget_dep + ' FCFA depense', normal_style))
    
    tasks = project.get('tasks', [])
    if tasks:
        story.append(Spacer(1, 0.3*cm))
        task_data = [['Tache', 'Statut', 'Priorite', 'Echeance']]
        for task in tasks[:10]:
            due = '-'
            if task.get('dueDate'):
                due = task.get('dueDate', '')[:10] if len(task.get('dueDate', '')) >= 10 else task.get('dueDate', '')
            task_title = task.get('title', '')[:30].replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')
            task_data.append([
                task_title,
                task.get('status', ''),
                task.get('priority', ''),
                due
            ])
        
        task_table = Table(task_data, colWidths=[8*cm, 3*cm, 3*cm, 3*cm])
        task_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
        ]))
        story.append(task_table)
    
    story.append(Spacer(1, 0.5*cm))

# Risks section
story.append(PageBreak())
story.append(Paragraph('Registre des Risques', heading_style))

all_risks = []
for project in projects:
    for risk in project.get('risks', []):
        all_risks.append({
            'project': project.get('name', ''),
            'title': risk.get('title', ''),
            'severity': risk.get('severity', ''),
            'probability': risk.get('probability', ''),
            'status': risk.get('status', '')
        })

if all_risks:
    risk_data = [['Projet', 'Risque', 'Severite', 'Probabilite', 'Statut']]
    for risk in all_risks:
        proj_name = risk['project'][:20].replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')
        risk_title = risk['title'][:30].replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;')
        risk_data.append([
            proj_name,
            risk_title,
            risk['severity'],
            risk['probability'],
            risk['status']
        ])
    
    risk_table = Table(risk_data, colWidths=[3.5*cm, 6*cm, 2.5*cm, 2.5*cm, 3*cm])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
    ]))
    story.append(risk_table)
else:
    story.append(Paragraph('Aucun risque identifie', normal_style))

# Build PDF
doc.build(story)
print('PDF created successfully')
`

    // Write Python script to temp file
    const scriptPath = path.join('/tmp', `generate_pdf_${Date.now()}.py`)
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
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Rapport_Projets.pdf"'
      }
    })
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la generation du fichier PDF: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
