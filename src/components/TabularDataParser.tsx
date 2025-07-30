import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { NetworkData } from './NetworkCanvas';
interface TabularDataParserProps {
  onDataLoaded: (data: NetworkData) => void;
}
export const TabularDataParser = ({
  onDataLoaded
}: TabularDataParserProps) => {
  const [csvInput, setCsvInput] = useState('');
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [sourceColumn, setSourceColumn] = useState<string>('');
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [weightColumn, setWeightColumn] = useState<string>('');
  const [labelColumn, setLabelColumn] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const parseCsvData = useCallback(() => {
    if (!csvInput.trim()) {
      toast.error('Please enter CSV data');
      return;
    }
    try {
      const lines = csvInput.trim().split('\n');
      const parsed = lines.map(line => {
        // Simple CSV parser - handles basic cases
        const cells = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cells.push(current.trim());
        return cells;
      });
      setParsedData(parsed);

      // Auto-detect common column names
      if (parsed.length > 0) {
        const headers = parsed[0];
        const sourceCol = headers.find(h => h.toLowerCase().includes('source') || h.toLowerCase().includes('from') || h.toLowerCase().includes('start'));
        const targetCol = headers.find(h => h.toLowerCase().includes('target') || h.toLowerCase().includes('to') || h.toLowerCase().includes('end'));
        const weightCol = headers.find(h => h.toLowerCase().includes('weight') || h.toLowerCase().includes('value') || h.toLowerCase().includes('strength'));
        const labelCol = headers.find(h => h.toLowerCase().includes('label') || h.toLowerCase().includes('name') || h.toLowerCase().includes('type'));
        if (sourceCol) setSourceColumn(sourceCol);
        if (targetCol) setTargetColumn(targetCol);
        if (weightCol) setWeightColumn(weightCol);
        if (labelCol) setLabelColumn(labelCol);
      }
      toast.success(`Parsed ${parsed.length} rows`);
    } catch (error) {
      toast.error('Failed to parse CSV data');
    }
  }, [csvInput]);
  const convertToNetwork = useCallback(() => {
    if (parsedData.length === 0) {
      toast.error('No data to convert');
      return;
    }
    if (!sourceColumn || !targetColumn) {
      toast.error('Please select source and target columns');
      return;
    }
    const headers = parsedData[0];
    const sourceIdx = headers.indexOf(sourceColumn);
    const targetIdx = headers.indexOf(targetColumn);
    const weightIdx = weightColumn && weightColumn !== 'none' ? headers.indexOf(weightColumn) : -1;
    const labelIdx = labelColumn && labelColumn !== 'none' ? headers.indexOf(labelColumn) : -1;
    if (sourceIdx === -1 || targetIdx === -1) {
      toast.error('Selected columns not found');
      return;
    }
    const nodeSet = new Set<string>();
    const edges: NetworkData['edges'] = [];

    // Process data rows (skip header)
    for (let i = 1; i < parsedData.length; i++) {
      const row = parsedData[i];
      const source = row[sourceIdx];
      const target = row[targetIdx];
      const weight = weightIdx !== -1 ? parseFloat(row[weightIdx]) || 1 : 1;
      const label = labelIdx !== -1 ? row[labelIdx] : '';
      if (source && target) {
        nodeSet.add(source);
        nodeSet.add(target);
        edges.push({
          id: `edge-${i}`,
          source,
          target,
          weight,
          label,
          type: weight > 5 ? 'strong' : weight > 2 ? 'default' : 'weak'
        });
      }
    }
    const nodes: NetworkData['nodes'] = Array.from(nodeSet).map(nodeId => ({
      id: nodeId,
      label: nodeId,
      type: 'default',
      metadata: {
        degree: edges.filter(e => e.source === nodeId || e.target === nodeId).length
      }
    }));
    const networkData: NetworkData = {
      nodes,
      edges
    };
    onDataLoaded(networkData);
    toast.success(`Created network with ${nodes.length} nodes and ${edges.length} edges`);
  }, [parsedData, sourceColumn, targetColumn, weightColumn, labelColumn, onDataLoaded]);
  const loadSampleCsv = useCallback(() => {
    const sampleData = `source,target,weight,label
Server1,Database1,5,SQL
Server1,Cache1,3,Redis
Server2,Database1,4,SQL
User1,Server1,2,HTTPS
User2,Server2,3,HTTPS
Cache1,Database1,2,Sync
Server1,API1,4,REST
API1,Database1,5,Query`;
    setCsvInput(sampleData);
    toast.success('Sample CSV data loaded');
  }, []);
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      setCsvInput(content);
      toast.success(`CSV file "${file.name}" loaded successfully`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);
  }, []);
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tabular Data Parser</CardTitle>
          <CardDescription>
            Convert CSV or tabular data into network format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} className="mb-4" />
          </div>
          
          <div>
            <Label htmlFor="csv-input">Direct Network Input - Type Your Network in CSV format</Label>
            <Textarea id="csv-input" placeholder="source,target,weight,label" value={csvInput} onChange={e => setCsvInput(e.target.value)} rows={8} className="font-mono text-sm" />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={parseCsvData}>Parse CSV</Button>
            <Button onClick={loadSampleCsv} variant="outline">
              Load Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {parsedData.length > 0 && <Card>
          <CardHeader>
            <CardTitle>Column Mapping</CardTitle>
            <CardDescription>
              Map your CSV columns to network properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Source Column *</Label>
                <Select value={sourceColumn} onValueChange={setSourceColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedData[0]?.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Target Column *</Label>
                <Select value={targetColumn} onValueChange={setTargetColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedData[0]?.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Weight Column</Label>
                <Select value={weightColumn} onValueChange={setWeightColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weight (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {parsedData[0]?.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Label Column</Label>
                <Select value={labelColumn} onValueChange={setLabelColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select label (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {parsedData[0]?.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={convertToNetwork} className="w-full">
              Convert to Network
            </Button>
          </CardContent>
        </Card>}

      {parsedData.length > 0 && <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              <Badge variant="secondary">{parsedData.length} rows</Badge>
              <Badge variant="secondary" className="ml-2">
                {parsedData[0]?.length || 0} columns
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {parsedData[0]?.map((header, idx) => <TableHead key={idx}>{header}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(1, 11).map((row, idx) => <TableRow key={idx}>
                      {row.map((cell, cellIdx) => <TableCell key={cellIdx}>{cell}</TableCell>)}
                    </TableRow>)}
                </TableBody>
              </Table>
              {parsedData.length > 11 && <p className="text-sm text-muted-foreground mt-2 text-center">
                  ... and {parsedData.length - 11} more rows
                </p>}
            </div>
          </CardContent>
        </Card>}
    </div>;
};