import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { Send, FileText, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { askQuestion, listDocuments } from '../services/api';
import { ChatMessage, Document } from '../types';

const ChatInterface = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(documentId ? [documentId] : []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get document info
  const { data: documents = [] } = useQuery('documents', listDocuments);

  // Ask question mutation
  const askQuestionMutation = useMutation(
    (question: string) => askQuestion({
      question,
      document_ids: selectedDocumentIds,
    }),
    {
      onSuccess: (response) => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'answer',
          content: response.answer,
          timestamp: new Date(),
          sources: response.sources,
          processingTime: response.processing_time
        };
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(false);
      },
      onError: (error) => {
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'answer',
          content: 'Sorry, I encountered an error while processing your question. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
      }
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || selectedDocumentIds.length === 0) return;

    const questionMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'question',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, questionMessage]);
    setInputValue('');
    setIsLoading(true);

    askQuestionMutation.mutate(inputValue.trim());
  };

  const handleDocumentSelect = (docId: string) => {
    setSelectedDocumentIds((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const formatSources = (sources: string) => {
    // Parse sources like "pp.12-15, p.23, pp.31-33"
    const sourceList = sources.split(',').map(s => s.trim());
    return sourceList.map((source, index) => (
      <span
        key={index}
        className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded text-sm mr-2 mb-1 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
        title={`Jump to ${source}`}
      >
        {source}
      </span>
    ));
  };

  // Get current project name (mock data for now)
  const currentProjectName = "Project 1";

  return (
    <div className="h-full flex flex-col">
      {/* Header with Project Name */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {currentProjectName}
        </h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start asking questions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ask any question about your legal documents and get instant answers with citations.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.type === 'question'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {message.type === 'answer' && message.sources && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Sources:
                    </div>
                    <div className="flex flex-wrap">
                      {formatSources(message.sources)}
                    </div>
                  </div>
                )}
                
                {message.type === 'answer' && message.processingTime && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Processed in {message.processingTime.toFixed(1)}s
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                <span className="text-gray-600 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Documents */}
      {selectedDocumentIds.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {selectedDocumentIds.map((docId) => {
              const doc = documents.find((d: Document) => d.document_id === docId);
              return doc ? (
                <span
                  key={docId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                >
                  {doc.filename}
                  <button
                    onClick={() => handleDocumentSelect(docId)}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about your selected documents..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading || selectedDocumentIds.length === 0}
          />
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Add more files"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || selectedDocumentIds.length === 0}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {selectedDocumentIds.length === 0 
            ? "Select at least one document to ask a question." 
            : `Selected ${selectedDocumentIds.length} document(s). Press Enter to send.`
          }
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 