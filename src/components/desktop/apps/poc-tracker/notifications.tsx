'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

export type NotificationType = 'milestone' | 'warning' | 'success' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  projectId: string
  projectName: string
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  clearNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('poc-tracker-notifications')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const hydrated = parsed.map((n: Notification) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(hydrated)
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('poc-tracker-notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Log to Sentry
    Sentry.logger.info('Notification created', {
      type: notification.type,
      title: notification.title,
      project_id: notification.projectId
    })
    Sentry.metrics.count('poc_tracker.notification_created', 1, {
      attributes: { type: notification.type }
    })

    // Play sound or show browser notification (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/sentry-logo-glyph-light.svg'
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    Sentry.metrics.count('poc_tracker.notification_read', 1)
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    Sentry.metrics.count('poc_tracker.notifications_mark_all_read', 1)
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('poc-tracker-notifications')
    Sentry.metrics.count('poc_tracker.notifications_cleared_all', 1)
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    Sentry.metrics.count('poc_tracker.notification_cleared', 1)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        clearNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
