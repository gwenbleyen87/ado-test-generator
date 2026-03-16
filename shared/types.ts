// Azure DevOps types
export interface DevOpsConfig {
  pat: string;
  organization: string;
  project: string;
}

export interface OpenAIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export interface Iteration {
  id: number;
  name: string;
  path: string;
  children?: Iteration[];
  attributes?: {
    startDate?: string;
    finishDate?: string;
  };
}

export interface UserStory {
  id: number;
  title: string;
  state: string;
  description: string;
  acceptanceCriteria: string;
  areaPath: string;
  iterationPath: string;
}

export interface Feature {
  id: number;
  title: string;
  state: string;
  description: string;
  acceptanceCriteria: string;
  areaPath: string;
  iterationPath: string;
  userStories: UserStory[];
}

// Agent types
export interface StructuredCriteria {
  featureId: number;
  featureTitle: string;
  categories: {
    functional: CriterionItem[];
    edgeCase: CriterionItem[];
    validation: CriterionItem[];
    integration: CriterionItem[];
    uiUx: CriterionItem[];
  };
}

export interface CriterionItem {
  id: string;
  description: string;
  source: 'explicit' | 'inferred';
  sourceStoryId?: number;
}

export interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id?: string;
  title: string;
  featureId: number;
  featureTitle: string;
  userStoryId?: number;
  priority: 1 | 2 | 3 | 4;
  testType: 'positive' | 'negative' | 'boundary';
  steps: TestStep[];
  linkedCriteriaIds: string[];
  areaPath: string;
}

export interface GenerationResult {
  featureId: number;
  featureTitle: string;
  criteria: StructuredCriteria;
  testCases: TestCase[];
}

// SSE event types
export type SSEEventType =
  | 'pipeline:start'
  | 'feature:start'
  | 'agent:start'
  | 'agent:progress'
  | 'agent:complete'
  | 'feature:complete'
  | 'pipeline:complete'
  | 'error';

export interface SSEEvent {
  type: SSEEventType;
  featureId?: number;
  featureTitle?: string;
  agent?: 'analyzer' | 'generator' | 'reviewer';
  message: string;
  data?: unknown;
  progress?: {
    currentFeature: number;
    totalFeatures: number;
  };
}

// Azure DevOps user
export interface DevOpsUser {
  id: string;
  displayName: string;
  uniqueName: string;
}

// Azure DevOps project
export interface DevOpsProject {
  id: string;
  name: string;
  description?: string;
  state: string;
}

// API request/response types
export interface ProjectsRequest {
  pat: string;
  organization: string;
}

export interface ValidateRequest {
  pat: string;
  organization: string;
  project: string;
}

export interface ValidateResponse {
  valid: boolean;
  projectName?: string;
  error?: string;
}

export interface FeaturesRequest {
  pat: string;
  organization: string;
  project: string;
  iterationPath: string;
}

export interface GenerateRequest {
  devops: DevOpsConfig;
  openai: OpenAIConfig;
  features: Feature[];
}

export interface ExportRequest {
  results: GenerationResult[];
  features: Feature[];
  projectName: string;
  assignedTo?: string;
}
