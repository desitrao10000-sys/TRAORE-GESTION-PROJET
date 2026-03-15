import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST() {
  try {
    const timestamp = new Date().toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-').replace(/, /g, '_')

    // Check if there are changes to commit
    const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: '/home/z/my-project' })
    
    if (!statusOutput.trim()) {
      return NextResponse.json({ 
        success: true, 
        message: 'Aucune modification à sauvegarder',
        hasChanges: false
      })
    }

    // Add all changes
    await execAsync('git add -A', { cwd: '/home/z/my-project' })
    
    // Commit changes
    const commitMessage = `Sauvegarde auto: ${timestamp}`
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: '/home/z/my-project' })
    
    // Push to GitHub
    await execAsync('git push origin master', { cwd: '/home/z/my-project' })
    
    return NextResponse.json({ 
      success: true, 
      message: `Sauvegarde réussie: ${commitMessage}`,
      hasChanges: true,
      timestamp
    })
  } catch (error) {
    console.error('Backup error:', error)
    
    // Try to get more details about the error
    let errorMessage = 'Erreur lors de la sauvegarde'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Get last commit info
    const { stdout: lastCommit } = await execAsync('git log -1 --format="%h|%s|%ci"', { cwd: '/home/z/my-project' })
    const [hash, message, date] = lastCommit.trim().split('|')
    
    // Get status
    const { stdout: status } = await execAsync('git status --porcelain', { cwd: '/home/z/my-project' })
    const hasChanges = status.trim().length > 0
    
    return NextResponse.json({
      success: true,
      lastBackup: {
        hash,
        message,
        date
      },
      hasChanges,
      changesCount: status.trim().split('\n').filter(Boolean).length
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la vérification' 
    }, { status: 500 })
  }
}
