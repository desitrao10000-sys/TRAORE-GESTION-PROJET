import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/tasks/timer/start - Démarrer le timer
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { taskId } = body

    // Vérifier si la tâche existe
    const task = await db.task.findUnique({ where: { id: taskId } })
    if (!task) {
      return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 })
    }

    // Si un timer est déjà en cours sur cette tâche, l'arrêter d'abord
    if (task.timerRunning) {
      const lastSession = await db.timerSession.findFirst({
        where: { taskId, stoppedAt: null },
        orderBy: { startedAt: 'desc' }
      })

      if (lastSession) {
        const now = new Date()
        const duration = Math.floor((now.getTime() - new Date(lastSession.startedAt).getTime()) / 1000)
        
        await db.timerSession.update({
          where: { id: lastSession.id },
          data: {
            stoppedAt: now,
            duration
          }
        })
      }
    }

    // Démarrer un nouveau timer
    const session = await db.timerSession.create({
      data: {
        taskId,
        startedAt: new Date()
      }
    })

    // Mettre à jour la tâche
    await db.task.update({
      where: { id: taskId },
      data: {
        timerRunning: true,
        timerStartedAt: new Date(),
        status: task.status === 'À faire' ? 'En cours' : task.status,
        startedAt: task.startedAt || new Date()
      }
    })

    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error('Error starting timer:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors du démarrage du timer' }, { status: 500 })
  }
}

// PUT /api/tasks/timer/stop - Arrêter le timer
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { taskId } = body

    const task = await db.task.findUnique({ where: { id: taskId } })
    if (!task) {
      return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 })
    }

    // Trouver la session en cours
    const lastSession = await db.timerSession.findFirst({
      where: { taskId, stoppedAt: null },
      orderBy: { startedAt: 'desc' }
    })

    if (!lastSession) {
      return NextResponse.json({ success: false, error: 'Aucun timer en cours' }, { status: 400 })
    }

    const now = new Date()
    const duration = Math.floor((now.getTime() - new Date(lastSession.startedAt).getTime()) / 1000)

    // Mettre à jour la session
    const session = await db.timerSession.update({
      where: { id: lastSession.id },
      data: {
        stoppedAt: now,
        duration
      }
    })

    // Calculer le temps total
    const totalSeconds = await db.timerSession.aggregate({
      where: { taskId },
      _sum: { duration: true }
    })

    const totalMinutes = Math.floor((totalSeconds._sum.duration || 0) / 60)

    // Mettre à jour la tâche
    await db.task.update({
      where: { id: taskId },
      data: {
        timerRunning: false,
        actualTime: totalMinutes
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        session,
        totalDuration: totalSeconds._sum.duration || 0,
        totalMinutes
      }
    })
  } catch (error) {
    console.error('Error stopping timer:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de l\'arrêt du timer' }, { status: 500 })
  }
}
