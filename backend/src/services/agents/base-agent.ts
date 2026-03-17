import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import type { OpenAIConfig } from '../../../../shared/types.js';

export abstract class BaseAgent {
  protected client: AzureOpenAI;
  protected model: string;
  private maxRetries = 3;

  constructor(config: OpenAIConfig) {
    this.client = new AzureOpenAI({
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      apiVersion: '2024-10-21',
    });
    this.model = config.model;
  }

  protected abstract getSystemPrompt(): string;

  private isReasoningModel(): boolean {
    return /^o[0-9]/.test(this.model);
  }

  async invoke(userMessage: string): Promise<Record<string, unknown>> {
    let lastError: Error | null = null;
    const isReasoning = this.isReasoningModel();

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Reasoning models (o1, o3, o4-mini) don't support system messages,
        // response_format, temperature, or max_tokens in the same way
        const messages: ChatCompletionMessageParam[] = isReasoning
          ? [
              {
                role: 'user',
                content: `${this.getSystemPrompt()}\n\nIMPORTANT: You MUST respond with valid JSON only, no markdown fences.\n\n${userMessage}`,
              },
            ]
          : [
              { role: 'system', content: this.getSystemPrompt() },
              { role: 'user', content: userMessage },
            ];

        const params: ChatCompletionCreateParamsNonStreaming = {
          model: this.model,
          messages,
          ...(isReasoning
            ? {}
            : {
                response_format: { type: 'json_object' },
                max_completion_tokens: 16384,
              }),
        };

        const response = await this.client.chat.completions.create(params);

        let content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('Empty response from Azure OpenAI');
        }

        // Strip markdown code fences if present (reasoning models may add them)
        content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

        return JSON.parse(content);
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    throw new Error(`Agent failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }
}
