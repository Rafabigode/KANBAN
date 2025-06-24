
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { KPIMetric } from '@/types/kpis';

interface KPIMetricCardProps {
  metric: KPIMetric;
  className?: string;
}

export const KPIMetricCard: React.FC<KPIMetricCardProps> = ({ metric, className }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'down':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant="outline" className={getTrendColor()}>
              {metric.trend === 'up' ? 'Bom' : metric.trend === 'down' ? 'Baixo' : 'Estável'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold">
          {metric.value}
          {metric.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{metric.unit}</span>}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
          
          {metric.formula && (
            <div className="bg-muted p-2 rounded text-xs">
              <strong>Fórmula:</strong> {metric.formula}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Atualizado: {metric.lastUpdated.toLocaleString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
