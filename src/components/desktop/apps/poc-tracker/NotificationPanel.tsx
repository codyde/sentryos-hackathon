'use client'

import { useState, useRef, useEffect } from 'react'
import { useNotifications, Notification, NotificationType } from './notifications'
import { Bell, CheckCheck, Trash2, X, CheckCircle, AlertTriangle, Info, TrendingUp } from 'lucide-react'

export function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, clearNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'milestone':
        return <TrendingUp className="w-4 h-4 text-[#7553ff]" />
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  const getNotificationBg = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 'milestone':
        return 'bg-[#7553ff]/10 border-[#7553ff]/30'
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/30'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#362552] rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-[#9086a3] hover:text-[#e8e4f0]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-[#ff45a8] text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-[#2a2438] border border-[#362552] rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#362552]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#7553ff]" />
              <h3 className="font-semibold text-[#e8e4f0]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-[#9086a3]">
                  ({unreadCount} unread)
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[#362552] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[#9086a3]" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#362552] bg-[#1e1a2a]">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-[#7553ff] hover:text-[#8c6fff] transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Bell className="w-12 h-12 text-[#362552] mb-3" />
                <p className="text-sm text-[#9086a3]">No notifications yet</p>
                <p className="text-xs text-[#9086a3] mt-1">
                  You'll be notified when milestones are completed
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#362552]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 cursor-pointer transition-colors ${
                      notification.read ? 'hover:bg-[#1e1a2a]/50' : 'bg-[#7553ff]/5 hover:bg-[#7553ff]/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${getNotificationBg(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-sm font-medium ${notification.read ? 'text-[#9086a3]' : 'text-[#e8e4f0]'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              clearNotification(notification.id)
                            }}
                            className="p-1 hover:bg-[#362552] rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-[#9086a3]" />
                          </button>
                        </div>
                        <p className="text-xs text-[#9086a3] mb-1">{notification.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[#9086a3]">{notification.projectName}</span>
                          <span className="text-[#362552]">•</span>
                          <span className="text-xs text-[#9086a3]">{formatTimestamp(notification.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
