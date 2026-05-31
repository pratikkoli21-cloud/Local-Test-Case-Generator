import { test, expect } from '@playwright/test';

// spec: specs/qaplayground-test-plan.md

test.describe('Comprehensive Test Plan: QA Playground Practice', () => {
  test('Scenario 1: Standard Form Authentication (Happy Path)', async ({ page }) => {
    // Assumptions about starting state: A blank/fresh browser session with no cookies, session storage, or local storage.
    // Playwright provides an isolated browser context per test by default.

    // 1. Navigate to https://qaplayground.com/practice.
    await page.goto('https://qaplayground.com/practice');

    // 2. Locate and click on the "Login" or "Authentication" practice module.
    await page.locator('text=/Login|Authentication/i').click();

    // 3. Enter a valid registered username (e.g., testuser) into the "Username" input field.
    await page.getByLabel(/username/i).fill('testuser');

    // 4. Enter the corresponding valid password into the "Password" input field.
    await page.getByLabel(/password/i).fill('password123');

    // 5. Click the "Submit" or "Login" button.
    await page.locator('button:has-text("Submit"), button:has-text("Login")').click();

    // Expected outcomes: A success message (e.g., "Welcome back!") should be visibly rendered in the DOM.
    await expect(page.getByText('Welcome back!')).toBeVisible();
  });
});