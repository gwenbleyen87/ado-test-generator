import React, { useState } from 'react';
import type { GenerationResult } from '../../../../shared/types.js';

interface Props {
  results: GenerationResult[];
}

export default function TestCasePreview({ results }: Props) {
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  const toggleTest = (key: string) => {
    const next = new Set(expandedTests);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedTests(next);
  };

  const totalTests = results.reduce((sum, r) => sum + r.testCases.length, 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Generated Test Cases</h2>
      <p style={styles.subtitle}>
        {totalTests} test cases across {results.length} feature(s). Click to expand steps.
      </p>

      {results.map((result) => (
        <div key={result.featureId} style={styles.featureGroup}>
          <h3 style={styles.featureTitle}>
            #{result.featureId} - {result.featureTitle}
            <span style={styles.count}>{result.testCases.length} tests</span>
          </h3>

          {result.testCases.map((tc, idx) => {
            const key = `${result.featureId}-${idx}`;
            const isExpanded = expandedTests.has(key);

            return (
              <div key={key} style={styles.testCard}>
                <div
                  style={styles.testHeader}
                  onClick={() => toggleTest(key)}
                >
                  <span style={styles.testTitle}>
                    {isExpanded ? '\u25BC' : '\u25B6'} {tc.title}
                  </span>
                  <div style={styles.badges}>
                    <span style={{
                      ...styles.typeBadge,
                      backgroundColor: tc.testType === 'positive' ? '#e8f5e9'
                        : tc.testType === 'negative' ? '#ffebee' : '#fff3e0',
                      color: tc.testType === 'positive' ? '#2e7d32'
                        : tc.testType === 'negative' ? '#c62828' : '#e65100',
                    }}>
                      {tc.testType}
                    </span>
                    <span style={styles.priorityBadge}>P{tc.priority}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={styles.steps}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>#</th>
                          <th style={styles.th}>Action</th>
                          <th style={styles.th}>Expected Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tc.steps.map((step) => (
                          <tr key={step.stepNumber}>
                            <td style={styles.tdNum}>{step.stepNumber}</td>
                            <td style={styles.td}>{step.action}</td>
                            <td style={styles.td}>{step.expectedResult}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto' },
  heading: { fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  featureGroup: { marginBottom: 24 },
  featureTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1a1a2e',
    borderBottom: '2px solid #0078d4',
    paddingBottom: 6,
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: { fontSize: 12, fontWeight: 400, color: '#888' },
  testCard: {
    border: '1px solid #e0e0e0',
    borderRadius: 6,
    marginBottom: 4,
    overflow: 'hidden',
  },
  testHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
  },
  testTitle: { fontSize: 13, fontWeight: 500, flex: 1 },
  badges: { display: 'flex', gap: 6 },
  typeBadge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 12,
    fontWeight: 500,
  },
  priorityBadge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    fontWeight: 500,
  },
  steps: { padding: '8px 12px', borderTop: '1px solid #eee' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left',
    padding: '6px 8px',
    borderBottom: '1px solid #ddd',
    fontWeight: 600,
    fontSize: 12,
    color: '#555',
  },
  td: { padding: '6px 8px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' },
  tdNum: {
    padding: '6px 8px',
    borderBottom: '1px solid #f0f0f0',
    textAlign: 'center',
    width: 30,
    color: '#888',
  },
};
