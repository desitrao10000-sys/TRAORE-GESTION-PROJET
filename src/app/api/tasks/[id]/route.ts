import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks/[id] - Récupérer une tâche spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const task = await db.task.findUnique({
      where: { id },
      include: {
        Project: true,
        SubTask: true,
        TaskFile: true,
        Comment: {
          orderBy: { createdAt: 'desc' }
        },
        ActivityHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        TimerSession: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })
    
    if (!task) {
      return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération de la tâche' }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Mettre à jour une tâche
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Récupérer l'ancienne tâche pour l'historique
    const oldTask = await db.task.findUnique({ where: { id } })
    
    const updateData: Record<string, unknown> = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.objectives !== undefined) updateData.objectives = body.objectives
    if (body.constraints !== undefined) updateData.constraints = body.constraints
    if (body.solutionProposed !== undefined) updateData.solutionProposed = body.solutionProposed
    if (body.status !== undefined) updateData.status = body.status
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.priorityScore !== undefined) updateData.priorityScore = body.priorityScore
    if (body.estimatedTime !== undefined) updateData.estimatedTime = body.estimatedTime
    if (body.actualTime !== undefined) updateData.actualTime = body.actualTime
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.assigneeId !== undefined) updateData.assigneeId = body.assigneeId
    if (body.assigneeName !== undefined) updateData.assigneeName = body.assigneeName
    
    // Gérer les changements de statut
    if (body.status === 'En cours' && !oldTask?.startedAt) {
      updateData.startedAt = new Date()
    }
    if (body.status === 'Validé' && !oldTask?.completedAt) {
      updateData.completedAt = new Date()
      updateData.timerRunning = false
    }
    
    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        Project: true,
        SubTask: true
      }
    })

    // Créer une entrée dans l'historique si changement de statut
    if (body.status && body.status !== oldTask?.status) {
      await db.activityHistory.create({
        data: {
          action: 'status_changed',
          entityType: 'task',
          entityId: task.id,
          details: JSON.stringify({ 
            oldStatus: oldTask?.status, 
            newStatus: body.status 
          }),
          userName: body.userName || 'Système',
          taskId: task.id
        }
      })
    }
    
    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour de la tâche' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Supprimer une tâche
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.task.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true, message: 'Tâche supprimée' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression de la tâche' }, { status: 500 })
  }
}
