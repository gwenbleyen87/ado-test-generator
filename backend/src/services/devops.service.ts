import type { DevOpsConfig, DevOpsProject, DevOpsUser, Feature, Iteration, UserStory, ValidateResponse } from '../../../shared/types.js';
import { buildFeaturesQuery } from './utils/wiql-builder.js';
import { stripHtml } from './utils/html-strip.js';

export class DevOpsService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(private config: DevOpsConfig) {
    this.baseUrl = `https://dev.azure.com/${config.organization}/${config.project}`;
    const token = Buffer.from(`:${config.pat}`).toString('base64');
    this.headers = {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options?.headers },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Azure DevOps API error (${res.status}): ${body}`);
    }
    return res.json() as Promise<T>;
  }

  static async getProjects(pat: string, organization: string): Promise<DevOpsProject[]> {
    const token = Buffer.from(`:${pat}`).toString('base64');
    const res = await fetch(
      `https://dev.azure.com/${organization}/_apis/projects?api-version=7.1&$top=500&stateFilter=wellFormed`,
      {
        headers: {
          Authorization: `Basic ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Azure DevOps API error (${res.status}): ${body}`);
    }
    const data = (await res.json()) as { value: DevOpsProject[] };
    return data.value
      .map((p) => ({ id: p.id, name: p.name, description: p.description, state: p.state }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getUsers(): Promise<DevOpsUser[]> {
    // Get all teams in the project, then collect unique members
    const teamsUrl = `https://dev.azure.com/${this.config.organization}/_apis/projects/${this.config.project}/teams?api-version=7.1&$top=500`;
    const teamsData = await this.fetchApi<{ value: { id: string; name: string }[] }>(teamsUrl);

    const userMap = new Map<string, DevOpsUser>();
    for (const team of teamsData.value) {
      const membersUrl = `https://dev.azure.com/${this.config.organization}/_apis/projects/${this.config.project}/teams/${team.id}/members?api-version=7.1&$top=500`;
      try {
        const membersData = await this.fetchApi<{ value: TeamMember[] }>(membersUrl);
        for (const m of membersData.value) {
          if (m.identity && !userMap.has(m.identity.uniqueName)) {
            userMap.set(m.identity.uniqueName, {
              id: m.identity.id,
              displayName: m.identity.displayName,
              uniqueName: m.identity.uniqueName,
            });
          }
        }
      } catch {
        // Skip teams we can't access
      }
    }

    return Array.from(userMap.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  async validateConnection(): Promise<ValidateResponse> {
    try {
      const data = await this.fetchApi<{ name: string }>(
        `https://dev.azure.com/${this.config.organization}/_apis/projects/${this.config.project}?api-version=7.1`
      );
      return { valid: true, projectName: data.name };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      return { valid: false, error: message };
    }
  }

  async getIterations(): Promise<Iteration[]> {
    const url = `${this.baseUrl}/_apis/wit/classificationnodes/Iterations?$depth=3&api-version=7.1`;
    const data = await this.fetchApi<IterationNode>(url);
    return this.flattenIterations(data);
  }

  private flattenIterations(node: IterationNode, parentPath = ''): Iteration[] {
    const path = parentPath ? `${parentPath}\\${node.name}` : node.name;
    const iteration: Iteration = {
      id: node.id,
      name: node.name,
      path: (node.path || path).replace(/^\\+/, '').replace(/\\Iteration(?=\\|$)/, ''),
      attributes: node.attributes,
    };

    if (node.children && node.children.length > 0) {
      iteration.children = [];
      for (const child of node.children) {
        const childIterations = this.flattenIterations(child, path);
        iteration.children.push(...childIterations);
      }
    }

    return [iteration];
  }

  async getFeaturesWithStories(iterationPath: string): Promise<Feature[]> {
    // Query for features under the iteration path
    const wiql = buildFeaturesQuery(iterationPath);
    const queryResult = await this.fetchApi<WiqlResult>(
      `${this.baseUrl}/_apis/wit/wiql?api-version=7.1`,
      {
        method: 'POST',
        body: JSON.stringify({ query: wiql }),
      }
    );

    if (!queryResult.workItems?.length) {
      return [];
    }

    // Batch fetch feature details with relations
    const featureIds = queryResult.workItems.map((wi) => wi.id);
    const features = await this.batchGetWorkItems(featureIds, true);

    // Extract user story IDs from relations
    const storyIds: number[] = [];
    for (const feature of features) {
      const childLinks = feature.relations?.filter(
        (r: WorkItemRelation) =>
          r.rel === 'System.LinkTypes.Hierarchy-Forward' &&
          r.url
      ) || [];
      for (const link of childLinks) {
        const id = parseInt(link.url.split('/').pop()!, 10);
        if (!isNaN(id)) storyIds.push(id);
      }
    }

    // Batch fetch user stories
    const storyMap = new Map<number, WorkItemDetail>();
    if (storyIds.length > 0) {
      const stories = await this.batchGetWorkItems(storyIds, false);
      for (const story of stories) {
        storyMap.set(story.id, story);
      }
    }

    // Assemble features with their user stories
    return features.map((f) => {
      const childLinks = f.relations?.filter(
        (r: WorkItemRelation) => r.rel === 'System.LinkTypes.Hierarchy-Forward'
      ) || [];
      const userStories: UserStory[] = childLinks
        .map((link: WorkItemRelation) => {
          const id = parseInt(link.url.split('/').pop()!, 10);
          const story = storyMap.get(id);
          if (!story) return null;
          return {
            id: story.id,
            title: story.fields['System.Title'] || '',
            state: story.fields['System.State'] || '',
            description: stripHtml(story.fields['System.Description']),
            acceptanceCriteria: stripHtml(story.fields['Microsoft.VSTS.Common.AcceptanceCriteria']),
            areaPath: story.fields['System.AreaPath'] || '',
            iterationPath: story.fields['System.IterationPath'] || '',
          } as UserStory;
        })
        .filter((s): s is UserStory => s !== null);

      return {
        id: f.id,
        title: f.fields['System.Title'] || '',
        state: f.fields['System.State'] || '',
        description: stripHtml(f.fields['System.Description']),
        acceptanceCriteria: stripHtml(f.fields['Microsoft.VSTS.Common.AcceptanceCriteria']),
        areaPath: f.fields['System.AreaPath'] || '',
        iterationPath: f.fields['System.IterationPath'] || '',
        userStories,
      } as Feature;
    });
  }

  private async batchGetWorkItems(ids: number[], expand: boolean): Promise<WorkItemDetail[]> {
    const results: WorkItemDetail[] = [];
    // Azure DevOps limits batch to 200 items
    const batchSize = 200;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const idsParam = batch.join(',');
      const expandParam = expand ? '&$expand=Relations' : '';
      const url = `${this.baseUrl}/_apis/wit/workitems?ids=${idsParam}${expandParam}&api-version=7.1`;
      const data = await this.fetchApi<{ value: WorkItemDetail[] }>(url);
      results.push(...data.value);
    }
    return results;
  }
}

// Internal types for Azure DevOps API responses
interface IterationNode {
  id: number;
  name: string;
  path?: string;
  attributes?: { startDate?: string; finishDate?: string };
  children?: IterationNode[];
}

interface WiqlResult {
  workItems: { id: number }[];
}

interface WorkItemRelation {
  rel: string;
  url: string;
  attributes?: Record<string, unknown>;
}

interface WorkItemDetail {
  id: number;
  fields: Record<string, string>;
  relations?: WorkItemRelation[];
}

interface TeamMember {
  identity: {
    id: string;
    displayName: string;
    uniqueName: string;
  };
}
