import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value

    if (token) {
      // Supprimer la session de la base de données
      await db.session.deleteMany({
        where: { token }
      })
    }

    // Créer la réponse et supprimer le cookie
    const response = NextResponse.json({ success: true })
    response.cookies.delete('session_token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
