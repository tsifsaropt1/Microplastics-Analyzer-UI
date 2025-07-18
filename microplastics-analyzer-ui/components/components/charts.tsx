import React, { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend } from 'recharts'
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, TrendingUp, Box } from "lucide-react"

// Chart Type Selector Component
const ChartTypeSelector = ({ selectedType, onTypeChange, theme }) => {
  const themeClasses = {
    textPrimary: theme === "light" ? "#4A5D3A" : "#E8F0E5",
    textSecondary: theme === "light" ? "#6B7D5A" : "#B8C8B5",
    selectedBg: theme === "light" ? "#8B9D7A" : "#5A6B57",
    unselectedBg: theme === "light" ? "#D4C4B0" : "#4A5A47"
  }

  const chartTypes = [
    { id: 'line', icon: TrendingUp, label: 'Line' },
    { id: 'bar', icon: BarChart3, label: 'Bar' },
    { id: '3d', icon: Box, label: '3D' }
  ]

  return (
    <div className="flex gap-2 mb-4">
      {chartTypes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onTypeChange(id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedType === id 
              ? 'text-white shadow-md' 
              : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: selectedType === id ? themeClasses.selectedBg : themeClasses.unselectedBg,
            color: selectedType === id ? '#fff' : themeClasses.textSecondary
          }}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  )
}

// 3D Chart Component
const ThreeDChart = ({ data, theme, xDataKey }) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const frameRef = useRef(null)
  const [threeLoaded, setThreeLoaded] = useState(false)

  const themeClasses = {
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    textPrimary: theme === "light" ? "#4A5D3A" : "#E8F0E5",
    textSecondary: theme === "light" ? "#6B7D5A" : "#B8C8B5"
  }

  useEffect(() => {
    // Load Three.js from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => setThreeLoaded(true)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!threeLoaded || !mountRef.current || !data.length || !window.THREE) return

    const THREE = window.THREE
    const width = mountRef.current.clientWidth
    const height = 256

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(theme === "light" ? 0xF5F3F0 : 0x3A4A37)
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    
    // Clear previous content
    mountRef.current.innerHTML = ''
    mountRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.avgLevel))
    const barColor = theme === "light" ? 0x8B9D7A : 0x5A6B57

    // Create 3D bars
    data.forEach((item, index) => {
      const barHeight = (item.avgLevel / maxValue) * 3
      const geometry = new THREE.BoxGeometry(0.6, barHeight, 0.6)
      const material = new THREE.MeshLambertMaterial({ color: barColor })
      const bar = new THREE.Mesh(geometry, material)
      
      // Position bars
      const xPos = (index - (data.length - 1) / 2) * 1.2
      bar.position.set(xPos, barHeight / 2, 0)
      bar.castShadow = true
      bar.receiveShadow = true
      
      // Add data to bar for tooltip
      bar.userData = { ...item, index }
      
      scene.add(bar)
    })

    // Add grid
    const gridHelper = new THREE.GridHelper(data.length * 1.2, data.length, 0x888888, 0x888888)
    gridHelper.position.y = -0.01
    scene.add(gridHelper)

    // Store references
    sceneRef.current = scene
    rendererRef.current = renderer

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      
      // Gentle rotation
      scene.rotation.y += 0.005
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      const newWidth = mountRef.current.clientWidth
      camera.aspect = newWidth / height
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [data, theme, xDataKey, threeLoaded])

  if (!threeLoaded) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"></div>
          <p style={{ color: themeClasses.textSecondary }}>Loading 3D visualization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 relative">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 text-xs opacity-60" style={{ color: themeClasses.textSecondary }}>
        3D View • Auto-rotating
      </div>
    </div>
  )
}

// Universal Chart Component
const UniversalChart = ({ data, chartType, theme, title, dataKey = "avgLevel", xDataKey }) => {
  const themeClasses = {
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    textPrimary: theme === "light" ? "#4A5D3A" : "#E8F0E5",
    textSecondary: theme === "light" ? "#6B7D5A" : "#B8C8B5",
    chartLine: theme === "light" ? "#8B9D7A" : "#B8C8B5",
    chartBar: theme === "light" ? "#8B9D7A" : "#5A6B57",
    gridColor: theme === "light" ? "#D4C4B0" : "#4A5A47"
  }

  // If 3D chart is selected, render the 3D component
  if (chartType === '3d') {
    return <ThreeDChart data={data} theme={theme} xDataKey={xDataKey} />
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${themeClasses.cardBg} p-3 rounded-lg shadow-lg border border-white/10`}>
          <p className="font-medium" style={{ color: themeClasses.textPrimary }}>
            {payload[0].payload.fullPeriod || payload[0].payload.fullMonth || payload[0].payload.date || label}
          </p>
          <p style={{ color: themeClasses.chartLine }}>
            Avg Level: {payload[0].value.toFixed(1)} ppm
          </p>
          <p style={{ color: themeClasses.textSecondary }}>
            Items: {payload[0].payload.itemCount}
          </p>
        </div>
      )
    }
    return null
  }

  const commonProps = {
    data: data,
    children: [
      <CartesianGrid key="grid" strokeDasharray="3 3" stroke={themeClasses.gridColor} />,
      <XAxis 
        key="xaxis"
        dataKey={xDataKey} 
        tick={{ fill: themeClasses.textSecondary, fontSize: 12 }}
        axisLine={{ stroke: themeClasses.gridColor }}
      />,
      <YAxis 
        key="yaxis"
        tick={{ fill: themeClasses.textSecondary, fontSize: 12 }}
        axisLine={{ stroke: themeClasses.gridColor }}
        label={{ value: 'ppm', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: themeClasses.textSecondary } }}
      />,
      <Tooltip key="tooltip" content={<CustomTooltip />} />
    ]
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonProps.children}
            <Bar 
              dataKey={dataKey}
              fill={themeClasses.chartBar}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {commonProps.children}
            <Line 
              type="monotone" 
              dataKey={dataKey}
              stroke={themeClasses.chartLine} 
              strokeWidth={3}
              dot={{ fill: themeClasses.chartLine, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: themeClasses.chartLine }}
            />
          </LineChart>
        )
    }
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Chart Components with Type Selection
export const WeeklyChart = ({ data, theme }) => {
  const [chartType, setChartType] = useState('line')
  
  const themeClasses = {
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    textPrimary: theme === "light" ? "#4A5D3A" : "#E8F0E5"
  }

  // Transform daily data for the chart
  const chartData = data ? data.flatMap(week => 
    week.details.map(day => ({
      day: day.date.split(',')[0], // Get day part (Today, Yesterday, etc.)
      avgLevel: day.items.reduce((sum, item) => sum + item.level, 0) / (day.items.length || 1),
      itemCount: day.items.length,
      date: day.date
    }))
  ).reverse() : [] // Reverse to show chronological order

  return (
    <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
      <CardContent className="p-0">
        <h3 className="font-semibold mb-4" style={{ color: themeClasses.textPrimary }}>
          Daily Microplastic Levels
        </h3>
        <ChartTypeSelector 
          selectedType={chartType} 
          onTypeChange={setChartType} 
          theme={theme}
        />
        <UniversalChart 
          data={chartData}
          chartType={chartType}
          theme={theme}
          title="Daily Microplastic Levels"
          xDataKey="day"
        />
      </CardContent>
    </Card>
  )
}

export const MonthlyChart = ({ data, theme }) => {
  const [chartType, setChartType] = useState('bar')
  
  const themeClasses = {
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    textPrimary: theme === "light" ? "#4A5D3A" : "#E8F0E5"
  }

  // Transform monthly data for the chart
  const chartData = data ? data.map(month => ({
    month: month.period.split(' ')[0], // Get month name
    avgLevel: month.avgLevel,
    itemCount: month.items,
    fullPeriod: month.period
  })).reverse() : [] // Reverse to show chronological order

  return (
    <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
      <CardContent className="p-0">
        <h3 className="font-semibold mb-4" style={{ color: themeClasses.textPrimary }}>
          Monthly Microplastic Trends
        </h3>
        <ChartTypeSelector 
          selectedType={chartType} 
          onTypeChange={setChartType} 
          theme={theme}
        />
        <UniversalChart 
          data={chartData}
          chartType={chartType}
          theme={theme}
          title="Monthly Microplastic Trends"
          xDataKey="month"
        />
      </CardContent>
    </Card>
  )
}

export const YearlyChart = ({ data, theme }) => {
  const [chartType, setChartType] = useState('3d')
  
  const themeClasses = {
    cardBg: theme === "light" ? "bg-[#F5F3F0]" : "bg-[#3A4A37]",
    textPrimary: theme === "light" ? "#4A5D3A" : "#E8F0E5"
  }

  // Transform yearly data for the chart
  const chartData = data ? data.flatMap(year => 
    year.details.map(month => ({
      month: month.date.substring(0, 3), // Get first 3 letters of month
      avgLevel: month.avgLevel,
      itemCount: month.items,
      fullMonth: month.date
    }))
  ) : []

  return (
    <Card className={`${themeClasses.cardBg} border-0 rounded-2xl p-6`}>
      <CardContent className="p-0">
        <h3 className="font-semibold mb-4" style={{ color: themeClasses.textPrimary }}>
          Yearly Microplastic Overview
        </h3>
        <ChartTypeSelector 
          selectedType={chartType} 
          onTypeChange={setChartType} 
          theme={theme}
        />
        <UniversalChart 
          data={chartData}
          chartType={chartType}
          theme={theme}
          title="Yearly Microplastic Overview"
          xDataKey="month"
        />
      </CardContent>
    </Card>
  )
}

// Demo Component
export default function MicroplasticChartsDemo() {
  const [theme, setTheme] = useState('light')
  
  const themeClasses = {
    bg: theme === "light" ? "bg-[#F0F7ED]" : "bg-[#2A3A27]",
    textPrimary: theme === "light" ? "#4A5D3A" : "#E8F0E5"
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} p-6`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: themeClasses.textPrimary }}>
            Microplastic Monitoring Dashboard
          </h1>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {theme === 'light' ? '🌙' : '☀️'} Toggle Theme
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <WeeklyChart data={null} theme={theme} />
          <MonthlyChart data={null} theme={theme} />
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <YearlyChart data={null} theme={theme} />
        </div>
      </div>
    </div>
  )
}