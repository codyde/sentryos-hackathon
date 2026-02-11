import jsPDF from 'jspdf'
import {
  POCProject,
  ReportData,
  ProjectReportData,
  ReportDeadline,
  ReportPreferences
} from './types'
import { calculatePOCStats } from './utils'
import { Notification } from './notifications'

/**
 * Generate comprehensive report data from projects and notifications
 */
export function generateReportData(
  projects: POCProject[],
  notifications: Notification[],
  preferences: ReportPreferences
): ReportData {
  // Filter projects based on preferences
  const selectedProjects = preferences.includeAllProjects
    ? projects
    : projects.filter(p => preferences.selectedProjectIds.includes(p.id))

  // Calculate executive summary statistics
  const totalProjects = selectedProjects.length
  let totalCompletion = 0
  let projectsOnTrack = 0
  let projectsBehind = 0

  const projectReports: ProjectReportData[] = selectedProjects.map(project => {
    const stats = calculatePOCStats(project)
    totalCompletion += stats.overallCompletion

    if (stats.onTrack) {
      projectsOnTrack++
    } else {
      projectsBehind++
    }

    return {
      id: project.id,
      customerName: project.customerName,
      projectName: project.projectName,
      stats,
      upcomingDeadlines: getUpcomingDeadlines(project, 7),
      recentActivity: getRecentActivity(notifications, project.id)
    }
  })

  const overallCompletion = totalProjects > 0
    ? Math.round(totalCompletion / totalProjects)
    : 0

  return {
    generatedAt: new Date(),
    totalProjects,
    overallCompletion,
    projectsOnTrack,
    projectsBehind,
    projects: projectReports
  }
}

/**
 * Get upcoming deadlines for a project within the specified number of days
 */
export function getUpcomingDeadlines(
  project: POCProject,
  days: number
): ReportDeadline[] {
  const deadlines: ReportDeadline[] = []
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  // Check action plan items
  project.actionPlan.forEach(item => {
    if (item.dueDate && item.status !== 'completed') {
      const dueDate = new Date(item.dueDate)
      if (dueDate >= now && dueDate <= futureDate) {
        deadlines.push({
          itemName: item.milestone,
          dueDate,
          owner: item.owner,
          type: 'action-item'
        })
      }
    }
  })

  // Check phase tasks
  project.phases.forEach(phase => {
    phase.tasks.forEach(task => {
      if (task.targetDate && task.status !== 'completed') {
        const dueDate = new Date(task.targetDate)
        if (dueDate >= now && dueDate <= futureDate) {
          deadlines.push({
            itemName: `${phase.name}: ${task.task}`,
            dueDate,
            owner: task.owner,
            type: 'phase-task'
          })
        }
      }
    })
  })

  // Sort by date ascending
  return deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}

/**
 * Get recent activity for a project from notifications
 */
export function getRecentActivity(
  notifications: Notification[],
  projectId: string
): string[] {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  return notifications
    .filter(n => n.projectId === projectId)
    .filter(n => new Date(n.timestamp) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10) // Limit to 10 most recent
    .map(n => {
      const date = new Date(n.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      return `${date}: ${n.title}`
    })
}

/**
 * Generate a PDF report from report data
 */
export function generatePDF(reportData: ReportData): Blob {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Helper to add a section header
  const addSectionHeader = (text: string) => {
    checkNewPage(15)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(text, margin, yPos)
    yPos += 10
  }

  // Helper to add body text
  const addBodyText = (text: string, indent = 0) => {
    checkNewPage(8)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(text, contentWidth - indent)
    doc.text(lines, margin + indent, yPos)
    yPos += lines.length * 6
  }

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('POC Tracker Status Report', margin, yPos)
  yPos += 12

  // Date
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const dateStr = reportData.generatedAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  doc.text(`Generated: ${dateStr}`, margin, yPos)
  yPos += 15

  // Executive Summary
  addSectionHeader('Executive Summary')
  addBodyText(`Total Projects: ${reportData.totalProjects}`)
  addBodyText(`Overall Completion: ${reportData.overallCompletion}%`)
  addBodyText(`Projects On Track: ${reportData.projectsOnTrack}`)
  addBodyText(`Projects Behind: ${reportData.projectsBehind}`)
  yPos += 10

  // Project Details
  reportData.projects.forEach((project, index) => {
    checkNewPage(40)

    // Project header
    addSectionHeader(`${index + 1}. ${project.customerName} - ${project.projectName}`)

    // Stats
    addBodyText(`Completion: ${project.stats.overallCompletion}%`)
    addBodyText(`Days Remaining: ${project.stats.daysRemaining}`)
    addBodyText(`Status: ${project.stats.onTrack ? 'On Track' : 'Behind Schedule'}`)
    addBodyText(
      `Action Items: ${project.stats.completedActionItems}/${project.stats.totalActionItems} completed`
    )
    addBodyText(
      `Phase Tasks: ${project.stats.completedTasks}/${project.stats.totalTasks} completed`
    )
    addBodyText(
      `Success Criteria: ${project.stats.completedCriteria}/${project.stats.totalCriteria} completed`
    )
    yPos += 5

    // Upcoming Deadlines
    if (project.upcomingDeadlines.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      checkNewPage(8)
      doc.text('Upcoming Deadlines (Next 7 Days):', margin, yPos)
      yPos += 6

      project.upcomingDeadlines.forEach(deadline => {
        const dateStr = deadline.dueDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
        addBodyText(`• ${dateStr}: ${deadline.itemName} (${deadline.owner})`, 5)
      })
      yPos += 3
    }

    // Recent Activity
    if (project.recentActivity.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      checkNewPage(8)
      doc.text('Recent Activity (Last 7 Days):', margin, yPos)
      yPos += 6

      project.recentActivity.forEach(activity => {
        addBodyText(`• ${activity}`, 5)
      })
      yPos += 3
    }

    yPos += 5
  })

  // Footer on last page
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Generated by POC Tracker',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  // Generate filename with date
  const filename = `poc-report-${reportData.generatedAt.toISOString().split('T')[0]}.pdf`

  // Return blob for download
  return doc.output('blob')
}

/**
 * Download a PDF report
 */
export function downloadPDF(reportData: ReportData) {
  const blob = generatePDF(reportData)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `poc-report-${reportData.generatedAt.toISOString().split('T')[0]}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
