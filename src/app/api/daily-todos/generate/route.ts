import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { addDays } from 'date-fns'

// POST /api/daily-todos/generate - Générer les todos depuis les tâches
export async function POST() {
  try {
    const today = new Date()
    const nextWeek = addDays(today, 14) // Look ahead 2 weeks
    
    // Get all active tasks
    const tasks = await db.task.findMany({
      where: {
        status: { notIn: ['Validé', 'Annulé'] }
      },
      include: {
        Project: true
      }
    })
    
    let created = 0
    
    for (const task of tasks) {
      // Check if todo already exists for this task
      const existing = await db.dailyTodo.findFirst({
        where: {
          taskId: task.id,
          status: { not: 'Validé' }
        }
      })
      
      if (!existing) {
        // Get associated risks for this project
        const risks = await db.risk.findMany({
          where: {
            projectId: task.projectId,
            status: { notIn: ['Résolu', 'Accepté'] }
          },
          take: 1,
          orderBy: { riskScore: 'desc' }
        })
        
        // Map task status to todo status
        const todoStatus = task.status === 'En cours' ? 'En cours' : 'À faire'
        
        await db.dailyTodo.create({
          data: {
            date: task.dueDate || today,
            projectId: task.projectId,
            projectName: task.Project?.name || 'Sans projet',
            taskId: task.id,
            taskTitle: task.title,
            taskDescription: task.description,
            status: todoStatus,
            deadline: task.dueDate,
            responsibleName: task.assigneeName,
            constraints: task.constraints,
            solution: task.solutionProposed,
            riskId: risks[0]?.id,
            riskTitle: risks[0]?.title,
            riskSeverity: risks[0]?.severity
          }
        })
        created++
      }
    }
    
    return NextResponse.json({ success: true, data: { created } })
  } catch (error) {
    console.error('Error generating todos:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la génération des todos' }, { status: 500 })
  }
}
