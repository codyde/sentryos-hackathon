'use client'

import { TimelineItem } from './types'
import { CheckCircle, Clock, AlertCircle, Circle, FileText, DollarSign, Shield, Users, Wrench } from 'lucide-react'

interface BusinessTimelineProps {
  items: TimelineItem[]
  onToggleStatus?: (id: string) => void
}

export function BusinessTimeline({ items, onToggleStatus }: BusinessTimelineProps) {
  const getCategoryIcon = (category: TimelineItem['category']) => {
    switch (category) {
      case 'legal':
        return <FileText className="w-4 h-4" />
      case 'commercial':
        return <DollarSign className="w-4 h-4" />
      case 'security':
        return <Shield className="w-4 h-4" />
      case 'onboarding':
        return <Users className="w-4 h-4" />
      case 'technical':
        return <Wrench className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: TimelineItem['category']) => {
    switch (category) {
      case 'legal':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      case 'commercial':
        return 'text-green-400 bg-green-500/10 border-green-500/30'
      case 'security':
        return 'text-red-400 bg-red-500/10 border-red-500/30'
      case 'onboarding':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30'
      case 'technical':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    }
  }

  const getStatusIcon = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-[#7553ff]" />
      case 'blocked':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'pending':
        return <Circle className="w-5 h-5 text-[#9086a3]" />
    }
  }

  const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/50'
      case 'in-progress':
        return 'bg-[#7553ff]/20 border-[#7553ff]/50'
      case 'blocked':
        return 'bg-red-500/20 border-red-500/50'
      case 'pending':
        return 'bg-[#2a2438] border-[#362552]'
    }
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'TBD'
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getCategoryLabel = (category: TimelineItem['category']) => {
    switch (category) {
      case 'legal':
        return 'Legal'
      case 'commercial':
        return 'Commercial'
      case 'security':
        return 'Security'
      case 'onboarding':
        return 'Onboarding'
      case 'technical':
        return 'Technical'
    }
  }

  // Sort items by target date
  const sortedItems = [...items].sort((a, b) => {
    if (!a.targetDate) return 1
    if (!b.targetDate) return -1
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  })

  return (
    <div className="p-4 bg-[#1e1a2a] border-t border-[#362552]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#e8e4f0] mb-1">Business Process Timeline</h2>
        <p className="text-sm text-[#9086a3]">
          Track the commercial, legal, and security steps alongside your POC
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="relative">
        {/* Horizontal line connecting items */}
        <div className="absolute top-[52px] left-8 right-8 h-0.5 bg-[#362552]" />

        {/* Timeline Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {sortedItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Connector dot */}
              <div className="absolute top-[52px] left-1/2 -translate-x-1/2 z-10">
                {getStatusIcon(item.status)}
              </div>

              {/* Card */}
              <div
                className={`mt-20 rounded-lg border ${getStatusColor(item.status)} p-4 hover:border-[#7553ff]/50 transition-all cursor-pointer`}
                onClick={() => onToggleStatus?.(item.id)}
              >
                {/* Category Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded border ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <span className="text-xs font-medium text-[#9086a3] uppercase tracking-wide">
                    {getCategoryLabel(item.category)}
                  </span>
                </div>

                {/* Item Name */}
                <h3 className="text-sm font-semibold text-[#e8e4f0] mb-2 line-clamp-2">
                  {item.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#9086a3] mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* Owner */}
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-3 h-3 text-[#9086a3]" />
                  <span className="text-xs text-[#9086a3]">{item.owner}</span>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#9086a3]">Target:</span>
                    <span className="text-[#e8e4f0] ml-1">{formatDate(item.targetDate)}</span>
                  </div>
                  {item.status === 'completed' && item.completionDate && (
                    <div className="text-green-400">
                      ✓ {formatDate(item.completionDate)}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-3 pt-3 border-t border-[#362552]">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : item.status === 'in-progress'
                        ? 'bg-[#7553ff]/20 text-[#7553ff]'
                        : item.status === 'blocked'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-[#2a2438] text-[#9086a3]'
                    }`}
                  >
                    {item.status === 'completed' && '✓ '}
                    {item.status === 'blocked' && '⚠ '}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-[#362552]">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-[#9086a3]">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#7553ff]" />
            <span className="text-[#9086a3]">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-[#9086a3]">Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-[#9086a3]" />
            <span className="text-[#9086a3]">Pending</span>
          </div>
        </div>
      </div>
    </div>
  )
}
