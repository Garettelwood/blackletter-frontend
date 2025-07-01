export interface UploadResponse {
  job_id: string;
  filename: string;
  status: string;
  message: string;
  s3_key: string;
}

export interface StatusResponse {
  job_id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  filename: string;
  pages?: number;
  chunks?: number;
  processed_date?: string;
  error_message?: string;
}

export interface Document {
  document_id: string;
  filename: string;
  pages: number;
  upload_date: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
}

export interface QuestionRequest {
  question: string;
  document_ids: string[];
  user_id?: string;
}

export interface QuestionResponse {
  answer: string;
  sources: string;
  processing_time: number;
  document_ids: string[];
}

export interface ChatMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  timestamp: Date;
  sources?: string;
  processingTime?: number;
}

export interface User {
  id: string;
  name?: string;
}

export interface Project {
  id: string;
  name: string;
  files?: ProjectFile[];
  documents?: ProjectFile[];
  created_at?: string;
  updated_at?: string;
  document_count?: number;
  is_expanded?: boolean;
}

export interface ProjectFile {
  document_id: string;
  filename: string;
  pages: number;
  upload_date: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
} 