import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const project = await db.project.findUnique({
      where: { id },
      include: {
        folder: true,
        tasks: {
          orderBy: { dueDate: 'asc' }
        },
        expenses: {
          orderBy: { date: 'desc' }
        },
        risks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    if (!project) {
      return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération du projet' }, { status: 500 })
  }
}
