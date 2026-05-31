import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Docs' }).click();
  await page.getByRole('link', { name: 'Writing tests', exact: true }).click();
  await page.getByRole('link', { name: 'Generating tests', exact: true }).click();
  await page.getByRole('link', { name: 'Running and debugging tests', exact: true }).click();
  await page.getByRole('link', { name: 'Trace viewer' }).first().click();
  await page.getByRole('link', { name: 'Setting up CI', exact: true }).click();
  await page.getByRole('link', { name: 'VS Code', exact: true }).click();
  await page.getByRole('button', { name: 'Playwright Test', exact: true }).click();
  await page.getByRole('button', { name: 'Playwright Test', exact: true }).click();
  await page.getByRole('button', { name: 'Search (Ctrl+K)' }).click();
  await page.getByRole('searchbox', { name: 'Search' }).fill('VS code');
  await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
});