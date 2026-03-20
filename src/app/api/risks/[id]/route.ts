import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE /api/risks/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.risk.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Risque supprimé' })
  } catch (error) {
    console.error('Error deleting risk:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la suppression du risque' 
    }, { status: 500 })
  }
}

// PUT /api/risks/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const risk = await db.risk.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, data: risk })
  } catch (error) {
    console.error('Error updating risk:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la mise à jour du risque' 
    }, { status: 500 })
  }
}
