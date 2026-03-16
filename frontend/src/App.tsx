import React, { useState } from 'react';
import type { DevOpsConfig, Feature, GenerationResult, OpenAIConfig } from '../../../shared/types.js';
import ConnectionForm from './components/ConnectionForm.js';
import PISelector from './components/PISelector.js';
import FeatureList from './components/FeatureList.js';
import AgentProgress from './components/AgentProgress.js';
import TestCasePreview from './components/TestCasePreview.js';
import ExportButton from './components/ExportButton.js';

type Step = 'connect' | 'select-pi' | 'review-features' | 'generate' | 'preview';

const STEP_LABELS: Record<Step, string> = {
  connect: '1. Connect',
  'select-pi': '2. Select PI',
  'review-features': '3. Review Features',
  generate: '4. Generate',
  preview: '5. Preview & Export',
};

const STEPS: Step[] = ['connect', 'select-pi', 'review-features', 'generate', 'preview'];

export default function App() {
  const [step, setStep] = useState<Step>('connect');
  const [devops, setDevops] = useState<DevOpsConfig | null>(null);
  const [openai, setOpenai] = useState<OpenAIConfig | null>(null);
  const [projectName, setProjectName] = useState('');
  const [iterationPath, setIterationPath] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([]);
  const [results, setResults] = useState<GenerationResult[]>([]);

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Azure DevOps AI Test Plan Generator</h1>
      </header>

      <nav style={styles.stepper}>
        {STEPS.map((s, i) => (
          <div
            key={s}
            style={{
              ...styles.stepItem,
              ...(i <= currentStepIndex ? styles.stepActive : {}),
              ...(i === currentStepIndex ? styles.stepCurrent : {}),
            }}
          >
            {STEP_LABELS[s]}
          </div>
        ))}
      </nav>

      <main style={styles.main}>
        {step === 'connect' && (
          <ConnectionForm
            onConnected={(d, o, name) => {
              setDevops(d);
              setOpenai(o);
              setProjectName(name);
              setStep('select-pi');
            }}
          />
        )}

        {step === 'select-pi' && devops && (
          <PISelector
            devops={devops}
            onSelect={(path) => {
              setIterationPath(path);
              setStep('review-features');
            }}
          />
        )}

        {step === 'review-features' && devops && (
          <FeatureList
            devops={devops}
            iterationPath={iterationPath}
            onSubmit={(features) => {
              setSelectedFeatures(features);
              setStep('generate');
            }}
          />
        )}

        {step === 'generate' && devops && openai && (
          <AgentProgress
            devops={devops}
            openai={openai}
            features={selectedFeatures}
            onComplete={(r) => {
              setResults(r);
              setStep('preview');
            }}
          />
        )}

        {step === 'preview' && (
          <div>
            <TestCasePreview results={results} />
            <ExportButton results={results} features={selectedFeatures} projectName={projectName} devops={devops!} />
          </div>
        )}
      </main>

      {currentStepIndex > 0 && step !== 'generate' && (
        <div style={styles.backBar}>
          <button
            style={styles.backButton}
            onClick={() => setStep(STEPS[currentStepIndex - 1])}
          >
            &larr; Back
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#0078d4',
    color: '#fff',
    padding: '16px 24px',
  },
  title: { fontSize: 20, fontWeight: 600, margin: 0 },
  stepper: {
    display: 'flex',
    justifyContent: 'center',
    gap: 0,
    padding: '12px 24px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  stepItem: {
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    color: '#aaa',
    borderBottom: '3px solid transparent',
  },
  stepActive: { color: '#333' },
  stepCurrent: { borderBottomColor: '#0078d4', color: '#0078d4', fontWeight: 600 },
  main: { padding: '24px 24px 80px' },
  backBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px 24px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
  },
  backButton: {
    padding: '8px 20px',
    backgroundColor: 'transparent',
    color: '#0078d4',
    border: '1px solid #0078d4',
    borderRadius: 6,
    fontSize: 14,
    cursor: 'pointer',
  },
};
