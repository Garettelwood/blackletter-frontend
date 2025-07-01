import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { X, Check, FileText, Plus } from 'lucide-react';
import { Document } from '../types';
import { createProject, listDocuments } from '../services/api';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewProjectModal = ({ isOpen, onClose }: NewProjectModalProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [projectName, setProjectName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available documents
  const { data: documentsData, isLoading: documentsLoading, error: documentsError } = useQuery('documents', listDocuments);
  
  // Ensure we have an array, even if API returns different structure
  const documents = Array.isArray(documentsData) ? documentsData : [];

  // Create project mutation
  const createProjectMutation = useMutation(createProject, {
    onSuccess: (data) => {
      console.log('Project created successfully:', data);
      console.log('Project ID to navigate to:', data.id);
      queryClient.invalidateQueries('projects');
      
      // Reset form
      setProjectName('');
      setSelectedFiles([]);
      setSearchTerm('');
      onClose();
      
      // Navigate to the new project - the API returns { id: "proj_..." }
      if (data.id) {
        console.log('Navigating to project:', `/projects/${data.id}`);
        // Add a small delay to ensure the project data is cached
        setTimeout(() => {
          navigate(`/projects/${data.id}`);
        }, 1000); // Increased delay to 1 second
      } else {
        console.error('No project ID in response:', data);
        alert('Project created but could not navigate to it. Please refresh the page.');
      }
    },
    onError: (error: any) => {
      console.error('Failed to create project:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create project. Please try again.';
      alert(errorMessage);
    }
  });

  // Filter documents based on search term
  const filteredDocuments = documents.filter((doc: Document) =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileToggle = (documentId: string) => {
    setSelectedFiles(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredDocuments.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredDocuments.map((doc: Document) => doc.document_id));
    }
  };

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    createProjectMutation.mutate({
      name: projectName.trim(),
      file_ids: selectedFiles
    });
  };

  const handleClose = () => {
    if (createProjectMutation.isLoading) return; // Prevent closing while creating
    
    setProjectName('');
    setSelectedFiles([]);
    setSearchTerm('');
    onClose();
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Project
          </h2>
          <button
            onClick={handleClose}
            disabled={createProjectMutation.isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={createProjectMutation.isLoading}
            />
          </div>

          {/* File Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Files ({selectedFiles.length} selected)
              </label>
              {filteredDocuments.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  {selectedFiles.length === filteredDocuments.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={createProjectMutation.isLoading}
              />
            </div>

            {/* File List */}
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-64 overflow-y-auto">
              {documentsLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading files...
                </div>
              ) : documentsError ? (
                <div className="p-4 text-center text-red-500">
                  Error loading files
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No files match your search' : 'No files available'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredDocuments.map((doc: Document) => (
                    <label
                      key={doc.document_id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(doc.document_id)}
                        onChange={() => handleFileToggle(doc.document_id)}
                        disabled={createProjectMutation.isLoading}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.pages} pages • {doc.status} • {new Date(doc.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                      {selectedFiles.includes(doc.document_id) && (
                        <Check className="h-4 w-4 text-primary-600" />
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={createProjectMutation.isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProject}
              disabled={!projectName.trim() || createProjectMutation.isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {createProjectMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal; 