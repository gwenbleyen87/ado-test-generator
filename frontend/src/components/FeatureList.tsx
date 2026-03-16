import React, { useEffect, useState } from 'react';
import type { DevOpsConfig, Feature } from '../../../../shared/types.js';
import { getFeatures } from '../api/client.js';

interface Props {
  devops: DevOpsConfig;
  iterationPath: string;
  onSubmit: (features: Feature[]) => void;
}

export default function FeatureList({ devops, iterationPath, onSubmit }: Props) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getFeatures({ ...devops, iterationPath })
      .then((data) => {
        setFeatures(data);
        setSelected(new Set(data.map((f) => f.id)));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [devops, iterationPath]);

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleExpand = (id: number) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const toggleAll = () => {
    if (selected.size === features.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(features.map((f) => f.id)));
    }
  };

  if (loading) return <div style={styles.loading}>Loading features...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (features.length === 0) return <div style={styles.loading}>No features found for this iteration.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Features & User Stories</h2>
        <label style={styles.selectAll}>
          <input
            type="checkbox"
            checked={selected.size === features.length}
            onChange={toggleAll}
          />
          Select All ({features.length})
        </label>
      </div>

      {features.map((feature) => (
        <div key={feature.id} style={styles.card}>
          <div style={styles.cardHeader}>
            <input
              type="checkbox"
              checked={selected.has(feature.id)}
              onChange={() => toggleSelect(feature.id)}
            />
            <span
              style={styles.featureTitle}
              onClick={() => toggleExpand(feature.id)}
            >
              {expanded.has(feature.id) ? '\u25BC' : '\u25B6'}{' '}
              #{feature.id} - {feature.title}
            </span>
            <span style={styles.badge}>{feature.state}</span>
            <span style={styles.storyCount}>
              {feature.userStories.length} stories
            </span>
          </div>

          {expanded.has(feature.id) && (
            <div style={styles.details}>
              {feature.description && (
                <div style={styles.section}>
                  <strong>Description:</strong>
                  <p style={styles.text}>{feature.description}</p>
                </div>
              )}
              {feature.acceptanceCriteria && (
                <div style={styles.section}>
                  <strong>Acceptance Criteria:</strong>
                  <p style={styles.text}>{feature.acceptanceCriteria}</p>
                </div>
              )}
              {feature.userStories.length > 0 && (
                <div style={styles.section}>
                  <strong>User Stories:</strong>
                  {feature.userStories.map((story) => (
                    <div key={story.id} style={styles.storyCard}>
                      <div style={styles.storyTitle}>
                        #{story.id} - {story.title}
                        <span style={styles.badge}>{story.state}</span>
                      </div>
                      {story.acceptanceCriteria && (
                        <p style={styles.text}>{story.acceptanceCriteria}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        style={styles.button}
        disabled={selected.size === 0}
        onClick={() => onSubmit(features.filter((f) => selected.has(f.id)))}
      >
        Generate Test Cases ({selected.size} features)
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: 600, color: '#1a1a2e' },
  selectAll: { fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
  card: {
    border: '1px solid #ddd',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
  },
  featureTitle: { flex: 1, fontWeight: 500, fontSize: 14 },
  badge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
    fontWeight: 500,
  },
  storyCount: { fontSize: 12, color: '#888' },
  details: { padding: '12px 16px', borderTop: '1px solid #eee' },
  section: { marginBottom: 12 },
  text: { fontSize: 13, color: '#555', margin: '4px 0', lineHeight: 1.5 },
  storyCard: {
    marginLeft: 12,
    marginTop: 8,
    padding: '8px 12px',
    borderLeft: '3px solid #0078d4',
    backgroundColor: '#fafafa',
  },
  storyTitle: { fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 },
  button: {
    width: '100%',
    padding: '12px 20px',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 16,
  },
  loading: { textAlign: 'center', color: '#666', padding: 40 },
  error: {
    backgroundColor: '#fde8e8',
    color: '#c62828',
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 14,
  },
};
