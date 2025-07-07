import axios from 'axios';
import { 
  UploadResponse, 
  StatusResponse, 
  Document, 
  QuestionRequest, 
  QuestionResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://23.23.190.168:8000';
const API_KEY = import.meta.env.VITE_API_KEY || 'bl_garrett_dev_67890';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// List all documents
export const listDocuments = async (userId?: string) => {
  const user_id = userId || 'garrett_test'; // Fallback to default if no user ID provided
  
  console.log('Attempting to fetch documents with:', {
    url: `${API_BASE_URL}/documents?user_id=${user_id}`,
    headers: { 'X-API-Key': API_KEY }
  });
  
  const response = await fetch(`${API_BASE_URL}/documents?user_id=${user_id}`, {
    headers: { 'X-API-Key': API_KEY }
  });
  
  console.log('Documents response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Documents API error response:', errorText);
    throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Documents API response:', data);
  return data;
};

// Delete a document
export const deleteDocument = async (documentId: string) => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: 'DELETE',
    headers: { 'X-API-Key': API_KEY }
  });
  if (!response.ok) throw new Error('Failed to delete document');
  return response;
};

// Q&A (Ask a question about one or more documents)
export const askQuestion = async (payload: { question: string, document_ids: string[], user_id?: string }) => {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Failed to get answer');
  return response.json();
};

// Upload a document
export const uploadDocument = async (file: File, userId?: string) => {
  const user_id = userId || 'garrett_test'; // Fallback to default if no user ID provided
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', user_id);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'X-API-Key': API_KEY },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload document');
  return response.json();
};

// Get document processing status
export const getStatus = async (jobId: string) => {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}`, {
    headers: { 'X-API-Key': API_KEY }
  });
  if (!response.ok) throw new Error('Failed to get status');
  return response.json();
};

// Project Management APIs
export const createProject = async (payload: { name: string, file_ids?: string[] }) => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: payload.name })
  });
  if (!response.ok) throw new Error('Failed to create project');
  const data = await response.json();
  console.log('Create project API response:', data);
  
  // Handle the API response structure: { success: true, project: {...} }
  if (data.success && data.project) {
    return data.project;
  }
  
  // Fallback to direct response if that's what we get
  return data;
};

export const listProjects = async () => {
  // Use GET endpoint for listing projects
  const response = await fetch(`${API_BASE_URL}/user/garrett/projects`, {
    headers: { 'X-API-Key': API_KEY }
  });
  
  if (!response.ok) {
    console.warn(`Projects API failed: ${response.status} ${response.statusText}`);
    return [];
  }
  
  const data = await response.json();
  console.log('Projects API response:', data);
  
  // Handle the API response structure: { success: true, projects: [...] }
  if (data.success && Array.isArray(data.projects)) {
    return data.projects;
  }
  
  // Fallback to direct array if that's what we get
  if (Array.isArray(data)) {
    return data;
  }
  
  // Return empty array if structure is unexpected
  console.warn('Unexpected projects API response structure:', data);
  return [];
};

export const updateProject = async (projectId: string, payload: { name?: string, file_ids?: string[] }) => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Failed to update project');
  return response.json();
};

export const deleteProject = async (projectId: string) => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
    headers: { 'X-API-Key': API_KEY }
  });
  if (!response.ok) throw new Error('Failed to delete project');
  return response;
};

export const addFilesToProject = async (projectId: string, fileIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ file_ids: fileIds })
  });
  if (!response.ok) throw new Error('Failed to add files to project');
  return response.json();
};

export const removeFilesFromProject = async (projectId: string, fileIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ file_ids: fileIds })
  });
  if (!response.ok) throw new Error('Failed to remove files from project');
  return response.json();
};

// Test API connectivity
export const testApiConnection = async () => {
  console.log('Testing API connection...');
  console.log('API Base URL:', API_BASE_URL);
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'Not set');
  
  try {
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/docs`);
    console.log('API docs endpoint status:', response.status);
    
    // Test with auth
    const authTest = await fetch(`${API_BASE_URL}/documents?user_id=garrett_test`, {
      headers: { 'X-API-Key': API_KEY }
    });
    console.log('Auth test status:', authTest.status);
    
    if (!authTest.ok) {
      const errorText = await authTest.text();
      console.error('Auth test error:', errorText);
    }
    
    return { docsStatus: response.status, authStatus: authTest.status };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export default api; 