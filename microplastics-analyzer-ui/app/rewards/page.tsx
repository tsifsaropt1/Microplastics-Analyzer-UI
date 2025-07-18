"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Trophy, Gift, Zap, Target, Share2, Copy, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RewardsPage() {
  const { theme } = useTheme()
  const router = useRouter()
  const [coins, setCoins] = useState(150)
  const [streak, setStreak] = useState(7)
  const [gameActive, setGameActive] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [showShareModal, setShowShareModal] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  
  // Real data states
  const [actualScansToday, setActualScansToday] = useState(0)
  const [microplasticReduction, setMicroplasticReduction] = useState(68)
  const [cleanStreakDays, setCleanStreakDays] = useState(23)
  const [purchasedItems, setPurchasedItems] = useState<string[]>([])
  const [claimedAchievements, setClaimedAchievements] = useState<number[]>([])

  const themeClasses = {
    background: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#2D3B2A]",
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    cardBgAlt: theme === "light" ? "bg-[#D4C4B0]" : "bg-[#4A5A47]",
    textPrimary: theme === "light" ? "text-[#4A5D3A]" : "text-[#E8F0E5]",
    textSecondary: theme === "light" ? "text-[#6B7D5A]" : "text-[#B8C8B5]",
    textWhite: "text-white",
    buttonPrimary: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#5A6B57)",
    buttonHover: theme === "light" ? "hover:bg-[#7A8B69]" : "hover:bg-[#4A5B47]",
  }

  // Check for scan completion from localStorage on component mount
  useEffect(() => {
    const checkScanCompletion = () => {
      const scanCompleted = localStorage.getItem('scanCompleted')
      if (scanCompleted === 'true') {
        setActualScansToday(prev => prev + 1)
        localStorage.removeItem('scanCompleted')
      }
    }

    checkScanCompletion()
    
    const interval = setInterval(checkScanCompletion, 1000)
    return () => clearInterval(interval)
  }, [])

  // Function to navigate to scan page
  const handleScanNavigation = () => {
    router.push('/scan')
  }

  // Simulate real data updates
  useEffect(() => {
    const updateRealData = () => {
      const reductionProgress = Math.min(100, microplasticReduction + Math.random() * 2)
      setMicroplasticReduction(reductionProgress)
      
      const streakProgress = Math.min(30, cleanStreakDays + (Math.random() > 0.7 ? 1 : 0))
      setCleanStreakDays(streakProgress)
    }

    const interval = setInterval(updateRealData, 30000)
    return () => clearInterval(interval)
  }, [microplasticReduction, cleanStreakDays])

  const achievements = [
    { id: 1, title: "First Scan", description: "Complete your first scan", reward: 10, unlocked: true },
    { id: 2, title: "Week Warrior", description: "Scan for 7 consecutive days", reward: 25, unlocked: true },
    {
      id: 3,
      title: "Eco Champion",
      description: "Reduce microplastics by 25%",
      reward: 50,
      unlocked: microplasticReduction >= 25,
      progress: microplasticReduction,
      target: 25,
    },
    {
      id: 4,
      title: "Clean Streak",
      description: "Maintain low levels for 30 days",
      reward: 100,
      unlocked: cleanStreakDays >= 30,
      progress: cleanStreakDays,
      target: 30,
    },
  ]

  const [dailyChallenges, setDailyChallenges] = useState([
    {
      id: 1,
      title: "Scan 3 items",
      description: "Complete 3 package scans today",
      reward: 15,
      completed: false,
      progress: actualScansToday,
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
    { 
      id: 3, 
      title: "Share Progress", 
      description: "Share your weekly progress", 
      reward: 10, 
      completed: false,
      isShare: true,
    },
  ])

  // Update daily challenges when scan count changes
  useEffect(() => {
    setDailyChallenges(prev => 
      prev.map(challenge => 
        challenge.id === 1 
          ? { ...challenge, progress: actualScansToday, completed: actualScansToday >= 3 && !challenge.completed }
          : challenge
      )
    )
  }, [actualScansToday])

  const memoryCards = [
    { id: 1, content: "🥛", matched: false },
    { id: 2, content: "🥛", matched: false },
    { id: 3, content: "🥤", matched: false },
    { id: 4, content: "🥤", matched: false },
    { id: 5, content: "🍱", matched: false },
    { id: 6, content: "🍱", matched: false },
  ]

  const [cards, setCards] = useState(memoryCards.sort(() => Math.random() - 0.5))

  const rewardShopItems = [
    { 
      id: "premium_analysis", 
      name: "Premium Analysis", 
      cost: 100, 
      description: "Detailed microplastic breakdown",
      benefits: ["Advanced AI scanning", "Detailed health impact", "Personalized recommendations"]
    },
    { 
      id: "custom_avatar", 
      name: "Custom Avatar", 
      cost: 50, 
      description: "Personalize your profile",
      benefits: ["Unique avatar styles", "Profile customization", "Special badges"]
    },
    { 
      id: "weekly_report", 
      name: "Weekly Report", 
      cost: 75, 
      description: "Detailed health insights",
      benefits: ["Weekly health summary", "Trend analysis", "Expert recommendations"]
    },
    { 
      id: "eco_badge", 
      name: "Eco Warrior Badge", 
      cost: 30, 
      description: "Show your commitment",
      benefits: ["Exclusive profile badge", "Social recognition", "Leaderboard boost"]
    },
  ]

  // Function to claim achievement rewards
  const claimAchievement = (achievement: typeof achievements[0]) => {
    if (achievement.unlocked && !claimedAchievements.includes(achievement.id)) {
      setCoins(prev => prev + achievement.reward)
      setClaimedAchievements(prev => [...prev, achievement.id])
      
      // Show success message
      const messages = {
        1: "🎉 First scan completed! You're on your way to a healthier lifestyle!",
        2: "🔥 Week warrior! Your consistency is paying off!",
        3: "🌟 Eco Champion! You're making a real difference!",
        4: "💪 Clean streak master! Your dedication is inspiring!"
      }
      
      alert(messages[achievement.id as keyof typeof messages] || "Achievement unlocked!")
    }
  }

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
    setDailyChallenges(prev => 
      prev.map(challenge => 
        challenge.id === 2 ? { ...challenge, completed: true } : challenge
      )
    )
  }

  const handleShareClick = () => {
    setShowShareModal(true)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const claimShareReward = () => {
    setCoins((prev) => prev + 10)
    setDailyChallenges(prev => 
      prev.map(challenge => 
        challenge.id === 3 ? { ...challenge, completed: true } : challenge
      )
    )
    setShowShareModal(false)
  }

  const claimScanReward = () => {
    if (actualScansToday >= 3) {
      setCoins((prev) => prev + 15)
      setDailyChallenges(prev => 
        prev.map(challenge => 
          challenge.id === 1 ? { ...challenge, completed: true } : challenge
        )
      )
    }
  }

  const purchaseRewardItem = (item: typeof rewardShopItems[0]) => {
    if (coins >= item.cost && !purchasedItems.includes(item.id)) {
      setCoins(prev => prev - item.cost)
      setPurchasedItems(prev => [...prev, item.id])
      
      // Enhanced functionality for each item
      const itemActions = {
        premium_analysis: () => {
          alert(`🔬 Premium Analysis Unlocked!\n\n✅ ${item.benefits.join('\n✅ ')}\n\nYour next scan will include detailed microplastic analysis!`)
        },
        custom_avatar: () => {
          alert(`🎨 Custom Avatar Unlocked!\n\n✅ ${item.benefits.join('\n✅ ')}\n\nVisit your profile to customize your avatar!`)
        },
        weekly_report: () => {
          alert(`📊 Weekly Report Unlocked!\n\n✅ ${item.benefits.join('\n✅ ')}\n\nYou'll receive your first report next Monday!`)
        },
        eco_badge: () => {
          alert(`🏆 Eco Warrior Badge Unlocked!\n\n✅ ${item.benefits.join('\n✅ ')}\n\nYour badge is now displayed on your profile!`)
        }
      }
      
      itemActions[item.id as keyof typeof itemActions]?.()
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
                    <div className="flex justify-end">
                      <Button
                        onClick={startMemoryGame}
                        size="sm"
                        className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl`}
                      >
                        Play Game
                      </Button>
                    </div>
                  ) : challenge.isShare ? (
                    <div className="flex justify-end">
                      {challenge.completed ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                          <span className={`text-xs ${themeClasses.textSecondary}`}>Completed</span>
                        </div>
                      ) : (
                        <Button
                          onClick={handleShareClick}
                          size="sm"
                          className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl flex items-center space-x-2`}
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </Button>
                      )}
                    </div>
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
                      <div className="flex items-center justify-between">
                        <p className={`text-xs ${themeClasses.textSecondary}`}>
                          {challenge.progress}/{challenge.target}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleScanNavigation}
                            size="sm"
                            className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl text-xs px-3 py-1`}
                          >
                            Scan Item
                          </Button>
                          {challenge.progress! >= challenge.target! && !challenge.completed && (
                            <Button
                              onClick={claimScanReward}
                              size="sm"
                              className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl text-xs px-3 py-1`}
                            >
                              Claim Reward
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6 w-full max-w-sm`}>
              <CardContent className="p-0">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                    <Share2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className={`font-semibold ${themeClasses.textPrimary} text-lg`}>Share Your Progress</h3>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Copy the link below to share your eco-friendly journey with friends!
                  </p>
                  
                  <div className="flex items-center space-x-2 p-3 bg-white/10 rounded-xl">
                    <input
                      type="text"
                      value={typeof window !== 'undefined' ? window.location.href : ''}
                      readOnly
                      className={`flex-1 bg-transparent text-sm ${themeClasses.textSecondary} outline-none`}
                    />
                    <Button
                      onClick={handleCopyUrl}
                      size="sm"
                      className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-lg px-3`}
                    >
                      {urlCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowShareModal(false)}
                      variant="outline"
                      className={`flex-1 ${themeClasses.textSecondary} border-gray-300 hover:bg-white/10`}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={claimShareReward}
                      disabled={!urlCopied}
                      className={`flex-1 ${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} disabled:opacity-50`}
                    >
                      Claim Reward
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    <div className="flex-1">
                      <p className={`font-medium ${themeClasses.textPrimary} text-sm`}>{achievement.title}</p>
                      <p className={`text-xs ${themeClasses.textSecondary}`}>{achievement.description}</p>
                      {!achievement.unlocked && achievement.progress !== undefined && achievement.target !== undefined && (
                        <div className="mt-2">
                          <Progress value={(achievement.progress / achievement.target) * 100} className="h-1 w-20" />
                          <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                            {achievement.progress}/{achievement.target} {achievement.id === 4 ? 'days' : '%'}
                          </p>
                        </div>
                      )}
                      {claimedAchievements.includes(achievement.id) && (
                        <p className={`text-xs text-green-500 mt-1`}>✓ Claimed</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {achievement.unlocked && !claimedAchievements.includes(achievement.id) ? (
                      <Button
                        onClick={() => claimAchievement(achievement)}
                        size="sm"
                        className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl`}
                      >
                        Claim +{achievement.reward} 🪙
                      </Button>
                    ) : !achievement.unlocked ? (
                      <div className="flex items-center space-x-1 opacity-50">
                        <span className="text-sm text-yellow-600 font-medium">+{achievement.reward}</span>
                        <span className="text-sm">🪙</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-yellow-600 font-medium">+{achievement.reward}</span>
                        <span className="text-sm">🪙</span>
                      </div>
                    )}
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
              {rewardShopItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className={`font-medium ${themeClasses.textPrimary} text-sm`}>{item.name}</p>
                      {purchasedItems.includes(item.id) && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Owned</span>
                      )}
                    </div>
                    <p className={`text-xs ${themeClasses.textSecondary} mb-2`}>{item.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.benefits.slice(0, 2).map((benefit, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${themeClasses.cardBgAlt} ${themeClasses.textSecondary}`}
                        >
                          {benefit}
                        </span>
                      ))}
                      {item.benefits.length > 2 && (
                        <span className={`text-xs ${themeClasses.textSecondary}`}>
                          +{item.benefits.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3">
                    <Button
                      onClick={() => purchaseRewardItem(item)}
                      size="sm"
                      disabled={coins < item.cost || purchasedItems.includes(item.id)}
                      className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-xl disabled:opacity-50`}
                    >
                      {purchasedItems.includes(item.id) ? "Owned" : `${item.cost} 🪙`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}