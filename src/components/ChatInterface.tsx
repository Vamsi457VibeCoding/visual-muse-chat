import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Bot, User, Settings, Upload, FileText, Brain, BookOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DocumentUpload from './DocumentUpload';
import DocumentViewer from './DocumentViewer';
import MessageRenderer from './MessageRenderer';
import CitationsSidebar from './CitationsSidebar';
import { DocumentStorage, Document } from '@/utils/DocumentStorage';

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
      content: `# Welcome to Your AI Mind Mapping Assistant! 🧠

I'm here to help you **brainstorm ideas**, organize thoughts, and enhance your visual thinking process. 

## What I Can Do:
- **Markdown Support**: Use *formatting*, **bold text**, and \`inline code\`
- **Code Blocks**: Syntax-highlighted code with copy functionality
- **Mathematical Formulas**: Express relationships like $E = mc^2$ or complex equations:

$$\\sum_{i=1}^{n} x_i = \\frac{1}{n} \\sum_{i=1}^{n} (x_i - \\bar{x})^2$$

- **Document Analysis**: Upload files for context-aware responses
- **Mind Map Integration**: Connect with your visual workspace

### Code Example:
\`\`\`javascript
function mindMap(idea) {
  return {
    concept: idea,
    connections: [],
    expand: () => console.log('Growing ideas!')
  };
}
\`\`\`

> **Pro Tip**: Ask me about programming concepts, algorithms, or mathematical formulas!

What would you like to explore today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedLLM, setSelectedLLM] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [useDocumentsOnly, setUseDocumentsOnly] = useState(false);
  const [showCitationsSidebar, setShowCitationsSidebar] = useState(true);

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

    // Simulate AI response with document context
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(inputMessage, selectedNode, selectedDocuments, useDocumentsOnly),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (userInput: string, node?: any, documents?: Document[], documentsOnly: boolean = false): string => {
    const contextInfo = [];
    
    if (documents && documents.length > 0) {
      contextInfo.push(`I have access to ${documents.length} document(s): ${documents.map(d => d.name).join(', ')}`);
    }
    
    if (node) {
      contextInfo.push(`Current node: "${node.label}"`);
    }

    // Document-only mode responses
    if (documentsOnly) {
      if (!documents || documents.length === 0) {
        return "I can only respond based on uploaded documents, but no documents are currently selected. Please upload and select documents to continue, or switch to parametric knowledge mode.";
      }
      
      const documentResponses = [
        `Based on the uploaded documents regarding "${userInput}", I found relevant information that suggests organizing this into:

**Key Themes from Documents:**
- Primary concepts and definitions
- Supporting evidence and citations
- Cross-referenced materials

**Mathematical Analysis** (if applicable):
$$\\sum_{i=1}^{n} x_i = \\text{total insights from documents}$$

Consider creating \`sub-branches\` for each documented topic.`,
        
        `According to the documents you've provided about "${userInput}", here are the main points:

## Document Insights
1. **Primary Sources**: Referenced materials
2. **Data Points**: Statistical information
3. **Conclusions**: Key findings

> *"The most important insight from your documents..."*

For complex relationships, consider using formulas like: $f(x) = ax + b$ where $x$ represents the input variable.`,
        
        `From the uploaded materials on "${userInput}", I can help structure this by:

### Document-Based Categories
- **Evidence**: Factual information
- **Analysis**: Interpretive content  
- **Applications**: Practical uses

Mathematical relationships found: $\\frac{d}{dx}f(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$`
      ];
      
      let response = documentResponses[Math.floor(Math.random() * documentResponses.length)];
      
      if (contextInfo.length > 0) {
        response = `${contextInfo.join('. ')}.\n\n${response}`;
      }
      
      return response;
    }

    // Parametric knowledge mode responses with markdown and math examples
    const responses = [
      `That's an interesting idea! For "${userInput}", I suggest creating sub-nodes for:

## Key Concepts
- **Core principles**: Fundamental ideas
- **Related topics**: Connected concepts  
- **Actionable items**: Next steps

### Code Implementation
Here's how you might structure this programmatically:

\`\`\`python
class MindMapNode:
    def __init__(self, concept):
        self.concept = concept
        self.children = []
        self.connections = []
    
    def add_child(self, child_concept):
        child = MindMapNode(child_concept)
        self.children.append(child)
        return child
\`\`\`

### Mathematical Relationships
For quantitative analysis: $y = mx + b$ or complex functions:

$$f(x) = \\int_{a}^{b} g(t) \\, dt$$

Use \`color-coding\` to group related concepts.`,

      `Great question! For mind mapping "${userInput}", consider organizing into main branches:

1. **Causes** → Root factors
2. **Effects** → Resulting outcomes
3. **Solutions** → Potential remedies
4. **Examples** → Real-world cases

### Algorithm for Analysis
\`\`\`javascript
const analyzeRelationships = (causes, effects) => {
  return causes.map(cause => ({
    cause,
    impact: effects.filter(effect => 
      isRelated(cause, effect)
    ),
    strength: calculateCorrelation(cause, effects)
  }));
};
\`\`\`

> **Pro tip**: Use mathematical notation for quantifiable relationships

For probability concepts: $P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$`,

      `I can help you expand on "${userInput}". Try adding child nodes for:

### Different Perspectives
- *Theoretical approach*
- *Practical application*
- *Historical context*

### Pros/Cons Analysis
**Advantages:**
- Benefit 1
- Benefit 2

**Disadvantages:**  
- Challenge 1
- Challenge 2

For decision matrices, use: $\\text{Score} = \\sum_{i=1}^n w_i \\times r_i$ where $w_i$ is weight and $r_i$ is rating.`,

      `Excellent insight about "${userInput}"! This connects well with other concepts. Consider:

## Color-Coding Strategy
- 🔴 **Critical concepts**
- 🟡 **Supporting ideas**  
- 🟢 **Applications**

### Mathematical Modeling
For complex systems: 

$$\\begin{align}
\\dot{x} &= f(x, u, t) \\\\
y &= g(x, u, t)
\\end{align}$$

Where $x$ is state, $u$ is input, and $t$ is time.

Use \`inline code\` for variable names and parameters.`,

      `Building on "${userInput}", explore these dimensions:

## Multi-Level Analysis

### 📊 Background Context
- Historical development
- Current state assessment
- Future implications

### 🎯 Key Stakeholders  
- Primary actors
- Secondary influences
- External factors

### 📈 Implementation Framework
\`\`\`typescript
interface AnalysisFramework {
  context: {
    historical: string[];
    current: string[];
    future: string[];
  };
  stakeholders: {
    primary: string[];
    secondary: string[];
    external: string[];
  };
  metrics: {
    performance: number;
    quality: number;
    impact: number;
  };
}
\`\`\`

### Quantitative Metrics
For measurement: $\\text{Performance} = \\frac{\\text{Output}}{\\text{Input}} \\times \\text{Quality Factor}$

Consider using **bold** for key terms and *italics* for emphasis.`
    ];

    let response = responses[Math.floor(Math.random() * responses.length)];
    
    if (contextInfo.length > 0) {
      response = `${contextInfo.join('. ')}.\n\n${response}`;
    }

    return response;
  };

  const handleDocumentUploaded = (document: Document) => {
    // Auto-select newly uploaded documents
    setSelectedDocuments(prev => [...prev, document]);
  };

  const handleDocumentSelect = (document: Document) => {
    if (!selectedDocuments.find(d => d.id === document.id)) {
      setSelectedDocuments(prev => [...prev, document]);
    }
  };

  const removeDocument = (documentId: string) => {
    setSelectedDocuments(prev => prev.filter(d => d.id !== documentId));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex gap-4">
      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col bg-chat-bg border-canvas-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">AI Assistant</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDocumentViewer(true)}
              className="hover:bg-accent/20"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDocumentUpload(true)}
              className="hover:bg-accent/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCitationsSidebar(!showCitationsSidebar)}
            className="hover:bg-accent/20"
            title={showCitationsSidebar ? "Hide Citations" : "Show Citations"}
          >
            {showCitationsSidebar ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
          <Settings className="w-4 h-4 text-muted-foreground" />
        </div>
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

        {/* Response Mode Toggle */}
        <div className="mt-3 flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-2">
            {useDocumentsOnly ? (
              <BookOpen className="w-4 h-4 text-primary" />
            ) : (
              <Brain className="w-4 h-4 text-primary" />
            )}
            <Label htmlFor="response-mode" className="text-sm font-medium">
              {useDocumentsOnly ? 'Documents Only' : 'Parametric Knowledge'}
            </Label>
          </div>
          <Switch
            id="response-mode"
            checked={useDocumentsOnly}
            onCheckedChange={setUseDocumentsOnly}
          />
        </div>
        
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {useDocumentsOnly 
            ? 'AI will only respond based on uploaded documents' 
            : 'AI will use general knowledge and documents (if selected)'
          }
        </p>

        {selectedNode && (
          <div className="mt-2 p-2 bg-primary/10 rounded-md border border-primary/20">
            <p className="text-xs text-primary font-medium">Selected Node: {selectedNode.label}</p>
          </div>
        )}

        {selectedDocuments.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">Referenced Documents:</p>
            <div className="flex flex-wrap gap-1">
              {selectedDocuments.map(doc => (
                <Badge 
                  key={doc.id}
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-destructive/20"
                  onClick={() => removeDocument(doc.id)}
                >
                  {doc.name}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
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
                  <MessageRenderer content={message.content} />
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
          Using {llmOptions.find(opt => opt.value === selectedLLM)?.label} • {useDocumentsOnly ? 'Documents Only' : 'Parametric'} • Press Enter to send
          {selectedDocuments.length > 0 && ` • ${selectedDocuments.length} document(s) in context`}
        </p>
      </div>

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <DocumentUpload
            onDocumentUploaded={handleDocumentUploaded}
            onClose={() => setShowDocumentUpload(false)}
          />
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <DocumentViewer
            onClose={() => setShowDocumentViewer(false)}
            onUploadClick={() => {
              setShowDocumentViewer(false);
              setShowDocumentUpload(true);
            }}
            onDocumentSelect={handleDocumentSelect}
          />
        </div>
      )}
    </Card>

    {/* Citations and Documents Sidebar */}
    {showCitationsSidebar && (
      <div className="w-80 flex-shrink-0">
        <CitationsSidebar 
          documents={selectedDocuments}
          onClose={() => setShowCitationsSidebar(false)}
        />
      </div>
    )}
  </div>
  );
};

export default ChatInterface;