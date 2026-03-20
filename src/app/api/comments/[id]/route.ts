import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE /api/comments/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.comment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Commentaire supprimé' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la suppression du commentaire' 
    }, { status: 500 })
  }
}
