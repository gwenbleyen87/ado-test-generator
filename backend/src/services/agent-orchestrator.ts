import type { Feature, GenerationResult, OpenAIConfig, SSEEvent } from '../../../shared/types.js';
import { AnalyzerAgent } from './agents/analyzer.agent.js';
import { GeneratorAgent } from './agents/generator.agent.js';
import { ReviewerAgent } from './agents/reviewer.agent.js';

export class AgentOrchestrator {
  private analyzer: AnalyzerAgent;
  private generator: GeneratorAgent;
  private reviewer: ReviewerAgent;
  private sendEvent: (event: SSEEvent) => void;

  constructor(openaiConfig: OpenAIConfig, sendEvent: (event: SSEEvent) => void) {
    this.analyzer = new AnalyzerAgent(openaiConfig);
    this.generator = new GeneratorAgent(openaiConfig);
    this.reviewer = new ReviewerAgent(openaiConfig);
    this.sendEvent = sendEvent;
  }

  async run(features: Feature[]): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];

    this.sendEvent({
      type: 'pipeline:start',
      message: `Starting test case generation for ${features.length} feature(s)`,
      progress: { currentFeature: 0, totalFeatures: features.length },
    });

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];

      this.sendEvent({
        type: 'feature:start',
        featureId: feature.id,
        featureTitle: feature.title,
        message: `Processing feature: ${feature.title}`,
        progress: { currentFeature: i + 1, totalFeatures: features.length },
      });

      try {
        // Agent 1: Analyzer
        this.sendEvent({
          type: 'agent:start',
          featureId: feature.id,
          agent: 'analyzer',
          message: 'Analyzing acceptance criteria...',
        });

        const criteria = await this.analyzer.analyze(feature);

        const criteriaCount = Object.values(criteria.categories).reduce(
          (sum, arr) => sum + arr.length, 0
        );

        this.sendEvent({
          type: 'agent:complete',
          featureId: feature.id,
          agent: 'analyzer',
          message: `Found ${criteriaCount} acceptance criteria`,
          data: { criteriaCount },
        });

        // Agent 2: Generator
        this.sendEvent({
          type: 'agent:start',
          featureId: feature.id,
          agent: 'generator',
          message: 'Generating test cases...',
        });

        const testCases = await this.generator.generate(criteria, feature.areaPath);

        this.sendEvent({
          type: 'agent:complete',
          featureId: feature.id,
          agent: 'generator',
          message: `Generated ${testCases.length} test cases`,
          data: { testCaseCount: testCases.length },
        });

        // Agent 3: Reviewer
        this.sendEvent({
          type: 'agent:start',
          featureId: feature.id,
          agent: 'reviewer',
          message: 'Reviewing test cases for quality and coverage...',
        });

        const reviewed = await this.reviewer.review(criteria, testCases);

        this.sendEvent({
          type: 'agent:complete',
          featureId: feature.id,
          agent: 'reviewer',
          message: `Review complete: ${reviewed.testCases.length} final test cases`,
          data: { reviewNotes: reviewed.reviewNotes },
        });

        results.push({
          featureId: feature.id,
          featureTitle: feature.title,
          criteria,
          testCases: reviewed.testCases,
        });

        this.sendEvent({
          type: 'feature:complete',
          featureId: feature.id,
          featureTitle: feature.title,
          message: `Feature complete: ${reviewed.testCases.length} test cases`,
          progress: { currentFeature: i + 1, totalFeatures: features.length },
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.sendEvent({
          type: 'error',
          featureId: feature.id,
          featureTitle: feature.title,
          message: `Error processing feature ${feature.title}: ${message}`,
        });
      }
    }

    return results;
  }
}
