import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Récupérer le profil utilisateur
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

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

    return NextResponse.json({ success: true, data: session.User })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour le profil utilisateur
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('session_token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      )
    }

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

    const data = await request.json()

    const user = await db.user.update({
      where: { id: session.userId },
      data: {
        name: data.name,
        phone: data.phone,
        position: data.position,
        department: data.department,
        bio: data.bio,
        skills: data.skills ? JSON.stringify(data.skills) : null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        position: user.position,
        department: user.department,
        bio: user.bio,
        skills: user.skills ? JSON.parse(user.skills) : []
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
