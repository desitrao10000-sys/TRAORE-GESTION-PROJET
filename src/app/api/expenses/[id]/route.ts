import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE /api/expenses/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get expense before deletion to update project budget
    const expense = await db.expense.findUnique({
      where: { id }
    })

    if (!expense) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dépense non trouvée' 
      }, { status: 404 })
    }

    // Delete expense
    await db.expense.delete({
      where: { id }
    })

    // Update project's spent budget if linked to a project
    if (expense.projectId) {
      await db.project.update({
        where: { id: expense.projectId },
        data: {
          budgetSpent: {
            decrement: expense.amount
          }
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Dépense supprimée' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la suppression de la dépense' 
    }, { status: 500 })
  }
}

// PUT /api/expenses/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get old expense to calculate budget difference
    const oldExpense = await db.expense.findUnique({
      where: { id }
    })

    if (!oldExpense) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dépense non trouvée' 
      }, { status: 404 })
    }

    const newAmount = body.amount ? parseFloat(body.amount) : oldExpense.amount

    // Update expense
    const expense = await db.expense.update({
      where: { id },
      data: {
        description: body.description,
        amount: newAmount,
        category: body.category,
        date: body.date ? new Date(body.date) : undefined,
        updatedAt: new Date()
      }
    })

    // Update project's spent budget if amount changed and linked to a project
    if (body.amount && parseFloat(body.amount) !== oldExpense.amount && oldExpense.projectId) {
      const difference = parseFloat(body.amount) - oldExpense.amount
      await db.project.update({
        where: { id: oldExpense.projectId },
        data: {
          budgetSpent: {
            increment: difference
          }
        }
      })
    }

    return NextResponse.json({ success: true, data: expense })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour de la dépense' 
    }, { status: 500 })
  }
}
