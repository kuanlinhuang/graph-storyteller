import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ConnectionMode,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { NetworkNode } from './NetworkNode';
import { NetworkEdge } from './NetworkEdge';

export interface NetworkData {
  nodes: Array<{
    id: string;
    label: string;
    type?: string;
    metadata?: Record<string, any>;
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    weight?: number;
    type?: string;
  }>;
}

interface NetworkCanvasProps {
  data: NetworkData | null;
  onDataChange?: (data: NetworkData) => void;
}

const nodeTypes = {
  network: NetworkNode,
};

const edgeTypes = {
  network: NetworkEdge,
};

export const NetworkCanvas = ({ data, onDataChange }: NetworkCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [nodeSize, setNodeSize] = useState([40]);
  const [fontSize, setFontSize] = useState([12]);
  const [showDirected, setShowDirected] = useState(true);
  const [textColor, setTextColor] = useState(['#000000']);
  const [edgeColor, setEdgeColor] = useState(['#3b82f6']);

  // Convert network data to React Flow format
  useEffect(() => {
    if (!data) return;

    const flowNodes: Node[] = data.nodes.map((node, index) => ({
      id: node.id,
      type: 'network',
      position: node.position || { 
        x: Math.random() * 500, 
        y: Math.random() * 500 
      },
      data: {
        label: node.label,
        metadata: node.metadata,
        nodeType: node.type || 'default',
        nodeSize: nodeSize[0],
        fontSize: fontSize[0],
        textColor: textColor[0],
      },
      style: {
        width: nodeSize[0],
        height: nodeSize[0],
        fontSize: fontSize[0],
      },
    }));

    const flowEdges: Edge[] = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'network',
      data: {
        label: edge.label,
        weight: edge.weight,
        edgeType: edge.type || 'default',
      },
      animated: false,
      markerEnd: showDirected ? {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: edgeColor[0],
      } : undefined,
      style: {
        strokeWidth: Math.max(1, (edge.weight || 1) * 2),
        stroke: edgeColor[0],
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    
    if (flowNodes.length > 0) {
      toast.success(`Loaded ${flowNodes.length} nodes and ${flowEdges.length} edges`);
    }
  }, [data, nodeSize, fontSize, showDirected, textColor, edgeColor, setNodes, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'network',
        data: {
          label: '',
          weight: 1,
          edgeType: 'default',
        },
        style: {
          strokeWidth: 2,
          stroke: 'hsl(var(--edge-default))',
        },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
      toast.success('Connection created');
    },
    [setEdges]
  );

  // Handle selection changes
  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    []
  );

  // Auto-layout nodes in a circle
  const arrangeInCircle = useCallback(() => {
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(200, Math.max(100, nodes.length * 20));
    
    setNodes((nds) =>
      nds.map((node, index) => {
        const angle = (index / nds.length) * 2 * Math.PI;
        return {
          ...node,
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          },
        };
      })
    );
    toast.success('Nodes arranged in circle');
  }, [nodes.length, setNodes]);

  // Auto-layout nodes in a grid
  const arrangeInGrid = useCallback(() => {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellWidth = 150;
    const cellHeight = 100;
    
    setNodes((nds) =>
      nds.map((node, index) => ({
        ...node,
        position: {
          x: (index % cols) * cellWidth + 50,
          y: Math.floor(index / cols) * cellHeight + 50,
        },
      }))
    );
    toast.success('Nodes arranged in grid');
  }, [nodes.length, setNodes]);

  // Clear the canvas
  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodes([]);
    setSelectedEdges([]);
    toast.success('Canvas cleared');
  }, [setNodes, setEdges]);

  // Add a new node
  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'network',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: `Node ${nodes.length + 1}`,
        metadata: {},
        nodeType: 'default',
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    toast.success('Node added');
  }, [nodes.length, setNodes]);

  // Delete selected elements
  const deleteSelected = useCallback(() => {
    const selectedNodeIds = selectedNodes.map(n => n.id);
    const selectedEdgeIds = selectedEdges.map(e => e.id);
    
    if (selectedNodeIds.length > 0) {
      setNodes((nds) => nds.filter(n => !selectedNodeIds.includes(n.id)));
      setEdges((eds) => eds.filter(e => 
        !selectedNodeIds.includes(e.source) && 
        !selectedNodeIds.includes(e.target) &&
        !selectedEdgeIds.includes(e.id)
      ));
      toast.success(`Deleted ${selectedNodeIds.length} nodes and related edges`);
    } else if (selectedEdgeIds.length > 0) {
      setEdges((eds) => eds.filter(e => !selectedEdgeIds.includes(e.id)));
      toast.success(`Deleted ${selectedEdgeIds.length} edges`);
    }
    
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, [selectedNodes, selectedEdges, setNodes, setEdges]);

  const exportSVG = useCallback(() => {
    // Create a simple SVG representation
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '800');
    svg.setAttribute('height', '600');
    svg.setAttribute('viewBox', `0 0 800 600`);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Add background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '800');
    rect.setAttribute('height', '600');
    rect.setAttribute('fill', '#ffffff');
    svg.appendChild(rect);
    
    // Add edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(sourceNode.position.x + nodeSize[0]/2));
        line.setAttribute('y1', String(sourceNode.position.y + nodeSize[0]/2));
        line.setAttribute('x2', String(targetNode.position.x + nodeSize[0]/2));
        line.setAttribute('y2', String(targetNode.position.y + nodeSize[0]/2));
        line.setAttribute('stroke', edgeColor[0]);
        line.setAttribute('stroke-width', String(edge.style?.strokeWidth || 2));
        svg.appendChild(line);
      }
    });
    
    // Add nodes
    nodes.forEach(node => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(node.position.x + nodeSize[0]/2));
      circle.setAttribute('cy', String(node.position.y + nodeSize[0]/2));
      circle.setAttribute('r', String(nodeSize[0]/2));
      circle.setAttribute('fill', 'hsl(var(--primary))');
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      
      // Add label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(node.position.x + nodeSize[0]/2));
      text.setAttribute('y', String(node.position.y + nodeSize[0]/2 + 5));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', String(fontSize[0]));
      text.setAttribute('fill', textColor[0]);
      text.textContent = node.data.label;
      svg.appendChild(text);
    });
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network-reactflow.svg';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('SVG exported successfully');
  }, [nodes, edges, nodeSize, fontSize, textColor, edgeColor]);

  const exportPDF = useCallback(async () => {
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (!reactFlowElement) return;

    try {
      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const pdf = new jsPDF('landscape');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('network-reactflow.pdf');
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <Card className="p-4 mb-4 shadow-card-custom">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={addNode} variant="default" size="sm">
                Add Node
              </Button>
              <Button 
                onClick={deleteSelected} 
                variant="destructive" 
                size="sm"
                disabled={selectedNodes.length === 0 && selectedEdges.length === 0}
              >
                Delete Selected
              </Button>
              <Button onClick={clearCanvas} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={arrangeInCircle} variant="secondary" size="sm">
                Circle Layout
              </Button>
              <Button onClick={arrangeInGrid} variant="secondary" size="sm">
                Grid Layout
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={exportSVG} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export SVG
              </Button>
              <Button onClick={exportPDF} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <Badge variant="secondary">{nodes.length} nodes</Badge>
              <Badge variant="secondary">{edges.length} edges</Badge>
              {selectedNodes.length > 0 && (
                <Badge variant="default">{selectedNodes.length} selected</Badge>
              )}
            </div>
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Node Size:</Label>
              <Slider
                value={nodeSize}
                onValueChange={setNodeSize}
                min={0}
                max={80}
                step={5}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground w-8">{nodeSize[0]}</span>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Font Size:</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={8}
                max={20}
                step={1}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground w-8">{fontSize[0]}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm">Text Color:</Label>
              <input
                type="color"
                value={textColor[0]}
                onChange={(e) => setTextColor([e.target.value])}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm">Edge Color:</Label>
              <input
                type="color"
                value={edgeColor[0]}
                onChange={(e) => setEdgeColor([e.target.value])}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm">Directed:</Label>
              <Button 
                onClick={() => setShowDirected(!showDirected)} 
                size="sm" 
                variant={showDirected ? "default" : "outline"}
                className="h-8 w-16"
              >
                {showDirected ? "ON" : "OFF"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* React Flow Canvas */}
      <Card className="flex-1 overflow-hidden shadow-card-custom">
        <div style={{ width: '100%', height: '600px' }}>
          <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="bg-canvas"
          attributionPosition="top-right"
        >
          <Controls />
          <MiniMap 
            nodeColor="hsl(var(--node-default))"
            maskColor="hsl(var(--background) / 0.8)"
            style={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
            }}
          />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1}
            color="hsl(var(--border))"
          />
        </ReactFlow>
        </div>
      </Card>
    </div>
  );
};