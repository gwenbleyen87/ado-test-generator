import { Router, Request, Response } from 'express';
import { ExcelExportService } from '../services/excel-export.service.js';
import type { ExportRequest } from '../../../shared/types.js';

export const exportRouter = Router();

exportRouter.post('/excel', async (req: Request, res: Response) => {
  try {
    const { results, features, projectName, assignedTo } = req.body as ExportRequest;
    if (!results?.length) {
      res.status(400).json({ error: 'No results to export' });
      return;
    }

    const buffer = await ExcelExportService.generate(results, projectName, features, assignedTo);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=test-cases.xlsx');
    res.send(buffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});
