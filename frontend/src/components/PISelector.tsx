import React, { useEffect, useState } from 'react';
import type { DevOpsConfig, Iteration } from '../../../../shared/types.js';
import { getIterations } from '../api/client.js';

interface Props {
  devops: DevOpsConfig;
  onSelect: (iterationPath: string) => void;
}

export default function PISelector({ devops, onSelect }: Props) {
  const [iterations, setIterations] = useState<Iteration[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getIterations(devops)
      .then((data) => {
        setIterations(data);
        const findCurrent = (items: Iteration[]): string | null => {
          for (const item of items) {
            if (item.attributes?.startDate && item.attributes?.finishDate) {
              const now = new Date();
              if (new Date(item.attributes.startDate) <= now && now <= new Date(item.attributes.finishDate)) {
                return item.path;
              }
            }
            if (item.children) {
              const found = findCurrent(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        const currentPath = findCurrent(data);
        if (currentPath) setSelected(currentPath);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [devops]);

  const isCurrent = (item: Iteration): boolean => {
    if (!item.attributes?.startDate || !item.attributes?.finishDate) return false;
    const now = new Date();
    return new Date(item.attributes.startDate) <= now && now <= new Date(item.attributes.finishDate);
  };

  const flattenOptions = (items: Iteration[], depth = 0): { path: string; label: string; current: boolean }[] => {
    const result: { path: string; label: string; current: boolean }[] = [];
    for (const item of items) {
      const indent = '\u00A0\u00A0'.repeat(depth);
      const current = isCurrent(item);
      const marker = current ? ' (Current)' : '';
      result.push({ path: item.path, label: `${indent}${item.name}${marker}`, current });
      if (item.children) {
        result.push(...flattenOptions(item.children, depth + 1));
      }
    }
    return result;
  };

  const options = flattenOptions(iterations);

  if (loading) return <div style={styles.loading}>Loading iterations...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Select Program Increment</h2>
      <p style={styles.subtitle}>Choose the iteration/PI to fetch features from.</p>

      <select
        style={styles.select}
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">-- Select an iteration --</option>
        {options.map((opt) => (
          <option key={opt.path} value={opt.path}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        style={styles.button}
        disabled={!selected}
        onClick={() => onSelect(selected)}
      >
        Load Features
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 500, margin: '0 auto' },
  heading: { fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1a1a2e' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    padding: '10px 20px',
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
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
