import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { NetworkData } from './NetworkCanvas';

interface D3NetworkCanvasProps {
  data: NetworkData | null;
  onDataChange?: (data: NetworkData) => void;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type?: string;
  metadata?: Record<string, any>;
  radius: number;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  label?: string;
  weight: number;
  type?: string;
}

export const D3NetworkCanvas = ({ data, onDataChange }: D3NetworkCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [simulation, setSimulation] = useState<d3.Simulation<D3Node, D3Link> | null>(null);
  const [nodes, setNodes] = useState<D3Node[]>([]);
  const [links, setLinks] = useState<D3Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null);
  const [forceStrength, setForceStrength] = useState([-100]);
  const [linkDistance, setLinkDistance] = useState([50]);
  const [nodeSize, setNodeSize] = useState([8]);
  const [fontSize, setFontSize] = useState([12]);
  const [showDirected, setShowDirected] = useState(true);
  const [textColor, setTextColor] = useState(['hsl(var(--foreground))']);
  const [edgeColor, setEdgeColor] = useState(['hsl(var(--primary))']);

  // Convert network data to D3 format
  useEffect(() => {
    if (!data) return;

    const d3Nodes: D3Node[] = data.nodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      metadata: node.metadata,
      radius: nodeSize[0],
    }));

    const d3Links: D3Link[] = data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      weight: edge.weight || 1,
      type: edge.type,
    }));

    setNodes(d3Nodes);
    setLinks(d3Links);
  }, [data, nodeSize]);

  // Initialize D3 simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create defs for arrowheads
    const defs = svg.append('defs');
    
    // Create arrowhead marker
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', edgeColor[0])
      .style('opacity', 0.7);

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Draw links
    const linkElements = g.selectAll<SVGLineElement, D3Link>('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', edgeColor[0])
      .style('stroke-width', d => Math.max(1, d.weight * 2))
      .style('opacity', d => Math.min(1, Math.max(0.3, d.weight / 10)))
      .attr('marker-end', showDirected ? 'url(#arrowhead)' : null);

    // Draw nodes
    const nodeElements = g.selectAll<SVGCircleElement, D3Node>('.node')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => d.radius)
      .style('fill', d => getNodeColor(d.type))
      .style('stroke', 'hsl(var(--background))')
      .style('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d);
        toast.info(`Selected: ${d.label}`);
      })
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Add node labels
    const nodeLabels = g.selectAll<SVGTextElement, D3Node>('.node-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .text(d => d.label)
      .style('font-size', `${fontSize[0]}px`)
      .style('font-weight', '500')
      .style('fill', textColor[0])
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'central')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Create simulation
    const sim = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links)
        .id(d => d.id)
        .distance(linkDistance[0])
      )
      .force('charge', d3.forceManyBody().strength(forceStrength[0]))
      .force('center', d3.forceCenter(400, 250))
      .force('collision', d3.forceCollide().radius((d: any) => (d as D3Node).radius + 2));

    sim.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!);

      nodeElements
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      nodeLabels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    setSimulation(sim);

    return () => {
      sim.stop();
    };
  }, [nodes, links, forceStrength, linkDistance, nodeSize, fontSize, showDirected, textColor, edgeColor]);

  const getNodeColor = (type?: string) => {
    switch (type) {
      case 'server': return 'hsl(0, 70%, 60%)';
      case 'database': return 'hsl(120, 70%, 60%)';
      case 'user': return 'hsl(240, 70%, 60%)';
      case 'service': return 'hsl(280, 70%, 60%)';
      default: return 'hsl(var(--primary))';
    }
  };

  const reheatSimulation = useCallback(() => {
    if (simulation) {
      simulation.alpha(0.3).restart();
      toast.success('Simulation reheated');
    }
  }, [simulation]);

  const centerGraph = useCallback(() => {
    if (!svgRef.current || !simulation) return;
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;
    
    // Reset simulation center
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(0.3).restart();
    
    // Center the view
    svg.transition().duration(750).call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    );
    
    toast.success('Graph centered');
  }, [simulation]);

  const exportSVG = useCallback(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network-d3.svg';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('SVG exported successfully');
  }, []);

  const exportPDF = useCallback(async () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    try {
      const canvas = await html2canvas(svgElement as any, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const pdf = new jsPDF('landscape');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 297; // A4 landscape width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('network-d3.pdf');
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex gap-2">
            <Button onClick={reheatSimulation} size="sm">
              Reheat Simulation
            </Button>
            <Button onClick={centerGraph} size="sm" variant="outline">
              Center Graph
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
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Force:</Label>
            <Slider
              value={forceStrength}
              onValueChange={setForceStrength}
              min={-500}
              max={-10}
              step={10}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-8">{forceStrength[0]}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Distance:</Label>
            <Slider
              value={linkDistance}
              onValueChange={setLinkDistance}
              min={20}
              max={200}
              step={10}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-8">{linkDistance[0]}</span>
          </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Node Size:</Label>
              <Slider
                value={nodeSize}
                onValueChange={setNodeSize}
                min={0}
                max={20}
                step={1}
                className="w-24"
              />
              <span className="text-xs text-muted-foreground w-8">{nodeSize[0]}</span>
            </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm">Font Size:</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={8}
              max={24}
              step={1}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground w-8">{fontSize[0]}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Text Color:</Label>
            <input
              type="color"
              value={textColor[0].includes('hsl') ? '#000000' : textColor[0]}
              onChange={(e) => setTextColor([e.target.value])}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Edge Color:</Label>
            <input
              type="color"
              value={edgeColor[0].includes('hsl') ? '#3b82f6' : edgeColor[0]}
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
        
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary">{nodes.length} nodes</Badge>
          <Badge variant="secondary">{links.length} links</Badge>
        </div>
      </Card>

      {/* Network Canvas */}
      <Card className="p-4">
        <svg
          ref={svgRef}
          width={800}
          height={500}
          style={{ border: '1px solid hsl(var(--border))' }}
          className="rounded-lg w-full"
        />
      </Card>

      {/* Selected Node Info */}
      {selectedNode && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Selected Node: {selectedNode.label}</h3>
          <div className="space-y-2">
            <div>
              <Badge variant="outline">{selectedNode.type || 'default'}</Badge>
            </div>
            {selectedNode.metadata && (
              <div className="text-sm text-muted-foreground">
                {Object.entries(selectedNode.metadata).map(([key, value]) => (
                  <div key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};