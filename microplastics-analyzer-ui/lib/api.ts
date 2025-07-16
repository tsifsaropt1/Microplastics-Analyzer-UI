const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002';

// This matches exactly what your backend returns
export interface FoodItem {
  food: string;
  quantity: string;
  calories: string;
  microplastics: string;
  risk: string;
}

// This matches your backend response structure
export interface AnalysisResult {
  success: boolean;
  timestamp: string;
  raw_analysis: string;
  parsed_results: FoodItem[];
}

// Main function to analyze food images
export const analyzeFood = async (imageFile: File): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  try {
    console.log('Sending image for analysis to:', `${API_BASE_URL}/analyze-food`);
    
    const response = await fetch(`${API_BASE_URL}/analyze-food`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to analyze image';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      console.error('Server error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('Raw response from server:', result);
    
    // Validate the response matches expected structure
    if (result.success && result.parsed_results) {
      // Ensure parsed_results is an array
      if (!Array.isArray(result.parsed_results)) {
        console.warn('parsed_results is not an array, converting...');
        result.parsed_results = [];
      }
      
      // Validate each item in the results
      result.parsed_results = result.parsed_results.map((item: any, index: number) => {
        console.log(`Processing item ${index}:`, item);
        
        const processedItem: FoodItem = {
          food: item.food || 'Unknown Food',
          quantity: item.quantity || '0g',
          calories: item.calories || '0 kcal',
          microplastics: item.microplastics || '0.0 mg/kg',
          risk: (item.risk || 'MEDIUM').toUpperCase(),
        };
        
        // Validate risk level
        if (!['LOW', 'MEDIUM', 'HIGH'].includes(processedItem.risk)) {
          console.warn(`Invalid risk level: ${processedItem.risk}, defaulting to MEDIUM`);
          processedItem.risk = 'MEDIUM';
        }
        
        console.log(`Processed item ${index}:`, processedItem);
        return processedItem;
      });
      
      console.log('Final processed results:', result.parsed_results);
    } else if (!result.success) {
      console.error('Analysis failed:', result);
      throw new Error('Analysis failed');
    } else {
      console.warn('No parsed results in successful response');
      result.parsed_results = [];
    }
    
    return result;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Utility functions for displaying risk levels
export const getRiskColor = (risk: string): string => {
  const riskLevel = (risk || '').toUpperCase();
  switch (riskLevel) {
    case 'LOW':
      return 'text-green-600';
    case 'MEDIUM':
      return 'text-yellow-600';
    case 'HIGH':
      return 'text-red-600';
    default:
      console.warn(`Unknown risk level: ${risk}`);
      return 'text-gray-600';
  }
};

export const getRiskBadgeColor = (risk: string): string => {
  const riskLevel = (risk || '').toUpperCase();
  switch (riskLevel) {
    case 'LOW':
      return 'bg-green-100 text-green-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    default:
      console.warn(`Unknown risk level: ${risk}`);
      return 'bg-gray-100 text-gray-800';
  }
};

// Optional: Add a simple health check if you want to test connection
export const healthCheck = async (): Promise<{status: string}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};