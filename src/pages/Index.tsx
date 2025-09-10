import { useState } from 'react';
import MindMapCanvas from '@/components/MindMapCanvas';
import ChatInterface from '@/components/ChatInterface';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Menu, Download, Share, FileText } from 'lucide-react';

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showChat, setShowChat] = useState(true);

  const handleNodeSelect = (nodeData: any) => {
    setSelectedNode(nodeData);
  };

  const handleNodeUpdate = (nodeId: string, updates: any) => {
    // Handle node updates from chat
    console.log('Updating node:', nodeId, updates);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-node">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Visual Mind</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Mind Mapping</p>
            </div>
          </div>
          
          {selectedNode && (
            <Badge variant="secondary" className="ml-4">
              Selected: {selectedNode.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className={showChat ? 'bg-primary/10 text-primary' : ''}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </Button>
          
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>

          <Button variant="ghost" size="sm">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className={`flex-1 transition-all duration-300 ${showChat ? 'mr-0' : 'mr-0'}`}>
          <MindMapCanvas onNodeSelect={handleNodeSelect} />
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-96 border-l border-border flex-shrink-0 transition-all duration-300">
            <ChatInterface 
              selectedNode={selectedNode}
              onNodeUpdate={handleNodeUpdate}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-3 border-t border-border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Visual Mind v1.0</span>
            <span>•</span>
            <span>AI-Enhanced Mind Mapping</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3" />
            <span>Ready to map your ideas</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;