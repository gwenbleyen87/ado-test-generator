import puppeteer from 'puppeteer';

const SCREENSHOTS_DIR = 'docs/screenshots';
const URL = 'http://localhost:5173';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function capture(page, name) {
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/${name}.png`, fullPage: false });
  console.log(`  ✔ ${name}.png`);
}

async function clickButtonByText(page, text) {
  return page.evaluate((searchText) => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent && btn.textContent.includes(searchText)) {
        btn.click();
        return true;
      }
    }
    return false;
  }, text);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 900 },
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // ── Step 1a: Connection form ─────────────────────────
  console.log('Step 1: Connection form');
  await capture(page, '01-connect');

  // ── Step 1b: Load Projects ───────────────────────────
  console.log('  Loading projects...');
  await clickButtonByText(page, 'Load Projects');
  await page.waitForSelector('select', { timeout: 15000 });
  await sleep(1000);

  // ── Step 1c: Select project ──────────────────────────
  console.log('  Selecting project...');
  const options = await page.$$eval('select option', (opts) =>
    opts.filter((o) => o.value).map((o) => o.value)
  );
  if (options.length > 0) {
    await page.select('select', options[0]);
    await sleep(500);
    await capture(page, '02-connect-configured');
  }

  // ── Step 2: PI selector ──────────────────────────────
  console.log('Step 2: Select PI');
  await clickButtonByText(page, 'Connect');
  await page.waitForFunction(
    () => document.body.innerText.includes('Select Program Increment'),
    { timeout: 15000 }
  );
  await sleep(1000);
  await capture(page, '03-select-pi');

  // ── Step 3: Feature list ─────────────────────────────
  console.log('Step 3: Review Features');
  await clickButtonByText(page, 'Load Features');
  await page.waitForFunction(
    () => document.querySelectorAll('input[type="checkbox"]').length > 1,
    { timeout: 30000 }
  );
  await sleep(1500);
  await capture(page, '04-review-features');

  // Deselect all, then select only 1st feature
  console.log('  Selecting 1 feature...');
  const allCheckboxes = await page.$$('input[type="checkbox"]');
  await allCheckboxes[0].click(); // deselect all
  await sleep(300);
  await allCheckboxes[1].click(); // select first only
  await sleep(500);

  // ── Step 4: Generate ─────────────────────────────────
  console.log('Step 4: Generate');
  await clickButtonByText(page, 'Generate Test Cases');
  await page.waitForFunction(
    () => document.body.innerText.includes('Generating Test Cases'),
    { timeout: 15000 }
  );
  await sleep(3000);
  await capture(page, '05-generate-progress');

  // Wait for auto-transition to preview (onComplete sets step to 'preview')
  console.log('  Waiting for generation to complete...');
  try {
    await page.waitForFunction(
      () => document.body.innerText.includes('Preview & Export') &&
            document.body.innerText.includes('test cases') &&
            !document.body.innerText.includes('Generating Test Cases'),
      { timeout: 600000 } // 10 minutes
    );
    await sleep(2000);
  } catch {
    console.log('  ⚠ Generation timed out');
  }

  // ── Step 5: Preview ──────────────────────────────────
  console.log('Step 5: Preview & Export');
  await capture(page, '06-preview');

  // Expand a test case
  const expanded = await page.evaluate(() => {
    const divs = document.querySelectorAll('div');
    for (const div of divs) {
      if (window.getComputedStyle(div).cursor === 'pointer' && div.innerText && div.innerText.length > 20 && div.innerText.length < 300) {
        div.click();
        return true;
      }
    }
    return false;
  });
  if (expanded) {
    await sleep(800);
    await capture(page, '07-preview-expanded');
  }

  console.log('\nDone!');
  await browser.close();
})();
