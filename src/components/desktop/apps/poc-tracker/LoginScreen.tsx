'use client'

import { useState } from 'react'
import { useAuth, DEMO_USERS, User } from './auth'
import { Shield, Chrome, Github, Lock } from 'lucide-react'

export function LoginScreen() {
  const { login } = useAuth()
  const [showUserSelect, setShowUserSelect] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'github' | null>(null)

  const handleProviderClick = (provider: 'google' | 'github') => {
    setSelectedProvider(provider)
    setShowUserSelect(true)
  }

  const handleUserSelect = (user: User) => {
    login(selectedProvider!, user)
  }

  const providerUsers = selectedProvider
    ? DEMO_USERS.filter(u => u.provider === selectedProvider)
    : []

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#1e1a2a] via-[#0f0c14] to-[#1e1a2a]">
      <div className="w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7553ff]/20 mb-4">
            <Shield className="w-8 h-8 text-[#7553ff]" />
          </div>
          <h1 className="text-3xl font-bold text-[#e8e4f0] mb-2">POC Tracker</h1>
          <p className="text-[#9086a3]">Sign in to access your POC projects</p>
        </div>

        {!showUserSelect ? (
          /* OAuth Provider Selection */
          <div className="bg-[#2a2438] rounded-2xl border border-[#362552] p-8">
            <div className="space-y-3">
              {/* Google Sign In */}
              <button
                onClick={() => handleProviderClick('google')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-800 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
              >
                <Chrome className="w-5 h-5" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#362552]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#2a2438] text-[#9086a3]">OR</span>
                </div>
              </div>

              {/* GitHub Sign In */}
              <button
                onClick={() => handleProviderClick('github')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#24292e] hover:bg-[#2d3339] text-white rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-6 flex items-start gap-2 text-xs text-[#9086a3]">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Your data is protected. We use industry-standard OAuth 2.0 authentication and never store your passwords.
              </p>
            </div>
          </div>
        ) : (
          /* Demo User Selection (simulates OAuth callback) */
          <div className="bg-[#2a2438] rounded-2xl border border-[#362552] p-8">
            <button
              onClick={() => setShowUserSelect(false)}
              className="text-sm text-[#9086a3] hover:text-[#e8e4f0] mb-4"
            >
              ← Back to sign in options
            </button>

            <h2 className="text-lg font-semibold text-[#e8e4f0] mb-4">
              Choose your account
            </h2>
            <p className="text-sm text-[#9086a3] mb-4">
              to continue to POC Tracker
            </p>

            <div className="space-y-2">
              {providerUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full flex items-center gap-3 p-4 bg-[#1e1a2a] hover:bg-[#362552] rounded-xl transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#7553ff]/20 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#7553ff] font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#e8e4f0]">{user.name}</p>
                    <p className="text-xs text-[#9086a3]">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-[#9086a3] mt-6 text-center">
              Demo: Select the Sentry account managing your POCs
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#9086a3]">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2">Powered by Sentry</p>
        </div>
      </div>
    </div>
  )
}
