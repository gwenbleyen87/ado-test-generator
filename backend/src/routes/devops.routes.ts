import { Router, Request, Response } from 'express';
import { DevOpsService } from '../services/devops.service.js';
import type { ProjectsRequest, ValidateRequest, FeaturesRequest } from '../../../shared/types.js';

export const devopsRouter = Router();

devopsRouter.post('/projects', async (req: Request, res: Response) => {
  try {
    const { pat, organization } = req.body as ProjectsRequest;
    if (!pat || !organization) {
      res.status(400).json({ error: 'Missing required fields: pat, organization' });
      return;
    }
    const projects = await DevOpsService.getProjects(pat, organization);
    res.json(projects);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

devopsRouter.post('/validate', async (req: Request, res: Response) => {
  try {
    const { pat, organization, project } = req.body as ValidateRequest;
    if (!pat || !organization || !project) {
      res.status(400).json({ valid: false, error: 'Missing required fields: pat, organization, project' });
      return;
    }
    const service = new DevOpsService({ pat, organization, project });
    const result = await service.validateConnection();
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ valid: false, error: message });
  }
});

devopsRouter.post('/iterations', async (req: Request, res: Response) => {
  try {
    const { pat, organization, project } = req.body as ValidateRequest;
    if (!pat || !organization || !project) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const service = new DevOpsService({ pat, organization, project });
    const iterations = await service.getIterations();
    res.json(iterations);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

devopsRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const { pat, organization, project } = req.body as ValidateRequest;
    if (!pat || !organization || !project) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const service = new DevOpsService({ pat, organization, project });
    const users = await service.getUsers();
    res.json(users);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

devopsRouter.post('/features', async (req: Request, res: Response) => {
  try {
    const { pat, organization, project, iterationPath } = req.body as FeaturesRequest;
    if (!pat || !organization || !project || !iterationPath) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const service = new DevOpsService({ pat, organization, project });
    const features = await service.getFeaturesWithStories(iterationPath);
    res.json(features);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
