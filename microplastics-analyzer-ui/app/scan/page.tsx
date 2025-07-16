"use client"

import type React from "react"
import { useState, useRef } from "react"
import { ArrowLeft, Camera, Scan } from "lucide-react"
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

export default function ScanPage() {
  const { theme } = useTheme()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          
          setScanResult({
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
          });
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
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                    className={`${themeClasses.borderColor} ${themeClasses.buttonPrimary.replace("bg-", "text-")} hover:${themeClasses.buttonPrimary} hover:${themeClasses.textWhite}`}
                  >
                    Change Image
                  </Button>
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
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className={`${themeClasses.buttonPrimary} ${themeClasses.buttonHover} ${themeClasses.textWhite} rounded-2xl px-8`}
                  >
                    Choose Photo
                  </Button>
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
      </div>
    </div>
  )
}
