"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Lightbulb, Star, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { getUserStats, getAnalysisStats, AnalysisStatistics, UserStats } from "@/lib/api"

export default function RecommendationsPage() {
  const { theme } = useTheme()
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [analysisStats, setAnalysisStats] = useState<AnalysisStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stats, analysis] = await Promise.all([
          getUserStats(),
          getAnalysisStats()
        ]);
        setUserStats(stats);
        setAnalysisStats(analysis);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Theme classes
  const themeClasses = {
    background: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#2D3B2A]",
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    cardBgAlt: theme === "light" ? "bg-[#D4C4B0]" : "bg-[#4A5A47]",
    textPrimary: theme === "light" ? "text-[#4A5D3A]" : "text-[#E8F0E5]",
    textSecondary: theme === "light" ? "text-[#6B7D5A]" : "text-[#B8C8B5]",
    textWhite: "text-white",
    buttonPrimary: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#5A6B57]",
    buttonHover: theme === "light" ? "hover:bg-[#7A8B69]" : "hover:bg-[#4A5B47]",
  }

  // Generate recommendations based on analysis stats
  const generateRecommendations = () => {
    if (!analysisStats) return [];

    const recommendations = [];

    // High impact recommendations based on risk distribution
    // Add null checks for nested properties
    if (analysisStats.risk_distribution?.high > 0) {
      recommendations.push({
        category: "High Impact",
        icon: "🚫",
        title: "Avoid High-Risk Foods",
        description: `${analysisStats.risk_distribution.high} of your recently analyzed foods showed high microplastic levels.`,
        tips: ["Choose fresh alternatives", "Check packaging materials", "Store in glass containers"],
        completed: false,
      });
    }

    // Add recommendations based on common items
    // Check if common_items exists and is an array
    if (analysisStats.common_items && Array.isArray(analysisStats.common_items)) {
      analysisStats.common_items.forEach(item => {
        if (item?.average_risk === 'HIGH') {
          recommendations.push({
            category: "High Impact",
            icon: "🔄",
            title: `Replace ${item.food || 'this item'}`,
            description: `This item appears frequently in your diet with high microplastic levels.`,
            tips: [
              "Find alternative products",
              "Check for glass-packaged options",
              "Consider making fresh at home"
            ],
            completed: false,
          });
        }
      });
    }

    // Add general recommendations
    recommendations.push(
      {
        category: "Medium Impact",
        icon: "💧",
        title: "Water Filtration",
        description: "Install a water filtration system to reduce microplastic exposure.",
        tips: ["Research filter types", "Regular maintenance", "Use filtered water for cooking"],
        completed: false,
      },
      {
        category: "Low Impact",
        icon: "📝",
        title: "Track Your Progress",
        description: "Keep monitoring your food choices to reduce exposure.",
        tips: ["Regular scanning", "Note alternatives", "Check improvements"],
        completed: false,
      }
    );

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "High Impact":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "Medium Impact":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "Low Impact":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
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
            <h1 className={`text-xl font-semibold ${themeClasses.textWhite}`}>Recommendations</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Progress Summary */}
        <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-6`}>
          <CardContent className="p-0">
            <div className="flex items-center space-x-3 mb-4">
              <Star className={`h-5 w-5 ${themeClasses.buttonPrimary.replace("bg-", "text-")}`} />
              <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Your Progress</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                  {userStats?.completed_recommendations || 0}
                </div>
                <div className={`text-xs ${themeClasses.textSecondary}`}>Completed</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                  {userStats?.pending_recommendations || 0}
                </div>
                <div className={`text-xs ${themeClasses.textSecondary}`}>In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className={`mt-4 ${themeClasses.textWhite}`}>Loading recommendations...</p>
          </div>
        )}

        {/* Recommendations List */}
        {!loading && (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
                <CardContent className="p-0">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{rec.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-semibold ${themeClasses.textPrimary} text-sm`}>{rec.title}</h4>
                          {rec.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rec.category)}`}>
                          {rec.category}
                        </span>
                      </div>

                      <p className={`text-sm ${themeClasses.textSecondary} mb-3`}>{rec.description}</p>

                      <div className="space-y-2">
                        <h5 className={`text-xs font-medium ${themeClasses.textPrimary} uppercase tracking-wide`}>
                          Action Steps:
                        </h5>
                        {rec.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex items-start space-x-2">
                            <div className={`w-1.5 h-1.5 ${themeClasses.buttonPrimary} rounded-full mt-2`}></div>
                            <p className={`text-xs ${themeClasses.textSecondary}`}>{tip}</p>
                          </div>
                        ))}
                      </div>

                      {!rec.completed && (
                        <Button
                          size="sm"
                          className={`mt-4 ${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl`}
                        >
                          Mark as Done
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Personalized Tip based on Analysis */}
        {analysisStats && (
          <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-6`}>
            <CardContent className="p-0">
              <div className="flex items-center space-x-3 mb-3">
                <Lightbulb className={`h-5 w-5 ${themeClasses.buttonPrimary.replace("bg-", "text-")}`} />
                <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Analysis Insights</h3>
              </div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {analysisStats.common_items?.[0]?.food
                  ? `Your most frequently analyzed food is ${analysisStats.common_items[0].food} with ${
                      analysisStats.common_items[0].average_risk?.toLowerCase() || 'unknown'
                    } risk levels. Consider alternatives to reduce exposure.`
                  : 'Start analyzing more foods to get personalized recommendations!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}