import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Move, Edit, Link } from 'lucide-react';

// Register dagre layout
cytoscape.use(dagre);

interface MindMapCanvasProps {
  onNodeSelect?: (nodeData: any) => void;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ onNodeSelect }) => {
  const cyRef = useRef<HTMLDivElement>(null);
  const [cy, setCy] = useState<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!cyRef.current) return;

    const cytoscapeInstance = cytoscape({
      container: cyRef.current,
      elements: [
        {
          data: { id: 'root', label: 'Main Idea', type: 'root' },
          position: { x: 400, y: 300 }
        }
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#8a2be2',
            'border-color': '#9d4edd',
            'border-width': 2,
            'color': '#ffffff',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': 600,
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'width': 100,
            'height': 60,
            'shape': 'round-rectangle',
          }
        },
        {
          selector: 'node[type="root"]',
          style: {
            'background-color': '#6f2da8',
            'border-color': '#9d4edd',
            'width': 120,
            'height': 80,
            'font-size': '14px',
            'font-weight': 700,
          }
        },
        {
          selector: 'node[type="secondary"]',
          style: {
            'background-color': '#06d6a0',
            'border-color': '#40e0d0',
          }
        },
        {
          selector: 'node[type="accent"]',
          style: {
            'background-color': '#ffd23f',
            'border-color': '#ffbe0b',
            'color': '#1a1a1a',
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#9d4edd',
            'border-width': 3,
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#4a4a4a',
            'target-arrow-color': '#4a4a4a',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'control-point-step-size': 40,
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#8a2be2',
            'target-arrow-color': '#8a2be2',
            'width': 3,
          }
        }
      ],
      layout: {
        name: 'preset'
      },
      minZoom: 0.5,
      maxZoom: 2,
      wheelSensitivity: 0.2,
    });

    // Event listeners
    cytoscapeInstance.on('tap', 'node', (evt) => {
      if (!isDragging) {
        const node = evt.target;
        const nodeData = node.data();
        setSelectedNode(nodeData);
        onNodeSelect?.(nodeData);
      }
    });

    cytoscapeInstance.on('tap', (evt) => {
      if (evt.target === cytoscapeInstance && !isDragging) {
        setSelectedNode(null);
        onNodeSelect?.(null);
      }
    });

    // Connection drag handlers - always active
    cytoscapeInstance.on('mousedown', 'node', (evt) => {
      evt.preventDefault();
      const node = evt.target;
      const nodeData = node.data();
      const position = node.renderedPosition();
      
      setIsDragging(true);
      setDragStart({
        x: position.x,
        y: position.y,
        nodeId: nodeData.id
      });
      setDragEnd({ x: position.x, y: position.y });
    });

    cytoscapeInstance.on('mousemove', (evt) => {
      if (isDragging && dragStart) {
        const containerRect = cyRef.current?.getBoundingClientRect();
        if (containerRect) {
          setDragEnd({
            x: evt.originalEvent.clientX - containerRect.left,
            y: evt.originalEvent.clientY - containerRect.top
          });
        }
      }
    });

    cytoscapeInstance.on('mouseup', 'node', (evt) => {
      if (isDragging && dragStart) {
        const targetNode = evt.target;
        const targetData = targetNode.data();
        
        if (dragStart.nodeId !== targetData.id) {
          createEdge(dragStart.nodeId, targetData.id);
        }
        
        resetDragState();
      }
    });

    cytoscapeInstance.on('mouseup', (evt) => {
      if (isDragging && evt.target === cytoscapeInstance) {
        resetDragState();
      }
    });

    setCy(cytoscapeInstance);

    return () => {
      cytoscapeInstance.destroy();
    };
  }, [onNodeSelect, isDragging, dragStart]);

  const resetDragState = () => {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const createEdge = (sourceId: string, targetId: string) => {
    if (!cy) return;

    // Check if edge already exists
    const existingEdge = cy.edges(`[source="${sourceId}"][target="${targetId}"], [source="${targetId}"][target="${sourceId}"]`);
    if (existingEdge.length > 0) {
      return; // Edge already exists
    }

    cy.add({
      data: { 
        id: `edge-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId
      }
    });
  };

  const addNode = (type: 'primary' | 'secondary' | 'accent' = 'primary') => {
    if (!cy) return;

    const nodeId = `node-${Date.now()}`;
    const position = selectedNode 
      ? { x: Math.random() * 200 + 300, y: Math.random() * 200 + 200 }
      : { x: Math.random() * 600 + 200, y: Math.random() * 400 + 150 };

    cy.add({
      data: { id: nodeId, label: 'New Idea', type },
      position
    });

    // Connect to selected node if one exists and not dragging
    if (selectedNode && !isDragging) {
      createEdge(selectedNode.id, nodeId);
    }

    cy.layout({ name: 'preset' }).run();
  };

  const deleteSelected = () => {
    if (!cy || !selectedNode) return;

    cy.remove(`#${selectedNode.id}`);
    setSelectedNode(null);
    onNodeSelect?.(null);
  };

  const startEditing = () => {
    if (!selectedNode) return;
    setEditText(selectedNode.label);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!cy || !selectedNode || !editText.trim()) return;

    cy.$(`#${selectedNode.id}`).data('label', editText.trim());
    setIsEditing(false);
    setEditText('');
    
    // Update selectedNode state
    setSelectedNode({ ...selectedNode, label: editText.trim() });
  };

  const runLayout = () => {
    if (!cy) return;

    cy.layout({
      name: 'dagre',
      rankDir: 'TB',
      animate: true,
      animationDuration: 500,
    } as any).run();
  };

  return (
    <div className="relative w-full h-full bg-canvas-bg">
      {/* Canvas */}
      <div 
        ref={cyRef} 
        className="w-full h-full bg-gradient-canvas border border-canvas-border rounded-lg"
        style={{ 
          background: 'radial-gradient(circle at 20% 20%, hsl(var(--canvas-grid)) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Drag Connection Line */}
      {isDragging && dragStart && dragEnd && (
        <svg 
          className="absolute inset-0 pointer-events-none z-20"
          style={{ width: '100%', height: '100%' }}
        >
          <line
            x1={dragStart.x}
            y1={dragStart.y}
            x2={dragEnd.x}
            y2={dragEnd.y}
            stroke="#8a2be2"
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity="0.8"
          />
          <circle
            cx={dragEnd.x}
            cy={dragEnd.y}
            r="6"
            fill="#8a2be2"
            opacity="0.8"
          />
        </svg>
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2 p-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-chat">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => addNode('primary')}
          className="hover:bg-primary/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Node
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => addNode('secondary')}
          className="hover:bg-node-secondary/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          Secondary
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => addNode('accent')}
          className="hover:bg-node-accent/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          Accent
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={runLayout}
          className="hover:bg-accent/20"
        >
          <Move className="w-4 h-4 mr-1" />
          Layout
        </Button>
        
        {selectedNode && !isDragging && (
          <>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={startEditing}
              className="hover:bg-node-success/20"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={deleteSelected}
              className="hover:bg-destructive/20"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}
      </div>

      {/* Node Info Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 p-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-chat min-w-[200px]">
          <h3 className="font-semibold text-foreground mb-2">Selected Node</h3>
          <p className="text-sm text-muted-foreground mb-1">Label: {selectedNode.label}</p>
          <p className="text-sm text-muted-foreground mb-1">Type: {selectedNode.type}</p>
          <p className="text-sm text-muted-foreground">ID: {selectedNode.id}</p>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg border border-border shadow-glow min-w-[300px]">
            <h3 className="font-semibold text-foreground mb-4">Edit Node</h3>
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Enter node text..."
              className="mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button 
                variant="ghost" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveEdit}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapCanvas;