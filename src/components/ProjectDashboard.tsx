/**
 * Project Dashboard - Main layout component for project-based interface
 * Contains project selector, chat sidebar, main content area, and mindmap
 */

import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MessageSquare, 
  Folder, 
  Settings, 
  Trash2, 
  Edit3,
  Brain,
  FileText,
  Clock
} from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import MindMapCanvas from '@/components/MindMapCanvas';

export const ProjectDashboard: React.FC = () => {
  const {
    projects,
    currentProject,
    currentChat,
    chats,
    isLoadingProjects,
    selectProject,
    selectChat,
    createProject,
    createChat,
    deleteProject,
    deleteChat,
    updateProject
  } = useProject();

  // Dialog states
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newChatName, setNewChatName] = useState('');
  const [editProject, setEditProject] = useState({ name: '', description: '' });

  // Current view state
  const [currentView, setCurrentView] = useState<'chat' | 'mindmap'>('chat');

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    
    await createProject(newProject);
    setNewProject({ name: '', description: '' });
    setIsCreateProjectOpen(false);
  };

  const handleCreateChat = async () => {
    if (!newChatName.trim()) return;
    
    await createChat(newChatName);
    setNewChatName('');
    setIsCreateChatOpen(false);
  };

  const handleEditProject = async () => {
    if (!currentProject || !editProject.name.trim()) return;
    
    await updateProject(currentProject.id, editProject);
    setIsEditProjectOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoadingProjects) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Projects & Chats */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* Project Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Projects</h1>
            <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project to organize your chats and mindmaps.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Name</Label>
                    <Input
                      id="project-name"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Textarea
                      id="project-description"
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your project"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateProjectOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Project Selector */}
          <ScrollArea className="max-h-32">
            <div className="space-y-2">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-colors ${
                    currentProject?.id === project.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => selectProject(project.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{project.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <Folder className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Current Project Info & Actions */}
        {currentProject && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold truncate">{currentProject.name}</h2>
              <div className="flex items-center space-x-1">
                <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditProject({
                          name: currentProject.name,
                          description: currentProject.description || ''
                        });
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Project</DialogTitle>
                      <DialogDescription>
                        Update your project details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={editProject.name}
                          onChange={(e) => setEditProject(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editProject.description}
                          onChange={(e) => setEditProject(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleEditProject}>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteProject(currentProject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {currentProject.description || 'No description'}
            </p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              Updated {formatDate(currentProject.updated_at)}
            </div>
          </div>
        )}

        {/* Chats Section */}
        {currentProject && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Chats</h3>
                <Dialog open={isCreateChatOpen} onOpenChange={setIsCreateChatOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Chat</DialogTitle>
                      <DialogDescription>
                        Start a new conversation in this project.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chat-name">Chat Name</Label>
                        <Input
                          id="chat-name"
                          value={newChatName}
                          onChange={(e) => setNewChatName(e.target.value)}
                          placeholder="Enter chat name"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateChatOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateChat}>
                          Create Chat
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {chats.map((chat) => (
                  <Card
                    key={chat.id}
                    className={`cursor-pointer transition-colors ${
                      currentChat?.id === chat.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => selectChat(chat.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <h4 className="font-medium truncate">{chat.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(chat.updated_at)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {chats.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No chats yet</p>
                    <p className="text-sm">Create your first chat to get started</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {currentProject && currentChat ? (
          <>
            {/* Header with view tabs */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{currentChat.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    in {currentProject.name}
                  </p>
                </div>
                <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'chat' | 'mindmap')}>
                  <TabsList>
                    <TabsTrigger value="chat" className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </TabsTrigger>
                    <TabsTrigger value="mindmap" className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>Mind Map</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Content based on current view */}
            <div className="flex-1">
              {currentView === 'chat' && (
                <ChatInterface 
                  selectedNode={null}
                  onNodeUpdate={() => {}}
                />
              )}
              {currentView === 'mindmap' && (
                <MindMapCanvas />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              {!currentProject ? (
                <>
                  <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-xl font-semibold mb-2">Welcome to Your Workspace</h2>
                  <p className="text-muted-foreground mb-4">
                    Create your first project to start organizing your conversations and mindmaps.
                  </p>
                  <Button onClick={() => setIsCreateProjectOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Project
                  </Button>
                </>
              ) : (
                <>
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h2 className="text-xl font-semibold mb-2">No Chat Selected</h2>
                  <p className="text-muted-foreground mb-4">
                    Create a new chat or select an existing one to start the conversation.
                  </p>
                  <Button onClick={() => setIsCreateChatOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Chat
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};