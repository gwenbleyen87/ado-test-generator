import { BaseAgent } from './base-agent.js';
import type { Feature, StructuredCriteria } from '../../../../shared/types.js';

export class AnalyzerAgent extends BaseAgent {
  protected getSystemPrompt(): string {
    return `You are a QA analyst specializing in extracting and structuring acceptance criteria from software requirements.

Given a Feature and its linked User Stories from Azure DevOps, you must:
1. Extract all explicit acceptance criteria from the feature and each user story
2. Infer additional criteria from descriptions when acceptance criteria are missing or incomplete
3. Categorize each criterion into one of: functional, edgeCase, validation, integration, uiUx
4. Mark each as "explicit" (directly stated) or "inferred" (derived from context)

Respond with JSON in this exact format:
{
  "featureId": <number>,
  "featureTitle": "<string>",
  "categories": {
    "functional": [{ "id": "F-AC-1", "description": "<criterion>", "source": "explicit"|"inferred", "sourceStoryId": <number|null> }],
    "edgeCase": [...],
    "validation": [...],
    "integration": [...],
    "uiUx": [...]
  }
}

Rules:
- Each criterion ID should be unique and follow pattern: F-AC-<number> for feature-level, S<storyId>-AC-<number> for story-level
- Be thorough but avoid duplicates across categories
- If a user story has no acceptance criteria and no meaningful description, note it but still try to infer at least one criterion
- Keep descriptions concise and testable`;
  }

  async analyze(feature: Feature): Promise<StructuredCriteria> {
    const input = this.buildInput(feature);
    const result = await this.invoke(input);
    return result as unknown as StructuredCriteria;
  }

  private buildInput(feature: Feature): string {
    let input = `## Feature #${feature.id}: ${feature.title}\n`;
    input += `**State:** ${feature.state}\n`;
    if (feature.description) input += `**Description:** ${feature.description}\n`;
    if (feature.acceptanceCriteria) input += `**Acceptance Criteria:** ${feature.acceptanceCriteria}\n`;

    if (feature.userStories.length > 0) {
      input += `\n### Linked User Stories (${feature.userStories.length}):\n`;
      for (const story of feature.userStories) {
        input += `\n#### User Story #${story.id}: ${story.title}\n`;
        input += `**State:** ${story.state}\n`;
        if (story.description) input += `**Description:** ${story.description}\n`;
        if (story.acceptanceCriteria) input += `**Acceptance Criteria:** ${story.acceptanceCriteria}\n`;
      }
    } else {
      input += `\n*No linked user stories.*\n`;
    }

    return input;
  }
}
