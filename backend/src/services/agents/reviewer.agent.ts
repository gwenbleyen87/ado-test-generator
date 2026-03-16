import { BaseAgent } from './base-agent.js';
import type { StructuredCriteria, TestCase } from '../../../../shared/types.js';

export class ReviewerAgent extends BaseAgent {
  protected getSystemPrompt(): string {
    return `You are a senior QA reviewer. Review test cases for quality, coverage, and completeness.

Given the original acceptance criteria and generated test cases, you must:
1. Verify every acceptance criterion has at least one test case covering it
2. Improve vague expected results to be specific and measurable
3. Remove redundant test cases (keep the more comprehensive one)
4. Add missing edge case or boundary tests if obvious gaps exist
5. Ensure test steps are in logical order and each step has both action and expected result
6. Verify all titles are under 128 characters

Respond with JSON in this exact format:
{
  "testCases": [
    {
      "title": "<max 128 chars>",
      "featureId": <number>,
      "featureTitle": "<string>",
      "userStoryId": <number|null>,
      "priority": 1|2|3|4,
      "testType": "positive"|"negative"|"boundary",
      "steps": [
        { "stepNumber": 1, "action": "<specific action>", "expectedResult": "<specific expected result>" }
      ],
      "linkedCriteriaIds": ["F-AC-1"],
      "areaPath": "<string>"
    }
  ],
  "reviewNotes": {
    "added": <number>,
    "removed": <number>,
    "modified": <number>,
    "coverageGaps": ["<description of any remaining gaps>"]
  }
}

Rules:
- Return the complete final set of test cases (not just changes)
- Maintain all existing fields (featureId, areaPath, etc.)
- Only add test cases if there are clear coverage gaps
- Prefer improving existing tests over adding new ones
- Expected results must be observable: "Error message 'Invalid email' is displayed" not "Error is shown"`;
  }

  async review(
    criteria: StructuredCriteria,
    testCases: TestCase[]
  ): Promise<{ testCases: TestCase[]; reviewNotes: Record<string, unknown> }> {
    const input = JSON.stringify({ criteria, testCases }, null, 2);
    const result = await this.invoke(input);
    return result as { testCases: TestCase[]; reviewNotes: Record<string, unknown> };
  }
}
