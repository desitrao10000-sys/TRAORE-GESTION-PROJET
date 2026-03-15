import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/tasks/subtasks - Créer une sous-tâche
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { taskId, title } = body

    const subTask = await db.subTask.create({
      data: {
        title,
        taskId,
        isCompleted: false
      }
    })

    return NextResponse.json({ success: true, data: subTask })
  } catch (error) {
    console.error('Error creating subtask:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création de la sous-tâche' }, { status: 500 })
  }
}

// PUT /api/tasks/subtasks - Mettre à jour une sous-tâche
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, isCompleted } = body

    const subTask = await db.subTask.update({
      where: { id },
      data: {
        title,
        isCompleted
      }
    })

    return NextResponse.json({ success: true, data: subTask })
  } catch (error) {
    console.error('Error updating subtask:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour de la sous-tâche' }, { status: 500 })
  }
}

// DELETE /api/tasks/subtasks - Supprimer une sous-tâche
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
    }

    await db.subTask.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Sous-tâche supprimée' })
  } catch (error) {
    console.error('Error deleting subtask:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression de la sous-tâche' }, { status: 500 })
  }
}
