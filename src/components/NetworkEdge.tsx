import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

interface NetworkEdgeData {
  label?: string;
  weight?: number;
  edgeType: string;
}

export const NetworkEdge = memo((props: any) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    selected,
    markerEnd,
  } = props;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: Math.max(1, (data?.weight || 1) * 2),
      ...style,
    };

    if (selected) {
      return {
        ...baseStyle,
        stroke: 'hsl(var(--edge-selected))',
        strokeWidth: baseStyle.strokeWidth + 1,
      };
    }

    return {
      ...baseStyle,
      stroke: 'hsl(var(--edge-default))',
    };
  };

  const getEdgeTypeColor = (type: string) => {
    switch (type) {
      case 'strong':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'weak':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={getEdgeStyle()} 
      />
      <EdgeLabelRenderer>
        {(data?.label || data?.weight) && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="flex flex-col items-center gap-1">
              {data?.label && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getEdgeTypeColor(data?.edgeType || 'default')} bg-background/90 backdrop-blur-sm`}
                >
                  {data.label}
                </Badge>
              )}
              {data?.weight && data.weight !== 1 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-background/90 backdrop-blur-sm"
                >
                  {data.weight}
                </Badge>
              )}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});