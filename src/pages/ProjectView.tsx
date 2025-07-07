import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Plus, 
  FileText, 
  MessageSquare,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Project, Document } from '../types';
import { 
  listProjects, 
  updateProject, 
  deleteProject, 
  addFilesToProject,
  removeFilesFromProject,
  listDocuments 
} from '../services/api';

const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showAddFiles, setShowAddFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch project and documents
  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery('projects', listProjects);
  const { data: allDocumentsData, isLoading: documentsLoading, error: documentsError } = useQuery('documents', listDocuments);
  
  // Ensure we have arrays, even if API returns different structure
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const allDocuments = Array.isArray(allDocumentsData) ? allDocumentsData : [];
  
  console.log('ProjectView - projectId:', projectId);
  console.log('ProjectView - projects:', projects);
  console.log('ProjectView - projectsData:', projectsData);
  console.log('ProjectView - projectsLoading:', projectsLoading);
  console.log('ProjectView - projectsError:', projectsError);
  
  const project = projects.find((p: any) => {
    console.log('Checking project:', p, 'against projectId:', projectId);
    return p.id === projectId || 
           p.project_id === projectId || 
           p.projectId === projectId;
  });
  console.log('ProjectView - found project:', project);
  
  // Handle the API response structure where files are in 'documents' field
  const projectFiles = project?.documents || project?.files || [];
  const availableDocuments = allDocuments.filter((doc: Document) => 
    !projectFiles.some((file: any) => file.document_id === doc.document_id)
  );

  // Mutations
  const updateProjectMutation = useMutation(
    ({ projectId, payload }: { projectId: string; payload: any }) => 
      updateProject(projectId, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        setEditingName(false);
      }
    }
  );

  const deleteProjectMutation = useMutation(deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      navigate('/');
    }
  });

  const addFilesToProjectMutation = useMutation(
    ({ projectId, fileIds }: { projectId: string; fileIds: string[] }) =>
      addFilesToProject(projectId, fileIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        setSelectedFiles([]);
        setShowAddFiles(false);
      }
    }
  );

  const removeFilesFromProjectMutation = useMutation(
    ({ projectId, fileIds }: { projectId: string; fileIds: string[] }) =>
      removeFilesFromProject(projectId, fileIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      }
    }
  );

  // Show loading state
  if (projectsLoading || documentsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 dark:border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (projectsError || documentsError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Project
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading the project data.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleNameEdit = () => {
    if (newName.trim() && newName !== project.name) {
      updateProjectMutation.mutate({
        projectId: project.id,
        payload: { name: newName.trim() }
      });
    } else {
      setEditingName(false);
      setNewName(project.name);
    }
  };

  const handleAddFiles = () => {
    if (selectedFiles.length > 0) {
      addFilesToProjectMutation.mutate({
        projectId: project.id,
        fileIds: selectedFiles
      });
    }
  };

  const handleRemoveFile = (documentId: string) => {
    removeFilesFromProjectMutation.mutate({
      projectId: project.id,
      fileIds: [documentId]
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div>
              {editingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary-500"
                    onBlur={handleNameEdit}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleNameEdit();
                      }
                    }}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {project.name}
                  </h1>
                  <button
                    onClick={() => {
                      setNewName(project.name);
                      setEditingName(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
                             <p className="text-sm text-gray-500 dark:text-gray-400">
                 Created {new Date(project.created_at || Date.now()).toLocaleDateString()} • {projectFiles.length} files
               </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddFiles(!showAddFiles)}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Files</span>
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Add Files Section */}
        {showAddFiles && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Files to Project
            </h3>
            
            {availableDocuments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                All available files are already in this project.
              </p>
            ) : (
              <div className="space-y-3">
                {availableDocuments.map((doc: Document) => (
                  <label
                    key={doc.document_id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(doc.document_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles(prev => [...prev, doc.document_id]);
                        } else {
                          setSelectedFiles(prev => prev.filter(id => id !== doc.document_id));
                        }
                      }}
                      className="rounded border-gray-300 text-gray-600 dark:text-gray-400 focus:ring-gray-500"
                    />
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {doc.filename}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {doc.pages} pages • {doc.status}
                      </p>
                    </div>
                  </label>
                ))}
                
                <div className="flex space-x-3 pt-3">
                  <button
                    onClick={handleAddFiles}
                    disabled={selectedFiles.length === 0 || addFilesToProjectMutation.isLoading}
                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50"
                  >
                    {addFilesToProjectMutation.isLoading ? 'Adding...' : `Add ${selectedFiles.length} Files`}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddFiles(false);
                      setSelectedFiles([]);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project Files */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Project Files
          </h2>
          
                    {projectFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No files in this project
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Add files to get started with your project.
              </p>
              <button
                onClick={() => setShowAddFiles(true)}
                                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                Add Files
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projectFiles.map((file: any) => (
                <div
                  key={file.document_id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.filename}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.document_id)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {file.pages} pages • {file.status}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Uploaded {new Date(file.upload_date).toLocaleDateString()}
                    </p>
                    
                    {file.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/chat/${file.document_id}`)}
                        className="w-full mt-3 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 flex items-center justify-center space-x-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Ask Questions</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteProjectMutation.mutate(project.id)}
                disabled={deleteProjectMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProjectMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView; 