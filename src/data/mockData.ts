/**
 * Mock data for simulating backend API responses
 * This file contains all the mock data used throughout the application
 * Replace with real API calls when backend is ready
 */

import { Project, Chat, Message, Document } from "@/services/httpService";

// Mock Projects Data
export const mockProjects: Project[] = [
  {
    id: "project-1",
    name: "AI Research Project",
    description: "Research on artificial intelligence and machine learning applications",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
    mindmap_data: {
      nodes: [
        {
          id: "node-1",
          data: { label: "AI Research", content: "Main research topic" },
          position: { x: 250, y: 250 }
        },
        {
          id: "node-2", 
          data: { label: "Machine Learning", content: "ML subtopic" },
          position: { x: 400, y: 200 }
        },
        {
          id: "node-3",
          data: { label: "Deep Learning", content: "Neural networks and deep learning" },
          position: { x: 400, y: 300 }
        }
      ],
      edges: [
        { id: "edge-1", source: "node-1", target: "node-2" },
        { id: "edge-2", source: "node-1", target: "node-3" }
      ]
    }
  },
  {
    id: "project-2", 
    name: "Web Development Guide",
    description: "Comprehensive guide for modern web development practices",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T16:45:00Z",
    mindmap_data: {
      nodes: [
        {
          id: "web-1",
          data: { label: "Web Development", content: "Modern web development" },
          position: { x: 250, y: 250 }
        },
        {
          id: "web-2",
          data: { label: "Frontend", content: "React, Vue, Angular" },
          position: { x: 150, y: 150 }
        },
        {
          id: "web-3", 
          data: { label: "Backend", content: "Node.js, Python, APIs" },
          position: { x: 350, y: 150 }
        }
      ],
      edges: [
        { id: "web-edge-1", source: "web-1", target: "web-2" },
        { id: "web-edge-2", source: "web-1", target: "web-3" }
      ]
    }
  },
  {
    id: "project-3",
    name: "Data Science Pipeline", 
    description: "End-to-end data science workflow and methodologies",
    created_at: "2024-01-05T11:30:00Z",
    updated_at: "2024-01-22T13:15:00Z",
    mindmap_data: {
      nodes: [
        {
          id: "ds-1",
          data: { label: "Data Science", content: "Data science workflow" },
          position: { x: 300, y: 200 }
        }
      ],
      edges: []
    }
  }
];

// Mock Chats Data (organized by project)
export const mockChats: Record<string, Chat[]> = {
  "project-1": [
    {
      id: "chat-1-1",
      project_id: "project-1",
      name: "General Discussion",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-20T14:30:00Z"
    },
    {
      id: "chat-1-2", 
      project_id: "project-1",
      name: "Technical Deep Dive",
      created_at: "2024-01-16T14:00:00Z",
      updated_at: "2024-01-19T16:20:00Z"
    },
    {
      id: "chat-1-3",
      project_id: "project-1", 
      name: "Research Questions",
      created_at: "2024-01-18T09:15:00Z",
      updated_at: "2024-01-20T11:45:00Z"
    }
  ],
  "project-2": [
    {
      id: "chat-2-1",
      project_id: "project-2",
      name: "Getting Started",
      created_at: "2024-01-10T09:30:00Z", 
      updated_at: "2024-01-18T16:45:00Z"
    },
    {
      id: "chat-2-2",
      project_id: "project-2",
      name: "Advanced Topics",
      created_at: "2024-01-12T15:20:00Z",
      updated_at: "2024-01-17T10:30:00Z"
    }
  ],
  "project-3": [
    {
      id: "chat-3-1", 
      project_id: "project-3",
      name: "Data Analysis",
      created_at: "2024-01-05T12:00:00Z",
      updated_at: "2024-01-22T13:15:00Z"
    }
  ]
};

// Mock Messages Data (organized by chat)
export const mockMessages: Record<string, Message[]> = {
  "chat-1-1": [
    {
      id: "msg-1-1-1",
      chat_id: "chat-1-1", 
      type: "user",
      content: "Hello! I'd like to start researching AI applications in healthcare.",
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      id: "msg-1-1-2",
      chat_id: "chat-1-1",
      type: "ai", 
      content: "Great topic! AI in healthcare has numerous applications including medical imaging, drug discovery, personalized treatment plans, and diagnostic assistance. Would you like me to help you explore any specific area?",
      timestamp: "2024-01-15T10:30:15Z",
      model_used: "gpt-4",
      use_documents_only: false
    },
    {
      id: "msg-1-1-3",
      chat_id: "chat-1-1",
      type: "user",
      content: "Let's focus on medical imaging. What are the current state-of-the-art techniques?",
      timestamp: "2024-01-15T10:32:00Z"
    },
    {
      id: "msg-1-1-4",
      chat_id: "chat-1-1",
      type: "ai",
      content: "In medical imaging, current state-of-the-art AI techniques include:\n\n1. **Convolutional Neural Networks (CNNs)** for image classification and segmentation\n2. **Vision Transformers** for improved pattern recognition\n3. **Generative Adversarial Networks (GANs)** for image enhancement\n4. **U-Net architectures** for precise medical image segmentation\n\nThese are being used successfully in radiology, pathology, and ophthalmology.",
      timestamp: "2024-01-15T10:32:30Z",
      model_used: "claude-3-opus",
      use_documents_only: false
    }
  ],
  "chat-1-2": [
    {
      id: "msg-1-2-1",
      chat_id: "chat-1-2",
      type: "user", 
      content: "Can you explain the technical details of transformer architectures?",
      timestamp: "2024-01-16T14:00:00Z"
    },
    {
      id: "msg-1-2-2",
      chat_id: "chat-1-2",
      type: "ai",
      content: "Transformer architectures revolutionized deep learning with their attention mechanism. Key components include:\n\n**Self-Attention**: Allows the model to weigh the importance of different parts of the input sequence.\n\n**Multi-Head Attention**: Multiple attention heads capture different types of relationships.\n\n**Position Encoding**: Since transformers don't have inherent sequence order, positional encodings are added.\n\n**Feed-Forward Networks**: Applied after attention layers for additional processing.\n\nWould you like me to dive deeper into any specific component?",
      timestamp: "2024-01-16T14:01:00Z",
      model_used: "gpt-4",
      use_documents_only: false
    }
  ],
  "chat-2-1": [
    {
      id: "msg-2-1-1",
      chat_id: "chat-2-1",
      type: "user",
      content: "I'm new to web development. Where should I start?",
      timestamp: "2024-01-10T09:30:00Z"
    },
    {
      id: "msg-2-1-2", 
      chat_id: "chat-2-1",
      type: "ai",
      content: "Welcome to web development! Here's a recommended learning path:\n\n**Foundation:**\n1. HTML - Structure of web pages\n2. CSS - Styling and layout\n3. JavaScript - Programming logic\n\n**Frontend Framework:**\n4. React, Vue, or Angular\n\n**Backend Basics:**\n5. Node.js or Python\n6. Database fundamentals\n\n**Tools:**\n7. Git version control\n8. Development tools\n\nStart with HTML/CSS/JavaScript fundamentals. Which area interests you most?",
      timestamp: "2024-01-10T09:30:45Z",
      model_used: "gpt-4",
      use_documents_only: false
    }
  ],
  "chat-3-1": [
    {
      id: "msg-3-1-1",
      chat_id: "chat-3-1",
      type: "user",
      content: "What's the typical data science workflow?",
      timestamp: "2024-01-05T12:00:00Z"
    },
    {
      id: "msg-3-1-2",
      chat_id: "chat-3-1", 
      type: "ai",
      content: "The typical data science workflow follows these stages:\n\n1. **Problem Definition** - Understanding business objectives\n2. **Data Collection** - Gathering relevant datasets\n3. **Data Exploration** - Initial analysis and visualization\n4. **Data Cleaning** - Handling missing values, outliers\n5. **Feature Engineering** - Creating meaningful variables\n6. **Model Building** - Selecting and training algorithms\n7. **Model Evaluation** - Testing performance metrics\n8. **Deployment** - Implementing in production\n9. **Monitoring** - Tracking model performance over time\n\nThis is an iterative process. Which stage would you like to explore further?",
      timestamp: "2024-01-05T12:01:15Z",
      model_used: "claude-3-opus",
      use_documents_only: false
    }
  ]
};

// Mock Documents Data (organized by project)
export const mockDocuments: Record<string, Document[]> = {
  "project-1": [
    {
      id: "doc-1-1",
      project_id: "project-1",
      name: "AI_Research_Paper.pdf",
      type: "application/pdf",
      size: 2048576,
      upload_date: "2024-01-15T11:00:00Z",
      file_path: "/uploads/project-1/AI_Research_Paper.pdf"
    },
    {
      id: "doc-1-2",
      project_id: "project-1", 
      name: "Medical_Imaging_Dataset.csv",
      type: "text/csv",
      size: 5242880,
      upload_date: "2024-01-16T09:30:00Z",
      file_path: "/uploads/project-1/Medical_Imaging_Dataset.csv"
    }
  ],
  "project-2": [
    {
      id: "doc-2-1",
      project_id: "project-2",
      name: "Web_Dev_Best_Practices.docx", 
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 1024000,
      upload_date: "2024-01-10T10:15:00Z",
      file_path: "/uploads/project-2/Web_Dev_Best_Practices.docx"
    }
  ],
  "project-3": [
    {
      id: "doc-3-1",
      project_id: "project-3",
      name: "Sales_Data_Q4.xlsx",
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 3145728,
      upload_date: "2024-01-05T13:00:00Z",
      file_path: "/uploads/project-3/Sales_Data_Q4.xlsx"
    }
  ]
};

// Utility functions for mock data manipulation
export const getMockProject = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getMockChats = (projectId: string): Chat[] => {
  return mockChats[projectId] || [];
};

export const getMockMessages = (chatId: string): Message[] => {
  return mockMessages[chatId] || [];
};

export const getMockDocuments = (projectId: string): Document[] => {
  return mockDocuments[projectId] || [];
};

// Mock API delay simulation
export const mockApiDelay = (min: number = 200, max: number = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};