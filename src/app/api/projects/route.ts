import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/projects - Récupérer tous les projets
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const status = searchParams.get('status')
    const includeArchived = searchParams.get('includeArchived') === 'true'
    
    const where: Record<string, unknown> = {}
    if (folderId) where.folderId = folderId
    if (status) where.status = status
    if (!includeArchived) where.isArchived = false
    
    const projects = await db.project.findMany({
      where,
      include: {
        folder: true,
        tasks: {
          select: { id: true, status: true, priority: true, dueDate: true }
        },
        expenses: {
          select: { id: true, amount: true, category: true, date: true }
        },
        risks: {
          select: { id: true, severity: true, status: true }
        },
        template: {
          select: { id: true, name: true }
        },
        dashboard: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des projets' }, { status: 500 })
  }
}

// POST /api/projects - Créer un nouveau projet
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      objectives,
      constraints,
      budgetPlanned,
      responsibleName,
      responsibleId,
      folderId,
      templateId,
      startDate,
      endDate
    } = body

    // Créer le projet
    const project = await db.project.create({
      data: {
        name,
        description,
        objectives,
        constraints,
        budgetPlanned: budgetPlanned || 0,
        responsibleName,
        responsibleId,
        folderId,
        templateId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        folder: true,
        template: true
      }
    })

    // Si basé sur un modèle, créer les tâches du modèle
    if (templateId) {
      const template = await db.projectTemplate.findUnique({
        where: { id: templateId },
        include: { taskTemplates: true }
      })

      if (template?.taskTemplates.length) {
        const now = new Date()
        await db.task.createMany({
          data: template.taskTemplates.map((tt, index) => ({
            title: tt.title,
            description: tt.description,
            priority: tt.defaultPriority,
            estimatedTime: tt.estimatedDays * 480, // Convertir jours en minutes (8h/jour)
            projectId: project.id,
            dueDate: tt.estimatedDays > 0 
              ? new Date(now.getTime() + tt.estimatedDays * 24 * 60 * 60 * 1000) 
              : null,
            order: index,
            status: 'À faire'
          }))
        })
      }
    }

    // Créer le dashboard
    await db.projectDashboard.create({
      data: {
        projectId: project.id
      }
    })

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création du projet' }, { status: 500 })
  }
}
