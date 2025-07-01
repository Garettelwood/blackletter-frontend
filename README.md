# Blackletter AI - Legal Document Q&A Frontend

A modern React-based frontend for the Blackletter AI legal document Q&A system. This application allows lawyers to upload PDF documents and ask natural language questions about their content, receiving accurate answers with page citations.

## 🚀 Features

### ✅ Document Upload
- **Drag & drop PDF upload** with visual feedback
- **File validation** (PDFs only, max 100MB)
- **Upload progress tracking**
- **Real-time error handling**

### ✅ Document Management
- **Document library** with status tracking
- **Search and filter** documents by status
- **Delete documents** with confirmation
- **Processing status** with real-time updates

### ✅ Project Management
- **Create projects** with custom names
- **Organize files** into projects
- **Project view** with file management
- **Add/remove files** from projects
- **Project navigation** in sidebar

### ✅ Q&A Chat Interface
- **ChatGPT-style chat UI** for familiar experience
- **Real-time question processing** with loading states
- **Source citations** displayed with each answer
- **Conversation history** with question/answer pairs
- **Processing time indicators**

### ✅ Professional Design
- **Clean, lawyer-friendly interface**
- **Dark/light mode toggle**
- **Mobile responsive design**
- **Professional color scheme**
- **Loading states and error handling**

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for API state management
- **React Router** for navigation
- **React Dropzone** for file uploads
- **Axios** for HTTP requests
- **Lucide React** for icons

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blackletter-ai-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key (Required)**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://23.23.190.168:8000
   VITE_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### API Authentication
The application requires an API key for authentication. The API key is automatically included in all requests to the backend.

**Default API Key:** `bl_garrett_dev_67890`

To use a different API key, set the `VITE_API_KEY` environment variable in your `.env` file.

### API Endpoint
The application is configured to connect to the Blackletter AI backend at:
```
http://23.23.190.168:8000
```

To change the API endpoint, set the `VITE_API_BASE_URL` environment variable in your `.env` file.

### Environment Variables
Create a `.env` file in the root directory for any environment-specific configuration:

```env
VITE_API_BASE_URL=http://23.23.190.168:8000
VITE_API_KEY=bl_garrett_dev_67890
```

## 📱 Usage

### 1. Upload a Document
1. Navigate to the home page (`/`)
2. Drag and drop a PDF file or click to browse
3. Wait for upload completion
4. You'll be redirected to the processing page

### 2. Monitor Processing
1. The processing page shows real-time status updates
2. Processing time varies (30 seconds to 5 minutes)
3. You'll be automatically redirected when complete

### 3. Ask Questions
1. Navigate to the document library (`/documents`)
2. Click "Ask Questions" on a completed document
3. Type your question in the chat interface
4. Receive answers with page citations

### 4. Manage Documents
1. View all documents in the library
2. Search and filter by status
3. Delete documents as needed
4. Monitor processing status

### 5. Create and Manage Projects
1. Click "New Project" in the sidebar
2. Enter a project name
3. Select files to include in the project
4. Click "Create Project" to save
5. View project details by clicking the project name
6. Add or remove files from projects as needed

## 🎨 Design System

### Colors
- **Primary**: Blue (#0ea5e9) - Used for buttons, links, and highlights
- **Success**: Green (#10b981) - Used for completed status
- **Warning**: Yellow (#f59e0b) - Used for processing status
- **Error**: Red (#ef4444) - Used for errors and failed status

### Components
- **Cards**: White background with subtle shadows
- **Buttons**: Primary (blue) and secondary (gray) variants
- **Inputs**: Consistent styling with focus states
- **Icons**: Lucide React icons throughout

## 🔌 API Integration

The frontend integrates with the following API endpoints:

### Upload Document
```typescript
POST /upload
Content-Type: multipart/form-data
Authorization: Bearer {API_KEY}
```

### Check Processing Status
```typescript
GET /status/{job_id}
Authorization: Bearer {API_KEY}
```

### Ask Questions
```typescript
POST /ask
Content-Type: application/json
Authorization: Bearer {API_KEY}
```

### List Documents
```typescript
GET /documents/{user_id}
Authorization: Bearer {API_KEY}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Set environment variables in Vercel dashboard
3. Run: `vercel`
4. Follow the prompts

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

## 🐛 Troubleshooting

### Common Issues

1. **401 Authentication Errors**
   - Verify your API key is correct in the `.env` file
   - Check that the API key has the necessary permissions
   - Use the "Test API Connection" button to debug

2. **API Connection Errors**
   - Verify the backend server is running at `http://23.23.190.168:8000`
   - Check network connectivity
   - Review browser console for CORS errors

3. **File Upload Issues**
   - Ensure file is PDF format
   - Check file size (max 100MB)
   - Verify network connection

4. **Processing Timeouts**
   - Large documents may take 5+ minutes
   - Check processing status page for updates
   - Contact support if processing fails

### Development Issues

1. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check `tsconfig.json` configuration

2. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check `tailwind.config.js` for custom styles

## 📄 License

This project is proprietary software for Blackletter AI.

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test thoroughly before submitting
4. Update documentation as needed

## 📞 Support

For technical support or questions:
- Check the API documentation at `http://23.23.190.168:8000/docs`
- Review browser console for error messages
- Use the debug tools in the application
- Contact the development team

---

**Built with ❤️ for legal professionals** # blackletter-frontend
