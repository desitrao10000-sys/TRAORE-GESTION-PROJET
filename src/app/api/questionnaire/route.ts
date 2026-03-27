import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/questionnaire - Récupérer le questionnaire actif
export async function GET() {
  try {
    const questionnaire = await db.questionnaireTemplate.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    return NextResponse.json({ success: true, data: questionnaire })
  } catch (error) {
    console.error('Error fetching questionnaire:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération du questionnaire' }, { status: 500 })
  }
}

// POST /api/questionnaire/answers - Sauvegarder les réponses
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { answers, taskId } = body

    // Sauvegarder chaque réponse
    const savedAnswers = await Promise.all(
      answers.map((answer: { questionId: string; answer: string }) =>
        db.questionnaireAnswer.create({
          data: {
            questionId: answer.questionId,
            answer: answer.answer,
            taskId
          }
        })
      )
    )

    return NextResponse.json({ success: true, data: savedAnswers })
  } catch (error) {
    console.error('Error saving answers:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la sauvegarde des réponses' }, { status: 500 })
  }
}
