import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const SCREENSHOTS_DIR = 'docs/screenshots';
const results = JSON.parse(readFileSync('/tmp/results-data.json', 'utf-8'));

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  const totalTests = results.reduce((sum, r) => sum + r.testCases.length, 0);

  let testCardsHtml = '';
  results.forEach(r => {
    testCardsHtml += `<div style="margin-bottom:20px">`;
    testCardsHtml += `<div style="font-size:15px;font-weight:600;color:#0078d4;margin-bottom:8px">#${r.featureId} - ${r.featureTitle}</div>`;

    r.testCases.forEach((tc, i) => {
      const typeColors = { positive: ['#e8f5e9','#2e7d32'], negative: ['#ffebee','#c62828'], boundary: ['#fff3e0','#e65100'] };
      const [bg, fg] = typeColors[tc.testType] || ['#f5f5f5','#333'];
      const expanded = i === 0;

      testCardsHtml += `<div style="border:1px solid #ddd;border-radius:8px;padding:12px 16px;margin-bottom:6px;background:white">`;
      testCardsHtml += `<div style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px">`;
      testCardsHtml += `${tc.title}`;
      testCardsHtml += ` <span style="font-size:11px;padding:2px 8px;border-radius:12px;font-weight:500;background:${bg};color:${fg}">${tc.testType}</span>`;
      testCardsHtml += ` <span style="font-size:11px;padding:2px 8px;border-radius:12px;font-weight:500;background:#e3f2fd;color:#1565c0">P${tc.priority}</span>`;
      testCardsHtml += `</div>`;

      if (expanded) {
        testCardsHtml += `<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:12px">`;
        testCardsHtml += `<tr><th style="text-align:left;padding:6px 8px;background:#f5f5f5;border:1px solid #e0e0e0;font-weight:600;width:30px">#</th><th style="text-align:left;padding:6px 8px;background:#f5f5f5;border:1px solid #e0e0e0;font-weight:600">Action</th><th style="text-align:left;padding:6px 8px;background:#f5f5f5;border:1px solid #e0e0e0;font-weight:600">Expected Result</th></tr>`;
        tc.steps.forEach(s => {
          testCardsHtml += `<tr><td style="padding:6px 8px;border:1px solid #e0e0e0;vertical-align:top">${s.stepNumber}</td><td style="padding:6px 8px;border:1px solid #e0e0e0;vertical-align:top">${s.action}</td><td style="padding:6px 8px;border:1px solid #e0e0e0;vertical-align:top">${s.expectedResult}</td></tr>`;
        });
        testCardsHtml += `</table>`;
      }

      testCardsHtml += `</div>`;
    });

    testCardsHtml += `</div>`;
  });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f6fa">
      <div style="background:#0078d4;color:white;padding:16px 24px">
        <h1 style="font-size:20px;font-weight:600;margin:0">Azure DevOps AI Test Plan Generator</h1>
      </div>
      <div style="display:flex;justify-content:center;padding:12px 24px;background:white;border-bottom:1px solid #e0e0e0">
        <div style="padding:8px 20px;font-size:13px;font-weight:500;color:#333;border-bottom:3px solid transparent">1. Connect</div>
        <div style="padding:8px 20px;font-size:13px;font-weight:500;color:#333;border-bottom:3px solid transparent">2. Select PI</div>
        <div style="padding:8px 20px;font-size:13px;font-weight:500;color:#333;border-bottom:3px solid transparent">3. Review Features</div>
        <div style="padding:8px 20px;font-size:13px;font-weight:500;color:#333;border-bottom:3px solid transparent">4. Generate</div>
        <div style="padding:8px 20px;font-size:13px;font-weight:600;color:#0078d4;border-bottom:3px solid #0078d4">5. Preview &amp; Export</div>
      </div>
      <div style="padding:24px;max-width:900px;margin:0 auto">
        <h2 style="font-size:18px;font-weight:600;color:#1a1a2e;margin-bottom:4px">Generated Test Cases</h2>
        <p style="font-size:14px;color:#555;margin-bottom:16px">${totalTests} test cases across ${results.length} feature(s)</p>
        ${testCardsHtml}
        <div style="margin-top:16px;padding:16px;background:white;border-radius:8px;border:1px solid #ddd;display:flex;align-items:center;gap:12px">
          <button style="padding:10px 24px;background:#0078d4;color:white;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">Export to Excel (.xlsx)</button>
          <span style="color:#555;font-size:13px">${totalTests} test cases ready for export</span>
        </div>
      </div>
      <div style="position:fixed;bottom:0;left:0;right:0;padding:12px 24px;background:white;border-top:1px solid #e0e0e0">
        <button style="padding:8px 20px;background:transparent;color:#0078d4;border:1px solid #0078d4;border-radius:6px;font-size:14px;cursor:pointer">&larr; Back</button>
      </div>
    </body>
    </html>
  `);

  await sleep(500);
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-preview.png`, fullPage: false });
  console.log('  ✔ 06-preview.png');

  await browser.close();
})();
