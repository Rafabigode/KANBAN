
export interface KPIMetric {
  name: string;
  value: number | string;
  description: string;
  formula?: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface BoardKPIs {
  boardId: string;
  boardTitle: string;
  totalCards: number;
  completedCards: number;
  completionRate: number;
  averageTimePerCard: number;
  cardsPerColumn: Record<string, number>;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  productivityScore: number;
  metrics: {
    averageCompletionTime: KPIMetric;
    createdVsCompleted: KPIMetric;
    overduePercentage: KPIMetric;
    averageStartTime: KPIMetric;
    taskThroughput: KPIMetric;
  };
}

export interface ProjectKPIs {
  totalBoards: number;
  totalCards: number;
  globalCompletionRate: number;
  averageProductivityScore: number;
  mostActiveBoard: string;
  cardsByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  dailyProgress: {
    date: string;
    cardsCompleted: number;
  }[];
  weeklyTrend: {
    week: string;
    cardsCreated: number;
    cardsCompleted: number;
    efficiency: number;
  }[];
  boardComparison: {
    boardName: string;
    efficiency: number;
    totalCards: number;
    completionRate: number;
  }[];
  metrics: {
    systemEfficiency: KPIMetric;
    dailyThroughput: KPIMetric;
    boardPerformance: KPIMetric;
    performanceTrend: KPIMetric;
  };
}

export interface KPIData {
  boardKPIs: BoardKPIs[];
  projectKPIs: ProjectKPIs;
  lastUpdated: Date;
}

export type KPITimeFilter = 'week' | 'month' | 'quarter' | 'custom';
export type KPISortBy = 'efficiency' | 'volume' | 'completion' | 'name';
