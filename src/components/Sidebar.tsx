import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  FolderOpen, 
  Settings, 
  User, 
  Edit2, 
  Moon, 
  Sun,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Trash2,
  FileText,
  LogOut
} from 'lucide-react';
import { Project, Document } from '../types';
import { 
  listProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  addFilesToProject,
  listDocuments 
} from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import NewProjectModal from './NewProjectModal';

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Sidebar = ({ darkMode, setDarkMode }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [openProjectMenu, setOpenProjectMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Fetch projects and documents
  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery('projects', listProjects);
  const { data: documentsData, isLoading: documentsLoading, error: documentsError } = useQuery(
    ['documents', user?.id],
    () => listDocuments(user?.id),
    {
      enabled: !!user?.id
    }
  );
  
  // Ensure we have arrays, even if API returns different structure
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const documents = Array.isArray(documentsData) ? documentsData : [];

  // Mutations
  const createProjectMutation = useMutation(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      setSelectedFiles([]);
      setNewProjectName('');
      setShowAllFiles(false);
    }
  });

  const updateProjectMutation = useMutation(
    ({ projectId, payload }: { projectId: string; payload: any }) => 
      updateProject(projectId, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        setEditingProject(null);
      }
    }
  );

  const deleteProjectMutation = useMutation(deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('projects');
      setShowDeleteConfirm(null);
      setOpenProjectMenu(null);
    }
  });

  const addFilesToProjectMutation = useMutation(
    ({ projectId, fileIds }: { projectId: string; fileIds: string[] }) =>
      addFilesToProject(projectId, fileIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      }
    }
  );

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleProjectEdit = (projectId: string) => {
    setEditingProject(projectId);
    setOpenProjectMenu(null);
  };

  const handleProjectRename = (projectId: string, newName: string) => {
    updateProjectMutation.mutate({
      projectId,
      payload: { name: newName }
    });
  };

  const handleAddFilesToProject = (projectId: string) => {
    // Navigate to upload page with project context
    navigate(`/upload?project=${projectId}`);
    setOpenProjectMenu(null);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  const handleFileSelection = (documentId: string) => {
    setSelectedFiles(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleCreateProjectFromFiles = () => {
    if (selectedFiles.length === 0 || !newProjectName.trim()) return;
    
    createProjectMutation.mutate({
      name: newProjectName,
      file_ids: selectedFiles
    });
  };

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettingsMenu(false);
      }
    };

    if (showSettingsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsMenu]);

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Blackletter Branding */}
      <div className="p-8 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-950 dark:text-white font-serif">
          Blackletter
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-serif">
          Legal AI Assistant
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 space-y-3">
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="w-full flex items-center space-x-4 px-6 py-4 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
        >
          <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">New Project</span>
        </button>
        
        <button
          onClick={() => navigate('/upload')}
          className="w-full flex items-center space-x-4 px-6 py-4 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
        >
          <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Upload Files</span>
        </button>
        
        <button
          onClick={() => setShowAllFiles(!showAllFiles)}
          className="w-full flex items-center space-x-4 px-6 py-4 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group"
        >
          <FolderOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">View All Files</span>
        </button>
      </div>

      {/* All Files Section */}
      {showAllFiles && (
        <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                All Files
              </h3>
              {selectedFiles.length > 0 && (
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear
                </button>
              )}
            </div>
            
            {documents.length === 0 ? (
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                No files uploaded yet
              </div>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {documents.map((doc: Document) => (
                  <label
                    key={doc.document_id}
                    className="flex items-center space-x-2 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(doc.document_id)}
                      onChange={() => handleFileSelection(doc.document_id)}
                      className="rounded border-gray-300 text-gray-600 dark:text-gray-400 focus:ring-gray-500"
                    />
                    <span className="truncate">{doc.filename}</span>
                  </label>
                ))}
              </div>
            )}
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={handleCreateProjectFromFiles}
                  disabled={!newProjectName.trim() || createProjectMutation.isLoading}
                  className="w-full px-3 py-1 text-xs bg-gray-900 dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createProjectMutation.isLoading ? 'Creating...' : `Create Project (${selectedFiles.length} files)`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="flex-1 px-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4">
          Projects
        </h3>
        
        {projectsLoading ? (
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            Loading projects...
          </div>
        ) : projectsError ? (
          <div className="px-4 py-2 text-sm text-red-500">
            Error loading projects
          </div>
        ) : projects.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            No projects yet
          </div>
        ) : (
          projects.map((project: Project) => (
          <div key={project.id} className="space-y-1">
            <div
              className="group relative flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              onMouseEnter={() => setHoveredProject(project.id)}
              onMouseLeave={() => setHoveredProject(null)}
              onClick={() => toggleProjectExpansion(project.id)}
            >
              <div className="flex items-center space-x-2 flex-1">
                {expandedProjects.includes(project.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                
                {editingProject === project.id ? (
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="bg-transparent border-none outline-none text-sm font-medium flex-1"
                    onBlur={(e) => handleProjectRename(project.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleProjectRename(project.id, e.currentTarget.value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span 
                    className="text-sm font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}`);
                    }}
                  >
                    {project.name}
                  </span>
                )}
              </div>
              
              {hoveredProject === project.id && editingProject !== project.id && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenProjectMenu(openProjectMenu === project.id ? null : project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </button>
                  
                  {openProjectMenu === project.id && (
                    <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectEdit(project.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit Name</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddFilesToProject(project.id);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Files</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(project.id);
                          setOpenProjectMenu(null);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete Project</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Project Files */}
            {expandedProjects.includes(project.id) && (
              <div className="ml-6 space-y-1">
                {(project.documents || project.files || []).length === 0 ? (
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                    No files in this project
                  </div>
                ) : (
                  (project.documents || project.files || []).map((file: any) => (
                    <div
                      key={file.document_id}
                      className="px-4 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 rounded cursor-pointer"
                      onClick={() => navigate(`/chat/${file.document_id}`)}
                    >
                      {file.filename}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
        )}
      </div>

      {/* Bottom User Section */}
      {user && (
        <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* User Profile */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* Settings Button */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              {/* Settings Dropdown */}
              {showSettingsMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setDarkMode(!darkMode);
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg transition-colors"
                  >
                    {darkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      logout();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Project
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteConfirm)}
                disabled={deleteProjectMutation.isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteProjectMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal 
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
      />
    </div>
  );
};

export default Sidebar; 