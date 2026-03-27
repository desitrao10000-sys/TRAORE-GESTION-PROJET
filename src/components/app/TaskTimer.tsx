'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Timer, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface TaskTimerProps {
  taskId: string
  timerRunning: boolean
  timerStartedAt: Date | null
  actualTime: number // in minutes
  estimatedTime?: number // in minutes
  onTimerUpdate?: () => void
  compact?: boolean
}

export function TaskTimer({ 
  taskId, 
  timerRunning, 
  timerStartedAt, 
  actualTime, 
  estimatedTime,
  onTimerUpdate,
  compact = false 
}: TaskTimerProps) {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(timerRunning)
  const [startedAt, setStartedAt] = useState(timerStartedAt ? new Date(timerStartedAt) : null)
  const [currentSeconds, setCurrentSeconds] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(actualTime)
  const [loading, setLoading] = useState(false)

  // Update timer display every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && startedAt) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000)
        setCurrentSeconds(elapsed)
      }, 1000)
    } else {
      setCurrentSeconds(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startedAt])

  // Sync with props
  useEffect(() => {
    setIsRunning(timerRunning)
    setStartedAt(timerStartedAt ? new Date(timerStartedAt) : null)
    setTotalMinutes(actualTime)
  }, [timerRunning, timerStartedAt, actualTime])

  // Format time for display
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Calculate total time including current session
  const getTotalSeconds = (): number => {
    return (totalMinutes * 60) + currentSeconds
  }

  // Get progress percentage
  const getProgressPercentage = (): number => {
    if (!estimatedTime || estimatedTime === 0) return 0
    const totalSeconds = getTotalSeconds()
    const estimatedSeconds = estimatedTime * 60
    return Math.min(100, (totalSeconds / estimatedSeconds) * 100)
  }

  // Start timer
  const startTimer = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action: 'start' })
      })

      const data = await response.json()

      if (data.success) {
        setIsRunning(true)
        setStartedAt(new Date(data.data.timerStartedAt))
        toast({
          title: '⏱️ Chronomètre démarré',
          description: 'Le chronomètre a été lancé'
        })
        onTimerUpdate?.()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Impossible de démarrer le chronomètre',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Stop timer
  const stopTimer = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action: 'stop' })
      })

      const data = await response.json()

      if (data.success) {
        setIsRunning(false)
        setStartedAt(null)
        setCurrentSeconds(0)
        setTotalMinutes(data.data.newActualTime)
        toast({
          title: '⏹️ Chronomètre arrêté',
          description: `Temps ajouté: ${data.data.additionalMinutes} minutes`
        })
        onTimerUpdate?.()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'arrêter le chronomètre',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Toggle timer
  const toggleTimer = () => {
    if (isRunning) {
      stopTimer()
    } else {
      startTimer()
    }
  }

  // Compact version for task cards
  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleTimer()
        }}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
          isRunning 
            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
            : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-3 h-3" />
            <span>{formatTime(getTotalSeconds())}</span>
          </>
        ) : (
          <>
            <Play className="w-3 h-3" />
            {totalMinutes > 0 && <span>{totalMinutes}min</span>}
          </>
        )}
      </button>
    )
  }

  // Full version
  return (
    <div className="bg-[#0f1c2e] border border-blue-400/30 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">Chronomètre</span>
        </div>
        {estimatedTime && estimatedTime > 0 && (
          <span className="text-blue-300 text-sm">
            Estimé: {estimatedTime} min
          </span>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center">
        <div className={`text-4xl font-mono font-bold ${isRunning ? 'text-green-400' : 'text-white'}`}>
          {formatTime(getTotalSeconds())}
        </div>
        {isRunning && (
          <div className="text-sm text-green-300 mt-1 animate-pulse">
            ● En cours
          </div>
        )}
      </div>

      {/* Progress bar */}
      {estimatedTime && estimatedTime > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                getProgressPercentage() > 100 
                  ? 'bg-red-500' 
                  : getProgressPercentage() > 75 
                    ? 'bg-amber-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, getProgressPercentage())}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-300">
            <span>{Math.floor(getTotalSeconds() / 60)} min</span>
            <span>{estimatedTime} min estimées</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-2">
        <Button
          onClick={toggleTimer}
          disabled={loading}
          className={`${
            isRunning 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {loading ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Arrêter
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Démarrer
            </>
          )}
        </Button>
      </div>

      {/* Time summary */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-blue-500/10 rounded p-2 text-center">
          <div className="text-blue-300">Temps total</div>
          <div className="text-white font-bold">{totalMinutes} min</div>
        </div>
        <div className="bg-blue-500/10 rounded p-2 text-center">
          <div className="text-blue-300">Session actuelle</div>
          <div className="text-white font-bold">{Math.floor(currentSeconds / 60)} min</div>
        </div>
      </div>
    </div>
  )
}
