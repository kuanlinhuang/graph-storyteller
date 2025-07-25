
import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
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

  // Convert network data to D3 format
  useEffect(() => {
    if (!data) return;

    const d3Nodes: D3Node[] = data.nodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      metadata: node.metadata,
      radius: 20 + (node.metadata?.importance || 0) * 5,
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
  }, [data]);

  // Initialize D3 simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create simulation
    const sim = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(linkDistance[0]))
      .force('charge', d3.forceManyBody().strength(forceStrength[0]))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as D3Node).radius + 5));

    // Create container groups
    const container = svg.append('g');
    const linksGroup = container.append('g').attr('class', 'links');
    const nodesGroup = container.append('g').attr('class', 'nodes');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create links with quantitative width based on weight
    const linkElements = linksGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'hsl(var(--edge-default))')
      .attr('stroke-width', d => Math.max(1, d.weight * 3))
      .attr('stroke-opacity', d => 0.6 + (d.weight * 0.3))
      .attr('marker-end', 'url(#arrowhead)');

    // Create arrow markers
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'hsl(var(--edge-default))');

    // Create link labels
    const linkLabels = linksGroup.selectAll('text.link-label')
      .data(links.filter(d => d.label))
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'hsl(var(--muted-foreground))')
      .text(d => d.label || '');

    // Create nodes
    const nodeElements = nodesGroup.selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.radius)
      .attr('fill', 'hsl(var(--node-default))')
      .attr('stroke', 'hsl(var(--background))')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('mouseover', function() {
        d3.select(this).attr('fill', 'hsl(var(--node-hover))');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', 'hsl(var(--node-default))');
      });

    // Create node labels centered in nodes
    const nodeLabels = nodesGroup.selectAll('text.node-label')
      .data(nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', d => Math.min(d.radius * 0.6, 12) + 'px')
      .attr('font-family', 'system-ui, -apple-system, sans-serif')
      .attr('font-weight', '600')
      .attr('fill', 'hsl(var(--node-text))')
      .text(d => d.label)
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Node click handler
    nodeElements.on('click', (event, d) => {
      setSelectedNode(d);
      event.stopPropagation();
    });

    // Update positions on tick
    sim.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as D3Node).x!)
        .attr('y1', d => (d.source as D3Node).y!)
        .attr('x2', d => (d.target as D3Node).x!)
        .attr('y2', d => (d.target as D3Node).y!);

      linkLabels
        .attr('x', d => ((d.source as D3Node).x! + (d.target as D3Node).x!) / 2)
        .attr('y', d => ((d.source as D3Node).y! + (d.target as D3Node).y!) / 2);

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
  }, [nodes, links, forceStrength, linkDistance]);

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
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    
    svg.transition().duration(750).call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(1)
    );
    
    toast.success('Graph centered');
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button onClick={reheatSimulation} size="sm">
              Reheat Simulation
            </Button>
            <Button onClick={centerGraph} size="sm" variant="outline">
              Center Graph
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Force Strength:</Label>
            <Slider
              value={forceStrength}
              onValueChange={setForceStrength}
              min={-500}
              max={-10}
              step={10}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">{forceStrength[0]}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-sm">Link Distance:</Label>
            <Slider
              value={linkDistance}
              onValueChange={setLinkDistance}
              min={20}
              max={200}
              step={10}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">{linkDistance[0]}</span>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary">{nodes.length} nodes</Badge>
            <Badge variant="secondary">{links.length} links</Badge>
          </div>
        </div>
      </Card>

      {/* Network Canvas */}
      <Card className="p-4">
        <svg
          ref={svgRef}
          width={800}
          height={600}
          style={{ border: '1px solid hsl(var(--border))' }}
          className="rounded-lg"
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
