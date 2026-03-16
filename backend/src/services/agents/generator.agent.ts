import { BaseAgent } from './base-agent.js';
import type { StructuredCriteria, TestCase } from '../../../../shared/types.js';

export class GeneratorAgent extends BaseAgent {
  protected getSystemPrompt(): string {
    return `You are a QA test case engineer. Given structured acceptance criteria, generate comprehensive test cases.

For each criterion, create one or more test cases with detailed steps. Each test case must include:
- A clear, descriptive title (max 128 characters)
- A test type: "positive" (happy path), "negative" (error/failure), or "boundary" (edge values)
- A priority: 1 (Critical), 2 (High), 3 (Medium), 4 (Low)
- Numbered steps with specific actions and expected results
- Links to the criteria IDs being tested

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
        { "stepNumber": 1, "action": "<what the tester does>", "expectedResult": "<what should happen>" }
      ],
      "linkedCriteriaIds": ["F-AC-1", "S123-AC-2"]
    }
  ]
}

Rules:
- Create at least one positive test for each functional criterion
- Create negative tests for validation criteria
- Create boundary tests for edge case criteria
- Each test must have at least 2 steps
- Actions should be specific and actionable (e.g., "Click the Submit button" not "Submit the form")
- Expected results must be observable and verifiable
- Title must not exceed 128 characters
- Aim for 2-5 test cases per criterion category, depending on complexity`;
  }

  async generate(criteria: StructuredCriteria, areaPath: string): Promise<TestCase[]> {
    const input = JSON.stringify(criteria, null, 2);
    const result = await this.invoke(input);
    const testCases = (result as { testCases: TestCase[] }).testCases || [];

    // Ensure area path is set and titles are capped
    return testCases.map((tc) => ({
      ...tc,
      areaPath: areaPath,
      title: tc.title.substring(0, 128),
    }));
  }
}
