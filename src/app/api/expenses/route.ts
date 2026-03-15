import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/expenses - Récupérer toutes les dépenses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    const where = projectId ? { projectId } : {}
    
    const expenses = await db.expense.findMany({
      where,
      include: {
        project: {
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
    const { description, amount, category, projectId, date } = body

    if (!description || !amount || !projectId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Description, montant et projet requis' 
      }, { status: 400 })
    }

    // Créer la dépense
    const expense = await db.expense.create({
      data: {
        description,
        amount: parseFloat(amount),
        category: category || 'Autres',
        projectId,
        date: date ? new Date(date) : new Date()
      }
    })

    // Mettre à jour le budget dépensé du projet
    await db.project.update({
      where: { id: projectId },
      data: {
        budgetSpent: {
          increment: parseFloat(amount)
        }
      }
    })

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
    const { id, description, amount, category, date } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requis' }, { status: 400 })
    }

    // Récupérer l'ancienne dépense pour ajuster le budget
    const oldExpense = await db.expense.findUnique({ where: { id } })
    
    if (!oldExpense) {
      return NextResponse.json({ success: false, error: 'Dépense non trouvée' }, { status: 404 })
    }

    const expense = await db.expense.update({
      where: { id },
      data: {
        description,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        date: date ? new Date(date) : undefined
      }
    })

    // Ajuster le budget du projet si le montant a changé
    if (amount !== undefined && amount !== oldExpense.amount) {
      const difference = parseFloat(amount) - oldExpense.amount
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression de la dépense' }, { status: 500 })
  }
}
