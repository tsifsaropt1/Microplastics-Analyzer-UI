import { useState, useEffect } from 'react';
import { analyzeFood, healthCheck, AnalysisResult, FoodItem, getRiskColor, getRiskBadgeColor } from '@/lib/api';

// Simple health check interface to match what your API might return
interface HealthCheck {
  status: string;
  analyzer_initialized?: boolean;
}

export default function FoodAnalyzer() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<HealthCheck | null>(null);

  // Check system health on component mount (optional - only if you have a health endpoint)
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await healthCheck();
        setSystemHealth(health);
      } catch (error) {
        console.error('Health check failed:', error);
        // Set a default "working" state if health check fails
        setSystemHealth({ status: 'ok', analyzer_initialized: true });
      }
    };
    checkHealth();
  }, []);

  // Handle image file selection and preview
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setError(null);
      setResult(null);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send image to backend for analysis
  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Sending image for analysis...');
      const analysisResult = await analyzeFood(image);
      console.log('Received analysis result:', analysisResult);

      // The risk levels should already be properly formatted from your API
      // but let's ensure they're uppercase just in case
      if (analysisResult.parsed_results) {
        analysisResult.parsed_results = analysisResult.parsed_results.map(item => ({
          ...item,
          risk: item.risk?.toUpperCase() || 'MEDIUM'
        }));
      }
      
      setResult(analysisResult);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Check if system is ready (either health check passed or we assume it's working)
  const isSystemReady = systemHealth?.analyzer_initialized !== false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Professional Microplastics Food Analyzer
          </h1>
          <p className="text-purple-200 text-lg">
            Advanced AI-Powered Food Safety Analysis • Weight Estimation • Calorie Calculation • Microplastic Detection
          </p>
          {/* System Status */}
          <div className="mt-4 inline-flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isSystemReady ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-purple-200">
              {isSystemReady ? 'System Ready' : 'System Unavailable'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Image Upload and Preview */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">📷</span>
              Image Analysis
            </h2>
            
            {/* Upload Section */}
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Upload Food Image
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="block w-full text-sm text-white
                          file:mr-4 file:py-3 file:px-6
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-purple-600 file:text-white
                          hover:file:bg-purple-700
                          file:cursor-pointer cursor-pointer
                          bg-white/10 rounded-lg p-3 border border-white/20"
              />
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-6">
                <h3 className="text-white text-lg font-semibold mb-3">Preview</h3>
                <div className="relative rounded-lg overflow-hidden border border-white/20">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-auto max-h-96 object-contain bg-black/20"
                  />
                </div>
              </div>
            )}
            
            {/* Analyze Button */}
            <button 
              onClick={handleAnalyze} 
              disabled={!image || loading || !isSystemReady}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white font-bold py-4 px-6 rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       hover:from-purple-700 hover:to-pink-700 
                       transition-all duration-300 transform hover:scale-105
                       flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>🔬</span>
                  <span>Start Analysis</span>
                </>
              )}
            </button>
          </div>
          
          {/* Right Panel - Results */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Analysis Results
            </h2>
            
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">❌</span>
                  <span className="text-red-100 font-medium">Error</span>
                </div>
                <p className="text-red-200 mt-2">{error}</p>
              </div>
            )}
            
            {/* Results Display */}
            {result && result.success && (
              <div className="space-y-6">
                {/* Analysis Info */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-2">Analysis Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-200">Timestamp:</span>
                      <p className="text-white">{formatTimestamp(result.timestamp)}</p>
                    </div>
                    <div>
                      <span className="text-purple-200">Items Found:</span>
                      <p className="text-white">{result.parsed_results ? result.parsed_results.length : 0}</p>
                    </div>
                  </div>
                </div>
                
                {/* Food Items */}
                {result.parsed_results && result.parsed_results.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-lg">Food Items Detected</h3>
                    {result.parsed_results.map((item: FoodItem, index: number) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-white font-semibold text-lg">
                              {item.food || 'Unknown Food'}
                            </h4>
                            {item.risk && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskBadgeColor(item.risk)}`}>
                                {item.risk} RISK
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-purple-200">Quantity:</span>
                              <p className="text-white font-medium">{item.quantity || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-purple-200">Calories:</span>
                              <p className="text-white font-medium">{item.calories || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-purple-200">Microplastics:</span>
                              <p className="text-white font-medium">{item.microplastics || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-purple-200">Risk Level:</span>
                              <p className={`font-bold ${getRiskColor(item.risk || '')}`}>
                                {item.risk || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Raw Analysis */}
                {result.raw_analysis && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-white font-semibold mb-2">Raw Analysis Output</h3>
                    <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                      {result.raw_analysis}
                    </pre>
                  </div>
                )}
              </div>
            )}
            
            {/* No Results Message */}
            {!result && !error && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔬</div>
                <h3 className="text-white text-xl font-semibold mb-2">Ready for Analysis</h3>
                <p className="text-purple-200">
                  Upload an image of food to begin microplastic analysis
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-purple-200 text-sm">
          <p>Professional Microplastics Food Analyzer v3.0 • Powered by Gemini AI</p>
          <p>Based on scientific research data from 2024-2025 studies</p>
        </div>
      </div>
    </div>
  );
}