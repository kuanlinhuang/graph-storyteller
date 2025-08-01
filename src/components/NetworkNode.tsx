import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Edit3, Info } from 'lucide-react';

interface NetworkNodeData {
  label: string;
  metadata?: Record<string, unknown>;
  nodeType: string;
  textColor?: string;
}

export const NetworkNode = memo((props: NodeProps<NetworkNodeData>) => {
  const { id, data, selected } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');

  const handleLabelSave = () => {
    // In a real app, you'd update the node data here
    setIsEditing(false);
  };

  const getNodeStyle = () => {
    const baseClasses = "min-w-[120px] p-3 border-2 transition-all duration-200 cursor-pointer";
    
    if (selected) {
      return `${baseClasses} border-node-selected bg-node-selected/10 shadow-node`;
    }
    
    return `${baseClasses} border-node hover:border-node-hover hover:shadow-node`;
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'server':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'database':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'service':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Card className={getNodeStyle()}>
      <div className="flex flex-col items-center gap-2">
        {/* Node Type Badge */}
        <Badge 
          variant="outline" 
          className={`text-xs ${getNodeTypeColor(data?.nodeType || 'default')}`}
        >
          {data?.nodeType || 'default'}
        </Badge>

        {/* Node Label */}
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLabelSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="text-center text-sm"
              style={{ color: data?.textColor }}
              autoFocus
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleLabelSave} className="flex-1">
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full justify-center">
            <span 
              className="text-sm font-medium text-center min-w-0 flex-1"
              style={{ color: data?.textColor }}
            >
              {data?.label || 'Node'}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Metadata Info */}
        {data?.metadata && Object.keys(data.metadata).length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="p-1 h-auto">
                <Info className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold">Node Information</Label>
                  <Separator className="mt-1" />
                </div>
                <div className="space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">ID</Label>
                    <p className="text-sm font-mono">{id}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <p className="text-sm">{data?.nodeType || 'default'}</p>
                  </div>
                  {Object.entries(data?.metadata || {}).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-sm">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-node-default border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-node-default border-2 border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-node-default border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-node-default border-2 border-background"
      />
    </Card>
  );
});