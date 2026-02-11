// Mutual Action Plan types
export interface ActionPlanItem {
  id: string
  dueDate?: Date
  milestone: string
  owner: string
  status: 'completed' | 'in-progress' | 'not-started'
  notes?: string
}

// POC by Phase types
export interface PhaseTask {
  id: string
  task: string
  resources: string
  owner: string
  targetDate?: Date
  status: 'completed' | 'in-progress' | 'not-started'
  notes: string
}

export interface Phase {
  id: string
  name: string
  tasks: PhaseTask[]
}

// Success Criteria types
export interface SuccessCriterion {
  id: string
  criteria: string
  validation: string
  category: string
  priority: 'high' | 'medium' | 'low'
  currentState: string
  status: 'completed' | 'in-progress' | 'not-started'
  notes: string
}

// Business Timeline types
export interface TimelineItem {
  id: string
  name: string
  category: 'legal' | 'commercial' | 'security' | 'onboarding' | 'technical'
  status: 'completed' | 'in-progress' | 'pending' | 'blocked'
  startDate?: Date
  targetDate?: Date
  completionDate?: Date
  owner: string
  description: string
  dependencies?: string[]
  notes?: string
}

// Main POC Project
export interface POCProject {
  id: string
  customerName: string
  projectName: string
  logoUrl?: string
  startDate: Date
  targetCompletionDate: Date
  sentryContact: string
  customerContact: string
  sentryTeam: Array<{ name: string; role: string }>
  customerTeam: Array<{ name: string; role: string }>
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  actionPlan: ActionPlanItem[]
  phases: Phase[]
  successCriteria: SuccessCriterion[]
  timeline: TimelineItem[]
  notes?: string
}

export interface POCStats {
  totalActionItems: number
  completedActionItems: number
  totalTasks: number
  completedTasks: number
  totalCriteria: number
  completedCriteria: number
  overallCompletion: number
  daysRemaining: number
  onTrack: boolean
}

// Status Report types
export interface ReportPreferences {
  emailAddresses: string[]
  includeAllProjects: boolean
  selectedProjectIds: string[]
  enabled: boolean
}

export interface ReportDeadline {
  itemName: string
  dueDate: Date
  owner: string
  type: 'action-item' | 'phase-task'
}

export interface ProjectReportData {
  id: string
  customerName: string
  projectName: string
  stats: POCStats
  upcomingDeadlines: ReportDeadline[]
  recentActivity: string[]
}

export interface ReportData {
  generatedAt: Date
  totalProjects: number
  overallCompletion: number
  projectsOnTrack: number
  projectsBehind: number
  projects: ProjectReportData[]
}
