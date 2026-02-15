/**
 * Example: Agent Cost Optimizer
 */

import { AgentCostOptimizer, ExecutionMode } from '../src';

const optimizer = new AgentCostOptimizer();

// Test different tasks
const tasks = [
  "What is the weather today?",
  "Write a function to calculate fibonacci numbers",
  "Build a system that: 1) analyzes requirements, 2) designs schema, 3) generates APIs"
];

tasks.forEach(task => {
  const analysis = optimizer.analyzeTask(task);
  console.log(`\n📝 Task: "${task.substring(0, 40)}..."`);
  console.log(`   Complexity: ${analysis.complexity}`);
  console.log(`   Tokens: ${analysis.estimatedTokens}`);
  console.log(`   Mode: ${optimizer.getModeLabel(analysis.recommendedMode)}`);
});

console.log('\n💰 Cost Comparison (1000 tokens):');
const costs = optimizer.compareCosts(1000);
console.log(`   Chat: ${costs[ExecutionMode.CHAT]}`);
console.log(`   Single: ${costs[ExecutionMode.SINGLE_AGENT]}`);
console.log(`   Multi: ${costs[ExecutionMode.MULTI_AGENT]}`);
