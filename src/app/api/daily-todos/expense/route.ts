import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/daily-todos/expense - Enregistrer une dépense sur un todo
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { todoId, amount, category, note, projectId, projectName } = body
    
    if (!todoId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    }
    
    // Update the todo with expense info
    const todo = await db.dailyTodo.update({
      where: { id: todoId },
      data: {
        expenseAmount: amount,
        expenseCategory: category,
        expenseNote: note
      }
    })
    
    // Create an expense record
    await db.expense.create({
      data: {
        description: note || `Dépense pour: ${todo.taskTitle}`,
        amount: amount,
        category: category,
        projectId: projectId,
        date: new Date()
      }
    })
    
    // Update project budget spent
    if (projectId) {
      await db.project.update({
        where: { id: projectId },
        data: {
          budgetSpent: { increment: amount }
        }
      })
    }
    
    return NextResponse.json({ success: true, data: todo })
  } catch (error) {
    console.error('Error adding expense:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de l\'enregistrement de la dépense' }, { status: 500 })
  }
}
