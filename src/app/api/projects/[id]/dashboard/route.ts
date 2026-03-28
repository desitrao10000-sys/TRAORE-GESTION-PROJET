import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/projects/[id]/dashboard - Dashboard spécifique au projet
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Récupérer les statistiques du projet
    const tasks = await db.task.findMany({
      where: { projectId: id },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        assigneeName: true,
        actualTime: true,
        estimatedTime: true
      }
    })

    const expenses = await db.expense.findMany({
      where: { projectId: id }
    })

    const risks = await db.risk.findMany({
      where: { projectId: id }
    })

    const project = await db.project.findUnique({
      where: { id },
      include: { Folder: true }
    })

    // Calculs
    const tasksByStatus = {
      todo: tasks.filter(t => t.status === 'À faire').length,
      inProgress: tasks.filter(t => t.status === 'En cours').length,
      late: tasks.filter(t => t.status === 'En retard').length,
      completed: tasks.filter(t => t.status === 'Validé').length
    }

    const tasksByPriority = {
      urgent: tasks.filter(t => t.priority === 'Urgente').length,
      high: tasks.filter(t => t.priority === 'Haute').length,
      medium: tasks.filter(t => t.priority === 'Moyenne').length,
      low: tasks.filter(t => t.priority === 'Basse').length
    }

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const budgetPercent = project?.budgetPlanned ? (totalExpenses / project.budgetPlanned) * 100 : 0

    const risksBySeverity = {
      critical: risks.filter(r => r.severity === 'Critique').length,
      high: risks.filter(r => r.severity === 'Haute').length,
      medium: risks.filter(r => r.severity === 'Moyenne').length,
      low: risks.filter(r => r.severity === 'Basse').length
    }

    const activeRisks = risks.filter(r => r.status !== 'Résolu' && r.status !== 'Accepté').length

    // Mettre à jour le dashboard
    await db.projectDashboard.upsert({
      where: { projectId: id },
      update: {
        tasksTotal: tasks.length,
        tasksCompleted: tasksByStatus.completed,
        tasksInProgress: tasksByStatus.inProgress,
        tasksLate: tasksByStatus.late,
        tasksToDo: tasksByStatus.todo,
        risksTotal: risks.length,
        risksCritical: risksBySeverity.critical,
        budgetUsedPercent: budgetPercent,
        lastUpdated: new Date()
      },
      create: {
        projectId: id,
        tasksTotal: tasks.length,
        tasksCompleted: tasksByStatus.completed,
        tasksInProgress: tasksByStatus.inProgress,
        tasksLate: tasksByStatus.late,
        tasksToDo: tasksByStatus.todo,
        risksTotal: risks.length,
        risksCritical: risksBySeverity.critical,
        budgetUsedPercent: budgetPercent
      }
    })

    const dashboard = {
      project,
      tasks: {
        total: tasks.length,
        byStatus: tasksByStatus,
        byPriority: tasksByPriority,
        list: tasks
      },
      expenses: {
        total: totalExpenses,
        budget: project?.budgetPlanned || 0,
        percent: budgetPercent,
        remaining: (project?.budgetPlanned || 0) - totalExpenses,
        list: expenses
      },
      risks: {
        total: risks.length,
        active: activeRisks,
        bySeverity: risksBySeverity,
        list: risks
      }
    }

    return NextResponse.json({ success: true, data: dashboard })
  } catch (error) {
    console.error('Error fetching project dashboard:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération du dashboard' }, { status: 500 })
  }
}
