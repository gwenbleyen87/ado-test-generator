import React, { useEffect, useRef, useState } from 'react';
import type { DevOpsConfig, Feature, GenerationResult, OpenAIConfig, SSEEvent } from '../../../../shared/types.js';
import { generateTestCases } from '../api/client.js';

interface Props {
  devops: DevOpsConfig;
  openai: OpenAIConfig;
  features: Feature[];
  onComplete: (results: GenerationResult[]) => void;
}

interface AgentStatus {
  analyzer: 'pending' | 'running' | 'done';
  generator: 'pending' | 'running' | 'done';
  reviewer: 'pending' | 'running' | 'done';
}

interface FeatureProgress {
  featureId: number;
  featureTitle: string;
  agents: AgentStatus;
  message: string;
  done: boolean;
  error?: string;
}

export default function AgentProgress({ devops, openai, features, onComplete }: Props) {
  const [progress, setProgress] = useState<FeatureProgress[]>(
    features.map((f) => ({
      featureId: f.id,
      featureTitle: f.title,
      agents: { analyzer: 'pending', generator: 'pending', reviewer: 'pending' },
      message: 'Waiting...',
      done: false,
    }))
  );
  const [overallMessage, setOverallMessage] = useState('Starting pipeline...');
  const [completed, setCompleted] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const handleEvent = (event: SSEEvent) => {
      if (event.type === 'pipeline:start') {
        setOverallMessage(event.message);
        return;
      }

      if (event.type === 'pipeline:complete') {
        setOverallMessage('All features processed!');
        setCompleted(true);
        return;
      }

      if (event.type === 'error') {
        setProgress((prev) =>
          prev.map((p) =>
            p.featureId === event.featureId
              ? { ...p, error: event.message, done: true }
              : p
          )
        );
        return;
      }

      setProgress((prev) =>
        prev.map((p) => {
          if (p.featureId !== event.featureId) return p;

          const updated = { ...p, message: event.message };

          if (event.type === 'agent:start' && event.agent) {
            updated.agents = { ...p.agents, [event.agent]: 'running' };
          }
          if (event.type === 'agent:complete' && event.agent) {
            updated.agents = { ...p.agents, [event.agent]: 'done' };
          }
          if (event.type === 'feature:complete') {
            updated.done = true;
          }

          return updated;
        })
      );

      if (event.progress) {
        setOverallMessage(
          `Processing feature ${event.progress.currentFeature} of ${event.progress.totalFeatures}`
        );
      }
    };

    generateTestCases({ devops, openai, features }, handleEvent)
      .then((results) => {
        onComplete(results);
      })
      .catch((err) => {
        setOverallMessage(`Error: ${err.message}`);
      });
  }, []);

  const agentLabel = (status: 'pending' | 'running' | 'done') => {
    if (status === 'done') return '\u2705';
    if (status === 'running') return '\u23F3';
    return '\u23F8';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Generating Test Cases</h2>
      <p style={styles.overall}>{overallMessage}</p>

      {progress.map((p) => (
        <div key={p.featureId} style={{ ...styles.card, ...(p.error ? styles.cardError : {}) }}>
          <div style={styles.cardTitle}>
            #{p.featureId} - {p.featureTitle}
            {p.done && !p.error && <span style={styles.doneBadge}>Done</span>}
            {p.error && <span style={styles.errorBadge}>Error</span>}
          </div>

          <div style={styles.agents}>
            <span style={styles.agentItem}>
              {agentLabel(p.agents.analyzer)} Analyzer
            </span>
            <span style={styles.arrow}>&rarr;</span>
            <span style={styles.agentItem}>
              {agentLabel(p.agents.generator)} Generator
            </span>
            <span style={styles.arrow}>&rarr;</span>
            <span style={styles.agentItem}>
              {agentLabel(p.agents.reviewer)} Reviewer
            </span>
          </div>

          <div style={styles.message}>{p.error || p.message}</div>
        </div>
      ))}

      {completed && (
        <div style={styles.completeMessage}>
          All features have been processed. Proceed to review.
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto' },
  heading: { fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1a1a2e' },
  overall: { fontSize: 14, color: '#555', marginBottom: 16 },
  card: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: 8,
  },
  cardError: { borderColor: '#e57373', backgroundColor: '#fff5f5' },
  cardTitle: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  agents: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  agentItem: { fontSize: 13 },
  arrow: { color: '#999', fontSize: 12 },
  message: { fontSize: 12, color: '#777' },
  doneBadge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    fontWeight: 500,
  },
  errorBadge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 12,
    backgroundColor: '#ffebee',
    color: '#c62828',
    fontWeight: 500,
  },
  completeMessage: {
    marginTop: 16,
    padding: '12px 16px',
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    color: '#2e7d32',
    fontWeight: 500,
    textAlign: 'center',
  },
};
