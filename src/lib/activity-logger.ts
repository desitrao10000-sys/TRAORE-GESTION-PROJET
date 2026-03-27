import { db } from './db'

export type ActionType = 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'completed' | 'commented'
export type EntityType = 'task' | 'project' | 'risk' | 'expense' | 'subtask'

interface LogActivityParams {
  action: ActionType
  entityType: EntityType
  entityId: string
  details?: {
    title?: string
    from?: string
    to?: string
    [key: string]: unknown
  }
  userId?: string
  userName?: string
  taskId?: string
}

export async function logActivity(params: LogActivityParams) {
  try {
    const entry = await db.activityHistory.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details ? JSON.stringify(params.details) : null,
        userId: params.userId,
        userName: params.userName,
        taskId: params.taskId
      }
    })
    return entry
  } catch (error) {
    console.error('Error logging activity:', error)
    return null
  }
}

// Helper functions for common actions
export const ActivityLogger = {
  taskCreated: (taskId: string, title: string, projectId: string, userName?: string) => 
    logActivity({
      action: 'created',
      entityType: 'task',
      entityId: taskId,
      taskId,
      details: { title, projectId },
      userName
    }),

  taskUpdated: (taskId: string, title: string, changes?: Record<string, unknown>, userName?: string) =>
    logActivity({
      action: 'updated',
      entityType: 'task',
      entityId: taskId,
      taskId,
      details: { title, ...changes },
      userName
    }),

  taskStatusChanged: (taskId: string, title: string, from: string, to: string, userName?: string) =>
    logActivity({
      action: 'status_changed',
      entityType: 'task',
      entityId: taskId,
      taskId,
      details: { title, from, to },
      userName
    }),

  taskCompleted: (taskId: string, title: string, userName?: string) =>
    logActivity({
      action: 'completed',
      entityType: 'task',
      entityId: taskId,
      taskId,
      details: { title },
      userName
    }),

  taskAssigned: (taskId: string, title: string, assignee: string, userName?: string) =>
    logActivity({
      action: 'assigned',
      entityType: 'task',
      entityId: taskId,
      taskId,
      details: { title, assignee },
      userName
    }),

  taskDeleted: (taskId: string, title: string, userName?: string) =>
    logActivity({
      action: 'deleted',
      entityType: 'task',
      entityId: taskId,
      taskId,
      details: { title },
      userName
    }),

  projectCreated: (projectId: string, name: string, userName?: string) =>
    logActivity({
      action: 'created',
      entityType: 'project',
      entityId: projectId,
      details: { title: name },
      userName
    }),

  projectUpdated: (projectId: string, name: string, changes?: Record<string, unknown>, userName?: string) =>
    logActivity({
      action: 'updated',
      entityType: 'project',
      entityId: projectId,
      details: { title: name, ...changes },
      userName
    }),

  projectStatusChanged: (projectId: string, name: string, from: string, to: string, userName?: string) =>
    logActivity({
      action: 'status_changed',
      entityType: 'project',
      entityId: projectId,
      details: { title: name, from, to },
      userName
    }),

  riskCreated: (riskId: string, title: string, projectId: string, userName?: string) =>
    logActivity({
      action: 'created',
      entityType: 'risk',
      entityId: riskId,
      details: { title, projectId },
      userName
    }),

  riskUpdated: (riskId: string, title: string, userName?: string) =>
    logActivity({
      action: 'updated',
      entityType: 'risk',
      entityId: riskId,
      details: { title },
      userName
    }),

  expenseCreated: (expenseId: string, description: string, amount: number, projectId: string, userName?: string) =>
    logActivity({
      action: 'created',
      entityType: 'expense',
      entityId: expenseId,
      details: { title: description, amount, projectId },
      userName
    }),

  commentAdded: (commentId: string, taskId: string, content: string, userName?: string) =>
    logActivity({
      action: 'commented',
      entityType: 'task',
      entityId: commentId,
      taskId,
      details: { title: content.substring(0, 50) },
      userName
    })
}
