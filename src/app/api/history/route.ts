import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/history - Récupérer l'historique
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const taskId = searchParams.get('taskId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const where: Record<string, unknown> = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    if (taskId) where.taskId = taskId
    
    const history = await db.activityHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    
    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération de l\'historique' }, { status: 500 })
  }
}

// POST /api/history - Ajouter une entrée d'historique
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, entityType, entityId, details, userId, userName, taskId } = body

    const entry = await db.activityHistory.create({
      data: {
        action,
        entityType,
        entityId,
        details,
        userId,
        userName,
        taskId
      }
    })

    return NextResponse.json({ success: true, data: entry })
  } catch (error) {
    console.error('Error creating history entry:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création de l\'entrée d\'historique' }, { status: 500 })
  }
}
