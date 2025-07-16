"use client"

import { ArrowLeft, Calendar, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

export default function HistoryPage() {
  const { theme } = useTheme()

  const themeClasses = {
    background: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#2D3B2A]",
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    cardBgAlt: theme === "light" ? "bg-[#D4C4B0]" : "bg-[#4A5A47]",
    textPrimary: theme === "light" ? "text-[#4A5D3A]" : "text-[#E8F0E5]",
    textSecondary: theme === "light" ? "text-[#6B7D5A]" : "text-[#B8C8B5]",
    textWhite: "text-white",
    buttonPrimary: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#5A6B57]",
  }

  const weeklyData = [
    {
      period: "This Week",
      items: 9,
      avgLevel: 21.4,
      trend: "down",
      details: [
        {
          date: "Today, March 15",
          items: [
            { name: "Yogurt Container", level: 12, risk: "Low", time: "2:30 PM" },
            { name: "Cereal Box", level: 8, risk: "Low", time: "8:00 AM" },
          ],
        },
        { date: "Yesterday, March 14", items: [{ name: "Frozen Meal", level: 45, risk: "High", time: "7:00 PM" }] },
      ],
    },
  ]

  const monthlyData = [
    {
      period: "March 2024",
      items: 34,
      avgLevel: 18.7,
      trend: "down",
      details: [
        { date: "Week 3 (Mar 15-21)", avgLevel: 21.4, items: 9, trend: "down" },
        { date: "Week 2 (Mar 8-14)", avgLevel: 19.2, items: 12, trend: "up" },
        { date: "Week 1 (Mar 1-7)", avgLevel: 15.3, items: 13, trend: "down" },
      ],
    },
    {
      period: "February 2024",
      items: 28,
      avgLevel: 22.1,
      trend: "up",
      details: [
        { date: "Week 4 (Feb 22-28)", avgLevel: 24.8, items: 8, trend: "up" },
        { date: "Week 3 (Feb 15-21)", avgLevel: 21.5, items: 7, trend: "down" },
        { date: "Week 2 (Feb 8-14)", avgLevel: 20.9, items: 6, trend: "down" },
        { date: "Week 1 (Feb 1-7)", avgLevel: 21.2, items: 7, trend: "up" },
      ],
    },
  ]

  const yearlyData = [
    {
      period: "2024",
      items: 156,
      avgLevel: 19.8,
      trend: "down",
      details: [
        { date: "March", avgLevel: 18.7, items: 34, trend: "down" },
        { date: "February", avgLevel: 22.1, items: 28, trend: "up" },
        { date: "January", avgLevel: 19.2, items: 94, trend: "down" },
      ],
    },
  ]

  const getRiskColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "High":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

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
                    <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>9</div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>Items Scanned</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                      21.4
                    </div>
                    <div className={`text-xs ${themeClasses.textSecondary}`}>Avg ppm</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Details */}
            {weeklyData[0].details.map((day, dayIndex) => (
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
                            <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>{item.level} ppm</p>
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
            ))}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            {monthlyData.map((month, monthIndex) => (
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
                        {month.avgLevel}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary}`}>Avg ppm</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {month.details.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className={`text-sm ${themeClasses.textPrimary}`}>{week.date}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${themeClasses.textSecondary}`}>{week.avgLevel} ppm</span>
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
            ))}
          </TabsContent>

          <TabsContent value="yearly" className="space-y-6">
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
                        {year.avgLevel}
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
                          <span className={`text-sm ${themeClasses.textSecondary}`}>{month.avgLevel} ppm</span>
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
