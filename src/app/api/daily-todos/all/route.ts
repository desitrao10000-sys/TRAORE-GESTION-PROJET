import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/daily-todos/all - Récupérer tous les todos (ou les générer depuis les tâches)
export async function GET() {
  try {
    // D'abord, vérifier s'il y a des todos dans la table
    let todos = await db.dailyTodo.findMany({
      orderBy: [
        { status: 'asc' },
        { deadline: 'asc' }
      ]
    })

    // Si pas de todos, les générer automatiquement depuis les tâches
    if (todos.length === 0) {
      // Récupérer toutes les tâches actives (non terminées/annulées)
      const tasks = await db.task.findMany({
        where: {
          status: { notIn: ['Validé', 'Annulé'] }
        },
        include: {
          project: true
        }
      })

      // Créer les todos pour chaque tâche
      for (const task of tasks) {
        // Récupérer les risques associés au projet
        const risks = await db.risk.findMany({
          where: {
            projectId: task.projectId,
            status: { notIn: ['Résolu', 'Accepté'] }
          },
          take: 1,
          orderBy: { riskScore: 'desc' }
        })

        await db.dailyTodo.create({
          data: {
            date: task.dueDate || new Date(),
            projectId: task.projectId,
            projectName: task.project?.name || 'Sans projet',
            taskId: task.id,
            taskTitle: task.title,
            taskDescription: task.description,
            status: mapTaskStatusToTodoStatus(task.status),
            deadline: task.dueDate,
            responsibleName: task.assigneeName,
            constraints: task.constraints,
            solution: task.solutionProposed,
            riskId: risks[0]?.id,
            riskTitle: risks[0]?.title,
            riskSeverity: risks[0]?.severity
          }
        })
      }

      // Re-fetch les todos après création
      todos = await db.dailyTodo.findMany({
        orderBy: [
          { status: 'asc' },
          { deadline: 'asc' }
        ]
      })
    }

    // Convertir les dates en string pour la sérialisation
    const serializedTodos = todos.map(todo => ({
      ...todo,
      date: todo.date?.toISOString() || null,
      deadline: todo.deadline?.toISOString() || null,
      completedAt: todo.completedAt?.toISOString() || null,
      reminderDate: todo.reminderDate?.toISOString() || null,
      createdAt: todo.createdAt?.toISOString() || null,
      updatedAt: todo.updatedAt?.toISOString() || null
    }))

    return NextResponse.json({ success: true, data: serializedTodos })
  } catch (error) {
    console.error('Error fetching all todos:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des todos' }, { status: 500 })
  }
}

// Mapper les statuts de tâche vers les statuts de todo
function mapTaskStatusToTodoStatus(taskStatus: string): string {
  switch (taskStatus) {
    case 'En cours':
      return 'En cours'
    case 'Validé':
      return 'Validé'
    case 'En retard':
      return 'À faire' // En retard reste "À faire" dans la todo list
    default:
      return 'À faire'
  }
}
