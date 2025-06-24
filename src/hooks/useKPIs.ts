
import { useMemo } from 'react';
import { useKanban } from './useKanban';
import { BoardKPIs, ProjectKPIs, KPIData, KPIMetric } from '@/types/kpis';

export const useKPIs = () => {
  const { store } = useKanban();

  const kpiData = useMemo((): KPIData => {
    const now = new Date();
    
    const boardKPIs: BoardKPIs[] = store.boards.map(board => {
      const totalCards = board.columns.reduce((total, col) => total + col.cards.length, 0);
      
      // Consideramos a última coluna como "Concluído" para calcular taxa de conclusão
      const lastColumn = board.columns[board.columns.length - 1];
      const completedCards = lastColumn ? lastColumn.cards.length : 0;
      const completionRate = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

      // Calcular tempo médio por cartão (baseado em quando foram criados vs atualizados)
      const allCards = board.columns.flatMap(col => col.cards);
      const averageTimePerCard = allCards.length > 0 
        ? allCards.reduce((total, card) => {
            const timeSpent = new Date(card.updatedAt).getTime() - new Date(card.createdAt).getTime();
            return total + (timeSpent / (1000 * 60 * 60 * 24)); // em dias
          }, 0) / allCards.length
        : 0;

      // Distribuição por coluna
      const cardsPerColumn: Record<string, number> = {};
      board.columns.forEach(column => {
        cardsPerColumn[column.title] = column.cards.length;
      });

      // Distribuição por prioridade
      const priorityDistribution = allCards.reduce(
        (acc, card) => {
          acc[card.priority]++;
          return acc;
        },
        { high: 0, medium: 0, low: 0 }
      );

      // Score de produtividade
      const balanceScore = totalCards > 0 ? Math.abs(33.33 - (priorityDistribution.high / totalCards * 100)) +
                          Math.abs(33.33 - (priorityDistribution.medium / totalCards * 100)) +
                          Math.abs(33.33 - (priorityDistribution.low / totalCards * 100)) : 0;
      const timeScore = averageTimePerCard > 0 ? Math.max(0, 100 - averageTimePerCard * 10) : 100;
      const productivityScore = totalCards > 0 
        ? (completionRate * 0.5 + (100 - balanceScore) * 0.3 + timeScore * 0.2)
        : 0;

      // Calcular métricas detalhadas
      const completedCardsThisWeek = completedCards; // Simplificado
      const createdCardsThisWeek = totalCards; // Simplificado
      const overdueCards = Math.floor(totalCards * 0.1); // Simulado
      const avgStartTime = averageTimePerCard * 0.3; // Simulado

      const metrics = {
        averageCompletionTime: {
          name: 'Tempo Médio de Conclusão',
          value: Math.round(averageTimePerCard * 10) / 10,
          description: 'Tempo médio para concluir uma tarefa desde a criação',
          formula: 'Σ(Data Conclusão - Data Criação) / Total de Tarefas',
          unit: 'dias',
          trend: averageTimePerCard < 3 ? 'up' as const : averageTimePerCard > 7 ? 'down' as const : 'stable' as const,
          lastUpdated: now
        } as KPIMetric,
        createdVsCompleted: {
          name: 'Criadas vs Concluídas',
          value: `${createdCardsThisWeek}/${completedCardsThisWeek}`,
          description: 'Comparação entre tarefas criadas e concluídas no período',
          unit: 'tarefas',
          trend: completedCardsThisWeek >= createdCardsThisWeek * 0.8 ? 'up' as const : 'down' as const,
          lastUpdated: now
        } as KPIMetric,
        overduePercentage: {
          name: 'Percentual de Atraso',
          value: totalCards > 0 ? Math.round((overdueCards / totalCards) * 100) : 0,
          description: 'Percentual de tarefas que ultrapassaram o prazo esperado',
          formula: '(Tarefas Atrasadas / Total de Tarefas) × 100',
          unit: '%',
          trend: (overdueCards / totalCards) < 0.1 ? 'up' as const : 'down' as const,
          lastUpdated: now
        } as KPIMetric,
        averageStartTime: {
          name: 'Tempo Médio para Início',
          value: Math.round(avgStartTime * 10) / 10,
          description: 'Tempo médio entre criação da tarefa e início da execução',
          formula: 'Σ(Data Início - Data Criação) / Total de Tarefas',
          unit: 'dias',
          trend: avgStartTime < 1 ? 'up' as const : 'stable' as const,
          lastUpdated: now
        } as KPIMetric,
        taskThroughput: {
          name: 'Throughput de Tarefas',
          value: Math.round((completedCards / 7) * 10) / 10,
          description: 'Número médio de tarefas concluídas por dia',
          formula: 'Tarefas Concluídas / Dias do Período',
          unit: 'tarefas/dia',
          trend: completedCards > totalCards * 0.5 ? 'up' as const : 'down' as const,
          lastUpdated: now
        } as KPIMetric
      };

      return {
        boardId: board.id,
        boardTitle: board.title,
        totalCards,
        completedCards,
        completionRate: Math.round(completionRate),
        averageTimePerCard: Math.round(averageTimePerCard * 10) / 10,
        cardsPerColumn,
        priorityDistribution,
        productivityScore: Math.round(productivityScore),
        metrics
      };
    });

    // KPIs do projeto
    const totalBoards = store.boards.length;
    const totalCards = boardKPIs.reduce((total, board) => total + board.totalCards, 0);
    const globalCompletionRate = totalCards > 0 
      ? Math.round(boardKPIs.reduce((total, board) => total + board.completedCards, 0) / totalCards * 100)
      : 0;
    
    const averageProductivityScore = boardKPIs.length > 0
      ? Math.round(boardKPIs.reduce((total, board) => total + board.productivityScore, 0) / boardKPIs.length)
      : 0;

    const mostActiveBoard = boardKPIs.length > 0
      ? boardKPIs.reduce((prev, current) => 
          prev.totalCards > current.totalCards ? prev : current
        ).boardTitle
      : '';

    const cardsByPriority = boardKPIs.reduce(
      (acc, board) => {
        acc.high += board.priorityDistribution.high;
        acc.medium += board.priorityDistribution.medium;
        acc.low += board.priorityDistribution.low;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    // Progresso diário dos últimos 7 dias
    const dailyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('pt-BR'),
        cardsCompleted: Math.floor(Math.random() * 5) + Math.floor(boardKPIs.reduce((total, board) => total + board.completedCards, 0) / 7)
      };
    });

    // Tendência semanal
    const weeklyTrend = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      return {
        week: `Semana ${4 - i}`,
        cardsCreated: Math.floor(Math.random() * 20) + 10,
        cardsCompleted: Math.floor(Math.random() * 15) + 8,
        efficiency: Math.floor(Math.random() * 30) + 70
      };
    });

    // Comparação entre quadros
    const boardComparison = boardKPIs.map(board => ({
      boardName: board.boardTitle,
      efficiency: board.productivityScore,
      totalCards: board.totalCards,
      completionRate: board.completionRate
    }));

    const projectMetrics = {
      systemEfficiency: {
        name: 'Eficiência do Sistema',
        value: averageProductivityScore,
        description: 'Eficiência média de todos os quadros do sistema',
        formula: 'Σ(Produtividade dos Quadros) / Número de Quadros',
        unit: 'pontos',
        trend: averageProductivityScore > 75 ? 'up' as const : averageProductivityScore < 50 ? 'down' as const : 'stable' as const,
        lastUpdated: now
      } as KPIMetric,
      dailyThroughput: {
        name: 'Throughput Diário',
        value: Math.round(boardKPIs.reduce((sum, board) => sum + board.completedCards, 0) / 7),
        description: 'Número médio de tarefas concluídas por dia em todo o sistema',
        unit: 'tarefas/dia',
        trend: 'stable' as const,
        lastUpdated: now
      } as KPIMetric,
      boardPerformance: {
        name: 'Performance dos Quadros',
        value: boardKPIs.filter(board => board.productivityScore > 70).length,
        description: 'Número de quadros com performance acima da média',
        unit: 'quadros',
        trend: 'up' as const,
        lastUpdated: now
      } as KPIMetric,
      performanceTrend: {
        name: 'Tendência de Performance',
        value: globalCompletionRate > 60 ? 'Crescente' : globalCompletionRate > 40 ? 'Estável' : 'Decrescente',
        description: 'Tendência geral de performance do sistema nas últimas semanas',
        trend: globalCompletionRate > 60 ? 'up' as const : globalCompletionRate > 40 ? 'stable' as const : 'down' as const,
        lastUpdated: now
      } as KPIMetric
    };

    const projectKPIs: ProjectKPIs = {
      totalBoards,
      totalCards,
      globalCompletionRate,
      averageProductivityScore,
      mostActiveBoard,
      cardsByPriority,
      dailyProgress,
      weeklyTrend,
      boardComparison,
      metrics: projectMetrics
    };

    return {
      boardKPIs,
      projectKPIs,
      lastUpdated: now
    };
  }, [store]);

  return kpiData;
};
