export enum Difficulty {
  BEGINNER = '基础',
  INTERMEDIATE = '进阶',
  ADVANCED = '专家'
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  content: string; 
  diagramType?: 'basis-convergence' | 'cost-of-carry' | 'none';
}

export type MarketScenario = 'NORMAL' | 'BULL_RUN' | 'BEAR_CRASH' | 'HIGH_VOLATILITY';

export interface SimulationState {
  cash: number;
  spotPosition: number; // Ounces of Gold
  futuresPosition: number; // Short contracts (negative)
  entrySpotPrice: number;
  entryFuturesPrice: number;
  currentSpotPrice: number;
  currentFuturesPrice: number;
  timeToMaturity: number; // Days
  maintenanceMarginRatio: number; // e.g. 0.10 (10%)
  isLiquidated: boolean;
  scenario: MarketScenario;
  history: Array<{
    day: number;
    spot: number;
    futures: number;
    pnl: number;
    basis: number;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}