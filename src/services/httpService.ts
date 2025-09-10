import { toast } from "@/components/ui/use-toast";

// Types for API responses
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  mindmap_data?: any;
}

export interface Chat {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  model_used?: string;
  use_documents_only?: boolean;
}

export interface Document {
  id: string;
  project_id: string;
  name: string;
  type: string;
  size: number;
  upload_date: string;
  file_path: string;
}

// Base API configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * HTTP Service for managing API calls to the FastAPI backend
 * Handles projects, chats, messages, documents, and real-time communication
 */
class HttpService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      toast({
        title: "API Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  // ====================== PROJECTS API ======================
  
  /**
   * Get all projects for the current user
   * 
   * @returns Promise<Project[]> - Array of project objects
   * 
   * Expected Response:
   * [
   *   {
   *     "id": "uuid",
   *     "name": "Project Name",
   *     "description": "Optional description",
   *     "created_at": "2024-01-01T00:00:00Z",
   *     "updated_at": "2024-01-01T00:00:00Z",
   *     "mindmap_data": {} // Optional mindmap JSON data
   *   }
   * ]
   */
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/projects');
  }

  /**
   * Get a specific project by ID
   * 
   * @param id - Project UUID
   * @returns Promise<Project> - Single project object
   * 
   * Expected Response:
   * {
   *   "id": "uuid",
   *   "name": "Project Name",
   *   "description": "Optional description",
   *   "created_at": "2024-01-01T00:00:00Z",
   *   "updated_at": "2024-01-01T00:00:00Z",
   *   "mindmap_data": {}
   * }
   */
  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  /**
   * Create a new project
   * 
   * @param data - Project data (name required, description optional)
   * @param data.name - Project name (required)
   * @param data.description - Project description (optional)
   * @param data.mindmap_data - Initial mindmap data (optional)
   * 
   * @returns Promise<Project> - Created project object with generated ID and timestamps
   * 
   * Request Body:
   * {
   *   "name": "New Project",
   *   "description": "Optional description",
   *   "mindmap_data": {} // Optional
   * }
   * 
   * Expected Response:
   * {
   *   "id": "generated-uuid",
   *   "name": "New Project",
   *   "description": "Optional description",
   *   "created_at": "2024-01-01T00:00:00Z",
   *   "updated_at": "2024-01-01T00:00:00Z",
   *   "mindmap_data": {}
   * }
   */
  async createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing project
   * 
   * @param id - Project UUID
   * @param data - Partial project data to update
   * @param data.name - Updated name (optional)
   * @param data.description - Updated description (optional)
   * @param data.mindmap_data - Updated mindmap data (optional)
   * 
   * @returns Promise<Project> - Updated project object
   * 
   * Request Body:
   * {
   *   "name": "Updated Name", // Optional
   *   "description": "Updated description", // Optional
   *   "mindmap_data": {} // Optional
   * }
   */
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a project and all associated data (chats, messages, documents)
   * 
   * @param id - Project UUID
   * @returns Promise<void> - No response body on success
   * 
   * Expected Response: 204 No Content
   */
  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // ====================== MIND MAP API ======================
  
  /**
   * Update mindmap data for a project
   * 
   * @param projectId - Project UUID
   * @param mindmapData - Complete mindmap data object (nodes, edges, layout, etc.)
   * @returns Promise<void> - No response body on success
   * 
   * Request Body:
   * {
   *   "mindmap_data": {
   *     "nodes": [
   *       {
   *         "id": "node1",
   *         "data": { "label": "Node Label", "content": "..." },
   *         "position": { "x": 100, "y": 100 }
   *       }
   *     ],
   *     "edges": [
   *       { "id": "edge1", "source": "node1", "target": "node2" }
   *     ]
   *   }
   * }
   * 
   * Expected Response: 200 OK (no body)
   */
  async updateMindMap(projectId: string, mindmapData: any): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}/mindmap`, {
      method: 'PUT',
      body: JSON.stringify({ mindmap_data: mindmapData }),
    });
  }

  // ====================== CHATS API ======================
  
  /**
   * Get all chats for a specific project
   * 
   * @param projectId - Project UUID
   * @returns Promise<Chat[]> - Array of chat objects
   * 
   * Expected Response:
   * [
   *   {
   *     "id": "chat-uuid",
   *     "project_id": "project-uuid", 
   *     "name": "Chat Name",
   *     "created_at": "2024-01-01T00:00:00Z",
   *     "updated_at": "2024-01-01T00:00:00Z"
   *   }
   * ]
   */
  async getChats(projectId: string): Promise<Chat[]> {
    return this.request<Chat[]>(`/api/projects/${projectId}/chats`);
  }

  /**
   * Get a specific chat by ID
   * 
   * @param projectId - Project UUID
   * @param chatId - Chat UUID
   * @returns Promise<Chat> - Single chat object
   */
  async getChat(projectId: string, chatId: string): Promise<Chat> {
    return this.request<Chat>(`/api/projects/${projectId}/chats/${chatId}`);
  }

  /**
   * Create a new chat in a project
   * 
   * @param projectId - Project UUID
   * @param data - Chat data
   * @param data.name - Chat name (required)
   * @returns Promise<Chat> - Created chat object
   * 
   * Request Body:
   * {
   *   "name": "New Chat"
   * }
   */
  async createChat(projectId: string, data: Omit<Chat, 'id' | 'project_id' | 'created_at' | 'updated_at'>): Promise<Chat> {
    return this.request<Chat>(`/api/projects/${projectId}/chats`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing chat
   * 
   * @param projectId - Project UUID
   * @param chatId - Chat UUID
   * @param data - Partial chat data to update
   * @param data.name - Updated chat name (optional)
   * @returns Promise<Chat> - Updated chat object
   */
  async updateChat(projectId: string, chatId: string, data: Partial<Chat>): Promise<Chat> {
    return this.request<Chat>(`/api/projects/${projectId}/chats/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a chat and all its messages
   * 
   * @param projectId - Project UUID
   * @param chatId - Chat UUID
   * @returns Promise<void> - No response body on success
   */
  async deleteChat(projectId: string, chatId: string): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}/chats/${chatId}`, {
      method: 'DELETE',
    });
  }

  // ====================== MESSAGES API ======================
  
  /**
   * Get all messages for a specific chat
   * 
   * @param projectId - Project UUID
   * @param chatId - Chat UUID
   * @returns Promise<Message[]> - Array of message objects ordered by timestamp
   * 
   * Expected Response:
   * [
   *   {
   *     "id": "message-uuid",
   *     "chat_id": "chat-uuid",
   *     "type": "user",
   *     "content": "User message content",
   *     "timestamp": "2024-01-01T00:00:00Z",
   *     "model_used": null,
   *     "use_documents_only": null
   *   },
   *   {
   *     "id": "message-uuid-2",
   *     "chat_id": "chat-uuid", 
   *     "type": "ai",
   *     "content": "AI response content",
   *     "timestamp": "2024-01-01T00:00:01Z",
   *     "model_used": "gpt-4",
   *     "use_documents_only": false
   *   }
   * ]
   */
  async getMessages(projectId: string, chatId: string): Promise<Message[]> {
    return this.request<Message[]>(`/api/projects/${projectId}/chats/${chatId}/messages`);
  }

  /**
   * Create a new message in a chat
   * 
   * @param projectId - Project UUID
   * @param chatId - Chat UUID
   * @param data - Message data
   * @param data.type - Message type: 'user' or 'ai' (required)
   * @param data.content - Message content (required)
   * @param data.model_used - AI model used (optional, for AI messages)
   * @param data.use_documents_only - Whether AI used only documents (optional, for AI messages)
   * @returns Promise<Message> - Created message object with generated ID and timestamp
   * 
   * Request Body:
   * {
   *   "type": "user",
   *   "content": "Hello, how are you?",
   *   "model_used": "gpt-4", // Optional, for AI messages
   *   "use_documents_only": false // Optional, for AI messages
   * }
   */
  async createMessage(projectId: string, chatId: string, data: Omit<Message, 'id' | 'chat_id' | 'timestamp'>): Promise<Message> {
    return this.request<Message>(`/api/projects/${projectId}/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ====================== STREAMING API ======================
  
  /**
   * Stream AI chat response with real-time chunks
   * 
   * @param projectId - Project UUID
   * @param chatId - Chat UUID  
   * @param message - User message content
   * @param options - Streaming options
   * @param options.model - AI model to use (e.g., "gpt-4", "claude-3-opus", optional)
   * @param options.useDocumentsOnly - Whether to use only uploaded documents (optional, default: false)
   * @param options.selectedNode - Currently selected mindmap node context (optional)
   * @param onChunk - Callback function to handle each streaming chunk
   * @returns Promise<void> - Resolves when streaming is complete
   * 
   * Request Body:
   * {
   *   "message": "User question",
   *   "model": "gpt-4", // Optional
   *   "use_documents_only": false, // Optional
   *   "selected_node": { // Optional
   *     "id": "node1",
   *     "data": { "label": "Node Label" }
   *   }
   * }
   * 
   * Streaming Response Format:
   * data: {"content": "Hello"}
   * data: {"content": " there"}
   * data: {"content": "!"}
   * data: [DONE]
   */
  async streamChatResponse(
    projectId: string,
    chatId: string,
    message: string,
    options: {
      model?: string;
      useDocumentsOnly?: boolean;
      selectedNode?: any;
    } = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/chats/${chatId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        model: options.model,
        use_documents_only: options.useDocumentsOnly,
        selected_node: options.selectedNode,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // WebSocket connection for real-time updates
  connectWebSocket(projectId: string, chatId: string): WebSocket {
    const wsUrl = `${this.baseURL.replace('http', 'ws')}/ws/projects/${projectId}/chats/${chatId}`;
    return new WebSocket(wsUrl);
  }

  // Documents API
  async getDocuments(projectId: string): Promise<Document[]> {
    return this.request<Document[]>(`/api/projects/${projectId}/documents`);
  }

  async uploadDocument(projectId: string, file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async deleteDocument(projectId: string, documentId: string): Promise<void> {
    return this.request<void>(`/api/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(projectId: string, documentId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/documents/${documentId}/download`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  }

  // Search API
  async searchMessages(projectId: string, query: string, chatId?: string): Promise<Message[]> {
    const params = new URLSearchParams({ query });
    if (chatId) params.append('chat_id', chatId);
    
    return this.request<Message[]>(`/api/projects/${projectId}/search/messages?${params}`);
  }

  async searchDocuments(projectId: string, query: string): Promise<Document[]> {
    const params = new URLSearchParams({ query });
    return this.request<Document[]>(`/api/projects/${projectId}/search/documents?${params}`);
  }

  // Analytics API (optional)
  async getProjectStats(projectId: string): Promise<{
    total_chats: number;
    total_messages: number;
    total_documents: number;
    created_at: string;
  }> {
    return this.request(`/api/projects/${projectId}/stats`);
  }
}

// Export singleton instance
export const httpService = new HttpService();
export default httpService;