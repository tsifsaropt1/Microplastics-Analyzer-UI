"use client"

import { useState } from "react"
import { ArrowLeft, Trophy, Gift, Zap, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

export default function RewardsPage() {
  const { theme } = useTheme()
  const [coins, setCoins] = useState(150)
  const [streak, setStreak] = useState(7)
  const [gameActive, setGameActive] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [selectedCards, setSelectedCards] = useState<number[]>([])

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

  const achievements = [
    { id: 1, title: "First Scan", description: "Complete your first scan", reward: 10, unlocked: true },
    { id: 2, title: "Week Warrior", description: "Scan for 7 consecutive days", reward: 25, unlocked: true },
    {
      id: 3,
      title: "Eco Champion",
      description: "Reduce microplastics by 25%",
      reward: 50,
      unlocked: false,
      progress: 68,
    },
    {
      id: 4,
      title: "Clean Streak",
      description: "Maintain low levels for 30 days",
      reward: 100,
      unlocked: false,
      progress: 23,
    },
  ]

  const dailyChallenges = [
    {
      id: 1,
      title: "Scan 3 items",
      description: "Complete 3 package scans today",
      reward: 15,
      completed: false,
      progress: 2,
      target: 3,
    },
    {
      id: 2,
      title: "Memory Game",
      description: "Match microplastic facts",
      reward: 20,
      completed: false,
      isGame: true,
    },
    { id: 3, title: "Share Progress", description: "Share your weekly progress", reward: 10, completed: true },
  ]

  const memoryCards = [
    { id: 1, content: "🥛", matched: false },
    { id: 2, content: "🥛", matched: false },
    { id: 3, content: "🥤", matched: false },
    { id: 4, content: "🥤", matched: false },
    { id: 5, content: "🍱", matched: false },
    { id: 6, content: "🍱", matched: false },
  ]

  const [cards, setCards] = useState(memoryCards.sort(() => Math.random() - 0.5))

  const handleCardClick = (cardId: number) => {
    if (selectedCards.length < 2 && !selectedCards.includes(cardId)) {
      const newSelected = [...selectedCards, cardId]
      setSelectedCards(newSelected)

      if (newSelected.length === 2) {
        const [first, second] = newSelected
        const firstCard = cards.find((c) => c.id === first)
        const secondCard = cards.find((c) => c.id === second)

        if (firstCard?.content === secondCard?.content) {
          setCards((prev) => prev.map((c) => (c.id === first || c.id === second ? { ...c, matched: true } : c)))
          setGameScore((prev) => prev + 10)
          setSelectedCards([])
        } else {
          setTimeout(() => setSelectedCards([]), 1000)
        }
      }
    }
  }

  const startMemoryGame = () => {
    setGameActive(true)
    setGameScore(0)
    setSelectedCards([])
    setCards(memoryCards.sort(() => Math.random() - 0.5))
  }

  const completeGame = () => {
    setCoins((prev) => prev + 20)
    setGameActive(false)
    // Mark challenge as completed
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
            <h1 className={`text-xl font-semibold ${themeClasses.textWhite}`}>Rewards & Games</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Coins & Streak */}
        <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-6`}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xl">🪙</span>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{coins}</p>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>EcoCoins</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className={`text-xl font-bold ${themeClasses.textPrimary}`}>{streak}</span>
                </div>
                <p className={`text-xs ${themeClasses.textSecondary}`}>Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Challenges */}
        <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
          <CardContent className="p-0">
            <div className="flex items-center space-x-3 mb-4">
              <Target className={`h-5 w-5 ${themeClasses.buttonPrimary.replace("bg-", "text-")}`} />
              <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Daily Challenges</h3>
            </div>
            <div className="space-y-4">
              {dailyChallenges.map((challenge) => (
                <div key={challenge.id} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-medium ${themeClasses.textPrimary} text-sm`}>{challenge.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-yellow-600 font-medium">+{challenge.reward}</span>
                      <span className="text-xs">🪙</span>
                    </div>
                  </div>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-3`}>{challenge.description}</p>

                  {challenge.isGame ? (
                    <Button
                      onClick={startMemoryGame}
                      size="sm"
                      className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl`}
                    >
                      Play Game
                    </Button>
                  ) : challenge.completed ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                      <span className={`text-xs ${themeClasses.textSecondary}`}>Completed</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Progress value={(challenge.progress! / challenge.target!) * 100} className="h-2" />
                      <p className={`text-xs ${themeClasses.textSecondary}`}>
                        {challenge.progress}/{challenge.target}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Memory Game */}
        {gameActive && (
          <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Memory Game</h3>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${themeClasses.textSecondary}`}>Score:</span>
                  <span className={`font-bold ${themeClasses.textPrimary}`}>{gameScore}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.matched || selectedCards.includes(card.id)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                      card.matched || selectedCards.includes(card.id)
                        ? `${themeClasses.cardBgAlt}`
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    {card.matched || selectedCards.includes(card.id) ? card.content : "?"}
                  </button>
                ))}
              </div>

              {cards.every((c) => c.matched) && (
                <Button
                  onClick={completeGame}
                  className={`w-full ${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl`}
                >
                  Claim Reward (+20 🪙)
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
          <CardContent className="p-0">
            <div className="flex items-center space-x-3 mb-4">
              <Trophy className={`h-5 w-5 ${themeClasses.buttonPrimary.replace("bg-", "text-")}`} />
              <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Achievements</h3>
            </div>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.unlocked ? "bg-yellow-500" : themeClasses.cardBgAlt
                      }`}
                    >
                      <Trophy
                        className={`h-5 w-5 ${achievement.unlocked ? "text-white" : themeClasses.textSecondary}`}
                      />
                    </div>
                    <div>
                      <p className={`font-medium ${themeClasses.textPrimary} text-sm`}>{achievement.title}</p>
                      <p className={`text-xs ${themeClasses.textSecondary}`}>{achievement.description}</p>
                      {!achievement.unlocked && achievement.progress && (
                        <div className="mt-2">
                          <Progress value={achievement.progress} className="h-1 w-20" />
                          <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>{achievement.progress}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-yellow-600 font-medium">+{achievement.reward}</span>
                      <span className="text-sm">🪙</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards Shop */}
        <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
          <CardContent className="p-0">
            <div className="flex items-center space-x-3 mb-4">
              <Gift className={`h-5 w-5 ${themeClasses.buttonPrimary.replace("bg-", "text-")}`} />
              <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Rewards Shop</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Premium Analysis", cost: 100, description: "Detailed microplastic breakdown" },
                { name: "Custom Avatar", cost: 50, description: "Personalize your profile" },
                { name: "Weekly Report", cost: 75, description: "Detailed health insights" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div>
                    <p className={`font-medium ${themeClasses.textPrimary} text-sm`}>{item.name}</p>
                    <p className={`text-xs ${themeClasses.textSecondary}`}>{item.description}</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={coins < item.cost}
                    className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl`}
                  >
                    {item.cost} 🪙
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
