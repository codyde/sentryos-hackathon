'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useReportPreferences } from './reportPreferences'
import { useNotifications } from './notifications'
import { generateReportData, downloadPDF } from './reportGenerator'
import { X, Download, Loader2 } from 'lucide-react'

interface ReportSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportSettingsDialog({ open, onOpenChange }: ReportSettingsDialogProps) {
  const { preferences, projects, addEmail, removeEmail, updatePreferences } = useReportPreferences()
  const { notifications } = useNotifications()
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleAddEmail = () => {
    setEmailError('')

    if (!emailInput.trim()) {
      setEmailError('Email address is required')
      return
    }

    if (!emailRegex.test(emailInput)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (preferences.emailAddresses.includes(emailInput)) {
      setEmailError('This email address is already added')
      return
    }

    addEmail(emailInput)
    setEmailInput('')
  }

  const handleRemoveEmail = (email: string) => {
    removeEmail(email)
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)

    try {
      // Generate report data
      const reportData = generateReportData(projects, notifications, preferences)

      // Log to Sentry
      Sentry.logger.info('Report generated', {
        total_projects: reportData.totalProjects,
        email_count: preferences.emailAddresses.length
      })
      Sentry.metrics.count('poc_tracker.report_generated', 1, {
        attributes: {
          project_count: reportData.totalProjects,
          email_count: preferences.emailAddresses.length
        }
      })

      // Download PDF
      downloadPDF(reportData)

      // Log download
      Sentry.logger.info('Report downloaded')
      Sentry.metrics.count('poc_tracker.report_downloaded', 1)

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to generate report:', error)
      Sentry.captureException(error)
      setEmailError('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEmail()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2a2438] border-[#362552] text-[#e8e4f0] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#e8e4f0]">Report Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Management Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[#e8e4f0] mb-2">Email Recipients</h3>
              <p className="text-xs text-[#9086a3] mb-3">
                Add email addresses to receive status reports
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-[#1e1a2a] border-[#362552] text-[#e8e4f0] placeholder:text-[#6b5f7c]"
                aria-invalid={!!emailError}
              />
              <button
                onClick={handleAddEmail}
                className="px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
              >
                Add Email
              </button>
            </div>

            {emailError && (
              <p className="text-xs text-red-400">{emailError}</p>
            )}

            {preferences.emailAddresses.length > 0 && (
              <div className="space-y-2 mt-3">
                {preferences.emailAddresses.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-3 py-2 bg-[#1e1a2a] border border-[#362552] rounded text-sm"
                  >
                    <span className="text-[#e8e4f0]">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-[#9086a3] hover:text-red-400 transition-colors"
                      title="Remove email"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Project Selection Section */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-[#e8e4f0] mb-2">Project Selection</h3>
              <p className="text-xs text-[#9086a3] mb-3">
                Choose which projects to include in the report
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="projectSelection"
                  checked={preferences.includeAllProjects}
                  onChange={() => updatePreferences({ includeAllProjects: true })}
                  className="w-4 h-4 text-[#7553ff] bg-[#1e1a2a] border-[#362552] focus:ring-[#7553ff]"
                />
                <span className="text-sm text-[#e8e4f0]">All Projects</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="projectSelection"
                  checked={!preferences.includeAllProjects}
                  onChange={() => updatePreferences({ includeAllProjects: false })}
                  className="w-4 h-4 text-[#7553ff] bg-[#1e1a2a] border-[#362552] focus:ring-[#7553ff]"
                />
                <span className="text-sm text-[#e8e4f0]">Select Specific Projects</span>
              </label>
            </div>

            {!preferences.includeAllProjects && (
              <div className="mt-3 space-y-2 pl-6 max-h-48 overflow-y-auto">
                {projects.map((project) => (
                  <label key={project.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.selectedProjectIds.includes(project.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...preferences.selectedProjectIds, project.id]
                          : preferences.selectedProjectIds.filter(id => id !== project.id)
                        updatePreferences({ selectedProjectIds: newIds })
                      }}
                      className="w-4 h-4 text-[#7553ff] bg-[#1e1a2a] border-[#362552] rounded focus:ring-[#7553ff]"
                    />
                    <span className="text-sm text-[#e8e4f0]">
                      {project.customerName} - {project.projectName}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-[#1e1a2a] hover:bg-[#362552] text-[#e8e4f0] text-sm rounded transition-colors"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || (preferences.selectedProjectIds.length === 0 && !preferences.includeAllProjects)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate & Download Report
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
