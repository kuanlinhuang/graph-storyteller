import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

export const NetworkEdge = memo((props: EdgeProps) => {
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
    const weight = (data as any)?.weight || 1;
    const strokeWidth = typeof weight === 'number' ? Math.max(1, weight * 2) : 2;
    const baseStyle = {
      strokeWidth,
      ...style,
    };

    if (selected) {
      return {
        ...baseStyle,
        stroke: 'hsl(var(--edge-selected))',
        strokeWidth: (typeof baseStyle.strokeWidth === 'number' ? baseStyle.strokeWidth : 2) + 1,
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

  const edgeData = data as any;
  const label = edgeData?.label;
  const weight = edgeData?.weight;
  const edgeType = edgeData?.edgeType || 'default';

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={getEdgeStyle()} 
      />
      <EdgeLabelRenderer>
        {(label || weight) && (
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
              {label && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getEdgeTypeColor(edgeType)} bg-background/90 backdrop-blur-sm`}
                >
                  {String(label)}
                </Badge>
              )}
              {weight && weight !== 1 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-background/90 backdrop-blur-sm"
                >
                  {String(weight)}
                </Badge>
              )}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});