const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1/survey';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  errors?: string[];
  error?: string;
}

class ApiService {
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    this.startTime = Date.now();
    console.log('🔗 API Service initialized:', API_BASE_URL);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    try {
      console.log(`📡 API Request: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      return {
        success: false,
        message: 'Network error - please check your connection'
      };
    }
  }

  // Submit survey to backend
  async submitSurvey(formData: any): Promise<ApiResponse> {
    const backendData = {
      full_name: formData.fullName,
      age: parseInt(formData.age.toString()),
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      health_status: formData.healthStatus,
      chronic_conditions: formData.chronicConditions || null,
      medications: formData.medications || null,
      annual_income: formData.annualIncome,
      has_insurance: formData.hasInsurance,
      savings_account: formData.savingsAccount
    };

    console.log('📤 Submitting survey:', backendData);
    return this.makeRequest('/submit', {
      method: 'POST',
      body: JSON.stringify(backendData)
    });
  }

  // Check backend health
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  // Get survey statistics
  async getSurveyStats(): Promise<ApiResponse> {
    return this.makeRequest('/stats');
  }

  // Log analytics (fire and forget)
  async logAnalytics(eventType: string, stepName?: string): Promise<void> {
    this.makeRequest('/analytics', {
      method: 'POST',
      body: JSON.stringify({
        event_type: eventType,
        step_name: stepName,
        session_id: this.sessionId,
        timestamp: new Date().toISOString()
      })
    }).catch(error => console.warn('Analytics failed:', error));
  }
}

export default new ApiService();