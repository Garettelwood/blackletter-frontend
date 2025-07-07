import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun, Plus, FolderOpen, Settings, User, Edit2 } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import DocumentLibrary from './pages/DocumentLibrary.tsx';
import ChatInterface from './pages/ChatInterface.tsx';
import ProcessingPage from './pages/ProcessingPage.tsx';
import ProjectView from './pages/ProjectView.tsx';
import Login from './pages/Login';
import Register from './pages/Register';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white dark:bg-black transition-all duration-300">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex h-screen">
                {/* Sidebar */}
                <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/" element={<ChatInterface />} />
                      <Route path="/upload" element={<UploadPage />} />
                      <Route path="/documents" element={<DocumentLibrary />} />
                      <Route path="/chat/:documentId" element={<ChatInterface />} />
                      <Route path="/processing/:jobId" element={<ProcessingPage />} />
                      <Route path="/projects/:projectId" element={<ProjectView />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App; 