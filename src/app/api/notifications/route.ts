import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notifications - Récupérer les notifications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    
    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (unreadOnly) where.read = false
    
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des notifications' }, { status: 500 })
  }
}

// PUT /api/notifications - Marquer comme lu
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, markAllRead, userId } = body

    if (markAllRead && userId) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      })
      return NextResponse.json({ success: true, message: 'Toutes les notifications marquées comme lues' })
    }

    if (id) {
      const notification = await db.notification.update({
        where: { id },
        data: { read: true }
      })
      return NextResponse.json({ success: true, data: notification })
    }

    return NextResponse.json({ success: false, error: 'ID ou userId requis' }, { status: 400 })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour de la notification' }, { status: 500 })
  }
}
