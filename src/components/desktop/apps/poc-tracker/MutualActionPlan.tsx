'use client'

import { ActionPlanItem } from './types'
import { getStatusBadgeColor, formatDate, isOverdue } from './utils'
import { CheckCircle2, Circle, Calendar, AlertTriangle } from 'lucide-react'

interface MutualActionPlanProps {
  items: ActionPlanItem[]
  onToggleStatus: (id: string) => void
}

export function MutualActionPlan({ items, onToggleStatus }: MutualActionPlanProps) {
  return (
    <div className="p-4">
      <div className="bg-[#2a2438] rounded-lg border border-[#362552] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#1e1a2a] border-b border-[#362552] text-xs font-semibold text-[#9086a3] uppercase">
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-5">Milestone</div>
          <div className="col-span-2">Owner</div>
          <div className="col-span-2">Notes</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-[#362552]">
          {items.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-[#9086a3]">No action items yet</p>
            </div>
          ) : (
            items.map((item) => {
              const overdue = item.status !== 'completed' && isOverdue(item.dueDate)

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-[#1e1a2a]/50 transition-colors items-center"
                >
                  {/* Status Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => onToggleStatus(item.id)}
                      className="hover:scale-110 transition-transform"
                    >
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#9086a3] hover:text-[#7553ff]" />
                      )}
                    </button>
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2">
                    {item.dueDate ? (
                      <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-red-400' : 'text-[#e8e4f0]'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.dueDate)}</span>
                        {overdue && <AlertTriangle className="w-3.5 h-3.5" />}
                      </div>
                    ) : (
                      <span className="text-sm text-[#9086a3]">No date</span>
                    )}
                  </div>

                  {/* Milestone */}
                  <div className="col-span-5">
                    <p className={`text-sm ${item.status === 'completed' ? 'line-through text-[#9086a3]' : 'text-[#e8e4f0]'}`}>
                      {item.milestone}
                    </p>
                  </div>

                  {/* Owner */}
                  <div className="col-span-2">
                    <span className="text-sm text-[#e8e4f0]">{item.owner || 'Unassigned'}</span>
                  </div>

                  {/* Notes */}
                  <div className="col-span-2">
                    {item.notes && (
                      <p className="text-xs text-[#9086a3] truncate" title={item.notes}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
