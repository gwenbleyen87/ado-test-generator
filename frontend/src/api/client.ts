import type {
  ProjectsRequest,
  DevOpsProject,
  DevOpsUser,
  ValidateRequest,
  ValidateResponse,
  FeaturesRequest,
  Feature,
  Iteration,
  GenerateRequest,
  SSEEvent,
  ExportRequest,
  GenerationResult,
} from '../../../shared/types.js';

const API_BASE = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getProjects(req: ProjectsRequest): Promise<DevOpsProject[]> {
  return post('/devops/projects', req);
}

export async function validateConnection(req: ValidateRequest): Promise<ValidateResponse> {
  return post('/devops/validate', req);
}

export async function getIterations(req: ValidateRequest): Promise<Iteration[]> {
  return post('/devops/iterations', req);
}

export async function getUsers(req: ValidateRequest): Promise<DevOpsUser[]> {
  return post('/devops/users', req);
}

export async function getFeatures(req: FeaturesRequest): Promise<Feature[]> {
  return post('/devops/features', req);
}

export async function generateTestCases(
  req: GenerateRequest,
  onEvent: (event: SSEEvent) => void
): Promise<GenerationResult[]> {
  const res = await fetch(`${API_BASE}/agents/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalResults: GenerationResult[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        try {
          const event: SSEEvent = JSON.parse(trimmed.slice(6));
          onEvent(event);
          if (event.type === 'pipeline:complete' && event.data) {
            finalResults = event.data as GenerationResult[];
          }
        } catch {
          // Ignore malformed events
        }
      }
    }
  }

  return finalResults;
}

export async function exportExcel(req: ExportRequest): Promise<Blob> {
  const res = await fetch(`${API_BASE}/export/excel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.blob();
}
