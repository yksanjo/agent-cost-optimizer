/**
 * Agent Cost Optimizer - Core Types
 */

export enum ExecutionMode {
  CHAT = 'chat',
  SINGLE_AGENT = 'single',
  MULTI_AGENT = 'multi'
}

export const COST_MULTIPLIERS: Record<ExecutionMode, number> = {
  [ExecutionMode.CHAT]: 1,
  [ExecutionMode.SINGLE_AGENT]: 4,
  [ExecutionMode.MULTI_AGENT]: 15
};

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface TaskAnalysis {
  complexity: ComplexityLevel;
  estimatedTokens: number;
  recommendedMode: ExecutionMode;
  confidence: number;
  reasoning: string;
}

export interface CostOptimizerOptions {
  valueThresholds?: {
    chat: number;
    singleAgent: number;
    multiAgent: number;
  };
  customMultipliers?: Partial<Record<ExecutionMode, number>>;
}
