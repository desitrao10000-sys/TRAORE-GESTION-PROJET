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

// PUT - Mettre à jour le profil utilisateur (le sien ou celui d'un membre pour le gestionnaire)
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
    const currentRole = session.User.role?.toLowerCase()
    const isManager = ['gestionnaire', 'admin', 'administrateur'].includes(currentRole)
    
    // Déterminer quel utilisateur modifier
    // Si targetUserId est fourni et que l'utilisateur est gestionnaire, modifier ce membre
    // Sinon, modifier son propre profil
    const targetUserId = data.targetUserId || session.userId
    
    // Vérifier les permissions
    if (targetUserId !== session.userId && !isManager) {
      return NextResponse.json(
        { success: false, error: 'Seul un gestionnaire peut modifier le profil d\'un autre utilisateur' },
        { status: 403 }
      )
    }

    const user = await db.user.update({
      where: { id: targetUserId },
      data: {
        name: data.name,
        phone: data.phone,
        position: data.position,
        department: data.department,
        bio: data.bio,
        skills: data.skills ? JSON.stringify(data.skills) : null,
        experience: data.experience ? JSON.stringify(data.experience) : null,
        education: data.education ? JSON.stringify(data.education) : null,
        certifications: data.certifications ? JSON.stringify(data.certifications) : null,
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
        skills: user.skills ? JSON.parse(user.skills) : [],
        experience: user.experience ? JSON.parse(user.experience) : [],
        education: user.education ? JSON.parse(user.education) : [],
        certifications: user.certifications ? JSON.parse(user.certifications) : [],
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
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
