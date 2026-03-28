import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Lister tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const sessionToken = request.cookies.get('session_token')?.value
    
    console.log('GET /api/users - sessionToken:', sessionToken ? 'present' : 'missing')
    
    if (!sessionToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Non autorisé - Veuillez vous connecter' 
      }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { User: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session expirée - Veuillez vous reconnecter' 
      }, { status: 401 })
    }

    const userRole = session.User.role?.toLowerCase()
    console.log('GET /api/users - user role:', session.User.role, '(normalized:', userRole, ')')
    
    // Accepter plusieurs rôles d'administrateur
    const adminRoles = ['gestionnaire', 'admin', 'administrateur', 'chef de projet']
    if (!adminRoles.includes(userRole)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Accès refusé - Vous devez être gestionnaire ou admin' 
      }, { status: 403 })
    }

    // Récupérer tous les utilisateurs
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        position: true,
        department: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`GET /api/users - Found ${users.length} users`)

    return NextResponse.json({
      success: true,
      users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur serveur' 
    }, { status: 500 })
  }
}
