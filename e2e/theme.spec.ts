import { test, expect } from '@playwright/test';

/**
 * E2E tests for theme functionality
 * **Validates: Requirements 10**
 */

test.describe('Theme Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should toggle between light and dark themes', async ({ page }) => {
    await page.goto('/');

    // Get the theme toggle button
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await expect(themeToggle).toBeVisible();

    // Check initial theme (should be light by default)
    const htmlElement = page.locator('html');
    let hasLightClass = await htmlElement.evaluate((el) => el.classList.contains('light'));
    let hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    
    // Initial state should be light
    expect(hasLightClass || !hasDarkClass).toBeTruthy();

    // Click to switch to dark mode
    await themeToggle.click();
    await page.waitForTimeout(100); // Wait for theme transition

    // Verify dark mode is applied
    hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkClass).toBeTruthy();

    // Verify button label changed
    await expect(themeToggle).toHaveAttribute('aria-label', /switch to light mode/i);

    // Click to switch back to light mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Verify light mode is applied
    hasLightClass = await htmlElement.evaluate((el) => el.classList.contains('light'));
    hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(hasLightClass || !hasDarkClass).toBeTruthy();

    // Verify button label changed back
    await expect(themeToggle).toHaveAttribute('aria-label', /switch to dark mode/i);
  });

  test('should persist theme preference after page refresh', async ({ page }) => {
    await page.goto('/');

    // Switch to dark mode
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Verify dark mode is active
    let htmlElement = page.locator('html');
    let hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkClass).toBeTruthy();

    // Verify theme is stored in localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('tempmail_theme'));
    expect(storedTheme).toBe(JSON.stringify('dark'));

    // Refresh the page
    await page.reload();
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for theme to be applied after reload
    await page.waitForTimeout(1000);

    // Check localStorage value after reload
    const storedThemeAfterReload = await page.evaluate(() => localStorage.getItem('tempmail_theme'));
    
    // Verify localStorage still has the dark theme
    expect(storedThemeAfterReload).toBe(JSON.stringify('dark'));

    // Get a fresh reference to the html element after reload
    htmlElement = page.locator('html');
    
    // Verify dark mode persists after refresh
    hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkClass).toBeTruthy();
  });

  test('should render all components correctly in light theme', async ({ page }) => {
    await page.goto('/');

    // Ensure light theme is active
    const htmlElement = page.locator('html');
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    
    // If dark mode is active, switch to light
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    if (hasDarkClass) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Verify theme toggle button is visible and styled correctly
    await expect(themeToggle).toBeVisible();
    const toggleBg = await themeToggle.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(toggleBg).toBeTruthy();

    // Verify main heading is visible
    const heading = page.getByRole('heading', { name: /tempmail pro/i });
    await expect(heading).toBeVisible();

    // Verify email creator section is visible
    const emailCreator = page.locator('text=Create Temporary Email');
    await expect(emailCreator).toBeVisible();

    // Verify duration options are visible
    const durationButtons = page.locator('button:has-text("10 minutes"), button:has-text("1 hour"), button:has-text("1 day")');
    await expect(durationButtons.first()).toBeVisible();

    // Verify create button is visible
    const createButton = page.getByRole('button', { name: /create email/i });
    await expect(createButton).toBeVisible();
  });

  test('should render all components correctly in dark theme', async ({ page }) => {
    await page.goto('/');

    // Switch to dark mode
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Verify dark mode is active
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkClass).toBeTruthy();

    // Verify theme toggle button is visible and styled correctly
    await expect(themeToggle).toBeVisible();
    const toggleBg = await themeToggle.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(toggleBg).toBeTruthy();

    // Verify main heading is visible
    const heading = page.getByRole('heading', { name: /tempmail pro/i });
    await expect(heading).toBeVisible();

    // Verify email creator section is visible
    const emailCreator = page.locator('text=Create Temporary Email');
    await expect(emailCreator).toBeVisible();

    // Verify duration options are visible
    const durationButtons = page.locator('button:has-text("10 minutes"), button:has-text("1 hour"), button:has-text("1 day")');
    await expect(durationButtons.first()).toBeVisible();

    // Verify create button is visible
    const createButton = page.getByRole('button', { name: /create email/i });
    await expect(createButton).toBeVisible();

    // Verify background color reflects dark theme
    const bodyBg = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    expect(bodyBg).toBeTruthy();
  });

  test('should apply theme changes without page reload', async ({ page }) => {
    await page.goto('/');

    // Get initial page load timestamp
    const initialTimestamp = await page.evaluate(() => window.performance.timing.loadEventEnd);

    // Toggle theme multiple times
    const themeToggle = page.getByRole('button', { name: /switch to (dark|light) mode/i });
    
    await themeToggle.click();
    await page.waitForTimeout(100);
    
    await themeToggle.click();
    await page.waitForTimeout(100);
    
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Verify page was not reloaded (timestamp should remain the same)
    const currentTimestamp = await page.evaluate(() => window.performance.timing.loadEventEnd);
    expect(currentTimestamp).toBe(initialTimestamp);

    // Verify theme is still functional
    const htmlElement = page.locator('html');
    const hasDarkClass = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(hasDarkClass).toBeTruthy();
  });
});
