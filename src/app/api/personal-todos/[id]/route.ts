import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Récupérer une tâche personnelle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const todo = await db.personalTodo.findUnique({
      where: { id }
    })

    if (!todo) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: todo })
  } catch (error) {
    console.error('Error fetching personal todo:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la tâche' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une tâche personnelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date()
    }

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate)
    }

    if (data.status === 'Validé' && !data.completedAt) {
      updateData.completedAt = new Date()
    }

    const todo = await db.personalTodo.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: todo })
  } catch (error) {
    console.error('Error updating personal todo:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la tâche' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une tâche personnelle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.personalTodo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting personal todo:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la tâche' },
      { status: 500 }
    )
  }
}
