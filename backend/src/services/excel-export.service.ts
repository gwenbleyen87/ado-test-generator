import ExcelJS from 'exceljs';
import type { Feature, GenerationResult } from '../../../shared/types.js';

export class ExcelExportService {
  static async generate(results: GenerationResult[], projectName: string, features?: Feature[], assignedTo?: string): Promise<Buffer> {
    // Build lookups from features
    const storyTitleMap = new Map<number, string>();
    const featureIterationMap = new Map<number, string>();
    if (features) {
      for (const f of features) {
        featureIterationMap.set(f.id, f.iterationPath);
        for (const s of f.userStories) {
          storyTitleMap.set(s.id, s.title);
        }
      }
    }
    const workbook = new ExcelJS.Workbook();

    // Test Cases worksheet - Azure Test Plans import format
    const testSheet = workbook.addWorksheet('Test Cases');
    testSheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Work Item Type', key: 'workItemType', width: 16 },
      { header: 'Title', key: 'title', width: 50 },
      { header: 'Step Action', key: 'stepAction', width: 50 },
      { header: 'Step Expected', key: 'stepExpected', width: 50 },
      { header: 'Area Path', key: 'areaPath', width: 30 },
      { header: 'Iteration Path', key: 'iterationPath', width: 30 },
      { header: 'Assigned To', key: 'assignedTo', width: 25 },
      { header: 'State', key: 'state', width: 12 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'User Story', key: 'userStory', width: 40 },
    ];

    // Style the header row
    const headerRow = testSheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add test case rows
    for (const result of results) {
      for (const tc of result.testCases) {
        for (let i = 0; i < tc.steps.length; i++) {
          const step = tc.steps[i];
          if (i === 0) {
            // First step row includes the test case info
            const storyLabel = tc.userStoryId
              ? `#${tc.userStoryId} - ${storyTitleMap.get(tc.userStoryId) || ''}`
              : '';
            testSheet.addRow({
              id: '',
              workItemType: 'Test Case',
              title: tc.title,
              stepAction: step.action,
              stepExpected: step.expectedResult,
              areaPath: tc.areaPath || projectName,
              iterationPath: featureIterationMap.get(tc.featureId) || projectName,
              assignedTo: assignedTo || '',
              state: 'Design',
              priority: tc.priority,
              userStory: storyLabel,
            });
          } else {
            // Subsequent steps only have step data
            testSheet.addRow({
              id: '',
              workItemType: '',
              title: '',
              stepAction: step.action,
              stepExpected: step.expectedResult,
              areaPath: '',
              state: '',
              priority: '',
            });
          }
        }
      }
    }

    // Summary worksheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Feature ID', key: 'featureId', width: 12 },
      { header: 'Feature Title', key: 'featureTitle', width: 50 },
      { header: 'Criteria Count', key: 'criteriaCount', width: 15 },
      { header: 'Test Cases', key: 'testCaseCount', width: 15 },
      { header: 'Total Steps', key: 'totalSteps', width: 15 },
      { header: 'Positive Tests', key: 'positiveTests', width: 15 },
      { header: 'Negative Tests', key: 'negativeTests', width: 15 },
      { header: 'Boundary Tests', key: 'boundaryTests', width: 15 },
    ];

    const summaryHeader = summarySheet.getRow(1);
    summaryHeader.font = { bold: true };
    summaryHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const result of results) {
      const criteriaCount = Object.values(result.criteria.categories).reduce(
        (sum, arr) => sum + arr.length, 0
      );
      summarySheet.addRow({
        featureId: result.featureId,
        featureTitle: result.featureTitle,
        criteriaCount,
        testCaseCount: result.testCases.length,
        totalSteps: result.testCases.reduce((sum, tc) => sum + tc.steps.length, 0),
        positiveTests: result.testCases.filter((tc) => tc.testType === 'positive').length,
        negativeTests: result.testCases.filter((tc) => tc.testType === 'negative').length,
        boundaryTests: result.testCases.filter((tc) => tc.testType === 'boundary').length,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
