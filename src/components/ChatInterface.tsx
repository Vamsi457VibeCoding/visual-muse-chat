import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, MessageCircle, Bot, User, Settings } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const llmOptions = [
  { value: 'gpt-4', label: 'GPT-4', description: 'Most capable model' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { value: 'claude-3', label: 'Claude 3', description: 'Great for analysis' },
  { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google\'s flagship' },
];

interface ChatInterfaceProps {
  selectedNode?: any;
  onNodeUpdate?: (nodeId: string, updates: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedNode, onNodeUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI assistant for mind mapping. I can help you brainstorm ideas, organize thoughts, and enhance your visual thinking process. What would you like to explore today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLLM, setSelectedLLM] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputMessage, selectedNode),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string, node?: any): string => {
    const responses = [
      `That's an interesting idea! Based on "${userInput}", I suggest creating sub-nodes for: key concepts, related topics, and actionable items.`,
      `Great question! For mind mapping "${userInput}", consider organizing it into main branches: causes, effects, solutions, and examples.`,
      `I can help you expand on "${userInput}". Try adding child nodes for different perspectives, pros/cons, or step-by-step processes.`,
      `Excellent insight about "${userInput}"! This could connect well with other nodes in your map. Consider color-coding related concepts.`,
      `Building on "${userInput}", you might want to explore: background context, current status, future implications, and key stakeholders.`
    ];

    if (node) {
      return `Since you have "${node.label}" selected, I can help you expand this node. ${responses[Math.floor(Math.random() * responses.length)]}`;
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col bg-chat-bg border-canvas-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">AI Assistant</h2>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* LLM Selection */}
        <Select value={selectedLLM} onValueChange={setSelectedLLM}>
          <SelectTrigger className="w-full bg-chat-input border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {llmOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedNode && (
          <div className="mt-2 p-2 bg-primary/10 rounded-md border border-primary/20">
            <p className="text-xs text-primary font-medium">Selected: {selectedNode.label}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-chat-bubble-user' 
                  : 'bg-chat-bubble-ai border border-border'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-foreground" />
                )}
              </div>

              <div className={`max-w-[80%] ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`inline-block p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-chat-bubble-user text-primary-foreground'
                    : 'bg-card border border-border text-foreground'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-chat-bubble-ai border border-border flex items-center justify-center">
                <Bot className="w-4 h-4 text-foreground" />
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about your mind map or brainstorm ideas..."
            className="flex-1 bg-chat-input border-border"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Using {llmOptions.find(opt => opt.value === selectedLLM)?.label} • Press Enter to send
        </p>
      </div>
    </Card>
  );
};

export default ChatInterface;