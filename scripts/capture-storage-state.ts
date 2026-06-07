import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';
import * as path from 'path';

const stealthPlugin = StealthPlugin();
stealthPlugin.enabledEvasions.delete('iframe.contentWindow');
stealthPlugin.enabledEvasions.delete('media.codecs');
chromium.use(stealthPlugin);

const BOT_EMAIL = process.env.BOT_ACCOUNT_EMAIL || 'Test-1@credinfinite.com';

(async () => {
  console.log('=== Google Auth Capture ===');
  console.log(`Bot email: ${BOT_EMAIL}`);
  console.log('');
  console.log('A browser will open. Sign in to Google with the bot account.');
  console.log('Handle any 2FA/CAPTCHA manually. After sign-in, navigate to:');
  console.log('  https://meet.google.com');
  console.log('');
  console.log('Once the Google Meet page loads successfully, press ENTER here');
  console.log('to save the session. The script will close the browser and save cookies.');
  console.log('');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--window-size=1280,800',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // Go to Google sign-in
  await page.goto(`https://accounts.google.com/signin/v2/identifier?hl=en&flowName=GlifWebSignIn&flowEntry=ServiceLogin`, {
    waitUntil: 'networkidle',
  });

  console.log('Browser opened. Sign in now.');

  // Wait for user to press Enter
  await new Promise<void>((resolve) => {
    process.stdin.once('data', () => resolve());
  });

  // Save storage state
  const statePath = path.resolve(__dirname, '..', 'google-auth.json');
  const state = await context.storageState();
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  console.log(`Storage state saved to ${statePath}`);

  await browser.close();
  console.log('Done. The bot will now use this saved session.');
  process.exit(0);
})();
