import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun, Plus, FolderOpen, Settings, User, Edit2 } from 'lucide-react';
import UploadPage from './pages/UploadPage';
import DocumentLibrary from './pages/DocumentLibrary.tsx';
import ChatInterface from './pages/ChatInterface.tsx';
import ProcessingPage from './pages/ProcessingPage.tsx';
import ProjectView from './pages/ProjectView.tsx';
import Sidebar from './components/Sidebar';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
    </div>
  );
}

export default App; 