#!/usr/bin/env node
/*
  clear-local-storage.js
  Usage:
    node scripts/clear-local-storage.js [url]

  Behavior:
  - If Playwright is installed, will launch a headless browser, navigate to the given URL (default http://localhost:5173),
    clear all localStorage keys that match known store names and then exit.
  - If Playwright is not installed, prints a ready-to-paste browser console snippet and instructions.

  Note: This script does NOT modify any server-side data. It clears browser localStorage only.
*/

const DEFAULT_URL = process.argv[2] || 'http://localhost:5173';
const knownKeys = ['notebook-store', 'mission-store', 'chat-store', 'multi-chat-store'];

async function tryPlaywrightClear(url) {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log(`Opening ${url} in headless browser...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const removed = await page.evaluate((keys) => {
      const removed = [];
      keys.forEach(k => {
        if (localStorage.getItem(k) !== null) {
          localStorage.removeItem(k);
          removed.push(k);
        }
      });
      // also remove any key containing 'store'
      Object.keys(localStorage).forEach(k => {
        if (/store/i.test(k) && !keys.includes(k)) {
          localStorage.removeItem(k);
          removed.push(k);
        }
      });
      return removed;
    }, knownKeys);

    await browser.close();
    return { success: true, removed };
  } catch (err) {
    return { success: false, error: err?.message || String(err) };
  }
}

function printConsoleSnippet() {
  console.log('\nPlaywright not available.');
  console.log('Open your app in the browser and paste this in DevTools Console:');
  console.log('--- BEGIN SNIPPET ---');
  console.log(`(function(){ const keys = ${JSON.stringify(knownKeys)}; const removed=[]; keys.forEach(k=>{ if(localStorage.getItem(k)!==null){ localStorage.removeItem(k); removed.push(k);} }); Object.keys(localStorage).forEach(k=>{ if(/store/i.test(k) && !keys.includes(k)){ localStorage.removeItem(k); removed.push(k); } }); console.log('Removed keys:', removed); location.reload(); })();`);
  console.log('--- END SNIPPET ---\n');
  console.log('This will remove saved Zustand persisted keys from your browser and reload the page.');
}

(async function main(){
  console.log('clear-local-storage script');
  console.log(`Target URL: ${DEFAULT_URL}`);

  const result = await tryPlaywrightClear(DEFAULT_URL);
  if (result.success) {
    console.log('Success clearing keys via Playwright. Removed:', result.removed);
    process.exit(0);
  }

  console.warn('Playwright clear failed or not installed:', result.error || 'no playwright');
  printConsoleSnippet();
  process.exit(0);
})();
