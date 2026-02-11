'use client'

import { POCProject } from './types'
import { calculatePOCStats, getProjectStatusColor, getProgressColor } from './utils'
import { CompanyLogo } from './CompanyLogo'
import { ArrowRight, Calendar, Users, CheckCircle, AlertTriangle } from 'lucide-react'

interface POCProjectCardProps {
  project: POCProject
  onClick: () => void
}

export function POCProjectCard({ project, onClick }: POCProjectCardProps) {
  const stats = calculatePOCStats(project)

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div
      onClick={onClick}
      className="bg-[#2a2438] rounded-lg border border-[#362552] p-4 hover:border-[#7553ff] transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <CompanyLogo
            companyName={project.customerName}
            size="medium"
            className="flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-[#e8e4f0] group-hover:text-[#7553ff] transition-colors">
                {project.customerName}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded ${getProjectStatusColor(project.status)} text-white`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-[#9086a3]">{project.projectName}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-[#9086a3] group-hover:text-[#7553ff] group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-[#9086a3]">Overall Progress</span>
          <span className="text-sm font-semibold text-[#e8e4f0]">{stats.overallCompletion}%</span>
        </div>
        <div className="w-full bg-[#1e1a2a] rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(stats.overallCompletion, stats.onTrack)}`}
            style={{ width: `${stats.overallCompletion}%` }}
          />
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="text-[#9086a3]">
            {stats.completedActionItems + stats.completedTasks + stats.completedCriteria} / {stats.totalActionItems + stats.totalTasks + stats.totalCriteria} items
          </span>
          {!stats.onTrack && stats.daysRemaining > 0 && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Behind schedule
            </span>
          )}
          {stats.onTrack && stats.daysRemaining > 0 && (
            <span className="text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              On track
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b border-[#362552]">
        <div className="bg-[#1e1a2a] rounded p-2">
          <div className="text-[#9086a3] text-xs mb-1">Action Items</div>
          <p className="text-sm font-semibold text-[#e8e4f0]">
            {stats.completedActionItems}/{stats.totalActionItems}
          </p>
        </div>
        <div className="bg-[#1e1a2a] rounded p-2">
          <div className="text-[#9086a3] text-xs mb-1">Phase Tasks</div>
          <p className="text-sm font-semibold text-[#e8e4f0]">
            {stats.completedTasks}/{stats.totalTasks}
          </p>
        </div>
        <div className="bg-[#1e1a2a] rounded p-2">
          <div className="text-[#9086a3] text-xs mb-1">Success Criteria</div>
          <p className="text-sm font-semibold text-[#e8e4f0]">
            {stats.completedCriteria}/{stats.totalCriteria}
          </p>
        </div>
      </div>

      {/* Dates and Contacts */}
      <div className="text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-[#9086a3]">
          <Calendar className="w-3.5 h-3.5" />
          <span>Target: {formatDate(project.targetCompletionDate)}</span>
          <span className={`ml-auto font-medium ${stats.daysRemaining < 7 ? 'text-red-400' : 'text-[#e8e4f0]'}`}>
            {stats.daysRemaining > 0 ? `${stats.daysRemaining} days left` : 'Overdue'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#9086a3]">
          <Users className="w-3.5 h-3.5" />
          <span>{project.sentryContact} & {project.customerContact}</span>
        </div>
      </div>
    </div>
  )
}
