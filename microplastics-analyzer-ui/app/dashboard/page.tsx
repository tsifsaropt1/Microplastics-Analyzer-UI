"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

// Types for real data
interface FoodAnalysis {
  id: string
  food: string
  quantity: string
  calories: string
  microplastics: string
  risk: string
  timestamp: string
}

interface DashboardStats {
  totalAnalyses: number
  averageMicroplastics: number
  averageCalories: number
  riskDistribution: {
    low: number
    medium: number
    high: number
  }
  monthlyTrends: Array<{
    month: string
    avgMicroplastics: number
    totalAnalyses: number
    avgCalories: number
  }>
  recentAnalyses: FoodAnalysis[]
}

export default function DashboardPage() {
  const { theme } = useTheme()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  const themeClasses = {
    background: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#2D3B2A]",
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    cardBgAlt: theme === "light" ? "bg-[#D4C4B0]" : "bg-[#4A5A47]",
    textPrimary: theme === "light" ? "text-[#4A5D3A]" : "text-[#E8F0E5]",
    textSecondary: theme === "light" ? "text-[#6B7D5A]" : "text-[#B8C8B5]",
    textWhite: "text-white",
    buttonPrimary: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#5A6B57]",
    chartBar: theme === "light" ? "bg-white" : "bg-[#E8F0E5]",
    progressBg: theme === "light" ? "bg-[#E5E0D8]" : "bg-[#2A3A27]",
  }

  // Fetch real data from your API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setDebugInfo("Attempting to fetch data from API...")
        
        // Try the correct endpoint based on your main.py
        const endpoint = 'http://localhost:8002/reports?limit=50'
        
        setDebugInfo(`Fetching from: ${endpoint}`)
        
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
        setDebugInfo(`API Response received. Success: ${data.success}, Count: ${data.count}`)
        
        if (!data.success) {
          throw new Error('API returned success: false')
        }
        
        // Process the reports from the API response
        const processedStats = processDashboardData(data.reports || [])
        setStats(processedStats)
        setError(null)
        setDebugInfo(`Successfully processed ${processedStats.totalAnalyses} analyses`)
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(`Failed to load dashboard data: ${errorMessage}`)
        setDebugInfo(`Error: ${errorMessage}. Using fallback data.`)
        
        // Fallback to demo data
        setStats(getDemoStats())
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Process raw report data into dashboard statistics
  const processDashboardData = (reports: any[]): DashboardStats => {
    console.log('Processing reports:', reports)
    const analyses: FoodAnalysis[] = []
    
    reports.forEach((report, reportIndex) => {
      try {
        const content = report.content || ''
        const timestamp = report.timestamp || report.created || new Date().toISOString()
        
        if (!content) {
          console.warn('No content found in report:', report)
          return
        }

        // Parse the report content to extract food analyses
        const rawAnalysisMatch = content.match(/RAW ANALYSIS:\s*([\s\S]*?)(?:\n\nPARSED RESULTS:|$)/)
        const rawAnalysis = rawAnalysisMatch ? rawAnalysisMatch[1].trim() : content
        
        // Split by food items (each starting with "FOOD:")
        const foodItems = rawAnalysis.split(/(?=FOOD:)/i).filter(item => item.trim())
        
        foodItems.forEach((item, itemIndex) => {
          const lines = item.split('\n').map(line => line.trim()).filter(line => line)
          
          let currentAnalysis: Partial<FoodAnalysis> = {
            id: `${report.id}-${itemIndex}`,
            timestamp: timestamp
          }
          
          lines.forEach(line => {
            const colonIndex = line.indexOf(':')
            if (colonIndex === -1) return
            
            const key = line.substring(0, colonIndex).trim().toLowerCase()
            const value = line.substring(colonIndex + 1).trim()
            
            switch (key) {
              case 'food':
                currentAnalysis.food = value
                break
              case 'quantity':
                currentAnalysis.quantity = value
                break
              case 'calories':
                currentAnalysis.calories = value
                break
              case 'microplastics':
                currentAnalysis.microplastics = value
                break
              case 'risk':
                currentAnalysis.risk = value.toUpperCase()
                break
            }
          })
          
          // Only add if we have at least a food name
          if (currentAnalysis.food) {
            analyses.push(currentAnalysis as FoodAnalysis)
          }
        })
        
      } catch (err) {
        console.error('Error parsing report:', err, report)
      }
    })

    console.log('Processed analyses:', analyses)

    // Calculate statistics
    const totalAnalyses = analyses.length
    const riskDistribution = {
      low: analyses.filter(a => a.risk === 'LOW').length,
      medium: analyses.filter(a => a.risk === 'MEDIUM').length,
      high: analyses.filter(a => a.risk === 'HIGH').length
    }

    // Calculate averages
    const avgMicroplastics = analyses.reduce((sum, a) => {
      const match = a.microplastics?.match(/([0-9.]+)/)
      const value = match ? parseFloat(match[1]) : 0
      return sum + value
    }, 0) / (totalAnalyses || 1)

    const avgCalories = analyses.reduce((sum, a) => {
      const match = a.calories?.match(/([0-9.]+)/)
      const value = match ? parseFloat(match[1]) : 0
      return sum + value
    }, 0) / (totalAnalyses || 1)

    // Create monthly trends
    const monthlyTrends = generateMonthlyTrends(analyses)

    return {
      totalAnalyses,
      averageMicroplastics: avgMicroplastics,
      averageCalories: avgCalories,
      riskDistribution,
      monthlyTrends,
      recentAnalyses: analyses.slice(0, 10)
    }
  }

  // Generate monthly trends from analyses
  const generateMonthlyTrends = (analyses: FoodAnalysis[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    const now = new Date()
    
    return months.map((month, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (6 - index), 1)
      const monthAnalyses = analyses.filter(a => {
        const analysisDate = new Date(a.timestamp)
        return analysisDate.getMonth() === monthDate.getMonth() && 
               analysisDate.getFullYear() === monthDate.getFullYear()
      })

      const avgMicroplastics = monthAnalyses.reduce((sum, a) => {
        const match = a.microplastics?.match(/([0-9.]+)/)
        const value = match ? parseFloat(match[1]) : 0
        return sum + value
      }, 0) / (monthAnalyses.length || 1)

      const avgCalories = monthAnalyses.reduce((sum, a) => {
        const match = a.calories?.match(/([0-9.]+)/)
        const value = match ? parseFloat(match[1]) : 0
        return sum + value
      }, 0) / (monthAnalyses.length || 1)

      return {
        month,
        avgMicroplastics: monthAnalyses.length ? avgMicroplastics : 0,
        totalAnalyses: monthAnalyses.length,
        avgCalories: monthAnalyses.length ? avgCalories : 0
      }
    })
  }

  // Fallback demo data
  const getDemoStats = (): DashboardStats => ({
    totalAnalyses: 0,
    averageMicroplastics: 0,
    averageCalories: 0,
    riskDistribution: { low: 0, medium: 0, high: 0 },
    monthlyTrends: [
      { month: "Jan", avgMicroplastics: 0, totalAnalyses: 0, avgCalories: 0 },
      { month: "Feb", avgMicroplastics: 0, totalAnalyses: 0, avgCalories: 0 },
      { month: "Mar", avgMicroplastics: 0, totalAnalyses: 0, avgCalories: 0 },
      { month: "Apr", avgMicroplastics: 0, totalAnalyses: 0, avgCalories: 0 },
      { month: "May", avgMicroplastics: 0, totalAnalyses: 0, avgCalories: 0 },
      { month: "Jun", avgMicroplastics: 0, totalAnalyses: 0, avgCalories: 0 },
      { month: "Jul", avgMicroplastics: 0, totalAnalyses: 0, avgCalories: 0 },
    ],
    recentAnalyses: []
  })

  // Calculate chart heights for monthly trends
  const getChartHeight = (value: number, maxValue: number) => {
    if (maxValue === 0) return 'h-2'
    const percentage = Math.max(0.1, value / maxValue)
    const height = Math.floor(percentage * 16)
    return `h-${Math.min(16, Math.max(2, height))}`
  }

  // Get risk color helper
  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'HIGH': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    }
  }

  // Calculate trend direction
  const getTrendDirection = (data: number[]) => {
    if (data.length < 2) return { icon: TrendingUp, change: 0, positive: true }
    
    const recent = data.slice(-2)
    const change = recent[0] === 0 ? 0 : ((recent[1] - recent[0]) / recent[0]) * 100
    
    return {
      icon: change >= 0 ? TrendingUp : TrendingDown,
      change: Math.abs(change),
      positive: change < 0
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} px-4 py-8`}>
        <div className="max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-white mb-4" />
            <p className="text-white text-sm text-center">{debugInfo}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themeClasses.background} px-4 py-8`}>
        <div className="max-w-md mx-auto">
          <div className="text-center py-20">
            <p className="text-white mb-4">{error}</p>
            <p className="text-white text-sm mb-4">{debugInfo}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className={`${themeClasses.buttonPrimary} text-white`}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const maxMicroplastics = Math.max(...(stats?.monthlyTrends.map(d => d.avgMicroplastics) || [1]))
  const microplasticsTrend = getTrendDirection(stats?.monthlyTrends.map(d => d.avgMicroplastics) || [])
  const caloriesTrend = getTrendDirection(stats?.monthlyTrends.map(d => d.avgCalories) || [])

  return (
    <div className={`min-h-screen ${themeClasses.background} px-4 py-8`}>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className={`${themeClasses.textWhite} hover:bg-white/10 p-2`}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className={`text-xl font-semibold ${themeClasses.textWhite}`}>Overview</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Debug info (remove in production) */}
        {debugInfo && (
          <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-4`}>
            <CardContent className="p-0">
              <p className={`text-xs ${themeClasses.textSecondary}`}>Debug: {debugInfo}</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 rounded-2xl p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-xl"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-xl"
            >
              History
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-xl"
            >
              Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-4`}>
                <CardContent className="p-0 text-center">
                  <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                    {stats?.totalAnalyses || 0}
                  </div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>Analyses</div>
                </CardContent>
              </Card>
              <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-4`}>
                <CardContent className="p-0 text-center">
                  <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                    {stats?.riskDistribution.high || 0}
                  </div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>High Risk</div>
                </CardContent>
              </Card>
              <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-4`}>
                <CardContent className="p-0 text-center">
                  <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                    {(stats?.averageMicroplastics || 0).toFixed(1)}
                  </div>
                  <div className={`text-xs ${themeClasses.textSecondary}`}>Avg ppm</div>
                </CardContent>
              </Card>
            </div>

            {/* Microplastic Levels Chart */}
            <Card className={`${themeClasses.cardBgAlt} border-0 rounded-3xl p-6`}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Microplastic Levels</h3>
                  <div className="flex items-center space-x-1">
                    <microplasticsTrend.icon className={`h-4 w-4 ${microplasticsTrend.positive ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${microplasticsTrend.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {microplasticsTrend.change.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`text-sm ${themeClasses.textSecondary} uppercase tracking-wide`}>AVERAGE</span>
                  <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                    {(stats?.averageMicroplastics || 0).toFixed(1)} <span className="text-sm font-normal">ppm</span>
                  </div>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>Last 7 Months</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between space-x-2 h-20">
                    {stats?.monthlyTrends.map((data, index) => (
                      <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                        <div className="w-full flex flex-col items-center">
                          <div className={`w-6 ${themeClasses.chartBar} rounded-t ${getChartHeight(data.avgMicroplastics, maxMicroplastics)} transition-all`}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`flex justify-between text-xs ${themeClasses.textSecondary} font-medium`}>
                    {stats?.monthlyTrends.map((data, index) => (
                      <span key={index}>{data.month}</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
              <CardContent className="p-0">
                <h3 className={`font-semibold ${themeClasses.textPrimary} mb-4`}>Risk Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats?.riskDistribution.low || 0}</div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>Low Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats?.riskDistribution.medium || 0}</div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>Medium Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats?.riskDistribution.high || 0}</div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>High Risk</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
              <CardContent className="p-0">
                <h3 className={`font-semibold ${themeClasses.textPrimary} mb-4`}>Recent Analyses</h3>
                <div className="space-y-4">
                  {stats?.recentAnalyses.length === 0 ? (
                    <p className={`text-center ${themeClasses.textSecondary} py-8`}>
                      No analyses yet. Start scanning your food to see data here!
                    </p>
                  ) : (
                    stats?.recentAnalyses.slice(0, 5).map((analysis, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className={`font-medium ${themeClasses.textPrimary} text-sm`}>{analysis.food}</p>
                          <p className={`text-xs ${themeClasses.textSecondary}`}>
                            {analysis.quantity} • {analysis.calories}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.risk)}`}>
                            {analysis.risk}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
              <CardContent className="p-0">
                <h3 className={`font-semibold ${themeClasses.textPrimary} mb-4`}>Personalized Tips</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Switch to Glass Containers",
                      description: "Reduce microplastic exposure by 40%",
                      impact: "High Impact",
                      icon: "🥛",
                    },
                    {
                      title: "Avoid Heating Plastic",
                      description: "Never microwave plastic containers",
                      impact: "Medium Impact",
                      icon: "🔥",
                    },
                    {
                      title: "Choose Fresh Over Packaged",
                      description: "Opt for fresh produce when possible",
                      impact: "High Impact",
                      icon: "🥬",
                    },
                    {
                      title: "Filter Your Water",
                      description: "Use a quality water filter at home",
                      impact: "Medium Impact",
                      icon: "💧",
                    },
                  ].map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl">
                      <div className="text-2xl">{rec.icon}</div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${themeClasses.textPrimary} text-sm mb-1`}>{rec.title}</h4>
                        <p className={`text-xs ${themeClasses.textSecondary} mb-2`}>{rec.description}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rec.impact === "High Impact"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          }`}
                        >
                          {rec.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}