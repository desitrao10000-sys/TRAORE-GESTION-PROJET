import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Créer une nouvelle instance pour éviter les problèmes de cache
const prisma = new PrismaClient()

// GET - Récupérer toutes les tâches personnelles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    
    if (status) {
      where.status = status
    }
    if (userId) {
      where.userId = userId
    }

    const todos = await prisma.personalTodo.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ success: true, data: todos })
  } catch (error) {
    console.error('Error fetching personal todos:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle tâche personnelle
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const todo = await prisma.personalTodo.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status || 'À faire',
        priority: data.priority || 'Moyenne',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        originalDueDate: data.dueDate ? new Date(data.dueDate) : null,
        userId: data.userId || null
      }
    })

    return NextResponse.json({ success: true, data: todo })
  } catch (error) {
    console.error('Error creating personal todo:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la tâche' },
      { status: 500 }
    )
  }
}
