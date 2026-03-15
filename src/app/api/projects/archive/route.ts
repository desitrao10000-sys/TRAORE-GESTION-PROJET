import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/projects/archive - Archiver un projet
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId } = body

    const project = await db.project.update({
      where: { id: projectId },
      data: {
        isArchived: true,
        status: 'Archivé'
      }
    })

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error archiving project:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de l\'archivage du projet' }, { status: 500 })
  }
}

// PUT /api/projects/archive - Désarchiver un projet
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { projectId } = body

    const project = await db.project.update({
      where: { id: projectId },
      data: {
        isArchived: false,
        status: 'En cours'
      }
    })

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error unarchiving project:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors du désarchivage du projet' }, { status: 500 })
  }
}
