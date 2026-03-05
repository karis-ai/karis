import { AgentFactory } from './cli/src/core/agent-factory.js';

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  toolExecutions: Array<{
    tool: string;
    startTime: number;
    endTime: number;
    duration: number;
  }>;
  contentChunks: number;
  totalContentLength: number;
  firstChunkTime?: number;
  timeToFirstChunk?: number;
}

async function testGeoAuditPerformance() {
  console.log('=== GEO Audit Performance Test ===\n');

  const metrics: PerformanceMetrics = {
    startTime: Date.now(),
    toolExecutions: [],
    contentChunks: 0,
    totalContentLength: 0,
  };

  const agent = await AgentFactory.create();
  const messages = [{ role: 'user' as const, content: '帮我对 karis.im 做一个 GEO audit' }];

  let currentTool: { tool: string; startTime: number } | null = null;

  console.log(`Start Time: ${new Date(metrics.startTime).toISOString()}`);
  console.log('Streaming response...\n');

  for await (const chunk of agent.streamChat(messages)) {
    if (chunk.type === 'tool_start' && chunk.tool) {
      currentTool = { tool: chunk.tool, startTime: Date.now() };
      process.stdout.write(`[${chunk.tool}] `);
    } else if (chunk.type === 'tool_end' && currentTool) {
      const endTime = Date.now();
      const duration = endTime - currentTool.startTime;
      metrics.toolExecutions.push({
        tool: currentTool.tool,
        startTime: currentTool.startTime,
        endTime,
        duration,
      });
      process.stdout.write(`${duration}ms\n`);
      currentTool = null;
    } else if (chunk.type === 'content' && chunk.content) {
      metrics.contentChunks++;
      metrics.totalContentLength += chunk.content.length;

      if (!metrics.firstChunkTime) {
        metrics.firstChunkTime = Date.now();
        metrics.timeToFirstChunk = metrics.firstChunkTime - metrics.startTime;
      }
    } else if (chunk.type === 'done') {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
    } else if (chunk.type === 'error') {
      console.error('\nError:', chunk.error);
      process.exit(1);
    }
  }

  console.log('\n=== Performance Metrics ===\n');
  console.log(`Total Duration: ${metrics.duration}ms (${(metrics.duration! / 1000).toFixed(2)}s)`);
  console.log(`Time to First Chunk: ${metrics.timeToFirstChunk}ms`);
  console.log(`Content Chunks: ${metrics.contentChunks}`);
  console.log(`Total Content Length: ${metrics.totalContentLength} characters`);
  console.log(`Average Chunk Size: ${Math.round(metrics.totalContentLength / metrics.contentChunks)} characters`);

  console.log('\n=== Tool Execution Times ===\n');
  const toolStats = new Map<string, { count: number; totalTime: number; minTime: number; maxTime: number }>();

  for (const exec of metrics.toolExecutions) {
    const stats = toolStats.get(exec.tool) || { count: 0, totalTime: 0, minTime: Infinity, maxTime: 0 };
    stats.count++;
    stats.totalTime += exec.duration;
    stats.minTime = Math.min(stats.minTime, exec.duration);
    stats.maxTime = Math.max(stats.maxTime, exec.duration);
    toolStats.set(exec.tool, stats);
  }

  for (const [tool, stats] of Array.from(toolStats.entries()).sort((a, b) => b[1].totalTime - a[1].totalTime)) {
    const avgTime = Math.round(stats.totalTime / stats.count);
    console.log(`${tool}:`);
    console.log(`  Count: ${stats.count}`);
    console.log(`  Total: ${stats.totalTime}ms`);
    console.log(`  Avg: ${avgTime}ms`);
    console.log(`  Min: ${stats.minTime}ms`);
    console.log(`  Max: ${stats.maxTime}ms`);
    console.log('');
  }

  console.log('=== Summary ===\n');
  console.log(`Total Tools Executed: ${metrics.toolExecutions.length}`);
  console.log(`Unique Tools: ${toolStats.size}`);
  console.log(`Average Tool Execution: ${Math.round(metrics.toolExecutions.reduce((sum, e) => sum + e.duration, 0) / metrics.toolExecutions.length)}ms`);
}

testGeoAuditPerformance().catch(console.error);
