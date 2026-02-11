'use client'

import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { POCProject } from './types'
import { calculatePOCStats, getProgressColor } from './utils'
import { CompanyLogo } from './CompanyLogo'
import { useAuth } from './auth'
import { NotificationPanel } from './NotificationPanel'
import { ReportSettingsDialog } from './ReportSettingsDialog'
import { useNotifications } from './notifications'
import { MutualActionPlan } from './MutualActionPlan'
import { POCByPhase } from './POCByPhase'
import { SuccessCriteria } from './SuccessCriteria'
import { BusinessTimeline } from './BusinessTimeline'
import { ArrowLeft, ListTodo, Layers, Target, LogOut, User, Settings } from 'lucide-react'

type TabType = 'action-plan' | 'phases' | 'success-criteria'

interface POCProjectDetailProps {
  project: POCProject
  onBack: () => void
  onUpdate: (project: POCProject) => void
}

export function POCProjectDetail({ project, onBack, onUpdate }: POCProjectDetailProps) {
  const { user, logout } = useAuth()
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState<TabType>('action-plan')
  const [reportSettingsOpen, setReportSettingsOpen] = useState(false)

  // Check for approaching deadlines and send warning notifications
  useEffect(() => {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Check action plan items with approaching deadlines
    project.actionPlan.forEach(item => {
      if (item.status !== 'completed' && item.dueDate) {
        const dueDate = new Date(item.dueDate)
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Create warning if due within 3 days and not already overdue
        if (daysUntilDue > 0 && daysUntilDue <= 3) {
          const warningKey = `warning-${project.id}-${item.id}-${daysUntilDue}`
          const hasShownWarning = localStorage.getItem(warningKey)

          if (!hasShownWarning) {
            addNotification({
              type: 'warning',
              title: '⚠️ Deadline Approaching',
              message: `"${item.action}" is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
              projectId: project.id,
              projectName: project.customerName
            })
            localStorage.setItem(warningKey, 'true')
          }
        }

        // Create urgent warning if overdue
        if (daysUntilDue < 0) {
          const overdueKey = `overdue-${project.id}-${item.id}`
          const hasShownOverdue = localStorage.getItem(overdueKey)

          if (!hasShownOverdue) {
            addNotification({
              type: 'warning',
              title: '🚨 Item Overdue',
              message: `"${item.action}" is ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''} overdue`,
              projectId: project.id,
              projectName: project.customerName
            })
            localStorage.setItem(overdueKey, 'true')
          }
        }
      }
    })
  }, [project, addNotification])

  const handleToggleActionItem = (id: string) => {
    const oldStats = calculatePOCStats(project)
    const item = project.actionPlan.find(i => i.id === id)

    const updatedProject = {
      ...project,
      actionPlan: project.actionPlan.map(item => {
        if (item.id === id) {
          const newStatus = item.status === 'completed' ? 'in-progress' : 'completed'
          Sentry.logger.info('Action item toggled', { item_id: id, status: newStatus })
          Sentry.metrics.count('poc_tracker.action_item_toggled', 1, {
            attributes: { completed: (newStatus === 'completed').toString() }
          })
          return { ...item, status: newStatus }
        }
        return item
      })
    }

    const newStats = calculatePOCStats(updatedProject)

    // Create notification when action item is completed
    if (item && item.status !== 'completed') {
      addNotification({
        type: item.milestone ? 'milestone' : 'success',
        title: item.milestone ? '🎯 Milestone Completed!' : '✓ Action Item Completed',
        message: `"${item.action}" has been marked as complete`,
        projectId: project.id,
        projectName: project.customerName
      })
    }

    // Check for overall progress milestones
    const oldCompletion = oldStats.overallCompletion
    const newCompletion = newStats.overallCompletion
    const milestones = [25, 50, 75, 100]

    for (const milestone of milestones) {
      if (oldCompletion < milestone && newCompletion >= milestone) {
        addNotification({
          type: milestone === 100 ? 'success' : 'milestone',
          title: milestone === 100 ? '🎉 POC Complete!' : `🎯 ${milestone}% Complete!`,
          message: milestone === 100
            ? `Congratulations! ${project.customerName} POC is now complete!`
            : `Great progress! ${project.customerName} POC is now ${milestone}% complete`,
          projectId: project.id,
          projectName: project.customerName
        })
      }
    }

    onUpdate(updatedProject)
  }

  const handleTogglePhaseTask = (phaseId: string, taskId: string) => {
    const oldStats = calculatePOCStats(project)
    const phase = project.phases.find(p => p.id === phaseId)
    const task = phase?.tasks.find(t => t.id === taskId)

    const updatedProject = {
      ...project,
      phases: project.phases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            tasks: phase.tasks.map(task => {
              if (task.id === taskId) {
                const newStatus = task.status === 'completed' ? 'in-progress' : 'completed'
                Sentry.logger.info('Phase task toggled', { phase_id: phaseId, task_id: taskId, status: newStatus })
                Sentry.metrics.count('poc_tracker.phase_task_toggled', 1, {
                  attributes: { completed: (newStatus === 'completed').toString() }
                })
                return { ...task, status: newStatus }
              }
              return task
            })
          }
        }
        return phase
      })
    }

    const newStats = calculatePOCStats(updatedProject)

    // Create notification when task is completed
    if (task && task.status !== 'completed' && phase) {
      addNotification({
        type: 'success',
        title: '✓ Task Completed',
        message: `"${task.description}" in ${phase.name} has been completed`,
        projectId: project.id,
        projectName: project.customerName
      })

      // Check if entire phase is now complete
      const updatedPhase = updatedProject.phases.find(p => p.id === phaseId)
      if (updatedPhase && updatedPhase.tasks.every(t => t.status === 'completed')) {
        addNotification({
          type: 'milestone',
          title: '🎯 Phase Complete!',
          message: `${phase.name} is now 100% complete!`,
          projectId: project.id,
          projectName: project.customerName
        })
      }
    }

    // Check for overall progress milestones
    const oldCompletion = oldStats.overallCompletion
    const newCompletion = newStats.overallCompletion
    const milestones = [25, 50, 75, 100]

    for (const milestone of milestones) {
      if (oldCompletion < milestone && newCompletion >= milestone) {
        addNotification({
          type: milestone === 100 ? 'success' : 'milestone',
          title: milestone === 100 ? '🎉 POC Complete!' : `🎯 ${milestone}% Complete!`,
          message: milestone === 100
            ? `Congratulations! ${project.customerName} POC is now complete!`
            : `Great progress! ${project.customerName} POC is now ${milestone}% complete`,
          projectId: project.id,
          projectName: project.customerName
        })
      }
    }

    onUpdate(updatedProject)
  }

  const handleToggleCriterion = (id: string) => {
    const oldStats = calculatePOCStats(project)
    const criterion = project.successCriteria.find(c => c.id === id)

    const updatedProject = {
      ...project,
      successCriteria: project.successCriteria.map(criterion => {
        if (criterion.id === id) {
          const newStatus = criterion.status === 'completed' ? 'in-progress' : 'completed'
          Sentry.logger.info('Success criterion toggled', { criterion_id: id, status: newStatus })
          Sentry.metrics.count('poc_tracker.success_criterion_toggled', 1, {
            attributes: { completed: (newStatus === 'completed').toString() }
          })
          return { ...criterion, status: newStatus }
        }
        return criterion
      })
    }

    const newStats = calculatePOCStats(updatedProject)

    // Create notification when criterion is completed
    if (criterion && criterion.status !== 'completed') {
      addNotification({
        type: 'success',
        title: '✓ Success Criterion Met',
        message: `"${criterion.criterion}" has been validated`,
        projectId: project.id,
        projectName: project.customerName
      })
    }

    // Check for overall progress milestones
    const oldCompletion = oldStats.overallCompletion
    const newCompletion = newStats.overallCompletion
    const milestones = [25, 50, 75, 100]

    for (const milestone of milestones) {
      if (oldCompletion < milestone && newCompletion >= milestone) {
        addNotification({
          type: milestone === 100 ? 'success' : 'milestone',
          title: milestone === 100 ? '🎉 POC Complete!' : `🎯 ${milestone}% Complete!`,
          message: milestone === 100
            ? `Congratulations! ${project.customerName} POC is now complete!`
            : `Great progress! ${project.customerName} POC is now ${milestone}% complete`,
          projectId: project.id,
          projectName: project.customerName
        })
      }
    }

    onUpdate(updatedProject)
  }

  const handleToggleTimelineItem = (id: string) => {
    const item = project.timeline.find(i => i.id === id)
    if (!item) return

    const updatedProject = {
      ...project,
      timeline: project.timeline.map(item => {
        if (item.id === id) {
          let newStatus: typeof item.status

          // Cycle through statuses: pending -> in-progress -> completed -> pending
          if (item.status === 'pending') {
            newStatus = 'in-progress'
          } else if (item.status === 'in-progress') {
            newStatus = 'completed'
          } else {
            newStatus = 'pending'
          }

          Sentry.logger.info('Timeline item status changed', {
            item_id: id,
            item_name: item.name,
            old_status: item.status,
            new_status: newStatus
          })
          Sentry.metrics.count('poc_tracker.timeline_item_toggled', 1, {
            attributes: { status: newStatus, category: item.category }
          })

          return {
            ...item,
            status: newStatus,
            completionDate: newStatus === 'completed' ? new Date() : undefined
          }
        }
        return item
      })
    }

    // Create notification for completed timeline items
    if (item.status !== 'completed') {
      const newItem = updatedProject.timeline.find(i => i.id === id)
      if (newItem?.status === 'completed') {
        addNotification({
          type: item.category === 'legal' || item.category === 'commercial' ? 'milestone' : 'success',
          title: '✓ Timeline Milestone Complete',
          message: `"${item.name}" has been completed`,
          projectId: project.id,
          projectName: project.customerName
        })
      }
    }

    onUpdate(updatedProject)
  }

  const stats = calculatePOCStats(project)

  return (
    <div className="h-full flex flex-col bg-[#1e1a2a]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#362552] bg-[#2a2438]">
        {/* Back Button and Title */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-2 py-1 text-sm text-[#9086a3] hover:text-[#7553ff] hover:bg-[#1e1a2a] rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          <div className="h-4 w-px bg-[#362552]" />
          <CompanyLogo
            companyName={project.customerName}
            size="small"
          />
          <div className="h-4 w-px bg-[#362552]" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-[#e8e4f0]">{project.customerName}</h1>
            <p className="text-sm text-[#9086a3]">{project.projectName}</p>
          </div>

          {/* Report Settings */}
          <button
            onClick={() => setReportSettingsOpen(true)}
            className="flex items-center justify-center w-8 h-8 hover:bg-[#1e1a2a] text-[#9086a3] hover:text-[#e8e4f0] rounded transition-colors"
            title="Report Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <NotificationPanel />

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1a2a] rounded-lg">
              <div className="w-6 h-6 rounded-full bg-[#7553ff]/20 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#7553ff]" />
                )}
              </div>
              <span className="text-sm text-[#e8e4f0]">{user.name}</span>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#1e1a2a] text-[#9086a3] hover:text-[#e8e4f0] text-sm rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#362552]" />

          <div className="text-right">
            <div className="text-2xl font-bold text-[#e8e4f0]">{stats.overallCompletion}%</div>
            <div className={`text-xs ${stats.onTrack ? 'text-green-400' : 'text-red-400'}`}>
              {stats.onTrack ? '✓ On Track' : '⚠ Behind Schedule'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1e1a2a] rounded-full h-2 mb-2">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(stats.overallCompletion, stats.onTrack)}`}
            style={{ width: `${stats.overallCompletion}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Action Plan</div>
            <div className="text-[#e8e4f0] font-semibold">
              {stats.completedActionItems}/{stats.totalActionItems}
            </div>
          </div>
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Phase Tasks</div>
            <div className="text-[#e8e4f0] font-semibold">
              {stats.completedTasks}/{stats.totalTasks}
            </div>
          </div>
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Success Criteria</div>
            <div className="text-[#e8e4f0] font-semibold">
              {stats.completedCriteria}/{stats.totalCriteria}
            </div>
          </div>
          <div className="bg-[#1e1a2a] rounded px-2 py-1">
            <div className="text-[#9086a3]">Days Left</div>
            <div className={`font-semibold ${stats.daysRemaining < 7 ? 'text-red-400' : 'text-[#e8e4f0]'}`}>
              {stats.daysRemaining > 0 ? stats.daysRemaining : 'Overdue'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#362552] bg-[#2a2438]">
        <button
          onClick={() => {
            setActiveTab('action-plan')
            Sentry.logger.info('Switched to Action Plan tab')
            Sentry.metrics.count('poc_tracker.tab_switched', 1, { attributes: { tab: 'action-plan' } })
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'action-plan'
              ? 'text-[#7553ff] border-[#7553ff]'
              : 'text-[#9086a3] border-transparent hover:text-[#e8e4f0]'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Mutual Action Plan
          <span className="text-xs bg-[#1e1a2a] px-1.5 py-0.5 rounded">
            {stats.completedActionItems}/{stats.totalActionItems}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('phases')
            Sentry.logger.info('Switched to Phases tab')
            Sentry.metrics.count('poc_tracker.tab_switched', 1, { attributes: { tab: 'phases' } })
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'phases'
              ? 'text-[#7553ff] border-[#7553ff]'
              : 'text-[#9086a3] border-transparent hover:text-[#e8e4f0]'
          }`}
        >
          <Layers className="w-4 h-4" />
          POC by Phase
          <span className="text-xs bg-[#1e1a2a] px-1.5 py-0.5 rounded">
            {stats.completedTasks}/{stats.totalTasks}
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab('success-criteria')
            Sentry.logger.info('Switched to Success Criteria tab')
            Sentry.metrics.count('poc_tracker.tab_switched', 1, { attributes: { tab: 'success-criteria' } })
          }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'success-criteria'
              ? 'text-[#7553ff] border-[#7553ff]'
              : 'text-[#9086a3] border-transparent hover:text-[#e8e4f0]'
          }`}
        >
          <Target className="w-4 h-4" />
          Success Criteria
          <span className="text-xs bg-[#1e1a2a] px-1.5 py-0.5 rounded">
            {stats.completedCriteria}/{stats.totalCriteria}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex flex-col">
          <div className="flex-shrink-0">
            {activeTab === 'action-plan' && (
              <MutualActionPlan
                items={project.actionPlan}
                onToggleStatus={handleToggleActionItem}
              />
            )}
            {activeTab === 'phases' && (
              <POCByPhase
                phases={project.phases}
                onToggleTask={handleTogglePhaseTask}
              />
            )}
            {activeTab === 'success-criteria' && (
              <SuccessCriteria
                criteria={project.successCriteria}
                onToggleStatus={handleToggleCriterion}
              />
            )}
          </div>

          {/* Business Timeline - Always visible below tabs */}
          <div className="flex-shrink-0">
            <BusinessTimeline
              items={project.timeline}
              onToggleStatus={handleToggleTimelineItem}
            />
          </div>
        </div>
      </div>

      {/* Report Settings Dialog */}
      <ReportSettingsDialog
        open={reportSettingsOpen}
        onOpenChange={setReportSettingsOpen}
      />
    </div>
  )
}
