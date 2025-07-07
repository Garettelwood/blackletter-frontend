import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';

const ProcessingPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    
    const pollStatus = async () => {
      try {
        const response = await api.get(`/status/${jobId}`);
        setStatus(response.data.status);
        
        // STOP polling when done
        if (response.data.status === 'completed' || response.data.status === 'failed') {
          return; // Don't set another timeout
        }
        
        // Continue polling only if still processing
        setTimeout(pollStatus, 5000); // 5 seconds
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };
    
    pollStatus();
    
    // Cleanup on unmount
    return () => {
      // Clear any timeouts if needed
    };
  }, [jobId]); // Only run when jobId changes

  const getStatusIcon = () => {
    if (!status) return <Loader2 className="h-8 w-8 text-gray-900 dark:text-white animate-spin" />;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Loader2 className="h-8 w-8 text-gray-900 dark:text-white animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    if (!status) return 'Checking document status...';
    
    switch (status) {
      case 'completed':
        return 'Document ready! You can now ask questions about the content';
      case 'failed':
        return 'Processing failed. Please try uploading again';
      case 'processing':
        return 'Processing your document... This may take up to 5 minutes for large files';
      default:
        return 'Unknown status';
    }
  };

  const getEstimatedTime = () => {
    if (!status || status !== 'processing') return null;
    
    // Rough estimate: 1 second per page
    if (status === 'processing') {
      return 'Estimated time: 1-5 minutes';
    }
    
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Processing Document
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Please wait while we analyze your legal document
        </p>
      </div>

      <div className="card p-8">
        <div className="text-center space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {status ? `Status: ${status}` : 'Checking status...'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {getStatusMessage()}
            </p>
          </div>

          {/* Progress Details */}
          {status && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="font-medium capitalize">{status}</span>
              </div>
              
              {status === 'processing' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Time:</span>
                  <span className="font-medium">{getEstimatedTime()}</span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => navigate('/documents')}
              className="text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 font-medium"
            >
              View Document Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage; 