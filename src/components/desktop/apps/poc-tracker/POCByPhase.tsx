'use client'

import { Phase, PhaseTask } from './types'
import { getStatusBadgeColor, formatDate, isOverdue } from './utils'
import { CheckCircle2, Circle, Calendar, AlertTriangle, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface POCByPhaseProps {
  phases: Phase[]
  onToggleTask: (phaseId: string, taskId: string) => void
}

export function POCByPhase({ phases, onToggleTask }: POCByPhaseProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(phases.map(p => p.id))
  )

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  const getPhaseCompletion = (phase: Phase) => {
    const completed = phase.tasks.filter(t => t.status === 'completed').length
    const total = phase.tasks.length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  return (
    <div className="p-4 space-y-4">
      {phases.length === 0 ? (
        <div className="bg-[#2a2438] rounded-lg border border-[#362552] p-12 text-center">
          <p className="text-sm text-[#9086a3]">No phases defined yet</p>
        </div>
      ) : (
        phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase.id)
          const completion = getPhaseCompletion(phase)

          return (
            <div key={phase.id} className="bg-[#2a2438] rounded-lg border border-[#362552] overflow-hidden">
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1e1a2a]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[#9086a3]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#9086a3]" />
                  )}
                  <h3 className="text-lg font-semibold text-[#e8e4f0]">{phase.name}</h3>
                  <span className="text-sm text-[#9086a3]">
                    ({phase.tasks.filter(t => t.status === 'completed').length}/{phase.tasks.length} tasks)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-[#1e1a2a] rounded-full h-2">
                    <div
                      className="bg-[#7553ff] h-full rounded-full transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[#e8e4f0] min-w-[3rem] text-right">
                    {completion}%
                  </span>
                </div>
              </button>

              {/* Phase Tasks */}
              {isExpanded && (
                <div className="border-t border-[#362552]">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-[#1e1a2a] text-xs font-semibold text-[#9086a3] uppercase">
                    <div className="col-span-1 text-center">Done</div>
                    <div className="col-span-3">Task</div>
                    <div className="col-span-2">Resources</div>
                    <div className="col-span-2">Owner</div>
                    <div className="col-span-2">Target Date</div>
                    <div className="col-span-2">Notes</div>
                  </div>

                  {/* Task Rows */}
                  <div className="divide-y divide-[#362552]">
                    {phase.tasks.map((task) => {
                      const overdue = task.status !== 'completed' && isOverdue(task.targetDate)

                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-[#1e1a2a]/30 transition-colors items-start"
                        >
                          {/* Checkbox */}
                          <div className="col-span-1 flex justify-center pt-1">
                            <button
                              onClick={() => onToggleTask(phase.id, task.id)}
                              className="hover:scale-110 transition-transform"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-[#9086a3] hover:text-[#7553ff]" />
                              )}
                            </button>
                          </div>

                          {/* Task */}
                          <div className="col-span-3">
                            <p className={`text-sm ${task.status === 'completed' ? 'line-through text-[#9086a3]' : 'text-[#e8e4f0]'}`}>
                              {task.task}
                            </p>
                          </div>

                          {/* Resources */}
                          <div className="col-span-2">
                            {task.resources && task.resources.trim() ? (
                              <div className="flex flex-wrap gap-1">
                                {task.resources.split('\n').filter(r => r.trim()).map((resource, i) => (
                                  <a
                                    key={i}
                                    href="#"
                                    className="inline-flex items-center gap-1 text-xs text-[#7553ff] hover:text-[#8c6fff] transition-colors"
                                    title={resource}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span className="truncate max-w-[100px]">{resource}</span>
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-[#9086a3]">-</span>
                            )}
                          </div>

                          {/* Owner */}
                          <div className="col-span-2">
                            <span className="text-sm text-[#e8e4f0]">{task.owner || '-'}</span>
                          </div>

                          {/* Target Date */}
                          <div className="col-span-2">
                            {task.targetDate ? (
                              <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-red-400' : 'text-[#e8e4f0]'}`}>
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(task.targetDate)}</span>
                                {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
                              </div>
                            ) : (
                              <span className="text-sm text-[#9086a3]">-</span>
                            )}
                          </div>

                          {/* Notes */}
                          <div className="col-span-2">
                            {task.notes && (
                              <p className="text-xs text-[#9086a3] line-clamp-2" title={task.notes}>
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
