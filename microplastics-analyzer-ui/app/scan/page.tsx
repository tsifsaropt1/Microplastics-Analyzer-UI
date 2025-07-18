"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Camera, Scan, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"
import Image from "next/image"
import { analyzeFood, FoodItem } from "@/lib/api"

interface ScanResult {
  food?: string;
  quantity?: string;
  calories?: string;
  microplastics?: string;
  risk?: string;
  recommendations?: string[];
}

interface ScanProgress {
  totalScans: number;
  completedScans: number;
  dailyGoal: number;
  lastScanDate: string;
  scanHistory: Array<{
    date: string;
    food: string;
    microplastics: string;
    risk: string;
  }>;
}

export default function ScanPage() {
  const { theme } = useTheme()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    totalScans: 0,
    completedScans: 0,
    dailyGoal: 3,
    lastScanDate: '',
    scanHistory: []
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const themeClasses = {
    background: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#2D3B2A]",
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    cardBgAlt: theme === "light" ? "bg-[#D4C4B0]" : "bg-[#4A5A47]",
    textPrimary: theme === "light" ? "text-[#4A5D3A]" : "text-[#E8F0E5]",
    textSecondary: theme === "light" ? "text-[#6B7D5A]" : "text-[#B8C8B5]",
    textWhite: "text-white",
    buttonPrimary: theme === "light" ? "bg-[#8B9D7A]" : "bg-[#5A6B57]",
    buttonHover: theme === "light" ? "hover:bg-[#7A8B69]" : "hover:bg-[#4A5B47]",
    progressBg: theme === "light" ? "bg-[#E5E0D8]" : "bg-[#2A3A27]",
    borderColor: theme === "light" ? "border-[#8B9D7A]" : "border-[#5A6B57]",
  }

  // Load progress from localStorage on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('scanProgress')
    if (savedProgress) {
      setScanProgress(JSON.parse(savedProgress))
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('scanProgress', JSON.stringify(scanProgress))
  }, [scanProgress])

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  // Function to update scan progress
  const updateScanProgress = (result: ScanResult) => {
    const today = new Date().toISOString().split('T')[0]
    const isNewDay = scanProgress.lastScanDate !== today
    
    setScanProgress(prev => {
      const newHistory = [...prev.scanHistory, {
        date: today,
        food: result.food || 'Unknown',
        microplastics: result.microplastics || '0 mg/kg',
        risk: result.risk || 'UNKNOWN'
      }]

      // Keep only last 30 scans
      const recentHistory = newHistory.slice(-30)

      // Count today's scans
      const todayScans = recentHistory.filter(scan => scan.date === today).length

      return {
        ...prev,
        totalScans: prev.totalScans + 1,
        completedScans: isNewDay ? 1 : Math.min(prev.completedScans + 1, prev.dailyGoal),
        lastScanDate: today,
        scanHistory: recentHistory
      }
    })
  }

  // Check if daily goal is reached
  const isDailyGoalReached = () => {
    const today = new Date().toISOString().split('T')[0]
    if (scanProgress.lastScanDate === today) {
      return scanProgress.completedScans >= scanProgress.dailyGoal
    }
    return false
  }

  // Get today's scan count
  const getTodayScanCount = () => {
    const today = new Date().toISOString().split('T')[0]
    return scanProgress.scanHistory.filter(scan => scan.date === today).length
  }

  // Open camera function
  const openCamera = async () => {
    try {
      console.log('Requesting camera access...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      console.log('Camera access granted, setting up stream...')
      setStream(mediaStream)
      setIsCameraOpen(true)
      
      // Wait for next tick to ensure state is updated
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          console.log('Video stream attached to video element')
        }
      }, 100)
      
    } catch (error) {
      console.error('Error accessing camera:', error)
      let errorMessage = 'Unable to access camera. '
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.'
      } else {
        errorMessage += 'Please check your camera permissions.'
      }
      
      alert(errorMessage)
    }
  }

  // Close camera function
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setStream(null)
    setIsCameraOpen(false)
  }

  // Capture photo function
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')

      if (context && video.videoWidth && video.videoHeight) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw the video frame to canvas (flip back if mirrored)
        context.save()
        context.scale(-1, 1) // Remove mirror effect for final image
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
        context.restore()
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' })
            setSelectedFile(file)
            
            // Create data URL for preview
            const reader = new FileReader()
            reader.onload = (e) => {
              setUploadedImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
            
            console.log('Photo captured successfully')
          }
        }, 'image/jpeg', 0.8)
      } else {
        console.error('Video not ready or canvas context not available')
        alert('Camera not ready. Please wait a moment and try again.')
      }
    }
    
    closeCamera()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleScan = async () => {
    if (!selectedFile) return

    setIsScanning(true)
    setScanResult(null)

    try {
      console.log('Sending image for analysis...');
      const result = await analyzeFood(selectedFile)
      console.log('Received analysis result:', result);
      
      if (result.success && result.parsed_results) {
        console.log('Parsed results:', result.parsed_results);
        
        // Check if we have items in parsed_results
        if (result.parsed_results && result.parsed_results.length > 0) {
          const firstItem = result.parsed_results[0];
          console.log('Processing first item:', firstItem);
          
          // Convert microplastics string to number (e.g., "5.2 mg/kg" -> 5.2)
          const microplasticsValue = parseFloat(firstItem.microplastics?.split(' ')[0] || '0');
          
          const scanResultData = {
            food: firstItem.food || 'Unknown Food',
            quantity: firstItem.quantity || 'N/A',
            calories: firstItem.calories || 'N/A',
            microplastics: firstItem.microplastics || '0 mg/kg',
            risk: firstItem.risk || 'MEDIUM',
            recommendations: [
              "Consider glass alternatives",
              `Avoid ${firstItem.food?.toLowerCase() || 'processed foods'} in plastic containers`,
              "Choose fresh options when possible",
              microplasticsValue > 5 ? "Switch to alternative products" : "Continue monitoring levels",
            ]
          };

          setScanResult(scanResultData);
          
          // Update scan progress
          updateScanProgress(scanResultData);
          
          // Set scan completion flag
          localStorage.setItem('scanCompleted', 'true');
          
        } else {
          console.error('No items in parsed_results');
          throw new Error('No food items detected in the image');
        }
      } else {
        console.error('Analysis failed:', result.error);
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      setScanResult({
        food: 'Analysis Error',
        risk: 'Unknown',
        microplastics: '0 mg/kg',
        recommendations: [
          'Analysis failed. Please check:',
          '1. Backend server is running (http://localhost:8000)',
          '2. Image is clear and contains food items',
          '3. Try scanning again with a different image'
        ]
      });
    } finally {
      setIsScanning(false)
    }
  }

  const getRiskColor = (level: string = '') => {
    switch (level.toUpperCase()) {
      case 'LOW':
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case 'MEDIUM':
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case 'HIGH':
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getMicroplasticLevel = (value: string = '0') => {
    // Convert "X.X mg/kg" to a number between 0-100 for the progress bar
    const number = parseFloat(value.split(' ')[0]);
    // Assuming values above 10 mg/kg are very high, scale accordingly
    return Math.min(Math.round((number / 10) * 100), 100);
  }

  const getProgressPercentage = () => {
    const today = new Date().toISOString().split('T')[0]
    const todayScans = scanProgress.lastScanDate === today ? 
      scanProgress.scanHistory.filter(scan => scan.date === today).length : 0
    return Math.min((todayScans / scanProgress.dailyGoal) * 100, 100)
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
            <h1 className={`text-xl font-semibold ${themeClasses.textWhite}`}>Scan Package</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div 
            className="fixed inset-0 bg-black z-[9999] flex flex-col"
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100vw', 
              height: '100vh',
              zIndex: 9999 
            }}
          >
            {/* Camera Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
              <h2 className="text-white text-lg font-semibold">Take Photo</h2>
              <Button
                onClick={closeCamera}
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full w-10 h-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Camera View */}
            <div className="flex-1 relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }} // Mirror effect for selfie-style
              />
              
              {/* Camera overlay/guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white/30 rounded-2xl w-80 h-60 flex items-center justify-center">
                  <span className="text-white/70 text-sm">Position food package here</span>
                </div>
              </div>
            </div>
            
            {/* Camera Controls */}
            <div className="bg-black/50 p-6 flex items-center justify-center">
              <Button
                onClick={capturePhoto}
                className="bg-white hover:bg-gray-200 text-black rounded-full w-20 h-20 p-0 shadow-lg"
              >
                <Camera className="h-10 w-10" />
              </Button>
            </div>
          </div>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Daily Progress Card */}
        <Card className={`${themeClasses.cardBg} border-0 rounded-3xl p-6`}>
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Today's Progress</h3>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {getTodayScanCount()} of {scanProgress.dailyGoal} scans completed
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDailyGoalReached() ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              }`}>
                {isDailyGoalReached() ? 'Complete!' : 'In Progress'}
              </div>
            </div>
            
            <div className={`w-full ${themeClasses.progressBg} rounded-full h-3`}>
              <div
                className={`${themeClasses.buttonPrimary} h-3 rounded-full transition-all duration-300`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            
            <div className="mt-2 text-right">
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {Math.round(getProgressPercentage())}% Complete
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card className={`${themeClasses.cardBg} border-0 rounded-3xl p-6`}>
          <CardContent className="p-0">
            <div className="text-center space-y-4">
              {uploadedImage ? (
                <div className="space-y-4">
                  <Image
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded packaging"
                    width={200}
                    height={150}
                    className="mx-auto rounded-2xl object-cover"
                  />
                  <div className="flex space-x-2 justify-center">
                    <Button
                      onClick={openCamera}
                      variant="outline"
                      size="sm"
                      className={`${themeClasses.borderColor} ${themeClasses.buttonPrimary.replace("bg-", "text-")} hover:${themeClasses.buttonPrimary} hover:${themeClasses.textWhite}`}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Retake
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className={`${themeClasses.borderColor} ${themeClasses.buttonPrimary.replace("bg-", "text-")} hover:${themeClasses.buttonPrimary} hover:${themeClasses.textWhite}`}
                    >
                      Upload File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-8">
                  <div
                    className={`w-16 h-16 mx-auto ${themeClasses.cardBgAlt} rounded-full flex items-center justify-center`}
                  >
                    <Camera className={`h-8 w-8 ${themeClasses.textSecondary}`} />
                  </div>
                  <div>
                    <p className={`${themeClasses.textPrimary} font-medium mb-2`}>Take a photo</p>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>Capture your food packaging</p>
                  </div>
                  <div className="flex space-x-3 justify-center">
                    <Button
                      onClick={openCamera}
                      className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-2xl px-6`}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Open Camera
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className={`${themeClasses.borderColor} ${themeClasses.buttonPrimary.replace("bg-", "text-")} hover:${themeClasses.buttonPrimary} hover:${themeClasses.textWhite} rounded-2xl px-6`}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

            {uploadedImage && (
              <Button
                onClick={handleScan}
                disabled={isScanning}
                className={`w-full ${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-2xl mt-4`}
                size="lg"
              >
                {isScanning ? (
                  <>
                    <Scan className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5 mr-2" />
                    Analyze Package
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isScanning && (
          <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
            <CardContent className="p-0 text-center space-y-4">
              <div
                className={`w-12 h-12 mx-auto ${themeClasses.buttonPrimary} rounded-full flex items-center justify-center`}
              >
                <Scan className={`h-6 w-6 ${themeClasses.textWhite} animate-spin`} />
              </div>
              <p className={themeClasses.textPrimary}>Analyzing microplastic content...</p>
              <div className={`w-full ${themeClasses.progressBg} rounded-full h-2`}>
                <div className={`${themeClasses.buttonPrimary} h-2 rounded-full w-2/3 animate-pulse`}></div>
              </div>
            </CardContent>
          </Card>
        )}

        {scanResult && (
          <div className="space-y-4">
            <Card className={`${themeClasses.cardBgAlt} border-0 rounded-2xl p-6`}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${themeClasses.textPrimary}`}>Analysis Result</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(scanResult.risk)}`}>
                    {scanResult.risk} Risk
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className={`text-sm ${themeClasses.textSecondary} uppercase tracking-wide`}>
                      MICROPLASTIC LEVEL
                    </span>
                    <div className={`text-2xl font-bold ${themeClasses.buttonPrimary.replace("bg-", "text-")}`}>
                      {scanResult.microplastics}
                    </div>
                    {scanResult.food && (
                      <p className={`text-sm ${themeClasses.textSecondary}`}>
                        Detected in: {scanResult.food}
                      </p>
                    )}
                  </div>

                  <div className={`w-full ${themeClasses.progressBg} rounded-full h-2`}>
                    <div
                      className={`${themeClasses.buttonPrimary} h-2 rounded-full transition-all`}
                      style={{ width: `${getMicroplasticLevel(scanResult.microplastics)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
              <CardContent className="p-0">
                <h4 className={`font-semibold ${themeClasses.textPrimary} mb-3`}>Recommendations</h4>
                <div className="space-y-2">
                  {scanResult.recommendations?.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className={`w-1.5 h-1.5 ${themeClasses.buttonPrimary} rounded-full mt-2`}></div>
                      <p className={`text-sm ${themeClasses.textSecondary}`}>{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Link href="/dashboard" className="flex-1">
                <Button
                  className={`w-full ${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-2xl`}
                >
                  View Progress
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setScanResult(null)
                  setUploadedImage(null)
                }}
                className={`${themeClasses.borderColor} ${themeClasses.buttonPrimary.replace("bg-", "text-")} hover:${themeClasses.buttonPrimary} hover:${themeClasses.textWhite} rounded-2xl`}
              >
                Scan Again
              </Button>
            </div>
          </div>
        )}

        {/* Scan History Summary */}
        {scanProgress.scanHistory.length > 0 && (
          <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
            <CardContent className="p-0">
              <h4 className={`font-semibold ${themeClasses.textPrimary} mb-3`}>Recent Scans</h4>
              <div className="space-y-2">
                {scanProgress.scanHistory.slice(-3).reverse().map((scan, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${themeClasses.textPrimary}`}>{scan.food}</p>
                      <p className={`text-xs ${themeClasses.textSecondary}`}>{scan.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm ${themeClasses.textSecondary}`}>{scan.microplastics}</p>
                      <div className={`px-2 py-1 rounded text-xs ${getRiskColor(scan.risk)}`}>
                        {scan.risk}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}