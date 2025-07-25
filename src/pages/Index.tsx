import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NetworkCanvas, NetworkData } from '@/components/NetworkCanvas';
import { FileUploader } from '@/components/FileUploader';
import { Network, Upload, Zap } from 'lucide-react';

const Index = () => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);

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
                  Interactive network analysis and visualization
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
                Upload your network files or create interactive visualizations from scratch. 
                Analyze relationships, discover patterns, and explore your data in an intuitive way.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Upload className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Easy Import</CardTitle>
                  <CardDescription>
                    Upload JSON files or paste data directly. Supports standard network formats.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Network className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Interactive Canvas</CardTitle>
                  <CardDescription>
                    Drag, zoom, and explore your network with smooth interactions and layouts.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card className="shadow-card-custom">
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-lg">Real-time Editing</CardTitle>
                  <CardDescription>
                    Add nodes, create connections, and modify your network on the fly.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <FileUploader onDataLoaded={handleDataLoaded} currentData={networkData} />
          </div>
        ) : (
          /* Main App Interface */
          <Tabs defaultValue="canvas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="canvas">Network Canvas</TabsTrigger>
              <TabsTrigger value="data">Data Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="canvas" className="space-y-6">
              <NetworkCanvas 
                data={networkData} 
                onDataChange={setNetworkData} 
              />
            </TabsContent>
            
            <TabsContent value="data" className="space-y-6">
              <FileUploader onDataLoaded={handleDataLoaded} currentData={networkData} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
