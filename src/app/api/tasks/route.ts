import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET /api/tasks - Récupérer toutes les tâches
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignee = searchParams.get('assignee')
    
    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assignee) where.assigneeName = { contains: assignee }
    
    const tasks = await db.task.findMany({
      where,
      include: {
        Project: {
          select: { id: true, name: true, status: true }
        },
        SubTask: true,
        Comment: {
          orderBy: { createdAt: 'desc' }
        },
        TaskFile: true,
        _count: {
          select: { SubTask: true, Comment: true }
        }
      },
      orderBy: [
        { priorityScore: 'desc' },
        { dueDate: 'asc' }
      ]
    })
    
    // Transform to match frontend interface (lowercase field names)
    const transformedTasks = tasks.map(task => ({
      ...task,
      project: task.Project,
      subtasks: task.SubTask,
      comments: task.Comment,
      taskFiles: task.TaskFile
    }))
    
    return NextResponse.json({ success: true, data: transformedTasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des tâches' }, { status: 500 })
  }
}

// POST /api/tasks - Créer une nouvelle tâche
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      objectives,
      constraints,
      solutionProposed,
      status,
      priority,
      priorityScore,
      estimatedTime,
      dueDate,
      startDate,
      projectId,
      assigneeId,
      assigneeName,
      budget
    } = body

    if (!title) {
      return NextResponse.json({ success: false, error: 'Le titre est requis' }, { status: 400 })
    }

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Le projet est requis' }, { status: 400 })
    }

    // Calculer le score de priorité si non fourni
    let score = priorityScore
    if (!score && priority) {
      const priorityMap: Record<string, number> = {
        'Urgente': 100,
        'Haute': 75,
        'Moyenne': 50,
        'Basse': 25
      }
      score = priorityMap[priority] || 50
    }

    const taskId = nanoid()
    const now = new Date()

    const task = await db.task.create({
      data: {
        id: taskId,
        title,
        description: description || null,
        objectives: objectives || null,
        constraints: constraints || null,
        solutionProposed: solutionProposed || null,
        status: status || 'À faire',
        priority: priority || 'Moyenne',
        priorityScore: score || 50,
        estimatedTime: estimatedTime || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        startedAt: startDate ? new Date(startDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        assigneeName: assigneeName || null,
        budget: budget ? parseFloat(String(budget)) : 0,
        updatedAt: now
      },
      include: {
        Project: {
          select: { id: true, name: true, status: true }
        },
        SubTask: true,
        Comment: {
          orderBy: { createdAt: 'desc' }
        },
        TaskFile: true
      }
    })

    // Créer une entrée dans l'historique
    try {
      await db.activityHistory.create({
        data: {
          id: nanoid(),
          action: 'created',
          entityType: 'task',
          entityId: task.id,
          details: JSON.stringify({ title: task.title }),
          userName: assigneeName || 'Système',
          taskId: task.id
        }
      })
    } catch (historyError) {
      console.error('Error creating activity history:', historyError)
      // Don't fail the task creation if history fails
    }

    // Transform to match frontend interface (lowercase field names)
    const transformedTask = {
      ...task,
      project: task.Project,
      subtasks: task.SubTask,
      comments: task.Comment,
      taskFiles: task.TaskFile
    }

    return NextResponse.json({ success: true, data: transformedTask })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création de la tâche: ' + (error instanceof Error ? error.message : 'Erreur inconnue') }, { status: 500 })
  }
}

// PUT /api/tasks - Mettre à jour une tâche
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      id, 
      title, 
      description, 
      objectives,
      constraints,
      solutionProposed,
      status, 
      priority, 
      priorityScore, 
      estimatedTime, 
      actualTime,
      dueDate, 
      assigneeId, 
      assigneeName,
      budget,
      budgetSpent
    } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de la tâche requis' }, { status: 400 })
    }

    // Construire les données de mise à jour
    const updateData: Record<string, unknown> = { updatedAt: new Date() }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (objectives !== undefined) updateData.objectives = objectives
    if (constraints !== undefined) updateData.constraints = constraints
    if (solutionProposed !== undefined) updateData.solutionProposed = solutionProposed
    if (status !== undefined) {
      updateData.status = status
      // Mettre à jour les dates selon le statut
      if (status === 'Validé') {
        updateData.completedAt = new Date()
      }
      if (status === 'En cours') {
        updateData.startedAt = new Date()
      }
    }
    if (priority !== undefined) updateData.priority = priority
    if (priorityScore !== undefined) updateData.priorityScore = priorityScore
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime
    if (actualTime !== undefined) updateData.actualTime = actualTime
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (body.startedAt !== undefined) updateData.startedAt = body.startedAt ? new Date(body.startedAt) : null
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId
    if (assigneeName !== undefined) updateData.assigneeName = assigneeName
    if (budget !== undefined) updateData.budget = parseFloat(String(budget))
    if (budgetSpent !== undefined) updateData.budgetSpent = parseFloat(String(budgetSpent))

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        Project: {
          select: { id: true, name: true, status: true }
        },
        SubTask: true
      }
    })

    // Créer une entrée dans l'historique si le statut a changé
    if (status) {
      try {
        await db.activityHistory.create({
          data: {
            id: nanoid(),
            action: 'status_changed',
            entityType: 'task',
            entityId: task.id,
            details: JSON.stringify({ newStatus: status, title: task.title }),
            userName: assigneeName || 'Système',
            taskId: task.id
          }
        })
      } catch (historyError) {
        console.error('Error creating activity history:', historyError)
      }
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour de la tâche' }, { status: 500 })
  }
}

// DELETE /api/tasks - Supprimer une tâche
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de la tâche requis' }, { status: 400 })
    }

    // Supprimer d'abord les sous-tâches, fichiers et commentaires
    await db.subTask.deleteMany({ where: { taskId: id } })
    await db.taskFile.deleteMany({ where: { taskId: id } })
    await db.comment.deleteMany({ where: { taskId: id } })
    await db.activityHistory.deleteMany({ where: { taskId: id } })

    // Supprimer la tâche
    await db.task.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression de la tâche' }, { status: 500 })
  }
}
