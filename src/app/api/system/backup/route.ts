import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, basename } from 'path'
import { db } from '@/lib/db'

const PROJECT_ROOT = '/home/z/my-project'
const DB_PATH = join(PROJECT_ROOT, 'db/custom.db')
const BACKUP_DIR = join(PROJECT_ROOT, 'backups')
const MAX_BACKUPS = 10

function formatDate(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function ensureBackupDir(): void {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }
}

async function backupDatabase(): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    if (!existsSync(DB_PATH)) {
      return { success: false, error: 'Base de données non trouvée' }
    }

    ensureBackupDir()
    const timestamp = formatDate()
    const backupPath = join(BACKUP_DIR, `database-${timestamp}.db`)
    
    copyFileSync(DB_PATH, backupPath)
    
    return { success: true, path: backupPath }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

function cleanOldBackups(): void {
  try {
    const files = readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('database-') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: join(BACKUP_DIR, f),
        time: statSync(join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time)

    if (files.length > MAX_BACKUPS) {
      files.slice(MAX_BACKUPS).forEach(file => {
        try {
          unlinkSync(file.path)
        } catch (e) {
          // Ignore
        }
      })
    }
  } catch (error) {
    // Ignore
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification via cookie
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier la session
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { User: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est gestionnaire
    if (session.User.role !== 'gestionnaire') {
      return NextResponse.json({ error: 'Accès refusé - Gestionnaire uniquement' }, { status: 403 })
    }

    // Effectuer la sauvegarde
    const result = await backupDatabase()
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Nettoyer les anciennes sauvegardes
    cleanOldBackups()

    // Sauvegarder sur Git si possible
    try {
      execSync(`cd ${PROJECT_ROOT} && git add -A`, { encoding: 'utf-8' })
      const status = execSync(`cd ${PROJECT_ROOT} && git status --porcelain`, { encoding: 'utf-8' })
      if (status.trim().length > 0) {
        const timestamp = new Date().toLocaleString('fr-FR')
        execSync(`cd ${PROJECT_ROOT} && git commit -m "Sauvegarde auto: ${timestamp}"`, { encoding: 'utf-8' })
      }
    } catch (e) {
      // Ignore Git errors
    }

    return NextResponse.json({
      success: true,
      message: 'Sauvegarde effectuée avec succès',
      backupPath: result.path,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { User: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    if (session.User.role !== 'gestionnaire') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Lister les sauvegardes disponibles
    const backups: { name: string; size: number; date: Date }[] = []
    
    if (existsSync(BACKUP_DIR)) {
      const files = readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('database-') && f.endsWith('.db'))
      
      for (const file of files) {
        const filePath = join(BACKUP_DIR, file)
        const stats = statSync(filePath)
        backups.push({
          name: file,
          size: stats.size,
          date: stats.mtime
        })
      }
    }

    // Statistiques de la base de données
    const projectCount = await db.project.count()
    const taskCount = await db.task.count()
    const userCount = await db.user.count()
    const sessionCount = await db.session.count()

    return NextResponse.json({
      database: {
        path: DB_PATH,
        exists: existsSync(DB_PATH)
      },
      stats: {
        projects: projectCount,
        tasks: taskCount,
        users: userCount,
        activeSessions: sessionCount
      },
      backups: backups.sort((a, b) => b.date.getTime() - a.date.getTime())
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des informations' }, { status: 500 })
  }
}
