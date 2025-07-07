import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { uploadDocument } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only accept PDFs and max 100MB per file
    const validFiles = acceptedFiles.filter(
      (file) => file.type === 'application/pdf' && file.size <= 100 * 1024 * 1024
    );
    if (validFiles.length !== acceptedFiles.length) {
      setError('Only PDF files under 100MB are supported.');
    } else {
      setError(null);
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  }, []);

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    setUploadProgress(Array(selectedFiles.length).fill(0));
    setSuccess(false);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        // Simulate progress
        setUploadProgress((prev) => prev.map((p, idx) => (idx === i ? 10 : p)));
        const res = await uploadDocument(file, user?.id);
        setUploadProgress((prev) => prev.map((p, idx) => (idx === i ? 100 : p)));
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/documents');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 20,
    disabled: uploading
  });

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Upload Documents
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Select multiple PDFs, then click <b>Done</b> to start uploading
        </p>
      </div>

      {/* Upload Area */}
      <div className="card p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
                      ? 'border-gray-400 bg-gray-50 dark:bg-gray-900/20'
        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} multiple />
          <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drag & drop your PDFs here or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You can select multiple files
              </p>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p>• Maximum file size: 100MB each</p>
              <p>• Supported format: PDF only</p>
              <p>• Processing starts when you click <b>Done</b></p>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Selected Files:</h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                  <span className="truncate max-w-xs">{file.name}</span>
                  <div className="flex items-center space-x-2">
                    {uploading ? (
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gray-900 dark:bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress[idx] || 0}%` }}
                        ></div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-green-700 dark:text-green-400">
                All files uploaded! Redirecting to document library...
              </p>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleUpload}
            className="btn-primary"
            disabled={uploading || selectedFiles.length === 0}
          >
            {uploading ? 'Uploading...' : 'Done'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/documents')}
                      className="text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-300 font-medium"
        >
          View Document Library →
        </button>
      </div>
    </div>
  );
};

export default UploadPage; 