import { Router, Request, Response } from 'express';
import { AgentOrchestrator } from '../services/agent-orchestrator.js';
import type { GenerateRequest } from '../../../shared/types.js';

export const agentsRouter = Router();

agentsRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { devops, openai, features } = req.body as GenerateRequest;
    if (!openai?.endpoint || !openai?.apiKey || !openai?.model || !features?.length) {
      res.status(400).json({ error: 'Missing required fields: openai config (endpoint, apiKey, model) and features' });
      return;
    }

    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const sendEvent = (data: unknown) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const orchestrator = new AgentOrchestrator(openai, sendEvent);
    const results = await orchestrator.run(features);

    sendEvent({
      type: 'pipeline:complete',
      message: 'All features processed',
      data: results,
    });

    res.end();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    // If headers already sent, send as SSE event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: message });
    }
  }
});
