import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Reprogrammer une tâche personnelle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const { newDueDate, reason } = data

    if (!newDueDate) {
      return NextResponse.json(
        { success: false, error: 'La nouvelle date d\'échéance est requise' },
        { status: 400 }
      )
    }

    // Récupérer la tâche actuelle
    const currentTodo = await db.personalTodo.findUnique({
      where: { id }
    })

    if (!currentTodo) {
      return NextResponse.json(
        { success: false, error: 'Tâche non trouvée' },
        { status: 404 }
      )
    }

    // Sauvegarder l'historique de reprogrammation
    await db.personalTodoHistory.create({
      data: {
        personalTodoId: id,
        oldDueDate: currentTodo.dueDate,
        newDueDate: new Date(newDueDate),
        reason: reason || null,
        reprogrammedAt: new Date()
      }
    })

    // Mettre à jour la tâche
    const todo = await db.personalTodo.update({
      where: { id },
      data: {
        dueDate: new Date(newDueDate),
        reprogrammed: true,
        reprogrammedAt: new Date(),
        reprogramReason: reason || null,
        reprogramCount: { increment: 1 },
        // Conserver la date originale si pas encore définie
        originalDueDate: currentTodo.originalDueDate || currentTodo.dueDate,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: todo,
      message: 'Tâche reprogrammée avec succès'
    })
  } catch (error) {
    console.error('Error reprogramming personal todo:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la reprogrammation de la tâche' },
      { status: 500 }
    )
  }
}
