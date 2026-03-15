import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/templates - Récupérer tous les modèles de projets
export async function GET() {
  try {
    const templates = await db.projectTemplate.findMany({
      include: {
        taskTemplates: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des modèles' }, { status: 500 })
  }
}

// POST /api/templates - Créer un nouveau modèle
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, icon, color, defaultBudget, taskTemplates } = body

    const template = await db.projectTemplate.create({
      data: {
        name,
        description,
        icon,
        color,
        defaultBudget: defaultBudget || 0,
        taskTemplates: taskTemplates ? {
          create: taskTemplates.map((tt: { title: string; description?: string; defaultPriority?: string; estimatedDays?: number; order?: number }, index: number) => ({
            title: tt.title,
            description: tt.description,
            defaultPriority: tt.defaultPriority || 'Moyenne',
            estimatedDays: tt.estimatedDays || 1,
            order: tt.order || index
          }))
        } : undefined
      },
      include: {
        taskTemplates: true
      }
    })

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création du modèle' }, { status: 500 })
  }
}
