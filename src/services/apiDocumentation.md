# FastAPI Backend - API Documentation

This document describes all the API endpoints, parameters, and expected responses for the project-based mindmap chat application.

## Base Configuration

- **Base URL**: `http://localhost:8000`
- **Content-Type**: `application/json` (except file uploads)
- **Authentication**: Bearer token (if implemented)

## Data Models

### Project

```typescript
interface Project {
  id: string;              // UUID
  name: string;            // Project name (required)
  description?: string;    // Optional description
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
  mindmap_data?: any;      // JSON object with mindmap structure
}
```

### Chat

```typescript
interface Chat {
  id: string;              // UUID
  project_id: string;      // Parent project UUID
  name: string;            // Chat name (required)
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}
```

### Message

```typescript
interface Message {
  id: string;                    // UUID
  chat_id: string;               // Parent chat UUID
  type: 'user' | 'ai';          // Message type
  content: string;               // Message content (required)
  timestamp: string;             // ISO 8601 timestamp
  model_used?: string;           // AI model used (for AI messages)
  use_documents_only?: boolean;  // Whether AI used only documents
}
```

### Document

```typescript
interface Document {
  id: string;              // UUID
  project_id: string;      // Parent project UUID
  name: string;            // Original filename
  type: string;            // MIME type (e.g., "application/pdf")
  size: number;            // File size in bytes
  upload_date: string;     // ISO 8601 timestamp
  file_path: string;       // Server file path
}
```

## API Endpoints

### Projects API

#### GET `/api/projects`
Get all projects for the current user.

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My First Project",
    "description": "A sample project for testing",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z",
    "mindmap_data": {
      "nodes": [],
      "edges": []
    }
  }
]
```

#### GET `/api/projects/{project_id}`
Get a specific project by ID.

**Parameters:**
- `project_id` (path): Project UUID

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My First Project",
  "description": "A sample project for testing",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z",
  "mindmap_data": {
    "nodes": [
      {
        "id": "node1",
        "data": { "label": "Central Topic", "content": "Main idea" },
        "position": { "x": 250, "y": 250 }
      }
    ],
    "edges": []
  }
}
```

#### POST `/api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Optional project description",
  "mindmap_data": {
    "nodes": [],
    "edges": []
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "New Project",
  "description": "Optional project description",
  "created_at": "2024-01-01T14:00:00Z",
  "updated_at": "2024-01-01T14:00:00Z",
  "mindmap_data": {
    "nodes": [],
    "edges": []
  }
}
```

#### PUT `/api/projects/{project_id}`
Update an existing project.

**Parameters:**
- `project_id` (path): Project UUID

**Request Body:** (partial update)
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response:** `200 OK` (updated project object)

#### DELETE `/api/projects/{project_id}`
Delete a project and all associated data.

**Parameters:**
- `project_id` (path): Project UUID

**Response:** `204 No Content`

### Mind Map API

#### PUT `/api/projects/{project_id}/mindmap`
Update mindmap data for a project.

**Parameters:**
- `project_id` (path): Project UUID

**Request Body:**
```json
{
  "mindmap_data": {
    "nodes": [
      {
        "id": "node1",
        "data": {
          "label": "Central Topic",
          "content": "Detailed content for this node",
          "color": "#ff6b6b"
        },
        "position": { "x": 250, "y": 250 },
        "type": "default"
      },
      {
        "id": "node2",
        "data": {
          "label": "Subtopic",
          "content": "Related information"
        },
        "position": { "x": 400, "y": 300 },
        "type": "default"
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2",
        "type": "smoothstep"
      }
    ],
    "viewport": {
      "x": 0,
      "y": 0,
      "zoom": 1
    }
  }
}
```

**Response:** `200 OK`

### Chats API

#### GET `/api/projects/{project_id}/chats`
Get all chats for a project.

**Parameters:**
- `project_id` (path): Project UUID

**Response:** `200 OK`
```json
[
  {
    "id": "chat-uuid-1",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "General Discussion",
    "created_at": "2024-01-01T10:30:00Z",
    "updated_at": "2024-01-01T11:45:00Z"
  },
  {
    "id": "chat-uuid-2",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Technical Questions",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:30:00Z"
  }
]
```

#### POST `/api/projects/{project_id}/chats`
Create a new chat.

**Parameters:**
- `project_id` (path): Project UUID

**Request Body:**
```json
{
  "name": "New Chat Topic"
}
```

**Response:** `201 Created`

#### PUT `/api/projects/{project_id}/chats/{chat_id}`
Update a chat.

**Parameters:**
- `project_id` (path): Project UUID
- `chat_id` (path): Chat UUID

**Request Body:**
```json
{
  "name": "Updated Chat Name"
}
```

**Response:** `200 OK`

#### DELETE `/api/projects/{project_id}/chats/{chat_id}`
Delete a chat and all its messages.

**Parameters:**
- `project_id` (path): Project UUID
- `chat_id` (path): Chat UUID

**Response:** `204 No Content`

### Messages API

#### GET `/api/projects/{project_id}/chats/{chat_id}/messages`
Get all messages for a chat, ordered by timestamp.

**Parameters:**
- `project_id` (path): Project UUID
- `chat_id` (path): Chat UUID

**Query Parameters:**
- `limit` (optional): Maximum number of messages (default: 100)
- `offset` (optional): Number of messages to skip (default: 0)

**Response:** `200 OK`
```json
[
  {
    "id": "msg-uuid-1",
    "chat_id": "chat-uuid-1",
    "type": "user",
    "content": "Hello, can you help me understand this concept?",
    "timestamp": "2024-01-01T10:30:00Z",
    "model_used": null,
    "use_documents_only": null
  },
  {
    "id": "msg-uuid-2",
    "chat_id": "chat-uuid-1",
    "type": "ai",
    "content": "Of course! I'd be happy to help you understand this concept. Based on the documents you've uploaded...",
    "timestamp": "2024-01-01T10:30:15Z",
    "model_used": "gpt-4",
    "use_documents_only": true
  }
]
```

#### POST `/api/projects/{project_id}/chats/{chat_id}/messages`
Create a new message.

**Parameters:**
- `project_id` (path): Project UUID
- `chat_id` (path): Chat UUID

**Request Body:**
```json
{
  "type": "user",
  "content": "What are the key principles of machine learning?",
  "model_used": null,
  "use_documents_only": null
}
```

**Response:** `201 Created`

### Streaming API

#### POST `/api/projects/{project_id}/chats/{chat_id}/stream`
Stream AI response in real-time chunks.

**Parameters:**
- `project_id` (path): Project UUID
- `chat_id` (path): Chat UUID

**Request Body:**
```json
{
  "message": "Explain quantum computing",
  "model": "gpt-4",
  "use_documents_only": false,
  "selected_node": {
    "id": "node1",
    "data": {
      "label": "Quantum Physics",
      "content": "Advanced physics concepts"
    }
  }
}
```

**Response:** `200 OK` (Server-Sent Events)
```
data: {"content": "Quantum"}
data: {"content": " computing"}
data: {"content": " is"}
data: {"content": " a"}
data: {"content": " revolutionary"}
data: {"content": " technology..."}
data: [DONE]
```

### WebSocket API

#### WebSocket `/ws/projects/{project_id}/chats/{chat_id}`
Real-time bidirectional communication for live chat and mindmap updates.

**Connection URL:** `ws://localhost:8000/ws/projects/{project_id}/chats/{chat_id}`

**Message Types:**

1. **Chat Message:**
```json
{
  "type": "chat_message",
  "data": {
    "message_id": "msg-uuid",
    "content": "New message content",
    "sender": "user"
  }
}
```

2. **Mindmap Update:**
```json
{
  "type": "mindmap_update",
  "data": {
    "node_id": "node1",
    "action": "update",
    "node_data": {
      "label": "Updated Label",
      "position": { "x": 300, "y": 250 }
    }
  }
}
```

3. **User Presence:**
```json
{
  "type": "user_presence",
  "data": {
    "user_id": "user-uuid",
    "status": "online",
    "cursor_position": { "x": 250, "y": 300 }
  }
}
```

### Documents API

#### GET `/api/projects/{project_id}/documents`
Get all documents for a project.

**Parameters:**
- `project_id` (path): Project UUID

**Response:** `200 OK`
```json
[
  {
    "id": "doc-uuid-1",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "research_paper.pdf",
    "type": "application/pdf",
    "size": 2048576,
    "upload_date": "2024-01-01T09:00:00Z",
    "file_path": "/uploads/projects/550e8400-e29b-41d4-a716-446655440000/research_paper.pdf"
  }
]
```

#### POST `/api/projects/{project_id}/documents`
Upload a new document.

**Parameters:**
- `project_id` (path): Project UUID

**Request:** `multipart/form-data`
- `file`: File to upload

**Response:** `201 Created`
```json
{
  "id": "doc-uuid-2",
  "project_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "uploaded_file.docx",
  "type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "size": 1024000,
  "upload_date": "2024-01-01T15:00:00Z",
  "file_path": "/uploads/projects/550e8400-e29b-41d4-a716-446655440000/uploaded_file.docx"
}
```

#### DELETE `/api/projects/{project_id}/documents/{document_id}`
Delete a document.

**Parameters:**
- `project_id` (path): Project UUID
- `document_id` (path): Document UUID

**Response:** `204 No Content`

#### GET `/api/projects/{project_id}/documents/{document_id}/download`
Download a document.

**Parameters:**
- `project_id` (path): Project UUID
- `document_id` (path): Document UUID

**Response:** `200 OK` (Binary file content)
**Headers:**
- `Content-Type`: Original file MIME type
- `Content-Disposition`: `attachment; filename="original_filename.ext"`

### Search API

#### GET `/api/projects/{project_id}/search/messages`
Search messages within a project.

**Parameters:**
- `project_id` (path): Project UUID

**Query Parameters:**
- `query` (required): Search query string
- `chat_id` (optional): Limit search to specific chat
- `limit` (optional): Maximum results (default: 50)

**Response:** `200 OK`
```json
[
  {
    "id": "msg-uuid-1",
    "chat_id": "chat-uuid-1",
    "type": "user",
    "content": "What is machine learning?",
    "timestamp": "2024-01-01T10:30:00Z",
    "relevance_score": 0.95
  }
]
```

#### GET `/api/projects/{project_id}/search/documents`
Search documents within a project.

**Parameters:**
- `project_id` (path): Project UUID

**Query Parameters:**
- `query` (required): Search query string
- `limit` (optional): Maximum results (default: 20)

**Response:** `200 OK`
```json
[
  {
    "id": "doc-uuid-1",
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "machine_learning_guide.pdf",
    "type": "application/pdf",
    "size": 2048576,
    "upload_date": "2024-01-01T09:00:00Z",
    "file_path": "/uploads/projects/550e8400-e29b-41d4-a716-446655440000/machine_learning_guide.pdf",
    "relevance_score": 0.88,
    "matching_content": "Machine learning is a subset of artificial intelligence..."
  }
]
```

### Analytics API

#### GET `/api/projects/{project_id}/stats`
Get project statistics.

**Parameters:**
- `project_id` (path): Project UUID

**Response:** `200 OK`
```json
{
  "total_chats": 5,
  "total_messages": 142,
  "total_documents": 8,
  "created_at": "2024-01-01T10:00:00Z",
  "last_activity": "2024-01-01T16:30:00Z",
  "storage_used": 15728640,
  "ai_model_usage": {
    "gpt-4": 45,
    "claude-3-opus": 23,
    "gpt-3.5-turbo": 12
  }
}
```

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": {
    "field": "name",
    "issue": "Name is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "The requested resource was not found"
}
```

### 422 Validation Error
```json
{
  "error": "Validation Error",
  "message": "Request validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Implementation Notes

1. **Authentication**: Add JWT bearer token authentication to all endpoints
2. **Rate Limiting**: Implement rate limiting for API calls, especially streaming
3. **File Upload Limits**: Set maximum file size (e.g., 50MB) and allowed file types
4. **Database Indexes**: Create indexes on frequently queried fields (project_id, chat_id, timestamps)
5. **Streaming**: Use FastAPI's StreamingResponse for chat streaming
6. **WebSocket Management**: Handle connection lifecycle, reconnection, and error recovery
7. **Caching**: Implement Redis caching for frequently accessed data
8. **Logging**: Add comprehensive logging for debugging and monitoring
9. **Validation**: Use Pydantic models for request/response validation
10. **CORS**: Configure CORS settings for frontend integration

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mindmap_db

# AI APIs
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# File Storage
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=52428800  # 50MB

# Redis (for caching and WebSocket management)
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET_KEY=your_jwt_secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30

# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false
```