import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Récupérer tous les projets avec leurs tâches
    const projects = await db.project.findMany({
      include: {
        tasks: true,
        folder: true
      }
    })
    
    // Calculer les statistiques
    const activeProjects = projects.filter(p => p.status === 'Actif' || p.status === 'En cours').length
    
    const allTasks = projects.flatMap(p => p.tasks)
    const tasksInProgress = allTasks.filter(t => t.status === 'En cours').length
    const tasksLate = allTasks.filter(t => t.status === 'En retard').length
    const tasksCompleted = allTasks.filter(t => t.status === 'Validé').length
    
    const totalBudget = projects.reduce((sum, p) => sum + p.budgetPlanned, 0)
    const totalSpent = projects.reduce((sum, p) => sum + p.budgetSpent, 0)
    const remainingBudget = totalBudget - totalSpent
    
    return NextResponse.json({
      success: true,
      data: {
        activeProjects,
        tasksInProgress,
        tasksLate,
        tasksCompleted,
        totalBudget,
        totalSpent,
        remainingBudget,
        projects,
        tasks: allTasks
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des statistiques' }, { status: 500 })
  }
}
