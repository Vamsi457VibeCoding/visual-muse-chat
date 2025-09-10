/**
 * Project Context - Manages global project state
 * Provides current project, chat selection, and related operations
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Chat, Message } from '@/services/httpService';
import { httpService } from '@/services/httpService';
import { toast } from '@/components/ui/use-toast';

interface ProjectContextType {
  // Current state
  projects: Project[];
  currentProject: Project | null;
  currentChat: Chat | null;
  chats: Chat[];
  messages: Message[];
  
  // Loading states
  isLoadingProjects: boolean;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  
  // Actions
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string) => Promise<void>;
  selectChat: (chatId: string) => Promise<void>;
  createProject: (data: { name: string; description?: string }) => Promise<void>;
  createChat: (name: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  
  // Mindmap
  updateMindMap: (mindmapData: any) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Loading states
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Load all projects
  const loadProjects = async () => {
    console.log('🚀 Loading projects...');
    setIsLoadingProjects(true);
    try {
      const projectData = await httpService.getProjects();
      console.log('✅ Projects loaded:', projectData);
      setProjects(projectData);
      
      // Auto-select first project if none selected
      if (!currentProject && projectData.length > 0) {
        console.log('🎯 Auto-selecting first project:', projectData[0].name);
        await selectProject(projectData[0].id);
      }
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProjects(false);
      console.log('🏁 Loading projects complete');
    }
  };

  // Select a project and load its chats
  const selectProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setCurrentProject(project);
    setCurrentChat(null);
    setMessages([]);
    
    // Load chats for this project
    setIsLoadingChats(true);
    try {
      const chatData = await httpService.getChats(projectId);
      setChats(chatData);
      
      // Auto-select first chat if available
      if (chatData.length > 0) {
        await selectChat(chatData[0].id);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast({
        title: "Error", 
        description: "Failed to load chats",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Select a chat and load its messages
  const selectChat = async (chatId: string) => {
    if (!currentProject) return;
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    setCurrentChat(chat);
    
    // Load messages for this chat
    setIsLoadingMessages(true);
    try {
      const messageData = await httpService.getMessages(currentProject.id, chatId);
      setMessages(messageData);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive", 
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Create new project
  const createProject = async (data: { name: string; description?: string }) => {
    try {
      const newProject = await httpService.createProject({
        name: data.name,
        description: data.description,
        mindmap_data: { nodes: [], edges: [] }
      });
      
      setProjects(prev => [...prev, newProject]);
      await selectProject(newProject.id);
      
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  // Create new chat
  const createChat = async (name: string) => {
    if (!currentProject) return;
    
    try {
      const newChat = await httpService.createChat(currentProject.id, { name });
      setChats(prev => [...prev, newChat]);
      await selectChat(newChat.id);
      
      toast({
        title: "Success", 
        description: "Chat created successfully",
      });
    } catch (error) {
      console.error('Failed to create chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat", 
        variant: "destructive",
      });
    }
  };

  // Update project
  const updateProject = async (id: string, data: Partial<Project>) => {
    try {
      const updatedProject = await httpService.updateProject(id, data);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject);
      }
      
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  // Delete project
  const deleteProject = async (id: string) => {
    try {
      await httpService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      
      if (currentProject?.id === id) {
        setCurrentProject(null);
        setCurrentChat(null);
        setChats([]);
        setMessages([]);
        
        // Select first remaining project
        const remainingProjects = projects.filter(p => p.id !== id);
        if (remainingProjects.length > 0) {
          await selectProject(remainingProjects[0].id);
        }
      }
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast({
        title: "Error", 
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    if (!currentProject) return;
    
    try {
      await httpService.deleteChat(currentProject.id, chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        setMessages([]);
        
        // Select first remaining chat
        const remainingChats = chats.filter(c => c.id !== chatId);
        if (remainingChats.length > 0) {
          await selectChat(remainingChats[0].id);
        }
      }
      
      toast({
        title: "Success",
        description: "Chat deleted successfully", 
      });
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  // Update mindmap
  const updateMindMap = async (mindmapData: any) => {
    if (!currentProject) return;
    
    try {
      await httpService.updateMindMap(currentProject.id, mindmapData);
      
      // Update local state
      const updatedProject = { ...currentProject, mindmap_data: mindmapData };
      setCurrentProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === currentProject.id ? updatedProject : p));
    } catch (error) {
      console.error('Failed to update mindmap:', error);
      toast({
        title: "Error",
        description: "Failed to save mindmap",
        variant: "destructive",
      });
    }
  };

  // Load projects on mount
  useEffect(() => {
    console.log('🔄 ProjectProvider mounted, starting to load projects...');
    loadProjects().catch(error => {
      console.error('💥 Critical error in loadProjects:', error);
      setIsLoadingProjects(false);
    });
  }, []);

  const value: ProjectContextType = {
    projects,
    currentProject,
    currentChat,
    chats,
    messages,
    isLoadingProjects,
    isLoadingChats,
    isLoadingMessages,
    loadProjects,
    selectProject,
    selectChat,
    createProject,
    createChat,
    updateProject,
    deleteProject,
    deleteChat,
    updateMindMap,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};