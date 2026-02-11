'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ReportPreferences, POCProject } from './types'

interface ReportPreferencesContextType {
  preferences: ReportPreferences
  projects: POCProject[]
  addEmail: (email: string) => void
  removeEmail: (email: string) => void
  updatePreferences: (updates: Partial<ReportPreferences>) => void
  clearPreferences: () => void
}

const ReportPreferencesContext = createContext<ReportPreferencesContextType | null>(null)

export function useReportPreferences() {
  const context = useContext(ReportPreferencesContext)
  if (!context) {
    throw new Error('useReportPreferences must be used within ReportPreferencesProvider')
  }
  return context
}

const DEFAULT_PREFERENCES: ReportPreferences = {
  emailAddresses: [],
  includeAllProjects: true,
  selectedProjectIds: [],
  enabled: false
}

export function ReportPreferencesProvider({
  children,
  projects
}: {
  children: ReactNode
  projects: POCProject[]
}) {
  const [preferences, setPreferences] = useState<ReportPreferences>(DEFAULT_PREFERENCES)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('poc-tracker-report-preferences')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setPreferences(parsed)
        Sentry.logger.info('Report preferences loaded', {
          email_count: parsed.emailAddresses?.length || 0
        })
      } catch (error) {
        console.error('Failed to load report preferences:', error)
        localStorage.removeItem('poc-tracker-report-preferences')
      }
    }
  }, [])

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('poc-tracker-report-preferences', JSON.stringify(preferences))
  }, [preferences])

  const addEmail = (email: string) => {
    if (!preferences.emailAddresses.includes(email)) {
      setPreferences(prev => ({
        ...prev,
        emailAddresses: [...prev.emailAddresses, email]
      }))
      Sentry.logger.info('Report email added', { email })
      Sentry.metrics.count('poc_tracker.report_email_added', 1)
    }
  }

  const removeEmail = (email: string) => {
    setPreferences(prev => ({
      ...prev,
      emailAddresses: prev.emailAddresses.filter(e => e !== email)
    }))
    Sentry.logger.info('Report email removed', { email })
    Sentry.metrics.count('poc_tracker.report_email_removed', 1)
  }

  const updatePreferences = (updates: Partial<ReportPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates
    }))
    Sentry.logger.info('Report preferences updated', { updates })
    Sentry.metrics.count('poc_tracker.report_preferences_updated', 1)
  }

  const clearPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES)
    localStorage.removeItem('poc-tracker-report-preferences')
    Sentry.logger.info('Report preferences cleared')
    Sentry.metrics.count('poc_tracker.report_preferences_cleared', 1)
  }

  return (
    <ReportPreferencesContext.Provider
      value={{
        preferences,
        projects,
        addEmail,
        removeEmail,
        updatePreferences,
        clearPreferences
      }}
    >
      {children}
    </ReportPreferencesContext.Provider>
  )
}
