"use client"

import { Camera, User, BarChart3, Leaf, Bell, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationPanel } from "@/components/notification-panel"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"
import Link from "next/link"

interface WelcomeStats {
  totalAnalyses: number
  averageMicroplastics: number
  averageRating: number
}

export default function HomePage() {
  const { theme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [stats, setStats] = useState<WelcomeStats | null>(null)
  const [loading, setLoading] = useState(true)

  const themeClasses = {
    background: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#2D3B2A]",
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    cardBgAlt: theme === "light" ? "bg-[#D4C4B0]" : "bg-[#4A5A47]",
    textPrimary: theme === "light" ? "text-[#4A5D3A]" : "text-[#E8F0E5]",
    textSecondary: theme === "light" ? "text-[#6B7D5A]" : "text-[#B8C8B5]",
    textWhite: "text-white",
    buttonPrimary: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#5A6B57]",
    buttonSecondary: theme === "light" ? "bg-[#A8B89A]" : "bg-[#6A7B67]",
    hoverCard: theme === "light" ? "hover:bg-[#F0EBE6]" : "hover:bg-[#424F3F]",
  }

  // Fetch real-time stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        const endpoint = 'http://localhost:8002/reports?limit=100'
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error('API returned success: false')
        }
        
        // Process the reports to calculate stats
        const processedStats = calculateStats(data.reports || [])
        setStats(processedStats)
        
      } catch (err) {
        console.error('Error fetching stats:', err)
        // Fallback to default values
        setStats({
          totalAnalyses: 0,
          averageMicroplastics: 0,
          averageRating: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Calculate statistics from reports
  const calculateStats = (reports: any[]): WelcomeStats => {
    const analyses: Array<{
      microplastics: number
      risk: string
    }> = []
    
    reports.forEach((report) => {
      try {
        const content = report.content || ''
        
        if (!content) return

        // Parse the report content to extract food analyses
        const rawAnalysisMatch = content.match(/RAW ANALYSIS:\s*([\s\S]*?)(?:\n\nPARSED RESULTS:|$)/)
        const rawAnalysis = rawAnalysisMatch ? rawAnalysisMatch[1].trim() : content
        
        // Split by food items (each starting with "FOOD:")
        const foodItems = rawAnalysis.split(/(?=FOOD:)/i).filter(item => item.trim())
        
        foodItems.forEach((item) => {
          const lines = item.split('\n').map(line => line.trim()).filter(line => line)
          
          let microplastics = 0
          let risk = ''
          
          lines.forEach(line => {
            const colonIndex = line.indexOf(':')
            if (colonIndex === -1) return
            
            const key = line.substring(0, colonIndex).trim().toLowerCase()
            const value = line.substring(colonIndex + 1).trim()
            
            if (key === 'microplastics') {
              const match = value.match(/([0-9.]+)/)
              if (match) {
                microplastics = parseFloat(match[1])
              }
            } else if (key === 'risk') {
              risk = value.toUpperCase()
            }
          })
          
          if (microplastics > 0) {
            analyses.push({ microplastics, risk })
          }
        })
        
      } catch (err) {
        console.error('Error parsing report:', err)
      }
    })

    // Calculate totals
    const totalAnalyses = analyses.length
    const averageMicroplastics = totalAnalyses > 0 
      ? analyses.reduce((sum, a) => sum + a.microplastics, 0) / totalAnalyses
      : 0

    // Calculate rating based on risk distribution (5-star system)
    // More low risk = higher rating, more high risk = lower rating
    const riskCounts = {
      low: analyses.filter(a => a.risk === 'LOW').length,
      medium: analyses.filter(a => a.risk === 'MEDIUM').length,
      high: analyses.filter(a => a.risk === 'HIGH').length
    }

    let averageRating = 0
    if (totalAnalyses > 0) {
      // Weight: LOW = 5 stars, MEDIUM = 3 stars, HIGH = 1 star
      const weightedScore = (riskCounts.low * 5) + (riskCounts.medium * 3) + (riskCounts.high * 1)
      averageRating = weightedScore / totalAnalyses
    }

    return {
      totalAnalyses,
      averageMicroplastics: Math.round(averageMicroplastics * 10) / 10, // Round to 1 decimal
      averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal
    }
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} px-4 py-8`}>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Leaf className={`h-5 w-5 ${themeClasses.textWhite}`} />
            </div>
            <span className={`text-xl font-semibold ${themeClasses.textWhite}`}>Microplastics Analyzer</span>
          </div>
          <div className="flex items-center space-x-2 relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center relative"
            >
              <Bell className={`h-4 w-4 ${themeClasses.textWhite}`} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </button>
            <ThemeToggle />
            <Link href="/profile">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className={`h-5 w-5 ${themeClasses.textWhite}`} />
              </div>
            </Link>

            {/* Notification Panel */}
            {showNotifications && <NotificationPanel theme={theme} onClose={() => setShowNotifications(false)} />}
          </div>
        </div>

        {/* Welcome Message */}
        <Card className={`${themeClasses.cardBg} border-0 rounded-3xl p-6`}>
          <CardContent className="p-0 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-200 to-green-300 rounded-full flex items-center justify-center mb-4">
              <div className="text-3xl">🌱</div>
            </div>
            <h1 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-2`}>Welcome to Microplastics Analyzer</h1>
            <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>
              Your personal microplastics analyzer. Start scanning food packaging to make healthier choices for you and
              the planet.
            </p>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-2xl p-1">
          <Link href="/dashboard" className="flex-1">
            <div className={`${themeClasses.cardBg} rounded-xl py-2 px-4 text-center`}>
              <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>Overview</span>
            </div>
          </Link>
          <Link href="/history" className="flex-1">
            <div className="rounded-xl py-2 px-4 text-center">
              <span className="text-sm font-medium text-white/70">History</span>
            </div>
          </Link>
          <Link href="/recommendations" className="flex-1">
            <div className="rounded-xl py-2 px-4 text-center">
              <span className="text-sm font-medium text-white/70">Tips</span>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link href="/scan">
            <Card
              className={`${themeClasses.cardBg} border-0 rounded-2xl p-4 ${themeClasses.hoverCard} transition-colors`}
            >
              <CardContent className="p-0 flex items-center space-x-4">
                <div className={`w-12 h-12 ${themeClasses.buttonPrimary} rounded-xl flex items-center justify-center`}>
                  <Camera className={`h-6 w-6 ${themeClasses.textWhite}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Start Analysis</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Scan food packaging now</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card
              className={`${themeClasses.cardBg} border-0 rounded-2xl p-4 ${themeClasses.hoverCard} transition-colors`}
            >
              <CardContent className="p-0 flex items-center space-x-4">
                <div
                  className={`w-12 h-12 ${themeClasses.buttonSecondary} rounded-xl flex items-center justify-center`}
                >
                  <BarChart3 className={`h-6 w-6 ${themeClasses.textWhite}`} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${themeClasses.textPrimary}`}>View Dashboard</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Check your progress</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rewards">
            <Card
              className={`${themeClasses.cardBg} border-0 rounded-2xl p-4 ${themeClasses.hoverCard} transition-colors`}
            >
              <CardContent className="p-0 flex items-center space-x-4">
                <div className={`w-12 h-12 ${themeClasses.buttonSecondary} rounded-xl flex items-center justify-center`}>
                  <div className="text-xl">🎮</div>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Daily Challenge</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>Play games & earn rewards</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Stats - Now with real-time data */}
        <div className="grid grid-cols-3 gap-3">
          <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-4`}>
            <CardContent className="p-0 text-center">
              {loading ? (
                <div className="flex justify-center items-center h-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className={`text-xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                  {stats?.totalAnalyses || 0}
                </div>
              )}
              <div className={`text-xs ${themeClasses.textSecondary}`}>Analyses</div>
            </CardContent>
          </Card>
          <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-4`}>
            <CardContent className="p-0 text-center">
              {loading ? (
                <div className="flex justify-center items-center h-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className={`text-xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                  {stats?.averageMicroplastics || 0}
                </div>
              )}
              <div className={`text-xs ${themeClasses.textSecondary}`}>Avg ppm</div>
            </CardContent>
          </Card>
          <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-4`}>
            <CardContent className="p-0 text-center">
              {loading ? (
                <div className="flex justify-center items-center h-8">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <div className={`text-xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                  {stats?.averageRating || 0}
                </div>
              )}
              <div className={`text-xs ${themeClasses.textSecondary}`}>Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}