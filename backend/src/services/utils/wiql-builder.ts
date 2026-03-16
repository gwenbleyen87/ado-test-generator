export function buildFeaturesQuery(iterationPath: string): string {
  return `
    SELECT [System.Id]
    FROM WorkItems
    WHERE [System.WorkItemType] = 'Feature'
      AND [System.IterationPath] UNDER '${iterationPath}'
      AND [System.State] <> 'Removed'
    ORDER BY [System.Id] ASC
  `.trim();
}

export function buildWorkItemsByIdsQuery(ids: number[]): string {
  const idList = ids.join(', ');
  return `
    SELECT [System.Id]
    FROM WorkItems
    WHERE [System.Id] IN (${idList})
    ORDER BY [System.Id] ASC
  `.trim();
}
