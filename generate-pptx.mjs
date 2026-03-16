import PptxGenJS from 'pptxgenjs';

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5

// ── Theme ──────────────────────────────────────────────
const C = {
  bg:       '0f172a', // slate-900
  card:     '1e293b', // slate-800
  cardAlt:  '334155', // slate-700
  accent:   '0078d4', // azure blue
  green:    '10b981',
  amber:    'f59e0b',
  purple:   '7c3aed',
  red:      'ef4444',
  white:    'ffffff',
  muted:    '94a3b8', // slate-400
  text:     'e2e8f0', // slate-200
};

const FONT = 'Segoe UI';

// ── Helpers ────────────────────────────────────────────
function addBg(slide) {
  slide.background = { color: C.bg };
}

function addTitle(slide, title, opts = {}) {
  slide.addText(title, {
    x: 0.6, y: 0.3, w: 12, h: 0.6,
    fontSize: 28, fontFace: FONT, bold: true, color: C.white,
    ...opts,
  });
}

function addSubtitle(slide, text, opts = {}) {
  slide.addText(text, {
    x: 0.6, y: 0.9, w: 12, h: 0.4,
    fontSize: 14, fontFace: FONT, color: C.muted,
    ...opts,
  });
}

function card(slide, { x, y, w, h, fill }) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: fill || C.card },
    rectRadius: 0.1,
    shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.3 },
  });
}

function badge(slide, { x, y, w, text, color }) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: w || 1.2, h: 0.32,
    fill: { color },
    rectRadius: 0.16,
  });
  slide.addText(text, {
    x, y, w: w || 1.2, h: 0.32,
    fontSize: 11, fontFace: FONT, bold: true, color: C.white, align: 'center', valign: 'middle',
  });
}

// ── Slide 1 — Title ────────────────────────────────────
{
  const s = pptx.addSlide();
  addBg(s);

  s.addText('ADO Test Generator', {
    x: 0.6, y: 1.8, w: 12, h: 1,
    fontSize: 44, fontFace: FONT, bold: true, color: C.white,
  });

  s.addText('AI-Powered Test Case Generation for Azure DevOps', {
    x: 0.6, y: 2.8, w: 10, h: 0.5,
    fontSize: 20, fontFace: FONT, color: C.accent,
  });

  s.addText(
    'Connects to Azure DevOps, retrieves Features & User Stories, uses Azure OpenAI\nto generate test cases, and exports to Excel for import into Azure Test Plans.',
    {
      x: 0.6, y: 3.5, w: 10, h: 0.9,
      fontSize: 14, fontFace: FONT, color: C.muted, lineSpacingMultiple: 1.3,
    }
  );

  const techBadges = ['React', 'Express', 'TypeScript', 'Azure OpenAI', 'Azure DevOps', 'ExcelJS'];
  techBadges.forEach((t, i) => {
    badge(s, { x: 0.6 + i * 1.7, y: 4.8, w: 1.5, text: t, color: C.cardAlt });
  });
}

// ── Slide 2 — Creating a PAT ─────────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Creating an Azure DevOps PAT');
  addSubtitle(s, 'Personal Access Token — required for reading work items from Azure DevOps');

  const steps = [
    { num: '1', text: 'Sign in to your Azure DevOps organization\n(dev.azure.com/{your-org})' },
    { num: '2', text: 'Click the User settings icon (top-right)\nand select Personal access tokens' },
    { num: '3', text: 'Click + New Token, give it a name\nand set an expiration date' },
    { num: '4', text: 'Under Scopes select Custom defined,\nthen grant Work Items → Read\nand Project and Team → Read' },
    { num: '5', text: 'Click Create and copy the token\nimmediately — it won\'t be shown again' },
  ];

  steps.forEach((st, i) => {
    const x = 0.3 + i * 2.55;
    card(s, { x, y: 1.5, w: 2.3, h: 3.8, fill: C.card });

    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.8, y: 1.7, w: 0.7, h: 0.7,
      fill: { color: C.accent },
    });
    s.addText(st.num, {
      x: x + 0.8, y: 1.7, w: 0.7, h: 0.7,
      fontSize: 22, fontFace: FONT, bold: true, color: C.white, align: 'center', valign: 'middle',
    });

    s.addText(st.text, {
      x: x + 0.15, y: 2.6, w: 2.0, h: 2.2,
      fontSize: 11, fontFace: FONT, color: C.text, align: 'center', lineSpacingMultiple: 1.3,
    });
  });
}

// ── Slide 3 — Creating an Azure OpenAI Instance ──────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Creating an Azure OpenAI Instance');
  addSubtitle(s, 'Deploy an OpenAI model on Azure to power test case generation');

  // Left card: Create the resource
  card(s, { x: 0.5, y: 1.6, w: 5.9, h: 5.0, fill: C.card });
  s.addText('Create the Resource', {
    x: 0.8, y: 1.8, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.accent,
  });

  const createSteps = [
    'Sign in to the Azure Portal (portal.azure.com)',
    'Click + Create a resource, search for Azure OpenAI',
    'Select your Subscription and Resource Group',
    'Choose a Region where Azure OpenAI is available\n(e.g., Sweden Central, East US)',
    'Enter a unique Name for the resource',
    'Select Standard S0 pricing tier',
    'Click Review + create, then Create',
  ];
  createSteps.forEach((step, i) => {
    s.addText(`${i + 1}.  ${step}`, {
      x: 0.8, y: 2.5 + i * 0.6, w: 5.4, h: 0.55,
      fontSize: 11, fontFace: FONT, color: C.text, valign: 'top', lineSpacingMultiple: 1.2,
    });
  });

  // Right card: Deploy a model
  card(s, { x: 6.9, y: 1.6, w: 5.9, h: 5.0, fill: C.card });
  s.addText('Deploy a Model', {
    x: 7.2, y: 1.8, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.green,
  });

  const deploySteps = [
    'Open Azure AI Foundry from the resource overview',
    'Navigate to Deployments',
    'Click + Deploy model → Deploy base model',
    'Select a model (e.g., gpt-4o, gpt-4o-mini)',
    'Set a Deployment name — this is what\nyou enter in the app\'s config',
    'Click Deploy and wait for completion',
  ];
  deploySteps.forEach((step, i) => {
    s.addText(`${i + 1}.  ${step}`, {
      x: 7.2, y: 2.5 + i * 0.6, w: 5.3, h: 0.55,
      fontSize: 11, fontFace: FONT, color: C.text, valign: 'top', lineSpacingMultiple: 1.2,
    });
  });
}

// ── Slide 4 — Retrieving Endpoint & API Key ──────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Retrieving the Endpoint & API Key');
  addSubtitle(s, 'Get the credentials needed to connect the app to your Azure OpenAI instance');

  // Steps card
  card(s, { x: 0.5, y: 1.6, w: 7.5, h: 4.5, fill: C.card });
  s.addText('Steps', {
    x: 0.8, y: 1.8, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.accent,
  });

  const keySteps = [
    'In the Azure Portal, navigate to your Azure OpenAI resource',
    'In the left menu, click Keys and Endpoint\n(under Resource Management)',
    'Copy the Endpoint URL\n(e.g., https://my-instance.openai.azure.com/)',
    'Click Show next to KEY 1 or KEY 2 and copy the value',
  ];
  keySteps.forEach((step, i) => {
    s.addText(`${i + 1}.  ${step}`, {
      x: 0.8, y: 2.5 + i * 0.8, w: 6.8, h: 0.75,
      fontSize: 13, fontFace: FONT, color: C.text, valign: 'top', lineSpacingMultiple: 1.2,
    });
  });

  // Config mapping card
  card(s, { x: 8.4, y: 1.6, w: 4.5, h: 4.5, fill: C.card });
  s.addText('Enter in the App', {
    x: 8.7, y: 1.8, w: 4, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.green,
  });

  const fields = [
    { label: 'Endpoint URL', value: 'Keys and Endpoint → Endpoint', color: C.accent },
    { label: 'API Key', value: 'Keys and Endpoint → KEY 1', color: C.amber },
    { label: 'Deployment Name', value: 'Deployments → Model name', color: C.green },
  ];
  fields.forEach((f, i) => {
    s.addText(f.label, {
      x: 8.7, y: 2.5 + i * 1.0, w: 4, h: 0.35,
      fontSize: 14, fontFace: FONT, bold: true, color: f.color,
    });
    s.addText(f.value, {
      x: 8.7, y: 2.85 + i * 1.0, w: 4, h: 0.35,
      fontSize: 12, fontFace: FONT, color: C.muted,
    });
  });
}

// ── Slide 5 — Why This Tool? ───────────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Why This Tool?');

  // Problem card
  card(s, { x: 0.5, y: 1.4, w: 5.9, h: 4.5, fill: C.card });
  s.addText('The Problem', {
    x: 0.8, y: 1.6, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.red,
  });
  const problems = [
    'Writing test cases manually is time-consuming',
    'Acceptance criteria often get lost between features and test plans',
    'Inconsistent test coverage across user stories',
    'Manual Excel formatting for Azure Test Plans import is error-prone',
  ];
  problems.forEach((p, i) => {
    s.addText(`✖  ${p}`, {
      x: 0.8, y: 2.3 + i * 0.65, w: 5.4, h: 0.5,
      fontSize: 13, fontFace: FONT, color: C.text, valign: 'top',
    });
  });

  // Solution card
  card(s, { x: 6.9, y: 1.4, w: 5.9, h: 4.5, fill: C.card });
  s.addText('The Solution', {
    x: 7.2, y: 1.6, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.green,
  });
  const solutions = [
    'AI generates test cases in seconds from acceptance criteria',
    'Directly reads Features & Stories from Azure DevOps',
    '3-agent AI pipeline ensures thorough, reviewed test coverage',
    'One-click Excel export formatted for Azure Test Plans',
  ];
  solutions.forEach((p, i) => {
    s.addText(`✔  ${p}`, {
      x: 7.2, y: 2.3 + i * 0.65, w: 5.4, h: 0.5,
      fontSize: 13, fontFace: FONT, color: C.text, valign: 'top',
    });
  });
}

// ── Slide 3 — Architecture Overview ────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Architecture Overview');

  const columns = [
    {
      title: 'Frontend', subtitle: 'React + Vite', color: C.accent,
      items: ['5-step wizard UI', 'Real-time SSE progress', 'Deployment selector', 'Test case preview'],
    },
    {
      title: 'Backend', subtitle: 'Express + TypeScript', color: C.green,
      items: ['REST API endpoints', '3-agent AI pipeline', 'DevOps API client', 'Excel export service'],
    },
    {
      title: 'External Services', subtitle: 'APIs', color: C.purple,
      items: ['Azure DevOps REST API v7.1', 'Azure OpenAI Chat API', 'PAT authentication', 'SSE streaming'],
    },
  ];

  columns.forEach((col, ci) => {
    const x = 0.5 + ci * 4.2;
    card(s, { x, y: 1.4, w: 3.8, h: 4.8, fill: C.card });
    badge(s, { x: x + 0.2, y: 1.6, w: 1.6, text: col.title, color: col.color });
    s.addText(col.subtitle, {
      x: x + 0.2, y: 2.1, w: 3.4, h: 0.3,
      fontSize: 12, fontFace: FONT, color: C.muted, italic: true,
    });
    col.items.forEach((item, ii) => {
      s.addText(`•  ${item}`, {
        x: x + 0.3, y: 2.6 + ii * 0.55, w: 3.2, h: 0.4,
        fontSize: 13, fontFace: FONT, color: C.text,
      });
    });

    // Arrow between columns
    if (ci < 2) {
      s.addText('➡', {
        x: x + 3.8, y: 3.4, w: 0.4, h: 0.5,
        fontSize: 22, fontFace: FONT, color: C.muted, align: 'center',
      });
    }
  });
}

// ── Slide 4 — 5-Step Wizard Flow ───────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, '5-Step Wizard Flow');

  const steps = [
    { num: '1', title: 'Connect', desc: 'Enter Azure DevOps org, PAT,\nselect project, provide\nAzure OpenAI endpoint & key', color: C.accent },
    { num: '2', title: 'Select PI', desc: 'Choose a Program Increment\n(iteration path) to scope\nwork items', color: C.accent },
    { num: '3', title: 'Review', desc: 'Browse Features & linked\nUser Stories, select items\nto generate tests for', color: C.accent },
    { num: '4', title: 'Generate', desc: 'AI generates test cases\nwith real-time streaming\nprogress via SSE', color: C.green },
    { num: '5', title: 'Export', desc: 'Preview test cases and\nexport as .xlsx for\nAzure Test Plans', color: C.purple },
  ];

  steps.forEach((st, i) => {
    const x = 0.3 + i * 2.55;
    card(s, { x, y: 1.5, w: 2.3, h: 4.2, fill: C.card });

    // Number circle
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.8, y: 1.7, w: 0.7, h: 0.7,
      fill: { color: st.color },
    });
    s.addText(st.num, {
      x: x + 0.8, y: 1.7, w: 0.7, h: 0.7,
      fontSize: 22, fontFace: FONT, bold: true, color: C.white, align: 'center', valign: 'middle',
    });

    s.addText(st.title, {
      x: x + 0.1, y: 2.6, w: 2.1, h: 0.4,
      fontSize: 16, fontFace: FONT, bold: true, color: C.white, align: 'center',
    });

    s.addText(st.desc, {
      x: x + 0.15, y: 3.1, w: 2.0, h: 1.8,
      fontSize: 11, fontFace: FONT, color: C.muted, align: 'center', lineSpacingMultiple: 1.3,
    });

    // Arrow
    if (i < 4) {
      s.addText('▶', {
        x: x + 2.3, y: 3.2, w: 0.25, h: 0.5,
        fontSize: 14, fontFace: FONT, color: C.muted, align: 'center',
      });
    }
  });
}

// ── Slide 5 — Demo: Connect & Select PI ────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Demo: Connect & Configure');
  addSubtitle(s, 'Step 1: Enter Azure DevOps credentials and Azure OpenAI config  ·  Step 2: Select a Program Increment');

  s.addImage({ path: 'docs/screenshots/02-connect-configured.png', x: 0.3, y: 1.5, w: 6.2, h: 5.0, rounding: true });
  s.addImage({ path: 'docs/screenshots/03-select-pi.png', x: 6.8, y: 1.5, w: 6.2, h: 5.0, rounding: true });

  badge(s, { x: 0.3, y: 6.6, w: 1.8, text: 'Step 1: Connect', color: C.accent });
  badge(s, { x: 6.8, y: 6.6, w: 1.8, text: 'Step 2: Select PI', color: C.accent });
}

// ── Slide 6 — Demo: Review Features & Generate ────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Demo: Review & Generate');
  addSubtitle(s, 'Step 3: Select features to generate tests for  ·  Step 4: AI pipeline processes each feature');

  s.addImage({ path: 'docs/screenshots/04-review-features.png', x: 0.3, y: 1.5, w: 6.2, h: 5.0, rounding: true });
  s.addImage({ path: 'docs/screenshots/05-generate-progress.png', x: 6.8, y: 1.5, w: 6.2, h: 5.0, rounding: true });

  badge(s, { x: 0.3, y: 6.6, w: 2.2, text: 'Step 3: Review Features', color: C.accent });
  badge(s, { x: 6.8, y: 6.6, w: 1.8, text: 'Step 4: Generate', color: C.green });
}

// ── Slide 7 — Demo: Preview & Export ───────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Demo: Preview & Export');
  addSubtitle(s, 'Step 5: Review generated test cases with steps, priorities, and type badges — then export to Excel');

  s.addImage({ path: 'docs/screenshots/06-preview.png', x: 1.65, y: 1.5, w: 10.0, h: 5.5, rounding: true });

  badge(s, { x: 1.65, y: 7.1, w: 2.2, text: 'Step 5: Preview & Export', color: C.purple });
}

// ── Slide 8 — 3-Agent AI Pipeline ──────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, '3-Agent AI Pipeline');
  addSubtitle(s, 'Each feature\'s test cases pass through three specialized AI agents sequentially');

  const agents = [
    {
      num: 'Agent 1', title: 'Analyzer', color: C.accent,
      desc: 'Examines the feature description and its linked user stories to extract and categorize all testable acceptance criteria.',
      input: 'Feature + User Stories',
      output: 'Structured criteria',
    },
    {
      num: 'Agent 2', title: 'Generator', color: C.amber,
      desc: 'Creates detailed test cases with numbered steps, actions, and expected results for each identified criterion.',
      input: 'Structured criteria',
      output: 'Draft test cases',
    },
    {
      num: 'Agent 3', title: 'Reviewer', color: C.green,
      desc: 'Validates test cases for completeness and coverage. Removes redundancy, refines wording, and adds missing edge cases.',
      input: 'Draft test cases',
      output: 'Final test cases',
    },
  ];

  agents.forEach((ag, i) => {
    const x = 0.5 + i * 4.2;
    card(s, { x, y: 1.6, w: 3.8, h: 5, fill: C.card });

    badge(s, { x: x + 0.2, y: 1.8, w: 1.3, text: ag.num, color: C.cardAlt });
    s.addText(ag.title, {
      x: x + 0.2, y: 2.3, w: 3.4, h: 0.5,
      fontSize: 22, fontFace: FONT, bold: true, color: ag.color,
    });
    s.addText(ag.desc, {
      x: x + 0.2, y: 2.9, w: 3.4, h: 1.5,
      fontSize: 12, fontFace: FONT, color: C.text, lineSpacingMultiple: 1.3, valign: 'top',
    });

    // Input/Output labels
    s.addText(`Input: ${ag.input}`, {
      x: x + 0.2, y: 4.8, w: 3.4, h: 0.35,
      fontSize: 11, fontFace: FONT, color: C.muted,
    });
    s.addText(`Output: ${ag.output}`, {
      x: x + 0.2, y: 5.15, w: 3.4, h: 0.35,
      fontSize: 11, fontFace: FONT, color: C.green, bold: true,
    });

    // Arrow
    if (i < 2) {
      s.addText('➡', {
        x: x + 3.8, y: 3.6, w: 0.4, h: 0.5,
        fontSize: 22, fontFace: FONT, color: C.muted, align: 'center',
      });
    }
  });
}

// ── Slide 6 — Tech Stack ───────────────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Tech Stack');

  const stacks = [
    { title: 'Frontend', color: C.accent, items: ['React 18', 'Vite 5', 'TypeScript'] },
    { title: 'Backend', color: C.green, items: ['Express 4', 'TypeScript', 'tsx (dev runner)'] },
    { title: 'AI', color: C.amber, items: ['Azure OpenAI API', 'GPT-5-mini deployment', '3-agent pipeline'] },
    { title: 'Integration', color: C.purple, items: ['Azure DevOps REST API v7.1', 'PAT authentication', 'SSE streaming'] },
    { title: 'Export', color: C.red, items: ['ExcelJS', '.xlsx format', 'Azure Test Plans compatible'] },
    { title: 'Project', color: C.cardAlt, items: ['npm workspaces monorepo', 'Shared types package', 'Concurrently for dev'] },
  ];

  stacks.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 4.2;
    const y = 1.4 + row * 3.0;

    card(s, { x, y, w: 3.8, h: 2.6, fill: C.card });
    badge(s, { x: x + 0.2, y: y + 0.2, w: 1.5, text: st.title, color: st.color });

    st.items.forEach((item, ii) => {
      s.addText(`•  ${item}`, {
        x: x + 0.3, y: y + 0.75 + ii * 0.45, w: 3.2, h: 0.35,
        fontSize: 13, fontFace: FONT, color: C.text,
      });
    });
  });
}

// ── Slide 7 — End-to-End Data Flow ─────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'End-to-End Data Flow');

  const flow = [
    { title: 'Azure DevOps', desc: 'Features &\nUser Stories', color: C.accent },
    { title: 'Backend API', desc: 'Fetch & parse\nwork items', color: C.cardAlt },
    { title: 'AI Pipeline', desc: 'Analyze → Generate\n→ Review', color: C.amber },
    { title: 'Frontend', desc: 'Preview &\nedit test cases', color: C.green },
  ];

  flow.forEach((f, i) => {
    const x = 0.5 + i * 3.15;
    card(s, { x, y: 1.5, w: 2.8, h: 2.2, fill: C.card });
    s.addText(f.title, {
      x: x + 0.1, y: 1.7, w: 2.6, h: 0.4,
      fontSize: 15, fontFace: FONT, bold: true, color: f.color, align: 'center',
    });
    s.addText(f.desc, {
      x: x + 0.1, y: 2.2, w: 2.6, h: 0.9,
      fontSize: 12, fontFace: FONT, color: C.muted, align: 'center', lineSpacingMultiple: 1.3,
    });
    if (i < 3) {
      s.addText('▼', {
        x: x + 2.8, y: 2.2, w: 0.35, h: 0.5,
        fontSize: 18, fontFace: FONT, color: C.muted, align: 'center',
      });
    }
  });

  // Excel output card
  card(s, { x: 0.5, y: 4.2, w: 12.3, h: 2.6, fill: C.card });
  s.addText('Excel Export Output', {
    x: 0.8, y: 4.4, w: 5, h: 0.4,
    fontSize: 18, fontFace: FONT, bold: true, color: C.purple,
  });

  const exportItems = [
    ['Test Case Title', 'Test Steps (action + expected result)', 'Priority (1–4)', 'Test Type (positive / negative / boundary)'],
    ['Assigned To', 'Automation Status', 'Area Path', 'Ready for Azure Test Plans import'],
  ];

  exportItems.forEach((row, ri) => {
    row.forEach((item, ci) => {
      s.addText(`✔  ${item}`, {
        x: 0.8 + ci * 3.0, y: 5.0 + ri * 0.5, w: 2.9, h: 0.4,
        fontSize: 12, fontFace: FONT, color: C.text,
      });
    });
  });
}

// ── Slide 8 — Azure OpenAI Configuration ───────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Azure OpenAI Integration');
  addSubtitle(s, 'The tool connects to your Azure OpenAI instance with configurable endpoint, API key, and deployment name');

  // Configuration card
  card(s, { x: 0.5, y: 1.6, w: 5.9, h: 4.5, fill: C.card });
  s.addText('Configuration', {
    x: 0.8, y: 1.8, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.accent,
  });

  const configItems = [
    { label: 'Endpoint URL', desc: 'Your Azure OpenAI resource endpoint' },
    { label: 'API Key', desc: 'Authentication key for the resource' },
    { label: 'Deployment Name', desc: 'Currently: gpt-5-mini' },
    { label: 'API Version', desc: 'Set to 2024-10-21 (stable)' },
  ];
  configItems.forEach((item, i) => {
    s.addText(item.label, {
      x: 0.8, y: 2.5 + i * 0.7, w: 2.5, h: 0.35,
      fontSize: 13, fontFace: FONT, bold: true, color: C.text,
    });
    s.addText(item.desc, {
      x: 3.3, y: 2.5 + i * 0.7, w: 2.8, h: 0.35,
      fontSize: 12, fontFace: FONT, color: C.muted,
    });
  });

  // Reasoning model handling card
  card(s, { x: 6.9, y: 1.6, w: 5.9, h: 4.5, fill: C.card });
  s.addText('Reasoning Model Handling', {
    x: 7.2, y: 1.8, w: 5, h: 0.5,
    fontSize: 20, fontFace: FONT, bold: true, color: C.amber,
  });

  s.addText('Reasoning models (o1, o3, o4) are handled specially:', {
    x: 7.2, y: 2.5, w: 5.3, h: 0.4,
    fontSize: 13, fontFace: FONT, color: C.text,
  });

  const reasoningItems = [
    'No system message — instructions passed as user message',
    'No response_format parameter',
    'No temperature or max_tokens overrides',
    'JSON response parsed with markdown fence stripping',
  ];
  reasoningItems.forEach((item, i) => {
    s.addText(`•  ${item}`, {
      x: 7.3, y: 3.1 + i * 0.55, w: 5.2, h: 0.4,
      fontSize: 12, fontFace: FONT, color: C.muted,
    });
  });
}

// ── Slide 9 — Getting Started ──────────────────────────
{
  const s = pptx.addSlide();
  addBg(s);
  addTitle(s, 'Getting Started');

  const steps = [
    { num: '1', title: 'Prerequisites', desc: 'Node.js v18+, Azure DevOps PAT,\nAzure OpenAI instance with a deployment', color: C.accent },
    { num: '2', title: 'Install', desc: 'npm install', color: C.green },
    { num: '3', title: 'Run', desc: 'npm run dev', color: C.amber },
    { num: '4', title: 'Open', desc: 'http://localhost:5173', color: C.purple },
  ];

  steps.forEach((st, i) => {
    const x = 0.5 + i * 3.15;
    card(s, { x, y: 1.5, w: 2.8, h: 3.5, fill: C.card });

    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 1.0, y: 1.7, w: 0.7, h: 0.7,
      fill: { color: st.color },
    });
    s.addText(st.num, {
      x: x + 1.0, y: 1.7, w: 0.7, h: 0.7,
      fontSize: 22, fontFace: FONT, bold: true, color: C.white, align: 'center', valign: 'middle',
    });

    s.addText(st.title, {
      x: x + 0.1, y: 2.6, w: 2.6, h: 0.4,
      fontSize: 16, fontFace: FONT, bold: true, color: C.white, align: 'center',
    });

    s.addText(st.desc, {
      x: x + 0.15, y: 3.1, w: 2.5, h: 1.2,
      fontSize: 12, fontFace: FONT, color: C.muted, align: 'center', lineSpacingMultiple: 1.3,
    });
  });

  s.addText('Monorepo with npm workspaces  •  backend/ (port 3001)  •  frontend/ (port 5173)  •  shared/ (types)', {
    x: 0.5, y: 5.5, w: 12, h: 0.4,
    fontSize: 12, fontFace: FONT, color: C.cardAlt, align: 'center',
  });
}

// ── Write file ─────────────────────────────────────────
pptx.writeFile({ fileName: 'ADO-Test-Generator-Overview.pptx' })
  .then(() => console.log('Created ADO-Test-Generator-Overview.pptx'))
  .catch((err) => console.error('Error:', err));
