import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkCanvas, NetworkData } from '@/components/NetworkCanvas';
import { FileUploader } from '@/components/FileUploader';
import { Network, Upload, Zap } from 'lucide-react';
import { D3NetworkCanvas } from '@/components/D3NetworkCanvas';
import { TabularDataParser } from '@/components/TabularDataParser';

const Index = () => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [visualizationType, setVisualizationType] = useState<'react-flow' | 'd3'>('d3');

  const handleDataLoaded = (data: NetworkData) => {
    setNetworkData(data);
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Network Visualizer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Interactive network analysis and visualization with D3.js
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {networkData && (
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {networkData.nodes.length} nodes
                  </Badge>
                  <Badge variant="secondary">
                    {networkData.edges.length} edges
                  </Badge>
                </div>
              )}
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {!networkData ? (
          /* Welcome Screen */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Visualize Your Network Data
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload network files, convert tabular data, or create interactive visualizations from scratch. 
                Analyze relationships with D3.js force-directed layouts and discover patterns in your data.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Upload className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Multiple Data Sources</CardTitle>
                  <CardDescription>
                    Upload JSON files, paste data directly, or convert CSV/tabular data to networks.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Network className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">D3.js Force Layout</CardTitle>
                  <CardDescription>
                    Automatic network positioning with physics simulation and customizable forces.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Edge Weight Visualization</CardTitle>
                  <CardDescription>
                    Connection strength indicated by line thickness and opacity based on weights.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">File Upload</TabsTrigger>
                <TabsTrigger value="tabular">Tabular Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-6">
                <FileUploader onDataLoaded={handleDataLoaded} currentData={networkData} />
              </TabsContent>
              
              <TabsContent value="tabular" className="space-y-6">
                <TabularDataParser onDataLoaded={handleDataLoaded} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Main App Interface */
          <Tabs defaultValue="d3-canvas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="d3-canvas">D3 Network</TabsTrigger>
              <TabsTrigger value="react-flow">React Flow</TabsTrigger>
              <TabsTrigger value="data">Data Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="d3-canvas" className="space-y-6">
              <D3NetworkCanvas 
                data={networkData} 
                onDataChange={setNetworkData} 
              />
            </TabsContent>
            
            <TabsContent value="react-flow" className="space-y-6">
              <NetworkCanvas 
                data={networkData} 
                onDataChange={setNetworkData} 
              />
            </TabsContent>
            
            <TabsContent value="data" className="space-y-6">
              <div className="space-y-6">
                <Tabs defaultValue="upload">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">File Upload</TabsTrigger>
                    <TabsTrigger value="tabular">Tabular Data</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upload" className="space-y-6">
                    <FileUploader onDataLoaded={handleDataLoaded} currentData={networkData} />
                  </TabsContent>
                  
                  <TabsContent value="tabular" className="space-y-6">
                    <TabularDataParser onDataLoaded={handleDataLoaded} />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
