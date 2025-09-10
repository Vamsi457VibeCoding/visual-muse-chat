# Project-Based Chat System Implementation Guide

This document provides a detailed guide for implementing the project-based chat system with mock data, designed to be easily switchable to real backend APIs.

## 🏗️ Architecture Overview

### System Components

1. **Data Layer** (`src/data/mockData.ts`)
   - Mock data for projects, chats, messages, and documents
   - Utility functions for data access
   - API delay simulation

2. **Service Layer** (`src/services/httpService.ts`)
   - HTTP service with mock/real API switching
   - Comprehensive API method definitions
   - Error handling and toast notifications

3. **State Management** (`src/contexts/ProjectContext.tsx`)
   - Global project state management
   - Current project/chat selection
   - CRUD operations for projects and chats

4. **UI Components**
   - `ProjectDashboard` - Main layout component
   - `ChatInterface` - Enhanced for project context
   - `MindMapCanvas` - Integrated with project state

## 📂 Project Structure

```
src/
├── data/
│   └── mockData.ts              # Mock data and utilities
├── services/
│   ├── httpService.ts           # API service layer
│   └── apiDocumentation.md      # Complete API documentation
├── contexts/
│   └── ProjectContext.tsx       # Global state management
├── components/
│   ├── ProjectDashboard.tsx     # Main dashboard layout
│   ├── ChatInterface.tsx        # Enhanced chat interface
│   └── MindMapCanvas.tsx        # Mind map component
└── docs/
    └── IMPLEMENTATION_GUIDE.md  # This file
```

## 🔄 Mock Data to Real API Migration

### Current Mock Setup

The system is currently configured to use mock data with a simple flag:

```typescript
// In src/services/httpService.ts
const USE_MOCK_DATA = true; // Set to false for real API
```

### Migration Process

1. **Set up your backend** (FastAPI, Node.js, etc.)
2. **Update the flag**: Set `USE_MOCK_DATA = false`
3. **Configure API endpoint**: Update `API_BASE_URL` 
4. **Test endpoints** using the provided API documentation

### API Endpoint Structure

All endpoints follow RESTful conventions:

```
GET    /api/projects              # List projects
POST   /api/projects              # Create project
GET    /api/projects/{id}         # Get project
PUT    /api/projects/{id}         # Update project
DELETE /api/projects/{id}         # Delete project

GET    /api/projects/{id}/chats           # List chats
POST   /api/projects/{id}/chats           # Create chat
DELETE /api/projects/{id}/chats/{chat_id} # Delete chat

GET    /api/projects/{id}/chats/{chat_id}/messages    # List messages
POST   /api/projects/{id}/chats/{chat_id}/messages    # Create message
POST   /api/projects/{id}/chats/{chat_id}/stream      # Stream response

PUT    /api/projects/{id}/mindmap         # Update mindmap
GET    /api/projects/{id}/documents       # List documents
POST   /api/projects/{id}/documents       # Upload document
```

## 🚀 Implementation Steps

### Step 1: Data Models

All TypeScript interfaces are defined in `src/services/httpService.ts`:

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  mindmap_data?: any;
}

interface Chat {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  model_used?: string;
  use_documents_only?: boolean;
}

interface Document {
  id: string;
  project_id: string;
  name: string;
  type: string;
  size: number;
  upload_date: string;
  file_path: string;
}
```

### Step 2: Mock Data Structure

Mock data is organized by relationships:

```typescript
// Projects array
export const mockProjects: Project[] = [...]

// Chats organized by project ID
export const mockChats: Record<string, Chat[]> = {
  "project-1": [...],
  "project-2": [...]
}

// Messages organized by chat ID  
export const mockMessages: Record<string, Message[]> = {
  "chat-1-1": [...],
  "chat-1-2": [...]
}

// Documents organized by project ID
export const mockDocuments: Record<string, Document[]> = {
  "project-1": [...],
  "project-2": [...]
}
```

### Step 3: Service Layer Implementation

The HTTP service automatically switches between mock and real data:

```typescript
async getProjects(): Promise<Project[]> {
  if (USE_MOCK_DATA) {
    await mockApiDelay(); // Simulate network delay
    return [...mockProjects];
  }
  return this.request<Project[]>('/api/projects');
}
```

### Step 4: State Management

The ProjectContext provides centralized state management:

```typescript
const {
  projects,           // All projects
  currentProject,     // Selected project
  currentChat,        // Selected chat
  chats,             // Chats in current project
  messages,          // Messages in current chat
  selectProject,     // Switch projects
  selectChat,        // Switch chats
  createProject,     // Create new project
  createChat,        // Create new chat
  // ... other methods
} = useProject();
```

### Step 5: UI Components

The ProjectDashboard serves as the main layout:

- **Left Sidebar**: Projects list and chat history
- **Main Area**: Tabbed interface (Chat/Mind Map)
- **Responsive Design**: Works on desktop and mobile

## 🎯 Key Features

### Project Management
- ✅ Create, edit, delete projects
- ✅ Project switching with state persistence
- ✅ Project description and metadata
- ✅ Auto-selection of first project/chat

### Chat System
- ✅ Multiple chats per project
- ✅ Chat history persistence
- ✅ Message threading
- ✅ Real-time message streaming (mock)
- ✅ AI model selection per message

### Mind Map Integration
- ✅ Project-specific mind maps
- ✅ Auto-save mind map state
- ✅ Context sharing between chat and mind map
- ✅ Visual mind map editor

### Document Management
- ✅ Project-scoped document uploads
- ✅ Document-aware AI responses
- ✅ File type support (PDF, DOCX, CSV, etc.)

## 🔧 Configuration Options

### Mock Data Customization

Add your own mock data in `src/data/mockData.ts`:

```typescript
// Add new project
mockProjects.push({
  id: "project-4",
  name: "Your Custom Project",
  description: "Custom project description",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  mindmap_data: { nodes: [], edges: [] }
});

// Add chats for the project
mockChats["project-4"] = [
  {
    id: "chat-4-1",
    project_id: "project-4", 
    name: "General Discussion",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
```

### API Configuration

Update these settings in `src/services/httpService.ts`:

```typescript
// Switch between mock and real API
const USE_MOCK_DATA = false; // Set to false for real backend

// Configure your backend URL
const API_BASE_URL = 'https://your-api.com'; // Your backend URL

// Adjust mock API delays
export const mockApiDelay = (min: number = 200, max: number = 800)
```

## 📋 Testing Checklist

### Mock Data Testing
- [ ] Projects load correctly
- [ ] Project switching works
- [ ] Chat creation and selection
- [ ] Message history persistence
- [ ] Mind map state saving
- [ ] Document upload simulation

### API Integration Testing
- [ ] Real API endpoints respond correctly
- [ ] Error handling works properly
- [ ] Loading states display appropriately
- [ ] Toast notifications appear
- [ ] Data persistence across sessions

### UI/UX Testing
- [ ] Responsive design on mobile
- [ ] Keyboard navigation works
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Smooth transitions between views

## 🚨 Common Issues & Solutions

### Issue: Mock data not loading
**Solution**: Check that `USE_MOCK_DATA = true` and mock data files are properly imported.

### Issue: Real API calls failing  
**Solution**: Verify `API_BASE_URL` is correct and backend is running. Check browser network tab for error details.

### Issue: State not persisting
**Solution**: Ensure ProjectProvider wraps your app and context is being used correctly.

### Issue: Mind map not saving
**Solution**: Check that `updateMindMap` is being called and project context is available.

## 🔮 Future Enhancements

### Planned Features
- Real-time collaboration via WebSockets
- Advanced search across projects
- Project templates and cloning
- Export/import functionality
- Mobile app version
- Offline support with sync

### Backend Integration
- User authentication and authorization
- Database indexing for performance
- File storage with CDN
- Rate limiting and caching
- Analytics and monitoring

## 📚 API Documentation

Complete API documentation is available in `src/services/apiDocumentation.md`, including:

- All endpoint definitions
- Request/response schemas  
- Error handling patterns
- Authentication requirements
- Rate limiting information
- WebSocket specifications

## 🤝 Contributing

When adding new features:

1. **Update mock data** first for testing
2. **Add corresponding API methods** in httpService
3. **Update context/state management** if needed
4. **Create/update UI components**
5. **Test with both mock and real data**
6. **Update documentation**

## 📞 Support

For implementation questions or issues:

1. Check this guide first
2. Review the API documentation
3. Test with mock data to isolate issues
4. Check browser console for errors
5. Verify network requests in dev tools

This implementation provides a solid foundation for a production-ready project-based chat system with seamless backend integration capabilities.
