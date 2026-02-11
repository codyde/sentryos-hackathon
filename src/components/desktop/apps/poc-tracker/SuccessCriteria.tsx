'use client'

import { SuccessCriterion } from './types'
import { getPriorityBadgeColor, getStatusBadgeColor } from './utils'
import { CheckCircle2, Circle, Info } from 'lucide-react'
import { useState } from 'react'

interface SuccessCriteriaProps {
  criteria: SuccessCriterion[]
  onToggleStatus: (id: string) => void
}

export function SuccessCriteria({ criteria, onToggleStatus }: SuccessCriteriaProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  const groupedCriteria = criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = []
    }
    acc[criterion.category].push(criterion)
    return acc
  }, {} as Record<string, SuccessCriterion[]>)

  return (
    <div className="p-4 space-y-4">
      {Object.entries(groupedCriteria).map(([category, items]) => (
        <div key={category} className="bg-[#2a2438] rounded-lg border border-[#362552] overflow-hidden">
          {/* Category Header */}
          <div className="px-4 py-3 bg-[#1e1a2a] border-b border-[#362552]">
            <h3 className="text-lg font-semibold text-[#e8e4f0]">{category}</h3>
            <p className="text-xs text-[#9086a3] mt-1">
              {items.filter(c => c.status === 'completed').length} of {items.length} completed
            </p>
          </div>

          {/* Criteria Table */}
          <div className="divide-y divide-[#362552]">
            {items.map((criterion) => (
              <div key={criterion.id}>
                {/* Main Row */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-[#1e1a2a]/30 transition-colors items-start">
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center pt-1">
                    <button
                      onClick={() => onToggleStatus(criterion.id)}
                      className="hover:scale-110 transition-transform"
                    >
                      {criterion.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#9086a3] hover:text-[#7553ff]" />
                      )}
                    </button>
                  </div>

                  {/* Criteria */}
                  <div className="col-span-6">
                    <p className={`text-sm ${criterion.status === 'completed' ? 'line-through text-[#9086a3]' : 'text-[#e8e4f0]'}`}>
                      {criterion.criteria}
                    </p>
                    {criterion.validation && (
                      <button
                        onClick={() => toggleRow(criterion.id)}
                        className="mt-2 flex items-center gap-1.5 text-xs text-[#7553ff] hover:text-[#8c6fff] transition-colors"
                      >
                        <Info className="w-3 h-3" />
                        {expandedRow === criterion.id ? 'Hide validation' : 'Show validation'}
                      </button>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="col-span-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getPriorityBadgeColor(criterion.priority)}`}>
                      {criterion.priority.charAt(0).toUpperCase() + criterion.priority.slice(1)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeColor(criterion.status)}`}>
                      {criterion.status === 'not-started' ? 'Not Started' : criterion.status === 'in-progress' ? 'In Progress' : 'Completed'}
                    </span>
                  </div>

                  {/* Current State */}
                  <div className="col-span-1 flex justify-center pt-1">
                    {criterion.currentState && (
                      <button
                        title={criterion.currentState}
                        className="text-[#9086a3] hover:text-[#7553ff] transition-colors"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Validation Details */}
                {expandedRow === criterion.id && (
                  <div className="px-4 py-3 bg-[#1e1a2a] border-t border-[#362552]">
                    <div className="space-y-3">
                      {criterion.validation && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#9086a3] uppercase mb-1">How to Validate</h4>
                          <p className="text-sm text-[#e8e4f0]">{criterion.validation}</p>
                        </div>
                      )}
                      {criterion.currentState && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#9086a3] uppercase mb-1">Current State</h4>
                          <p className="text-sm text-[#e8e4f0]">{criterion.currentState}</p>
                        </div>
                      )}
                      {criterion.notes && (
                        <div>
                          <h4 className="text-xs font-semibold text-[#9086a3] uppercase mb-1">Notes</h4>
                          <p className="text-sm text-[#e8e4f0]">{criterion.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {criteria.length === 0 && (
        <div className="bg-[#2a2438] rounded-lg border border-[#362552] p-12 text-center">
          <p className="text-sm text-[#9086a3]">No success criteria defined yet</p>
        </div>
      )}
    </div>
  )
}
