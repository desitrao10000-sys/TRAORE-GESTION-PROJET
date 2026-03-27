#!/usr/bin/env python3
"""
Generate professional PDF reports for TRAORE GESTION PROJET
"""
import json
import sys
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, Image
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

def create_pdf_report(data, output_path):
    """Create professional PDF report"""
    
    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Title'],
        fontName='Times New Roman',
        fontSize=24,
        textColor=colors.HexColor('#1F4E79'),
        alignment=TA_CENTER,
        spaceAfter=12
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=14,
        textColor=colors.HexColor('#333333'),
        alignment=TA_CENTER,
        spaceAfter=24
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontName='Times New Roman',
        fontSize=16,
        textColor=colors.HexColor('#1F4E79'),
        spaceBefore=18,
        spaceAfter=12
    )
    
    subheading_style = ParagraphStyle(
        'SubHeading',
        parent=styles['Heading3'],
        fontName='Times New Roman',
        fontSize=12,
        textColor=colors.HexColor('#333333'),
        spaceBefore=12,
        spaceAfter=8
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY
    )
    
    header_style = ParagraphStyle(
        'TableHeader',
        fontName='Times New Roman',
        fontSize=10,
        textColor=colors.white,
        alignment=TA_CENTER
    )
    
    cell_style = ParagraphStyle(
        'TableCell',
        fontName='Times New Roman',
        fontSize=9,
        textColor=colors.black,
        alignment=TA_LEFT
    )
    
    cell_center_style = ParagraphStyle(
        'TableCellCenter',
        fontName='Times New Roman',
        fontSize=9,
        textColor=colors.black,
        alignment=TA_CENTER
    )
    
    # Parse data
    projects = data.get('projects', [])
    tasks = data.get('tasks', [])
    risks = data.get('risks', [])
    filters = data.get('filters', {})
    is_full = data.get('type') == 'full'
    
    include_tasks = is_full or filters.get('includeTasks', True)
    include_risks = is_full or filters.get('includeRisks', True)
    include_budget = is_full or filters.get('includeBudget', True)
    
    # Build story
    story = []
    
    # ========== COVER PAGE ==========
    story.append(Spacer(1, 3*cm))
    
    story.append(Paragraph("RAPPORT DE GESTION DE PROJET", title_style))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("TRAORE GESTION PROJET", subtitle_style))
    story.append(Spacer(1, 2*cm))
    
    # Report info
    info_style = ParagraphStyle(
        'Info',
        parent=styles['Normal'],
        fontName='Times New Roman',
        fontSize=12,
        alignment=TA_CENTER,
        spaceAfter=8
    )
    
    story.append(Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}", info_style))
    story.append(Paragraph(f"<b>Type:</b> {'Rapport Complet' if is_full else 'Rapport Personnalisé'}", info_style))
    
    # Applied filters
    if not is_full and filters:
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph("<b>Filtres appliqués:</b>", info_style))
        if filters.get('projectIds') and filters['projectIds'] != 'all':
            story.append(Paragraph(f"Projets: {len(filters['projectIds'])} sélectionné(s)", info_style))
        if filters.get('dateFrom'):
            story.append(Paragraph(f"Date début: {filters['dateFrom']}", info_style))
        if filters.get('dateTo'):
            story.append(Paragraph(f"Date fin: {filters['dateTo']}", info_style))
    
    story.append(PageBreak())
    
    # ========== RÉSUMÉ EXÉCUTIF ==========
    story.append(Paragraph("1. Résumé Exécutif", heading_style))
    
    # Statistics
    active_projects = len([p for p in projects if p.get('status') in ['Actif', 'En cours']])
    completed_tasks = len([t for t in tasks if t.get('status') == 'Validé'])
    in_progress_tasks = len([t for t in tasks if t.get('status') == 'En cours'])
    late_tasks = len([t for t in tasks if t.get('status') == 'En retard'])
    critical_risks = len([r for r in risks if r.get('severity') == 'Critique'])
    total_budget = sum([p.get('budgetPlanned', 0) for p in projects])
    total_spent = sum([p.get('budgetSpent', 0) for p in projects])
    
    # KPI Table
    kpi_data = [
        [Paragraph('<b>Indicateur</b>', header_style), Paragraph('<b>Valeur</b>', header_style)],
        ['Nombre de projets', str(len(projects))],
        ['Projets actifs', str(active_projects)],
        ['Total tâches', str(len(tasks))],
        ['Tâches validées', str(completed_tasks)],
        ['Tâches en cours', str(in_progress_tasks)],
        ['Tâches en retard', str(late_tasks)],
        ['Total risques', str(len(risks))],
        ['Risques critiques', str(critical_risks)],
        ['Budget total (CFA)', f"{total_budget:,.0f}".replace(",", " ")],
        ['Total dépensé (CFA)', f"{total_spent:,.0f}".replace(",", " ")],
    ]
    
    kpi_table = Table(kpi_data, colWidths=[8*cm, 5*cm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#F5F5F5')),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#F5F5F5')),
        ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#F5F5F5')),
        ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#F5F5F5')),
        ('BACKGROUND', (0, 9), (-1, 9), colors.HexColor('#F5F5F5')),
    ]))
    
    story.append(kpi_table)
    story.append(Spacer(1, 1*cm))
    
    # ========== PROJETS ==========
    story.append(Paragraph("2. Liste des Projets", heading_style))
    
    if projects:
        project_headers = ['Nom', 'Statut', 'Budget', 'Dépenses', 'Tâches']
        project_data = [[Paragraph(f'<b>{h}</b>', header_style) for h in project_headers]]
        
        for p in projects:
            project_data.append([
                Paragraph(p.get('name', ''), cell_style),
                Paragraph(p.get('status', ''), cell_center_style),
                Paragraph(f"{p.get('budgetPlanned', 0):,.0f}".replace(",", " "), cell_center_style),
                Paragraph(f"{p.get('budgetSpent', 0):,.0f}".replace(",", " "), cell_center_style),
                Paragraph(str(len(p.get('tasks', []))), cell_center_style),
            ])
        
        project_table = Table(project_data, colWidths=[5*cm, 2.5*cm, 3*cm, 3*cm, 2*cm])
        project_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        # Alternating row colors
        for i in range(1, len(project_data)):
            if i % 2 == 0:
                project_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F5F5F5')),
                ]))
        
        story.append(project_table)
    else:
        story.append(Paragraph("Aucun projet à afficher.", body_style))
    
    story.append(Spacer(1, 1*cm))
    
    # ========== TÂCHES ==========
    if include_tasks:
        story.append(Paragraph("3. Liste des Tâches", heading_style))
        
        if tasks:
            task_headers = ['Titre', 'Statut', 'Priorité', 'Projet']
            task_data = [[Paragraph(f'<b>{h}</b>', header_style) for h in task_headers]]
            
            for t in tasks[:50]:  # Limit to 50 tasks
                project_name = t.get('project', {}).get('name', '') if t.get('project') else ''
                task_data.append([
                    Paragraph(t.get('title', ''), cell_style),
                    Paragraph(t.get('status', ''), cell_center_style),
                    Paragraph(t.get('priority', ''), cell_center_style),
                    Paragraph(project_name, cell_style),
                ])
            
            task_table = Table(task_data, colWidths=[6*cm, 2.5*cm, 2.5*cm, 4.5*cm])
            task_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            for i in range(1, len(task_data)):
                if i % 2 == 0:
                    task_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F5F5F5')),
                    ]))
            
            story.append(task_table)
            
            if len(tasks) > 50:
                story.append(Paragraph(f"<i>... et {len(tasks) - 50} tâches supplémentaires</i>", body_style))
        else:
            story.append(Paragraph("Aucune tâche à afficher.", body_style))
        
        story.append(Spacer(1, 1*cm))
    
    # ========== RISQUES ==========
    if include_risks:
        story.append(Paragraph("4. Analyse des Risques", heading_style))
        
        if risks:
            risk_headers = ['Titre', 'Sévérité', 'Statut', 'Projet']
            risk_data = [[Paragraph(f'<b>{h}</b>', header_style) for h in risk_headers]]
            
            for r in risks:
                project_name = r.get('project', {}).get('name', '') if r.get('project') else ''
                risk_data.append([
                    Paragraph(r.get('title', ''), cell_style),
                    Paragraph(r.get('severity', ''), cell_center_style),
                    Paragraph(r.get('status', ''), cell_center_style),
                    Paragraph(project_name, cell_style),
                ])
            
            risk_table = Table(risk_data, colWidths=[5*cm, 3*cm, 3.5*cm, 4*cm])
            risk_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            for i in range(1, len(risk_data)):
                if i % 2 == 0:
                    risk_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F5F5F5')),
                    ]))
            
            story.append(risk_table)
        else:
            story.append(Paragraph("Aucun risque identifié.", body_style))
        
        story.append(Spacer(1, 1*cm))
    
    # ========== BUDGET ==========
    if include_budget:
        story.append(Paragraph("5. Analyse Budgétaire", heading_style))
        
        if projects:
            budget_headers = ['Projet', 'Budget prévu', 'Dépenses', '% Utilisé']
            budget_data = [[Paragraph(f'<b>{h}</b>', header_style) for h in budget_headers]]
            
            for p in projects:
                budget = p.get('budgetPlanned', 0)
                spent = p.get('budgetSpent', 0)
                percent = round((spent / budget) * 100) if budget > 0 else 0
                
                budget_data.append([
                    Paragraph(p.get('name', ''), cell_style),
                    Paragraph(f"{budget:,.0f} CFA".replace(",", " "), cell_center_style),
                    Paragraph(f"{spent:,.0f} CFA".replace(",", " "), cell_center_style),
                    Paragraph(f"{percent}%", cell_center_style),
                ])
            
            # Total row
            total_percent = round((total_spent / total_budget) * 100) if total_budget > 0 else 0
            budget_data.append([
                Paragraph('<b>TOTAL</b>', cell_style),
                Paragraph(f"<b>{total_budget:,.0f} CFA</b>".replace(",", " "), cell_center_style),
                Paragraph(f"<b>{total_spent:,.0f} CFA</b>".replace(",", " "), cell_center_style),
                Paragraph(f"<b>{total_percent}%</b>", cell_center_style),
            ])
            
            budget_table = Table(budget_data, colWidths=[5*cm, 3.5*cm, 3.5*cm, 2.5*cm])
            budget_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, -1), 'Times New Roman'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#E6E6E6')),
            ]))
            
            for i in range(1, len(budget_data) - 1):
                if i % 2 == 0:
                    budget_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F5F5F5')),
                    ]))
            
            story.append(budget_table)
        else:
            story.append(Paragraph("Aucune donnée budgétaire à afficher.", body_style))
    
    # ========== FOOTER ==========
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("_" * 80, body_style))
    story.append(Paragraph(
        f"Rapport généré automatiquement par TRAORE GESTION PROJET - {datetime.now().strftime('%d/%m/%Y')}",
        ParagraphStyle('Footer', parent=body_style, fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
    ))
    
    # Build PDF
    doc.build(story)
    
    # Add metadata using the script
    try:
        import subprocess
        subprocess.run(['python', 'scripts/add_zai_metadata.py', output_path], check=True, capture_output=True)
    except:
        pass  # Metadata script might not exist
    
    return output_path

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_pdf.py <json_data_file> <output_path>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    output_path = sys.argv[2]
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    result = create_pdf_report(data, output_path)
    print(f"PDF file created: {result}")
