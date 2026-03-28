#!/usr/bin/env bun
/**
 * Script de sauvegarde automatique pour TRAORE GESTION PROJET
 * Ce script sauvegarde la base de données et les fichiers importants
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs'
import { join, basename } from 'path'

const PROJECT_ROOT = '/home/z/my-project'
const DB_PATH = join(PROJECT_ROOT, 'db/custom.db')
const BACKUP_DIR = join(PROJECT_ROOT, 'backups')
const MAX_BACKUPS = 10 // Garder les 10 dernières sauvegardes

function formatDate(): string {
  const now = new Date()
  return now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function ensureBackupDir(): void {
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }
}

function backupDatabase(): string | null {
  try {
    if (!existsSync(DB_PATH)) {
      console.log('❌ Base de données non trouvée:', DB_PATH)
      return null
    }

    ensureBackupDir()
    const timestamp = formatDate()
    const backupPath = join(BACKUP_DIR, `database-${timestamp}.db`)
    
    copyFileSync(DB_PATH, backupPath)
    console.log('✅ Base de données sauvegardée:', backupPath)
    
    return backupPath
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
    return null
  }
}

function cleanOldBackups(): void {
  try {
    const files = execSync(`ls -t ${BACKUP_DIR}/database-*.db 2>/dev/null || true`, { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(f => f.length > 0)

    if (files.length > MAX_BACKUPS) {
      const toDelete = files.slice(MAX_BACKUPS)
      toDelete.forEach(file => {
        execSync(`rm -f "${file}"`)
        console.log('🗑️ Ancienne sauvegarde supprimée:', basename(file))
      })
    }
  } catch (error) {
    // Ignore errors during cleanup
  }
}

function saveToGit(): void {
  try {
    const timestamp = new Date().toLocaleString('fr-FR')
    
    execSync(`cd ${PROJECT_ROOT} && git add -A`, { encoding: 'utf-8' })
    
    // Check if there's anything to commit
    const status = execSync(`cd ${PROJECT_ROOT} && git status --porcelain`, { encoding: 'utf-8' })
    if (status.trim().length > 0) {
      execSync(`cd ${PROJECT_ROOT} && git commit -m "Sauvegarde auto: ${timestamp}"`, { encoding: 'utf-8' })
      console.log('✅ Changements commités dans Git')
    }
  } catch (error) {
    // Ignore errors during git operations
  }
}

function main(): void {
  console.log('\n🔄 === SAUVEGARDE AUTOMATIQUE ===')
  console.log(`📅 ${new Date().toLocaleString('fr-FR')}\n`)

  // 1. Sauvegarder la base de données
  backupDatabase()

  // 2. Nettoyer les anciennes sauvegardes
  cleanOldBackups()

  // 3. Sauvegarder dans Git (si configuré)
  saveToGit()

  console.log('\n✅ Sauvegarde terminée!\n')
}

// Exécuter la sauvegarde
main()
