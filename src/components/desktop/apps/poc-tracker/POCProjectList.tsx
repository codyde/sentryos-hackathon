'use client'

import { useState } from 'react'
import { POCProject } from './types'
import { POCProjectCard } from './POCProjectCard'
import { useAuth } from './auth'
import { NotificationPanel } from './NotificationPanel'
import { ReportSettingsDialog } from './ReportSettingsDialog'
import { Plus, TrendingUp, LogOut, User, Settings } from 'lucide-react'

interface POCProjectListProps {
  projects: POCProject[]
  onSelectProject: (project: POCProject) => void
  onNewProject?: () => void
}

export function POCProjectList({ projects, onSelectProject, onNewProject }: POCProjectListProps) {
  const { user, logout } = useAuth()
  const [reportSettingsOpen, setReportSettingsOpen] = useState(false)

  return (
    <div className="h-full flex flex-col bg-[#1e1a2a]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#362552] bg-[#2a2438]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#7553ff]" />
          <h1 className="text-lg font-semibold text-[#e8e4f0]">POC Tracker</h1>
          <span className="text-sm text-[#9086a3]">({projects.length} projects)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Report Settings */}
          <button
            onClick={() => setReportSettingsOpen(true)}
            className="flex items-center justify-center w-8 h-8 hover:bg-[#362552] text-[#9086a3] hover:text-[#e8e4f0] rounded transition-colors"
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
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#362552] text-[#9086a3] hover:text-[#e8e4f0] text-sm rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>

          {onNewProject && (
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
              New POC
            </button>
          )}
        </div>
      </div>

      {/* Project Grid */}
      <div className="flex-1 overflow-auto p-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <TrendingUp className="w-16 h-16 text-[#362552] mb-4" />
            <h3 className="text-lg font-semibold text-[#e8e4f0] mb-2">No POC Projects</h3>
            <p className="text-sm text-[#9086a3] mb-4">
              Get started by creating your first POC project
            </p>
            {onNewProject && (
              <button
                onClick={onNewProject}
                className="flex items-center gap-2 px-4 py-2 bg-[#7553ff] hover:bg-[#8c6fff] text-white text-sm rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First POC
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map((project) => (
              <POCProjectCard
                key={project.id}
                project={project}
                onClick={() => onSelectProject(project)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Settings Dialog */}
      <ReportSettingsDialog
        open={reportSettingsOpen}
        onOpenChange={setReportSettingsOpen}
      />
    </div>
  )
}
