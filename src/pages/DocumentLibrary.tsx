import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Upload,
  Search,
  Trash2
} from 'lucide-react';
import { listDocuments, deleteDocument } from '../services/api';
import { Document } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DocumentLibrary = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  const { data: documents = [], isLoading, error, refetch } = useQuery(
    'documents',
    () => listDocuments(user?.id),
    {
      refetchInterval: 10000, // Refetch every 10 seconds to update status
    }
  );

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId);
        refetch();
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Failed to load documents</p>
          <button 
            onClick={() => refetch()}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Document Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and interact with your uploaded legal documents
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-primary mt-4 sm:mt-0"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New Document
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {documents.length === 0 ? 'No documents uploaded' : 'No documents match your search'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {documents.length === 0 
              ? 'Upload your first legal document to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {documents.length === 0 && (
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc: Document) => (
            <div key={doc.document_id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-48">
                      {doc.filename}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {doc.pages} pages
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    <div className="flex items-center">
                      {getStatusIcon(doc.status)}
                      <span className="ml-1 capitalize">{doc.status}</span>
                    </div>
                  </span>
                  
                  <button
                    onClick={() => handleDelete(doc.document_id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                {doc.status === 'completed' && (
                  <button
                    onClick={() => navigate(`/chat/${doc.document_id}`)}
                    className="btn-primary flex-1 flex items-center justify-center"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask Questions
                  </button>
                )}
                
                {doc.status === 'processing' && (
                  <button
                    onClick={() => navigate(`/processing/${doc.document_id}`)}
                    className="btn-secondary flex-1 flex items-center justify-center"
                    disabled
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Processing...
                  </button>
                )}
                
                {doc.status === 'failed' && (
                  <button
                    onClick={() => navigate('/')}
                    className="btn-secondary flex-1"
                  >
                    Upload Again
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentLibrary; 