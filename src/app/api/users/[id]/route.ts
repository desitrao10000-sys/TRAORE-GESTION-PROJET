import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Récupérer le profil d'un utilisateur par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier l'authentification
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé' 
      }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { User: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session expirée' 
      }, { status: 401 })
    }

    // Récupérer l'utilisateur demandé
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        position: true,
        department: true,
        bio: true,
        skills: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier l'authentification
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé' 
      }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { User: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session expirée' 
      }, { status: 401 })
    }

    const userRole = session.User.role?.toLowerCase()
    const adminRoles = ['gestionnaire', 'admin', 'administrateur']
    
    // Seul le gestionnaire peut supprimer des utilisateurs
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Accès refusé - Seul un gestionnaire peut supprimer des membres' 
      }, { status: 403 })
    }

    // Vérifier que l'utilisateur à supprimer existe
    const userToDelete = await db.user.findUnique({
      where: { id }
    })

    if (!userToDelete) {
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 })
    }

    // Empêcher la suppression du gestionnaire ou admin
    const protectedRoles = ['gestionnaire', 'admin', 'administrateur']
    if (protectedRoles.includes(userToDelete.role?.toLowerCase())) {
      return NextResponse.json({ 
        success: false,
        error: 'Impossible de supprimer un gestionnaire ou un admin' 
      }, { status: 400 })
    }

    // Supprimer les sessions de l'utilisateur
    await db.session.deleteMany({
      where: { userId: id }
    })

    // Supprimer l'utilisateur
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}
