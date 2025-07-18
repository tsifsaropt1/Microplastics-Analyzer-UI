"use client"
import { WeeklyChart, MonthlyChart, YearlyChart } from '@/components/components/charts';
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, TrendingDown, TrendingUp, Loader2 } from "lucide-react"
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

interface DailyDetail {
  date: string
  items: Array<{
    name: string
    level: number
    risk: string
    time: string
  }>
}

interface WeeklyData {
  period: string
  items: number
  avgLevel: number
  trend: string
  details: DailyDetail[]
}

interface MonthlyData {
  period: string
  items: number
  avgLevel: number
  trend: string
  details: Array<{
    date: string
    avgLevel: number
    items: number
    trend: string
  }>
}

interface YearlyData {
  period: string
  items: number
  avgLevel: number
  trend: string
  details: Array<{
    date: string
    avgLevel: number
    items: number
    trend: string
  }>
}

export default function HistoryPage() {
  const { theme } = useTheme()
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([])
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
  }

  // Fetch real data from API
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true)
        setDebugInfo("Attempting to fetch data from API...")
        
        const endpoint = 'http://localhost:8002/reports?limit=100'
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
        
        const processedAnalyses = processReportsData(data.reports || [])
        setAnalyses(processedAnalyses)
        setError(null)
        setDebugInfo(`Successfully processed ${processedAnalyses.length} analyses`)
        
      } catch (err) {
        console.error('Error fetching history data:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(`Failed to load history data: ${errorMessage}`)
        setDebugInfo(`Error: ${errorMessage}. Using empty data.`)
        setAnalyses([])
      } finally {
        setLoading(false)
      }
    }

    fetchHistoryData()
  }, [])

  // Process raw report data into food analyses
  const processReportsData = (reports: any[]): FoodAnalysis[] => {
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

        const rawAnalysisMatch = content.match(/RAW ANALYSIS:\s*([\s\S]*?)(?:\n\nPARSED RESULTS:|$)/)
        const rawAnalysis = rawAnalysisMatch ? rawAnalysisMatch[1].trim() : content
        
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
          
          if (currentAnalysis.food) {
            analyses.push(currentAnalysis as FoodAnalysis)
          }
        })
        
      } catch (err) {
        console.error('Error parsing report:', err, report)
      }
    })

    return analyses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Helper functions
  const extractMicroplasticLevel = (microplastics: string): number => {
    const match = microplastics?.match(/([0-9.]+)/)
    return match ? parseFloat(match[1]) : 0
  }

  const formatDate = (date: Date): string => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const calculateTrend = (current: number, previous: number): string => {
    if (previous === 0) return "down"
    return current < previous ? "down" : "up"
  }

  // Generate weekly data
  const generateWeeklyData = (): WeeklyData[] => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 6)
    
    const weekAnalyses = analyses.filter(a => {
      const analysisDate = new Date(a.timestamp)
      return analysisDate >= weekStart && analysisDate <= now
    })

    const dailyGroups = new Map<string, FoodAnalysis[]>()
    
    weekAnalyses.forEach(analysis => {
      const date = new Date(analysis.timestamp)
      const dateKey = date.toDateString()
      
      if (!dailyGroups.has(dateKey)) {
        dailyGroups.set(dateKey, [])
      }
      dailyGroups.get(dateKey)!.push(analysis)
    })

    const details: DailyDetail[] = []
    dailyGroups.forEach((dayAnalyses, dateKey) => {
      const date = new Date(dateKey)
      const items = dayAnalyses.map(analysis => ({
        name: analysis.food,
        level: extractMicroplasticLevel(analysis.microplastics),
        risk: analysis.risk,
        time: formatTime(new Date(analysis.timestamp))
      }))
      
      details.push({
        date: formatDate(date),
        items: items
      })
    })

    details.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const avgLevel = weekAnalyses.reduce((sum, a) => sum + extractMicroplasticLevel(a.microplastics), 0) / (weekAnalyses.length || 1)

    return [{
      period: "This Week",
      items: weekAnalyses.length,
      avgLevel: avgLevel,
      trend: "down",
      details: details
    }]
  }

  // Generate monthly data
  const generateMonthlyData = (): MonthlyData[] => {
    const monthlyData: MonthlyData[] = []
    const now = new Date()
    
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthAnalyses = analyses.filter(a => {
        const analysisDate = new Date(a.timestamp)
        return analysisDate >= monthDate && analysisDate < nextMonth
      })

      // Group by weeks
      const weeklyDetails = []
      for (let week = 0; week < 4; week++) {
        const weekStart = new Date(monthDate)
        weekStart.setDate(monthDate.getDate() + (week * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        const weekAnalyses = monthAnalyses.filter(a => {
          const analysisDate = new Date(a.timestamp)
          return analysisDate >= weekStart && analysisDate <= weekEnd
        })

        if (weekAnalyses.length > 0) {
          const avgLevel = weekAnalyses.reduce((sum, a) => sum + extractMicroplasticLevel(a.microplastics), 0) / weekAnalyses.length
          const weekNumber = week + 1
          const dateRange = `Week ${weekNumber} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${weekEnd.toLocaleDateString('en-US', { day: 'numeric' })})`
          
          weeklyDetails.push({
            date: dateRange,
            avgLevel: avgLevel,
            items: weekAnalyses.length,
            trend: "down"
          })
        }
      }

      const avgLevel = monthAnalyses.reduce((sum, a) => sum + extractMicroplasticLevel(a.microplastics), 0) / (monthAnalyses.length || 1)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      monthlyData.push({
        period: monthName,
        items: monthAnalyses.length,
        avgLevel: avgLevel,
        trend: "down",
        details: weeklyDetails
      })
    }

    return monthlyData
  }

  // Generate yearly data
  const generateYearlyData = (): YearlyData[] => {
    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    
    const yearAnalyses = analyses.filter(a => {
      const analysisDate = new Date(a.timestamp)
      return analysisDate >= yearStart && analysisDate <= now
    })

    // Group by months
    const monthlyDetails = []
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(now.getFullYear(), month, 1)
      const monthEnd = new Date(now.getFullYear(), month + 1, 0)
      
      const monthAnalyses = yearAnalyses.filter(a => {
        const analysisDate = new Date(a.timestamp)
        return analysisDate >= monthStart && analysisDate <= monthEnd
      })

      if (monthAnalyses.length > 0) {
        const avgLevel = monthAnalyses.reduce((sum, a) => sum + extractMicroplasticLevel(a.microplastics), 0) / monthAnalyses.length
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'long' })
        
        monthlyDetails.push({
          date: monthName,
          avgLevel: avgLevel,
          items: monthAnalyses.length,
          trend: "down"
        })
      }
    }

    const avgLevel = yearAnalyses.reduce((sum, a) => sum + extractMicroplasticLevel(a.microplastics), 0) / (yearAnalyses.length || 1)

    return [{
      period: now.getFullYear().toString(),
      items: yearAnalyses.length,
      avgLevel: avgLevel,
      trend: "down",
      details: monthlyDetails
    }]
  }

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "LOW":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "HIGH":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
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

  const weeklyData = generateWeeklyData()
  const monthlyData = generateMonthlyData()
  const yearlyData = generateYearlyData()

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
            <h1 className={`text-xl font-semibold ${themeClasses.textWhite}`}>Dietary History</h1>
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

        <Tabs defaultValue="weekly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 rounded-2xl p-1">
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-xl"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-xl"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-xl"
            >
              Yearly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-6">
            {/* Weekly Summary */}
            <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-6`}>
              <CardContent className="p-0">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className={`h-5 w-5 ${themeClasses.buttonPrimary.replace("bg-", "text-")}`} />
                  <h3 className={`font-semibold ${themeClasses.textPrimary}`}>This Week Summary</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                      {weeklyData[0]?.items || 0}
                    </div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>Items Scanned</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                      {weeklyData[0]?.avgLevel.toFixed(1) || "0.0"}
                    </div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>Avg ppm</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add the Weekly Chart */}
            {weeklyData[0]?.details.length > 0 && (
              <WeeklyChart data={weeklyData} theme={theme} />
            )}

            {/* Daily Details */}
            {weeklyData[0]?.details.length === 0 ? (
              <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
                <CardContent className="p-0">
                  <p className={`text-center ${themeClasses.textSecondary} py-8`}>
                    No scans this week. Start scanning your food to see history!
                  </p>
                </CardContent>
              </Card>
            ) : (
              weeklyData[0]?.details.map((day, dayIndex) => (
                <Card key={dayIndex} className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
                  <CardContent className="p-0">
                    <h3 className={`font-semibold ${themeClasses.textPrimary} mb-4`}>{day.date}</h3>
                    <div className="space-y-3">
                      {day.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                          <div className="flex-1">
                            <p className={`font-medium ${themeClasses.textPrimary} text-sm`}>{item.name}</p>
                            <p className={`text-xs ${themeClasses.textSecondary}`}>{item.time}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>{item.level.toFixed(1)} ppm</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(item.risk)}`}>
                              {item.risk}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            {/* Add the Monthly Chart */}
            {monthlyData.length > 0 && (
              <MonthlyChart data={monthlyData} theme={theme} />
            )}

            {monthlyData.length === 0 ? (
              <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
                <CardContent className="p-0">
                  <p className={`text-center ${themeClasses.textSecondary} py-8`}>
                    No monthly data available yet. Keep scanning to build your history!
                  </p>
                </CardContent>
              </Card>
            ) : (
              monthlyData.map((month, monthIndex) => (
                <Card key={monthIndex} className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${themeClasses.textPrimary}`}>{month.period}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                          {month.avgLevel.toFixed(1)} ppm avg
                        </span>
                        {month.trend === "down" ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                          {month.items}
                        </div>
                        <div className={`text-xs ${themeClasses.textSecondary}`}>Items Scanned</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                          {month.avgLevel.toFixed(1)}
                        </div>
                        <div className={`text-xs ${themeClasses.textSecondary}`}>Avg ppm</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {month.details.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className={`text-sm ${themeClasses.textPrimary}`}>{week.date}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs ${themeClasses.textSecondary}`}>{week.avgLevel.toFixed(1)} ppm</span>
                            {week.trend === "down" ? (
                              <TrendingDown className="h-3 w-3 text-green-600" />
                            ) : (
                              <TrendingUp className="h-3 w-3 text-red-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="yearly" className="space-y-6">
            {/* Add the Yearly Chart */}
            {yearlyData[0]?.details.length > 0 && (
              <YearlyChart data={yearlyData} theme={theme} />
            )}

            {yearlyData.map((year, yearIndex) => (
              <Card key={yearIndex} className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-semibold ${themeClasses.textPrimary}`}>{year.period}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                        {year.avgLevel.toFixed(1)} ppm avg
                      </span>
                      {year.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                        {year.items}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>Items Scanned</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                        {year.avgLevel.toFixed(1)}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>Avg ppm</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {year.details.map((month, monthIndex) => (
                      <div key={monthIndex} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>{month.date}</span>
                        <div className="flex items-center space-x-3">
                          <span className={`text-sm ${themeClasses.textSecondary}`}>{month.items} items</span>
                          <span className={`text-sm ${themeClasses.textSecondary}`}>{month.avgLevel.toFixed(1)} ppm</span>
                          {month.trend === "down" ? (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}