import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { NetworkData } from './NetworkCanvas';

interface FileUploaderProps {
  onDataLoaded: (data: NetworkData) => void;
  currentData: NetworkData | null;
}

export const FileUploader = ({ onDataLoaded, currentData }: FileUploaderProps) => {
  const [jsonInput, setJsonInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Sample network data
  const sampleData: NetworkData = {
    nodes: [
      { id: '1', label: 'Web Server', type: 'server', metadata: { cpu: '4 cores', ram: '16GB' } },
      { id: '2', label: 'Database', type: 'database', metadata: { type: 'PostgreSQL', size: '100GB' } },
      { id: '3', label: 'User Alice', type: 'user', metadata: { role: 'admin', lastLogin: '2024-01-15' } },
      { id: '4', label: 'API Gateway', type: 'service', metadata: { version: '2.1.0' } },
      { id: '5', label: 'Cache Server', type: 'server', metadata: { type: 'Redis', memory: '8GB' } },
    ],
    edges: [
      { id: 'e1', source: '3', target: '1', label: 'HTTPS', weight: 3, type: 'strong' },
      { id: 'e2', source: '1', target: '4', label: 'REST API', weight: 2, type: 'default' },
      { id: 'e3', source: '4', target: '2', label: 'SQL', weight: 4, type: 'critical' },
      { id: 'e4', source: '1', target: '5', label: 'Cache', weight: 1, type: 'weak' },
      { id: 'e5', source: '5', target: '2', label: 'Sync', weight: 2, type: 'default' },
    ]
  };

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate the data structure
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid format: missing or invalid nodes array');
        }
        
        if (!data.edges || !Array.isArray(data.edges)) {
          throw new Error('Invalid format: missing or invalid edges array');
        }

        // Validate nodes
        for (const node of data.nodes) {
          if (!node.id || !node.label) {
            throw new Error('Invalid node format: each node must have id and label');
          }
        }

        // Validate edges
        for (const edge of data.edges) {
          if (!edge.id || !edge.source || !edge.target) {
            throw new Error('Invalid edge format: each edge must have id, source, and target');
          }
        }

        onDataLoaded(data);
        toast.success(`Successfully loaded ${data.nodes.length} nodes and ${data.edges.length} edges`);
      } catch (error) {
        toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    reader.readAsText(file);
  }, [onDataLoaded]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => 
      file.type === 'application/json' || file.name.endsWith('.json')
    );
    
    if (jsonFile) {
      handleFileUpload(jsonFile);
    } else {
      toast.error('Please upload a JSON file');
    }
  }, [handleFileUpload]);

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Parse JSON input
  const handleJsonSubmit = () => {
    try {
      const data = JSON.parse(jsonInput);
      onDataLoaded(data);
      setJsonInput('');
      toast.success('JSON data loaded successfully');
    } catch (error) {
      toast.error('Invalid JSON format');
    }
  };

  // Load sample data
  const loadSampleData = () => {
    onDataLoaded(sampleData);
    toast.success('Sample data loaded');
  };

  // Export current data
  const exportData = () => {
    if (!currentData) {
      toast.error('No data to export');
      return;
    }

    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'network-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  // Clear current data
  const clearData = () => {
    onDataLoaded({ nodes: [], edges: [] });
    toast.success('Data cleared');
  };

  return (
    <div className="space-y-6">
      {/* File Upload Card */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Network Data
          </CardTitle>
          <CardDescription>
            Upload a JSON file containing network nodes and edges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop your JSON file here
            </p>
            <p className="text-muted-foreground mb-4">
              or click to browse
            </p>
            <Input
              type="file"
              accept=".json,application/json"
              onChange={handleInputChange}
              className="w-full max-w-xs mx-auto"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button onClick={loadSampleData} variant="outline">
              Load Sample Data
            </Button>
            {currentData && (
              <>
                <Button onClick={exportData} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button onClick={clearData} variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* JSON Input Card */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle>Direct JSON Input</CardTitle>
          <CardDescription>
            Paste your network data in JSON format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="json-input">JSON Data</Label>
            <Textarea
              id="json-input"
              placeholder={`{
  "nodes": [
    {"id": "1", "label": "Node 1", "type": "server"},
    {"id": "2", "label": "Node 2", "type": "client"}
  ],
  "edges": [
    {"id": "e1", "source": "1", "target": "2", "label": "connection"}
  ]
}`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <Button 
            onClick={handleJsonSubmit} 
            disabled={!jsonInput.trim()}
            className="w-full"
          >
            Load JSON Data
          </Button>
        </CardContent>
      </Card>

      {/* Current Data Info */}
      {currentData && (
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle>Current Dataset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Badge variant="secondary">
                {currentData.nodes.length} nodes
              </Badge>
              <Badge variant="secondary">
                {currentData.edges.length} edges
              </Badge>
              <Separator orientation="vertical" className="h-6" />
              <div className="text-sm text-muted-foreground">
                Types: {Array.from(new Set(currentData.nodes.map(n => n.type || 'default'))).join(', ')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Format Documentation */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle>Supported Format</CardTitle>
          <CardDescription>
            Your JSON file should follow this structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
{`{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "server|database|user|service", // optional
      "metadata": { // optional
        "key": "value"
      }
    }
  ],
  "edges": [
    {
      "id": "unique-edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "Connection Type", // optional
      "weight": 2, // optional, affects line thickness
      "type": "strong|weak|critical" // optional
    }
  ]
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};