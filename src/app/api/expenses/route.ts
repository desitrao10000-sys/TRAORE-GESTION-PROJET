import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

// GET /api/expenses - Récupérer toutes les dépenses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const taskId = searchParams.get('taskId')
    
    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (taskId) where.taskId = taskId
    
    const expenses = await db.expense.findMany({
      where,
      include: {
        Project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: expenses })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des dépenses' }, { status: 500 })
  }
}

// POST /api/expenses - Créer une nouvelle dépense
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { description, amount, category, projectId, taskId, date } = body

    if (!description || !amount || !projectId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Description, montant et projet requis' 
      }, { status: 400 })
    }

    const amountFloat = parseFloat(amount)

    // Créer la dépense
    const expense = await db.expense.create({
      data: {
        id: nanoid(),
        description,
        amount: amountFloat,
        category: category || 'Autres',
        projectId,
        taskId: taskId || null,
        date: date ? new Date(date) : new Date(),
        updatedAt: new Date()
      }
    })

    // Mettre à jour le budget dépensé du projet
    await db.project.update({
      where: { id: projectId },
      data: {
        budgetSpent: {
          increment: amountFloat
        }
      }
    })

    // Si une tâche est associée, mettre à jour son budgetSpent
    if (taskId) {
      await db.task.update({
        where: { id: taskId },
        data: {
          budgetSpent: {
            increment: amountFloat
          }
        }
      })
    }

    return NextResponse.json({ success: true, data: expense })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création de la dépense' }, { status: 500 })
  }
}

// PUT /api/expenses - Mettre à jour une dépense
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, description, amount, category, date, taskId } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
    }

    // Récupérer l'ancienne dépense pour ajuster le budget
    const oldExpense = await db.expense.findUnique({ where: { id } })
    
    if (!oldExpense) {
      return NextResponse.json({ success: false, error: 'Dépense non trouvée' }, { status: 404 })
    }

    const amountFloat = amount !== undefined ? parseFloat(amount) : oldExpense.amount

    const expense = await db.expense.update({
      where: { id },
      data: {
        description,
        amount: amountFloat,
        category,
        taskId: taskId !== undefined ? taskId : oldExpense.taskId,
        date: date ? new Date(date) : undefined
      }
    })

    // Ajuster le budget du projet si le montant a changé
    if (amount !== undefined && amountFloat !== oldExpense.amount) {
      const difference = amountFloat - oldExpense.amount
      await db.project.update({
        where: { id: oldExpense.projectId },
        data: {
          budgetSpent: {
            increment: difference
          }
        }
      })

      // Si la dépense est liée à une tâche, ajuster son budgetSpent
      if (oldExpense.taskId) {
        await db.task.update({
          where: { id: oldExpense.taskId },
          data: {
            budgetSpent: {
              increment: difference
            }
          }
        })
      }
    }

    return NextResponse.json({ success: true, data: expense })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour de la dépense' }, { status: 500 })
  }
}

// DELETE /api/expenses - Supprimer une dépense
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
    }

    // Récupérer la dépense avant suppression
    const expense = await db.expense.findUnique({ where: { id } })
    
    if (!expense) {
      return NextResponse.json({ success: false, error: 'Dépense non trouvée' }, { status: 404 })
    }

    // Supprimer la dépense
    await db.expense.delete({ where: { id } })

    // Mettre à jour le budget du projet
    await db.project.update({
      where: { id: expense.projectId },
      data: {
        budgetSpent: {
          decrement: expense.amount
        }
      }
    })

    // Si la dépense était liée à une tâche, mettre à jour son budgetSpent
    if (expense.taskId) {
      await db.task.update({
        where: { id: expense.taskId },
        data: {
          budgetSpent: {
            decrement: expense.amount
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression de la dépense' }, { status: 500 })
  }
}
// Force recompile
