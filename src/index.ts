/**
 * Agent Cost Optimizer
 * Intelligent router that analyzes task complexity and automatically selects
 * between chat (1×), single-agent (4×), or multi-agent (15×) execution
 */

import {
  ExecutionMode,
  COST_MULTIPLIERS,
  ComplexityLevel,
  TaskAnalysis,
  CostOptimizerOptions
} from './types';

export class AgentCostOptimizer {
  private valueThresholds: CostOptimizerOptions['valueThresholds'];
  private multipliers: Record<ExecutionMode, number>;

  constructor(options: CostOptimizerOptions = {}) {
    this.valueThresholds = options.valueThresholds || {
      chat: 10,
      singleAgent: 50,
      multiAgent: 200
    };

    this.multipliers = {
      ...COST_MULTIPLIERS,
      ...options.customMultipliers
    };
  }

  /**
   * Analyze a task and determine its complexity
   */
  analyzeTask(task: string | { description: string; context?: string }): TaskAnalysis {
    const taskDescription = typeof task === 'string' ? task : task.description;
    const context = typeof task === 'string' ? '' : (task.context || '');

    const combinedText = `${taskDescription} ${context}`;
    const wordCount = combinedText.split(/\s+/).length;
    const charCount = combinedText.length;

    const hasMultipleParts = /,\s*and|\.\s+[A-Z]/.test(taskDescription);
    const hasConditional = /\b(if|when|unless|whether|or|and)\b/i.test(taskDescription);
    const hasIteration = /\b(each|every|loop|iterate|repeat)\b/i.test(taskDescription);
    const hasComplexReasoning = /\b(analyze|compare|evaluate|reason|explain why)\b/i.test(taskDescription);
    const hasCodeRelated = /\b(code|function|class|implement|debug|refactor)\b/i.test(taskDescription);
    const hasMultiStep = /\b(first|then|next|finally|step|process)\b/i.test(taskDescription);

    let complexityScore = 0;
    complexityScore += Math.min(wordCount / 2, 20);
    if (hasMultipleParts) complexityScore += 15;
    if (hasConditional) complexityScore += 15;
    if (hasIteration) complexityScore += 20;
    if (hasComplexReasoning) complexityScore += 20;
    if (hasCodeRelated) complexityScore += 15;
    if (hasMultiStep) complexityScore += 10;

    const estimatedTokens = Math.ceil(charCount / 4);

    let complexity: ComplexityLevel;
    if (complexityScore < 20) complexity = ComplexityLevel.SIMPLE;
    else if (complexityScore < 45) complexity = ComplexityLevel.MEDIUM;
    else if (complexityScore < 70) complexity = ComplexityLevel.HIGH;
    else complexity = ComplexityLevel.VERY_HIGH;

    const recommendedMode = this.determineMode(estimatedTokens, complexityScore);
    const confidence = Math.min(0.95, 0.5 + (complexityScore / 100) * 0.45);

    return {
      complexity,
      estimatedTokens,
      recommendedMode,
      confidence,
      reasoning: `Score: ${complexityScore.toFixed(1)}/100. Tokens: ~${estimatedTokens}. ${this.getModeLabel(recommendedMode)}`
    };
  }

  private determineMode(estimatedTokens: number, complexityScore: number): ExecutionMode {
    const thresholds = this.valueThresholds || { chat: 10, singleAgent: 50, multiAgent: 200 };
    if (estimatedTokens <= thresholds.chat && complexityScore <= 20) return ExecutionMode.CHAT;
    else if (estimatedTokens <= thresholds.singleAgent && complexityScore <= 50) return ExecutionMode.SINGLE_AGENT;
    else return ExecutionMode.MULTI_AGENT;
  }

  getModeLabel(mode: ExecutionMode): string {
    const labels: Record<ExecutionMode, string> = {
      [ExecutionMode.CHAT]: 'Chat (1×)',
      [ExecutionMode.SINGLE_AGENT]: 'Single Agent (4×)',
      [ExecutionMode.MULTI_AGENT]: 'Multi-Agent (15×)'
    };
    return labels[mode];
  }

  calculateCost(mode: ExecutionMode, tokens: number): number {
    return tokens * this.multipliers[mode];
  }

  compareCosts(tokens: number): Record<ExecutionMode, number> {
    return {
      [ExecutionMode.CHAT]: this.calculateCost(ExecutionMode.CHAT, tokens),
      [ExecutionMode.SINGLE_AGENT]: this.calculateCost(ExecutionMode.SINGLE_AGENT, tokens),
      [ExecutionMode.MULTI_AGENT]: this.calculateCost(ExecutionMode.MULTI_AGENT, tokens)
    };
  }

  getMultiplier(mode: ExecutionMode): number {
    return this.multipliers[mode];
  }
}

export default AgentCostOptimizer;
export { ExecutionMode, ComplexityLevel, COST_MULTIPLIERS } from './types';
