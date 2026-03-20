import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const PROJECT_ROOT = '/home/z/my-project'
const DB_PATH = join(PROJECT_ROOT, 'db/custom.db')
const BACKUP_DIR = join(PROJECT_ROOT, 'backups')

// Cette API vérifie l'état du système et effectue une sauvegarde au démarrage
export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    
    // Vérifier que la base de données existe
    const dbExists = existsSync(DB_PATH)
    
    // Statistiques de la base de données
    let stats = {
      projects: 0,
      tasks: 0,
      users: 0,
      sessions: 0,
      dailyTodos: 0,
      personalTodos: 0,
      risks: 0,
      expenses: 0
    }
    
    if (dbExists) {
      try {
        stats = {
          projects: await db.project.count(),
          tasks: await db.task.count(),
          users: await db.user.count(),
          sessions: await db.session.count(),
          dailyTodos: await db.dailyTodo.count(),
          personalTodos: await db.personalTodo.count(),
          risks: await db.risk.count(),
          expenses: await db.expense.count()
        }
      } catch (e) {
        // Ignore count errors
      }
    }
    
    // Créer une sauvegarde de démarrage
    let startupBackupCreated = false
    let backupPath = null
    
    if (dbExists) {
      try {
        if (!existsSync(BACKUP_DIR)) {
          mkdirSync(BACKUP_DIR, { recursive: true })
        }
        
        const backupName = `startup-${timestamp.replace(/[:.]/g, '-')}.db`
        backupPath = join(BACKUP_DIR, backupName)
        copyFileSync(DB_PATH, backupPath)
        startupBackupCreated = true
      } catch (e) {
        console.error('Erreur sauvegarde démarrage:', e)
      }
    }
    
    // Lister les sauvegardes disponibles
    const backups: { name: string; size: number; date: string }[] = []
    if (existsSync(BACKUP_DIR)) {
      const files = readdirSync(BACKUP_DIR).filter(f => f.endsWith('.db'))
      for (const file of files) {
        const filePath = join(BACKUP_DIR, file)
        const fileStats = statSync(filePath)
        backups.push({
          name: file,
          size: fileStats.size,
          date: fileStats.mtime.toISOString()
        })
      }
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp,
      database: {
        path: DB_PATH,
        exists: dbExists,
        persistent: true // SQLite est toujours persistent
      },
      stats,
      startupBackup: {
        created: startupBackupCreated,
        path: backupPath
      },
      backups: backups.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
      message: 'Système prêt - Toutes les données sont persistantes'
    })
  } catch (error) {
    console.error('Erreur status:', error)
    return NextResponse.json({
      status: 'error',
      error: String(error)
    }, { status: 500 })
  }
}
