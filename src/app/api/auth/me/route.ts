import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Chercher la session
    const session = await db.session.findUnique({
      where: { token },
      include: { User: true }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session invalide' },
        { status: 401 }
      )
    }

    // Vérifier si la session a expiré
    if (session.expiresAt < new Date()) {
      // Supprimer la session expirée
      await db.session.delete({ where: { id: session.id } })
      return NextResponse.json(
        { success: false, error: 'Session expirée' },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur est actif
    if (!session.User.isActive) {
      return NextResponse.json(
        { success: false, error: 'Compte désactivé' },
        { status: 403 }
      )
    }

    // Utiliser uniquement les champs de base
    const user = session.User as {
      id: string
      email: string
      name: string | null
      role: string
      avatar: string | null
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'gestionnaire' | 'membre',
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
