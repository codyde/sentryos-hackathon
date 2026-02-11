import { POCProject, POCStats, PhaseTask, ActionPlanItem, SuccessCriterion } from './types'

export function calculatePOCStats(project: POCProject): POCStats {
  const totalActionItems = project.actionPlan.length
  const completedActionItems = project.actionPlan.filter(item => item.status === 'completed').length

  const totalTasks = project.phases.reduce((sum, phase) => sum + phase.tasks.length, 0)
  const completedTasks = project.phases.reduce(
    (sum, phase) => sum + phase.tasks.filter(t => t.status === 'completed').length,
    0
  )

  const totalCriteria = project.successCriteria.length
  const completedCriteria = project.successCriteria.filter(c => c.status === 'completed').length

  const totalItems = totalActionItems + totalTasks + totalCriteria
  const completedItems = completedActionItems + completedTasks + completedCriteria
  const overallCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const now = new Date()
  const targetDate = new Date(project.targetCompletionDate)
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const startDate = new Date(project.startDate)
  const totalDuration = targetDate.getTime() - startDate.getTime()
  const elapsedDuration = now.getTime() - startDate.getTime()
  const expectedProgress = totalDuration > 0 ? (elapsedDuration / totalDuration) : 0
  const actualProgress = totalItems > 0 ? (completedItems / totalItems) : 0
  const onTrack = actualProgress >= expectedProgress * 0.9

  return {
    totalActionItems,
    completedActionItems,
    totalTasks,
    completedTasks,
    totalCriteria,
    completedCriteria,
    overallCompletion,
    daysRemaining,
    onTrack
  }
}

export function getStatusColor(status: 'completed' | 'in-progress' | 'not-started'): string {
  switch (status) {
    case 'completed': return 'text-green-400'
    case 'in-progress': return 'text-yellow-400'
    case 'not-started': return 'text-gray-400'
    default: return 'text-gray-400'
  }
}

export function getStatusBadgeColor(status: 'completed' | 'in-progress' | 'not-started'): string {
  switch (status) {
    case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'not-started': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return 'text-red-400'
    case 'medium': return 'text-yellow-400'
    case 'low': return 'text-blue-400'
    default: return 'text-gray-400'
  }
}

export function getPriorityBadgeColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export function getProjectStatusColor(status: POCProject['status']): string {
  switch (status) {
    case 'completed': return 'bg-green-500'
    case 'in-progress': return 'bg-blue-500'
    case 'blocked': return 'bg-red-500'
    case 'not-started': return 'bg-gray-500'
    default: return 'bg-gray-500'
  }
}

export function getProgressColor(percentage: number, onTrack: boolean): string {
  if (percentage === 100) return 'bg-green-500'
  if (!onTrack) return 'bg-red-500'
  if (percentage >= 50) return 'bg-blue-500'
  return 'bg-yellow-500'
}

export function formatDate(date?: Date): string {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function isOverdue(date?: Date): boolean {
  if (!date) return false
  return new Date(date) < new Date()
}
