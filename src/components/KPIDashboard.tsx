
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { useKPIs } from '@/hooks/useKPIs';
import { useKanban } from '@/hooks/useKanban';
import { KPIMetricCard } from './KPIMetricCard';
import { TrendingUp, Target, Clock, Activity, Award, Users, BarChart3, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KPITimeFilter, KPISortBy } from '@/types/kpis';

export const KPIDashboard: React.FC = () => {
  const { boardKPIs, projectKPIs, lastUpdated } = useKPIs();
  const { getCurrentBoard } = useKanban();
  const [timeFilter, setTimeFilter] = useState<KPITimeFilter>('week');
  const [sortBy, setSortBy] = useState<KPISortBy>('efficiency');
  const [showOnlyCurrentBoard, setShowOnlyCurrentBoard] = useState(true);
  
  const currentBoard = getCurrentBoard();
  const currentBoardKPI = currentBoard ? boardKPIs.find(b => b.boardId === currentBoard.id) : null;

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  const priorityData = [
    { name: 'Alta', value: projectKPIs.cardsByPriority.high, color: '#ef4444' },
    { name: 'Média', value: projectKPIs.cardsByPriority.medium, color: '#f59e0b' },
    { name: 'Baixa', value: projectKPIs.cardsByPriority.low, color: '#10b981' }
  ];

  const sortedBoards = [...boardKPIs].sort((a, b) => {
    switch (sortBy) {
      case 'efficiency':
        return b.productivityScore - a.productivityScore;
      case 'volume':
        return b.totalCards - a.totalCards;
      case 'completion':
        return b.completionRate - a.completionRate;
      case 'name':
        return a.boardTitle.localeCompare(b.boardTitle);
      default:
        return 0;
    }
  });

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductivityLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Baixo';
  };

  return (
    <div className="space-y-6">
      {/* Controles e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="board-filter"
              checked={showOnlyCurrentBoard}
              onCheckedChange={setShowOnlyCurrentBoard}
            />
            <label htmlFor="board-filter" className="text-sm font-medium">
              Apenas quadro atual
            </label>
          </div>
          {currentBoard && showOnlyCurrentBoard && (
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {currentBoard.title}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={(value: KPITimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: KPISortBy) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efficiency">Eficiência</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="completion">Taxa Conclusão</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="detailed">KPIs Detalhados</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Quadros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{showOnlyCurrentBoard ? 1 : projectKPIs.totalBoards}</div>
                <p className="text-xs text-muted-foreground">
                  {showOnlyCurrentBoard ? 'Quadro atual' : 'Quadros ativos no sistema'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showOnlyCurrentBoard && currentBoardKPI ? currentBoardKPI.totalCards : projectKPIs.totalCards}
                </div>
                <p className="text-xs text-muted-foreground">
                  {showOnlyCurrentBoard ? 'Tarefas no quadro atual' : 'Tarefas em todos os quadros'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {showOnlyCurrentBoard && currentBoardKPI ? currentBoardKPI.completionRate : projectKPIs.globalCompletionRate}%
                </div>
                <Progress 
                  value={showOnlyCurrentBoard && currentBoardKPI ? currentBoardKPI.completionRate : projectKPIs.globalCompletionRate} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getProductivityColor(showOnlyCurrentBoard && currentBoardKPI ? currentBoardKPI.productivityScore : projectKPIs.averageProductivityScore)}`}>
                  {showOnlyCurrentBoard && currentBoardKPI ? currentBoardKPI.productivityScore : projectKPIs.averageProductivityScore}
                </div>
                <Badge variant="outline" className="mt-1">
                  {getProductivityLabel(showOnlyCurrentBoard && currentBoardKPI ? currentBoardKPI.productivityScore : projectKPIs.averageProductivityScore)}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={showOnlyCurrentBoard && currentBoardKPI 
                        ? [
                            { name: 'Alta', value: currentBoardKPI.priorityDistribution.high, color: '#ef4444' },
                            { name: 'Média', value: currentBoardKPI.priorityDistribution.medium, color: '#f59e0b' },
                            { name: 'Baixa', value: currentBoardKPI.priorityDistribution.low, color: '#10b981' }
                          ]
                        : priorityData
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(showOnlyCurrentBoard && currentBoardKPI 
                        ? [
                            { name: 'Alta', value: currentBoardKPI.priorityDistribution.high, color: '#ef4444' },
                            { name: 'Média', value: currentBoardKPI.priorityDistribution.medium, color: '#f59e0b' },
                            { name: 'Baixa', value: currentBoardKPI.priorityDistribution.low, color: '#10b981' }
                          ]
                        : priorityData
                      ).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progresso dos Últimos 7 Dias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={projectKPIs.dailyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Tarefas Concluídas']} />
                    <Line type="monotone" dataKey="cardsCompleted" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {showOnlyCurrentBoard && currentBoardKPI ? (
            <>
              <h3 className="text-lg font-semibold">KPIs Detalhados - {currentBoardKPI.boardTitle}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <KPIMetricCard metric={currentBoardKPI.metrics.averageCompletionTime} />
                <KPIMetricCard metric={currentBoardKPI.metrics.createdVsCompleted} />
                <KPIMetricCard metric={currentBoardKPI.metrics.overduePercentage} />
                <KPIMetricCard metric={currentBoardKPI.metrics.averageStartTime} />
                <KPIMetricCard metric={currentBoardKPI.metrics.taskThroughput} />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">KPIs Detalhados - Visão Geral do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIMetricCard metric={projectKPIs.metrics.systemEfficiency} />
                <KPIMetricCard metric={projectKPIs.metrics.dailyThroughput} />
                <KPIMetricCard metric={projectKPIs.metrics.boardPerformance} />
                <KPIMetricCard metric={projectKPIs.metrics.performanceTrend} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          {!showOnlyCurrentBoard && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Comparação entre Quadros</h3>
                <Badge variant="outline">Ordenado por: {sortBy}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedBoards.map(board => (
                  <Card key={board.boardId}>
                    <CardHeader>
                      <CardTitle className="text-base">{board.boardTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total de Tarefas</span>
                        <Badge variant="secondary">{board.totalCards}</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de Conclusão</span>
                          <span>{board.completionRate}%</span>
                        </div>
                        <Progress value={board.completionRate} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Produtividade</span>
                          <span className={getProductivityColor(board.productivityScore)}>
                            {board.productivityScore}
                          </span>
                        </div>
                        <Progress value={board.productivityScore} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Tempo Médio/Tarefa</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">{board.averageTimePerCard}d</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-red-500">Alta: {board.priorityDistribution.high}</span>
                        <span className="text-yellow-500">Média: {board.priorityDistribution.medium}</span>
                        <span className="text-green-500">Baixa: {board.priorityDistribution.low}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {showOnlyCurrentBoard && currentBoard && (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Comparação não disponível
              </h3>
              <p className="text-sm text-muted-foreground">
                Desative o filtro "Apenas quadro atual" para ver a comparação entre quadros
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Informações Adicionais */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>
                {showOnlyCurrentBoard && currentBoard 
                  ? `Dados do quadro: ${currentBoard.title}`
                  : `Quadro Mais Ativo: ${projectKPIs.mostActiveBoard}`
                }
              </span>
            </div>
            <span>Atualizado em: {lastUpdated.toLocaleString('pt-BR')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
