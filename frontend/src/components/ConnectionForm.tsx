import React, { useState } from 'react';
import type { DevOpsConfig, DevOpsProject, OpenAIConfig } from '../../../../shared/types.js';
import { getProjects } from '../api/client.js';

interface Props {
  onConnected: (devops: DevOpsConfig, openai: OpenAIConfig, projectName: string) => void;
}

export default function ConnectionForm({ onConnected }: Props) {
  const [pat, setPat] = useState('');
  const [organization, setOrganization] = useState('');
  const [projects, setProjects] = useState<DevOpsProject[] | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [openaiEndpoint, setOpenaiEndpoint] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [model, setModel] = useState('gpt-5-mini');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchProjects = async () => {
    setLoading(true);
    setError('');
    setProjects(null);
    setSelectedProject('');

    try {
      const result = await getProjects({ pat, organization });
      if (result.length === 0) {
        setError('No projects found in this organization.');
      } else {
        setProjects(result);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects. Check your PAT and organization name.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      setError('Please select a project.');
      return;
    }
    const projectObj = projects?.find((p) => p.name === selectedProject);
    onConnected(
      { pat, organization, project: selectedProject },
      { endpoint: openaiEndpoint, apiKey: openaiKey, model },
      projectObj?.name || selectedProject
    );
  };

  const orgReady = pat.length > 0 && organization.length > 0;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.heading}>Azure DevOps Connection</h2>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Organization</label>
        <input
          style={styles.input}
          value={organization}
          onChange={(e) => { setOrganization(e.target.value); setProjects(null); setSelectedProject(''); }}
          placeholder="your-org"
          required
        />
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>Personal Access Token (PAT)</label>
        <input
          style={styles.input}
          type="password"
          value={pat}
          onChange={(e) => { setPat(e.target.value); setProjects(null); setSelectedProject(''); }}
          placeholder="Enter your PAT"
          required
        />
      </div>

      {!projects && (
        <button
          type="button"
          style={{ ...styles.button, opacity: orgReady ? 1 : 0.5 }}
          disabled={!orgReady || loading}
          onClick={handleFetchProjects}
        >
          {loading ? 'Loading projects...' : 'Load Projects'}
        </button>
      )}

      {projects && projects.length > 0 && (
        <>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Project</label>
            <select
              style={styles.input}
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
            >
              <option value="">-- Select a project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {projects.length > 10 && (
              <div style={styles.hint}>{projects.length} projects available</div>
            )}
          </div>

          <h2 style={{ ...styles.heading, marginTop: 24 }}>Azure OpenAI Configuration</h2>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Endpoint URL</label>
            <input
              style={styles.input}
              value={openaiEndpoint}
              onChange={(e) => setOpenaiEndpoint(e.target.value)}
              placeholder="https://your-resource.openai.azure.com/"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>API Key</label>
            <input
              style={styles.input}
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your API key"
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Deployment Name</label>
            <select
              style={styles.input}
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="gpt-5-mini">gpt-5-mini</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ ...styles.button, opacity: selectedProject && openaiEndpoint && openaiKey ? 1 : 0.5 }}
            disabled={!selectedProject || !openaiEndpoint || !openaiKey}
          >
            Connect & Continue
          </button>
        </>
      )}

      {error && <div style={styles.error}>{error}</div>}
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { maxWidth: 500, margin: '0 auto' },
  heading: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1a1a2e' },
  fieldGroup: { marginBottom: 12 },
  label: { display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500, color: '#333' },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box',
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
    marginTop: 8,
  },
  error: {
    backgroundColor: '#fde8e8',
    color: '#c62828',
    padding: '8px 12px',
    borderRadius: 6,
    marginTop: 12,
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
};
