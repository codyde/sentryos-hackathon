'use client'

import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { POCProject } from './types'
import { POCProjectList } from './POCProjectList'
import { POCProjectDetail } from './POCProjectDetail'
import { getAllMockProjects } from './mockProjects'
import { AuthProvider, useAuth } from './auth'
import { LoginScreen } from './LoginScreen'
import { NotificationProvider } from './notifications'
import { ReportPreferencesProvider } from './reportPreferences'

function POCTrackerContent() {
  const { user, isLoading: authLoading } = useAuth()
  const [projects, setProjects] = useState<POCProject[]>([])
  const [selectedProject, setSelectedProject] = useState<POCProject | null>(null)

  // Load and filter projects based on authenticated user
  useEffect(() => {
    if (!user) return

    Sentry.logger.info('POC Tracker loaded for user', { user_email: user.email })
    Sentry.metrics.count('poc_tracker.page_load', 1)

    // Load all mock POC projects
    const allProjects = getAllMockProjects()

    // Filter projects where the user is the Sentry contact
    const userProjects = allProjects.filter(
      project => project.sentryContact.toLowerCase() === user.name.toLowerCase() ||
                 project.sentryContact.toLowerCase().includes(user.email.split('@')[0])
    )

    setProjects(userProjects)

    Sentry.logger.info('Loaded POC projects for user', {
      total_projects: allProjects.length,
      user_projects: userProjects.length,
      user_email: user.email
    })
  }, [user])

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1e1a2a]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#7553ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#9086a3]">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />
  }

  const handleSelectProject = (project: POCProject) => {
    Sentry.logger.info('Selected POC project', {
      project_id: project.id,
      customer: project.customerName,
      user_email: user.email
    })
    Sentry.metrics.count('poc_tracker.project_opened', 1)
    setSelectedProject(project)
  }

  const handleBackToList = () => {
    Sentry.logger.info('Returned to project list')
    Sentry.metrics.count('poc_tracker.back_to_list', 1)
    setSelectedProject(null)
  }

  const handleUpdateProject = (updatedProject: POCProject) => {
    setProjects(projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    ))
    setSelectedProject(updatedProject)
  }

  // Wrap content with ReportPreferencesProvider to provide projects context
  return (
    <ReportPreferencesProvider projects={projects}>
      {selectedProject ? (
        <POCProjectDetail
          project={selectedProject}
          onBack={handleBackToList}
          onUpdate={handleUpdateProject}
        />
      ) : (
        <POCProjectList
          projects={projects}
          onSelectProject={handleSelectProject}
        />
      )}
    </ReportPreferencesProvider>
  )
}

export function POCTracker() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <POCTrackerContent />
      </NotificationProvider>
    </AuthProvider>
  )
}
