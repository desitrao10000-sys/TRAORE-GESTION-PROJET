import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/delay-causes - Récupérer toutes les causes de retard
export async function GET() {
  try {
    const causes = await db.delayCause.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { usages: 'desc' },
        { name: 'asc' }
      ]
    })
    return NextResponse.json({ success: true, data: causes })
  } catch (error) {
    console.error('Error fetching delay causes:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des causes de retard' }, { status: 500 })
  }
}

// POST /api/delay-causes - Créer une nouvelle cause de retard
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, color, projectId } = body

    const cause = await db.delayCause.create({
      data: {
        name,
        description,
        color,
        projectId,
        isDefault: false
      }
    })

    return NextResponse.json({ success: true, data: cause })
  } catch (error) {
    console.error('Error creating delay cause:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création de la cause de retard' }, { status: 500 })
  }
}
