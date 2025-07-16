"use client"

import { X, Clock, Award, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NotificationPanelProps {
  theme: string
  onClose: () => void
}

export function NotificationPanel({ theme, onClose }: NotificationPanelProps) {
  const themeClasses = {
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    textPrimary: theme === "light" ? "text-[#4A5D3A]" : "text-[#E8F0E5]",
    textSecondary: theme === "light" ? "text-[#6B7D5A]" : "text-[#B8C8B5]",
    textWhite: "text-white",
  }

  const notifications = [
    {
      id: 1,
      type: "achievement",
      title: "New Achievement Unlocked!",
      message: "You've completed 7 days of scanning",
      time: "2 min ago",
      icon: <Award className="h-4 w-4 text-yellow-500" />,
    },
    {
      id: 2,
      type: "improvement",
      title: "Great Progress!",
      message: "Your microplastic levels decreased by 15%",
      time: "1 hour ago",
      icon: <TrendingDown className="h-4 w-4 text-green-500" />,
    },
    {
      id: 3,
      type: "reminder",
      title: "Daily Scan Reminder",
      message: "Don't forget to scan your lunch packaging",
      time: "3 hours ago",
      icon: <Clock className="h-4 w-4 text-blue-500" />,
    },
  ]

  return (
    <div className="absolute top-12 right-0 z-50">
      <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-4 w-80 shadow-xl`}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Notifications</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className={`h-4 w-4 ${themeClasses.textPrimary}`} />
            </Button>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl">
                <div className="mt-0.5">{notification.icon}</div>
                <div className="flex-1">
                  <p className={`font-medium ${themeClasses.textPrimary} text-sm`}>{notification.title}</p>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>{notification.message}</p>
                  <p className={`text-xs ${themeClasses.textSecondary} opacity-70`}>{notification.time}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" className={`w-full mt-3 ${themeClasses.textPrimary} text-sm`}>
            View All Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
