import { test, expect } from '@playwright/test';

/**
 * Responsive Design Tests
 * 
 * Tests the application's responsive design at different screen sizes:
 * - 320px (small mobile)
 * - 768px (tablet)
 * - 1024px (desktop)
 * - 1920px (large desktop)
 * 
 * Validates: Requirement R13 - Responsive Design
 * Tests layout, touch interactions, and keyboard navigation at all breakpoints
 */

const BREAKPOINTS = {
  smallMobile: { width: 320, height: 568, name: 'Small Mobile (320px)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (768px)' },
  desktop: { width: 1024, height: 768, name: 'Desktop (1024px)' },
  largeDesktop: { width: 1920, height: 1080, name: 'Large Desktop (1920px)' },
};

test.describe('Responsive Design - Layout Tests', () => {
  Object.entries(BREAKPOINTS).forEach(([key, viewport]) => {
    test.describe(`${viewport.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
      });

      test('should render header correctly', async ({ page }) => {
        const header = page.locator('header');
        await expect(header).toBeVisible();
        
        const title = page.locator('h1:has-text("Mailly")');
        await expect(title).toBeVisible();
        
        const subtitle = page.locator('text=Create temporary disposable email addresses');
        await expect(subtitle).toBeVisible();
      });

      test('should render EmailCreator component correctly', async ({ page }) => {
        const emailCreator = page.locator('section:has(h2:has-text("Create Temporary Email"))');
        await expect(emailCreator).toBeVisible();
        
        // Check duration buttons are visible
        const durationButtons = page.locator('button:has-text("10 minutes"), button:has-text("1 hour"), button:has-text("1 day")');
        await expect(durationButtons.first()).toBeVisible();
        
        // Check domain select is visible
        const domainSelect = page.locator('select#domain-select');
        await expect(domainSelect).toBeVisible();
        
        // Check create button is visible
        const createButton = page.locator('button:has-text("Create Email")');
        await expect(createButton).toBeVisible();
      });

      test('should have touch-friendly button sizes', async ({ page }) => {
        // Check that interactive elements meet minimum touch target size (44x44px)
        const createButton = page.locator('button:has-text("Create Email")');
        const buttonBox = await createButton.boundingBox();
        
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(44);
          expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        }
      });

      test('should have touch-friendly duration buttons', async ({ page }) => {
        const durationButton = page.locator('button:has-text("10 minutes")');
        const buttonBox = await durationButton.boundingBox();
        
        if (buttonBox) {
          expect(buttonBox.height).toBeGreaterThanOrEqual(44);
          expect(buttonBox.width).toBeGreaterThanOrEqual(44);
        }
      });

      test('should handle text overflow gracefully', async ({ page }) => {
        // Check that long text doesn't cause horizontal scrolling
        const body = page.locator('body');
        const bodyBox = await body.boundingBox();
        
        if (bodyBox) {
          expect(bodyBox.width).toBeLessThanOrEqual(viewport.width);
        }
      });

      test('should display empty state correctly', async ({ page }) => {
        const emptyState = page.locator('section:has(h3:has-text("No temporary emails yet"))');
        await expect(emptyState).toBeVisible();
        
        const emptyStateIcon = emptyState.locator('svg');
        await expect(emptyStateIcon).toBeVisible();
      });

      test('should maintain readability of text', async ({ page }) => {
        // Check that text is not too small
        const subtitle = page.locator('text=Create temporary disposable email addresses');
        const fontSize = await subtitle.evaluate((el) => {
          return window.getComputedStyle(el).fontSize;
        });
        
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(12); // Minimum readable font size
      });

      test('should not have horizontal scrollbar', async ({ page }) => {
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
      });

      test('should have proper padding and spacing', async ({ page }) => {
        const emailCreator = page.locator('section:has(h2:has-text("Create Temporary Email"))');
        const computedStyle = await emailCreator.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom,
          };
        });

        // Padding should be present
        const paddingValues = [
          parseInt(computedStyle.paddingLeft),
          parseInt(computedStyle.paddingRight),
          parseInt(computedStyle.paddingTop),
          parseInt(computedStyle.paddingBottom),
        ];
        
        // At least some padding should be present
        expect(paddingValues.some(p => p > 0)).toBeTruthy();
      });
    });
  });
});

test.describe('Responsive Design - Touch Interactions', () => {
  test('should handle touch interactions on small mobile (320px)', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 320, height: 568 } });
    const page = await context.newPage();
    await page.goto('/');
    
    // Verify duration buttons are touch-friendly
    const durationButtons = page.locator('button:has-text("10 minutes")');
    const buttonBox = await durationButtons.first().boundingBox();
    
    if (buttonBox) {
      expect(buttonBox.height).toBeGreaterThanOrEqual(44);
    }

    // Click on duration button (tap equivalent)
    await durationButtons.first().click();
    
    // Verify button state changed
    const button = durationButtons.first();
    const ariaPressed = await button.getAttribute('aria-pressed');
    expect(ariaPressed).toBe('true');
    
    await context.close();
  });

  test('should handle touch interactions on tablet (768px)', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 768, height: 1024 } });
    const page = await context.newPage();
    await page.goto('/');
    
    // Click on domain select
    const domainSelect = page.locator('select#domain-select');
    await domainSelect.click();
    
    // Verify select is focused
    await expect(domainSelect).toBeFocused();
    
    await context.close();
  });

  test('should have adequate spacing between touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // Get all duration buttons
    const buttons = page.locator('button:has-text("10 minutes"), button:has-text("1 hour"), button:has-text("1 day")');
    const count = await buttons.count();
    
    // Check that buttons are visible and have proper size
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const box = await button.boundingBox();
      
      if (box) {
        // Each button should be at least 44px tall
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should support touch scrolling on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 100));
    
    // Verify scroll position changed
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design - Keyboard Navigation', () => {
  test('should support keyboard navigation on small mobile (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Verify focus is on an interactive element
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveCount(1);
  });

  test('should support keyboard navigation on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus moved
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveCount(1);
  });

  test('should support keyboard navigation on desktop (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    
    // Tab to duration button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Press Space to select
    await page.keyboard.press('Space');
    
    // Verify button was activated
    const focusedButton = await page.locator(':focus');
    const ariaPressed = await focusedButton.getAttribute('aria-pressed');
    expect(ariaPressed).toBe('true');
  });

  test('should support keyboard navigation on large desktop (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Tab to create button
    let tabCount = 0;
    while (tabCount < 10) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const focusedElement = await page.locator(':focus');
      const text = await focusedElement.textContent();
      
      if (text?.includes('Create Email')) {
        break;
      }
    }
    
    // Verify we found the create button
    const focusedElement = await page.locator(':focus');
    const text = await focusedElement.textContent();
    expect(text).toContain('Create Email');
  });

  test('should show visible focus indicators at all breakpoints', async ({ page }) => {
    for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Tab to first element
      await page.keyboard.press('Tab');
      
      // Get focused element
      const focusedElement = await page.locator(':focus');
      
      // Check for focus indicator
      const outline = await focusedElement.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.outline;
      });
      
      expect(outline).toBeTruthy();
    }
  });

  test('should maintain logical tab order on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    const tabOrder: string[] = [];
    
    // Tab through first 5 elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      const ariaLabel = await focusedElement.getAttribute('aria-label');
      if (ariaLabel) {
        tabOrder.push(ariaLabel);
      }
    }
    
    // Should have navigated through elements
    expect(tabOrder.length).toBeGreaterThan(0);
  });

  test('should skip disabled elements in tab order', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Tab through a few elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.locator(':focus');
      const count = await focusedElement.count();
      
      // Should have a focused element
      if (count > 0) {
        const isDisabled = await focusedElement.first().isDisabled();
        // Focused element should not be disabled
        expect(isDisabled).toBeFalsy();
      }
    }
  });
});

test.describe('Responsive Layout Transitions', () => {
  test('should adapt layout when resizing from mobile to desktop', async ({ page }) => {
    // Start at mobile size
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // Verify mobile layout
    let header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Resize to desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Verify desktop layout still works
    await expect(header).toBeVisible();
    const title = page.locator('h1:has-text("Mailly")');
    await expect(title).toBeVisible();
  });

  test('should adapt layout when resizing from desktop to mobile', async ({ page }) => {
    // Start at desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Verify desktop layout
    let header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Verify mobile layout still works
    await expect(header).toBeVisible();
    const title = page.locator('h1:has-text("Mailly")');
    await expect(title).toBeVisible();
  });

  test('should maintain content visibility during resize', async ({ page }) => {
    // Start at tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    const emailCreator = page.locator('section:has(h2:has-text("Create Temporary Email"))');
    await expect(emailCreator).toBeVisible();
    
    // Resize to mobile
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(emailCreator).toBeVisible();
    
    // Resize to desktop
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(emailCreator).toBeVisible();
    
    // Resize to large desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(emailCreator).toBeVisible();
  });
});

test.describe('Content Visibility at Different Breakpoints', () => {
  test('should show all content sections at all breakpoints', async ({ page }) => {
    for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Check main sections are visible
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      const emailCreator = page.locator('section:has(h2:has-text("Create Temporary Email"))');
      await expect(emailCreator).toBeVisible();
      
      const emailList = page.locator('section:has(h2:has-text("Your Emails"))');
      await expect(emailList).toBeVisible();
    }
  });

  test('should render text at readable sizes across all breakpoints', async ({ page }) => {
    for (const [key, viewport] of Object.entries(BREAKPOINTS)) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Check heading size
      const heading = page.locator('h1');
      const fontSize = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(20); // Headings should be readable
    }
  });
});
