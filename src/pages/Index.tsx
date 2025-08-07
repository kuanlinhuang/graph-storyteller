import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkCanvas, NetworkData } from '@/components/NetworkCanvas';
import { FileUploader } from '@/components/FileUploader';
import { Network, Upload, Zap, BarChart3 } from 'lucide-react';
import { D3NetworkCanvas } from '@/components/D3NetworkCanvas';
import { TabularDataParser } from '@/components/TabularDataParser';

const COUNTER_STORAGE_KEY = 'graph-storyteller-network-count';
const Index = () => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [visualizationType, setVisualizationType] = useState<'react-flow' | 'd3'>('d3');
  const [networkCount, setNetworkCount] = useState<number>(0);

  // Load counter from localStorage on component mount
  useEffect(() => {
    const savedCount = localStorage.getItem(COUNTER_STORAGE_KEY);
    if (savedCount) {
      setNetworkCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save counter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(COUNTER_STORAGE_KEY, networkCount.toString());
  }, [networkCount]);
  const handleDataLoaded = (data: NetworkData) => {
    setNetworkData(data);
    // Increment counter when new network data is loaded
    setNetworkCount(prev => prev + 1);
  };
  return <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">Interactive Network Visualizer</h1>
                <p className="text-sm text-muted-foreground">Interactive network visualization with D3 and React flow</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Network Counter */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {networkCount} network{networkCount !== 1 ? 's' : ''} visualized
                </span>
              </div>

              {networkData && <div className="flex gap-2">
                  <Badge variant="secondary">
                    {networkData.nodes.length} nodes
                  </Badge>
                  <Badge variant="secondary">
                    {networkData.edges.length} edges
                  </Badge>
                </div>}
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {!networkData ? (/* Welcome Screen */
      <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Visualize Your Network Data
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Upload network files, convert tabular data, and create interactive visualizations. Visualize your favorite network with D3.js force-directed and React flow layouts.</p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Upload className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Multiple Input Formats</CardTitle>
                  <CardDescription>Upload JSON files or convert CSV/tabular data as network inputs.</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Network className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">D3.js & React Flow Layouts</CardTitle>
                  <CardDescription>Automatic positioning with D3 physics simulation or React Flow.</CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Node &amp; Edge Visualization</CardTitle>
                  <CardDescription>Various ways to visualize node labels and connection strengths.</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">JSON Network File Upload</TabsTrigger>
                <TabsTrigger value="tabular">Tabular Network File Upload</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-6">
                <FileUploader onDataLoaded={handleDataLoaded} currentData={networkData} />
              </TabsContent>
              
              <TabsContent value="tabular" className="space-y-6">
                <TabularDataParser onDataLoaded={handleDataLoaded} />
              </TabsContent>
            </Tabs>
          </div>) : (/* Main App Interface */
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Network Visualization - Takes 3/4 of the space */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="d3-canvas" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="d3-canvas">D3 Network</TabsTrigger>
                  <TabsTrigger value="react-flow">React Flow</TabsTrigger>
                </TabsList>
                
                <TabsContent value="d3-canvas" className="space-y-6">
                  <D3NetworkCanvas data={networkData} onDataChange={setNetworkData} />
                </TabsContent>
                
                <TabsContent value="react-flow" className="space-y-6">
                  <NetworkCanvas data={networkData} onDataChange={setNetworkData} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Data Management - Takes 1/4 of the space, always visible */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Manage your network data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="current" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="current">Current</TabsTrigger>
                      <TabsTrigger value="upload">New JSON</TabsTrigger>
                      <TabsTrigger value="tabular">New CSV</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="current" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Dataset</span>
                          <Badge variant="secondary">Loaded</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Badge variant="outline" className="text-center">
                            {networkData.nodes.length} nodes
                          </Badge>
                          <Badge variant="outline" className="text-center">
                            {networkData.edges.length} edges
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Max edge weight: {Math.max(...networkData.edges.map(e => e.weight || 1))}</div>
                          <div>Min edge weight: {Math.min(...networkData.edges.map(e => e.weight || 1))}</div>
                        </div>
                        <Button onClick={() => setNetworkData(null)} variant="outline" size="sm" className="w-full mt-3">
                          Clear Data & Start New
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="upload" className="space-y-4">
                      <FileUploader onDataLoaded={handleDataLoaded} currentData={networkData} />
                    </TabsContent>
                    
                    <TabsContent value="tabular" className="space-y-4">
                      <TabularDataParser onDataLoaded={handleDataLoaded} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Citation Card */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-sm">Citation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="font-semibold text-foreground">
                      Please Cite:
                    </p>
                    <p className="font-medium">
                      "Interactive Network Visualizer"
                    </p>
                    <p>
                      Kuan-lin Huang 2025
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      (doi: )
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>)}
      </main>
    </div>;
};
export default Index;