import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/comments - Récupérer les commentaires
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const taskId = searchParams.get('taskId')
    
    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (taskId) where.taskId = taskId
    
    const comments = await db.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des commentaires' }, { status: 500 })
  }
}

// POST /api/comments - Créer un commentaire
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, author, projectId, taskId } = body

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Le contenu du commentaire est requis' }, { status: 400 })
    }
    if (!author || !author.trim()) {
      return NextResponse.json({ success: false, error: 'L\'auteur est requis' }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: {
        content: content.trim(),
        authorName: author.trim(),
        projectId: projectId || null,
        taskId: taskId || null
      }
    })

    return NextResponse.json({ success: true, data: comment })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création du commentaire' }, { status: 500 })
  }
}

// DELETE /api/comments - Supprimer un commentaire
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID du commentaire requis' }, { status: 400 })
    }

    await db.comment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression du commentaire' }, { status: 500 })
  }
}
