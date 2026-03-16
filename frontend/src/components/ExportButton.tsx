import React, { useEffect, useState } from 'react';
import type { DevOpsConfig, DevOpsUser, Feature, GenerationResult } from '../../../../shared/types.js';
import { exportExcel, getUsers } from '../api/client.js';

interface Props {
  results: GenerationResult[];
  features: Feature[];
  projectName: string;
  devops: DevOpsConfig;
}

export default function ExportButton({ results, features, projectName, devops }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<DevOpsUser[]>([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    getUsers(devops)
      .then((data) => {
        setUsers(data);
        setLoadingUsers(false);
      })
      .catch(() => {
        setLoadingUsers(false);
      });
  }, [devops]);

  const handleExport = async () => {
    setLoading(true);
    setError('');

    try {
      const blob = await exportExcel({ results, features, projectName, assignedTo: assignedTo || undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-cases-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const totalTests = results.reduce((sum, r) => sum + r.testCases.length, 0);

  return (
    <div style={styles.container}>
      <div style={styles.fieldGroup}>
        <label style={styles.label}>Assigned To</label>
        {loadingUsers ? (
          <div style={styles.hint}>Loading users...</div>
        ) : users.length > 0 ? (
          <select
            style={styles.select}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">-- Unassigned --</option>
            {users.map((u) => (
              <option key={u.id} value={u.uniqueName}>
                {u.displayName}
              </option>
            ))}
          </select>
        ) : (
          <input
            style={styles.select}
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="Enter name or email"
          />
        )}
      </div>

      <button
        style={styles.button}
        disabled={loading || results.length === 0}
        onClick={handleExport}
      >
        {loading ? 'Generating Excel...' : `Download Excel (${totalTests} test cases)`}
      </button>
      {error && <div style={styles.error}>{error}</div>}
      <p style={styles.hint}>
        The exported file is formatted for Azure Test Plans import.
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 500, margin: '16px auto', textAlign: 'center' },
  fieldGroup: { marginBottom: 16, textAlign: 'left' },
  label: { display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500, color: '#333' },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box' as const,
  },
  button: {
    padding: '12px 32px',
    backgroundColor: '#107c10',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    marginTop: 12,
    backgroundColor: '#fde8e8',
    color: '#c62828',
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 14,
  },
  hint: { marginTop: 8, fontSize: 12, color: '#888' },
};
