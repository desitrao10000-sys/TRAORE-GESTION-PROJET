import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/daily-todos - Récupérer les todos du jour
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    
    const todos = await db.dailyTodo.findMany({
      where: {
        date: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lte: new Date(date + 'T23:59:59.999Z')
        }
      },
      orderBy: [
        { status: 'asc' }, // À faire d'abord, puis En cours, puis Validé
        { deadline: 'asc' }
      ]
    })
    
    return NextResponse.json({ success: true, data: todos })
  } catch (error) {
    console.error('Error fetching daily todos:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des todos' }, { status: 500 })
  }
}

// POST /api/daily-todos - Créer un todo journalier
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      date,
      projectId,
      projectName,
      taskId,
      taskTitle,
      deadline,
      responsibleName,
      constraints,
      solution,
      reminderDate
    } = body

    const todo = await db.dailyTodo.create({
      data: {
        date: date ? new Date(date) : new Date(),
        projectId,
        projectName,
        taskId,
        taskTitle,
        deadline: deadline ? new Date(deadline) : null,
        responsibleName,
        constraints,
        solution,
        reminderDate: reminderDate ? new Date(reminderDate) : null
      }
    })

    return NextResponse.json({ success: true, data: todo })
  } catch (error) {
    console.error('Error creating daily todo:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création du todo' }, { status: 500 })
  }
}

// PUT /api/daily-todos - Mettre à jour le statut d'un todo
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    const updateData: Record<string, unknown> = { status }
    
    if (status === 'Validé') {
      updateData.completedAt = new Date()
    }

    const todo = await db.dailyTodo.update({
      where: { id },
      data: updateData
    })

    // Si validé, mettre à jour la tâche associée
    if (status === 'Validé' && todo.taskId) {
      await db.task.update({
        where: { id: todo.taskId },
        data: {
          status: 'Validé',
          completedAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true, data: todo })
  } catch (error) {
    console.error('Error updating daily todo:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour du todo' }, { status: 500 })
  }
}
