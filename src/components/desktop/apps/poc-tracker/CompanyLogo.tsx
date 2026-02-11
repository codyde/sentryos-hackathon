'use client'

import { useState, useEffect } from 'react'
import { getLogoUrls } from './logoUtils'
import { Building2 } from 'lucide-react'

interface CompanyLogoProps {
  companyName: string
  domain?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

/**
 * CompanyLogo component with automatic fallback across multiple logo sources
 * Tries: Clearbit -> Google Favicon -> DuckDuckGo -> Favicon.io -> Fallback Icon
 */
export function CompanyLogo({ companyName, domain, size = 'medium', className = '' }: CompanyLogoProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const logoUrls = getLogoUrls(companyName, domain)
  const currentUrl = logoUrls[currentUrlIndex]

  // Reset when company changes
  useEffect(() => {
    setCurrentUrlIndex(0)
    setIsError(false)
    setIsLoading(true)
  }, [companyName, domain])

  const handleError = () => {
    if (currentUrlIndex < logoUrls.length - 1) {
      // Try next source
      setCurrentUrlIndex(prev => prev + 1)
      setIsLoading(true)
    } else {
      // All sources failed, show fallback
      setIsError(true)
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    setIsError(false)
  }

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  }

  // Show fallback icon if all sources failed
  if (isError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-[#362552] flex items-center justify-center ${className}`}
        title={`${companyName} (logo not available)`}
      >
        <Building2 className={`${iconSizes[size]} text-[#7553ff]`} />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg bg-white flex items-center justify-center overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="w-4 h-4 border-2 border-[#7553ff] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={currentUrl}
        alt={`${companyName} logo`}
        className="w-full h-full object-contain p-1"
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  )
}
