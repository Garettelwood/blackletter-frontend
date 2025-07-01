import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://23.23.190.168:8000';
const API_KEY = import.meta.env.VITE_API_KEY || 'bl_garrett_dev_67890';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    console.log('API Base URL:', API_BASE_URL);
    console.log('API Key:', API_KEY ? '***' + API_KEY.slice(-4) : 'Not set');
    
    // Test 1: Check if the API is reachable
    const healthCheck = await axios.get(`${API_BASE_URL}/docs`);
    console.log('✅ API is reachable, docs endpoint:', healthCheck.status);
    
    // Test 2: Try to list documents with API key
    const documentsUrl = `${API_BASE_URL}/documents`;
    try {
      const documents = await axios.get(documentsUrl, {
        headers: {
          'X-API-Key': API_KEY,
        },
      });
      console.log('✅ Documents endpoint works with API key:', documents.status);
    } catch (error: any) {
      console.log('❌ Documents endpoint failed:', error.response?.status, error.response?.data);
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ API connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
};

export const testUploadEndpoint = async () => {
  try {
    // Create a simple test file
    const testContent = 'This is a test PDF content';
    const testFile = new File([testContent], 'test.pdf', { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('file', testFile);
    
    console.log('Testing upload endpoint with API key...');
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'X-API-Key': API_KEY,
        // Do NOT set Content-Type for FormData
      },
    });
    
    console.log('✅ Upload endpoint works with API key:', response.status, response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Upload endpoint failed:', error.response?.status, error.response?.data);
    throw error;
  }
}; 