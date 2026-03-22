'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, 
  AlertCircle, CheckCircle2, Clock, Loader2,
  MessageSquare, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  userId: string | null
  entityId: string | null
  entityType: string | null
  scheduledAt: Date | null
  sentAt: Date | null
  createdAt: Date
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void
}

export function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true, userId: 'all' })
      })
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Get type config
  const getTypeConfig = (type: string) => {
    const configs: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
      reminder: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20' },
      mention: { icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/20' },
      status_change: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
      daily_summary: { icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/20' },
      alert: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' }
    }
    return configs[type] || { icon: Bell, color: 'text-gray-400', bg: 'bg-gray-500/20' }
  }

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return format(new Date(date), 'd MMM', { locale: fr })
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-[#1e3a5f]/50 hover:bg-[#1e3a5f] transition-colors border border-blue-400/30"
      >
        {unreadCount > 0 ? (
          <Bell className="w-5 h-5 text-amber-400" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gradient-to-br from-[#1e3a5f] to-[#0f1c2e] rounded-xl border border-blue-400/30 shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-blue-400/20">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-300 hover:text-blue-200"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Tout marquer lu
                </Button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-blue-400/10">
                  {notifications.map(notification => {
                    const config = getTypeConfig(notification.type)
                    const Icon = config.icon

                    return (
                      <div
                        key={notification.id}
                        onClick={() => {
                          if (!notification.read) markAsRead(notification.id)
                          onNotificationClick?.(notification)
                        }}
                        className={`p-3 cursor-pointer hover:bg-blue-400/5 transition-colors ${
                          !notification.read ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm ${!notification.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-amber-400 rounded-full shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-blue-400/20 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-300 hover:text-blue-200 w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
