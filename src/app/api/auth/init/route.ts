import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Hash simple pour le mot de passe
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

export async function GET() {
  try {
    // Vérifier s'il existe déjà un gestionnaire
    const existingGestionnaire = await db.user.findFirst({
      where: { role: 'gestionnaire' }
    })

    if (existingGestionnaire) {
      return NextResponse.json({
        success: true,
        message: 'Un gestionnaire existe déjà',
        user: { email: existingGestionnaire.email, name: existingGestionnaire.name }
      })
    }

    // Créer le gestionnaire par défaut
    const defaultPassword = 'admin123'
    const hashedPassword = simpleHash(defaultPassword)

    // Créer avec uniquement les champs de base
    const gestionnaire = await db.user.create({
      data: {
        email: 'admin@traoreprojet.com',
        name: 'Gestionnaire Principal',
        password: hashedPassword,
        role: 'gestionnaire',
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Gestionnaire créé avec succès',
      user: { email: gestionnaire.email, name: gestionnaire.name },
      defaultPassword // À supprimer en production
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'initialisation' },
      { status: 500 }
    )
  }
}

// API pour créer un membre
export async function POST(request: Request) {
  try {
    const { email, name, password, position, department } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: 'Email, nom et mot de passe requis' },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    const hashedPassword = simpleHash(password)

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: 'membre',
        position,
        department,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
