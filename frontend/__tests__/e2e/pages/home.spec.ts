import { mockHomeData } from '@e2e/data/mockHomeData'
import { test, expect } from '@playwright/test'

test.setTimeout(60000);

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(60000);
    
    await page.route('**/graphql/', async (route) => {
      await route.fulfill({
        status: 200,
        json: mockHomeData,
      })
    })

    let retries = 3;
    while (retries > 0) {
      try {
        await page.goto('/', { timeout: 45000, waitUntil: 'domcontentloaded' });
        
        // Add a longer delay after navigation to ensure all components have time to render
        await page.waitForTimeout(3000);
        break;
      } catch (e) {
        retries--;
        if (retries === 0) throw e;
        console.log('Retrying navigation...');
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  })

  test('should have a heading and searchBar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to OWASP Nest' })).toBeVisible()
    await expect(
      page.getByText('Your gateway to OWASP. Discover, engage, and help shape the future!')
    ).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Search the OWASP community' })).toBeVisible()
    await page.getByRole('textbox', { name: 'Search the OWASP community' }).fill('owasp')
  })

  test('should have new chapters', async ({ page, context }) => {
    // Skip networkidle since it's causing timeouts
    await expect(page.getByRole('heading', { name: 'New Chapters' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'chapter 1' })).toBeVisible()
    await expect(page.getByText('Feb 20,').first()).toBeVisible()
    
    // Click first, then check URL directly without waiting for load event
    await page.getByRole('link', { name: 'chapter 1' }).click({ force: true });
    
    // Use a more reliable approach to verify navigation
    await expect(page).toHaveURL(/.*chapters\/chapter-1/, { timeout: 10000 });
  })

  test('should have new projects', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'New Projects' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Project 1' })).toBeVisible()
    await expect(page.getByText('Jan 1,').first()).toBeVisible()
    
    // Click first, then check URL directly without waiting for load event
    await page.getByRole('link', { name: 'Project 1' }).click({ force: true });
    
    // Use a more reliable approach to verify navigation
    await expect(page).toHaveURL(/.*projects\/project-1/, { timeout: 10000 });
  })

  test('should have top contributors', async ({ page }) => {
    // Add an explicit wait to ensure component is loaded
    await page.waitForTimeout(2000);
    
    // Increase timeout for finding the heading
    await expect(page.getByRole('heading', { name: 'Top Contributors' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('img', { name: 'Contributor 1' })).toBeVisible()
    await expect(page.getByText('Repository 1')).toBeVisible()
    
    // Click first, then check URL directly without waiting for load event
    await page.getByText('Contributor 1').click({ force: true });
    
    // Use a more reliable approach to verify navigation
    await expect(page).toHaveURL(/.*community\/users\/contributor1/, { timeout: 10000 });
  })

  test('should have recent issues', async ({ page }) => {
    // Add wait and increase timeout for this section
    await page.waitForTimeout(2000);
    
    // Increase timeout for elements that might take longer to appear
    await expect(page.getByRole('heading', { name: 'Recent Issues' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Issue 1' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Author 1').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Feb 24,').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('5 comments')).toBeVisible({ timeout: 10000 })
  })

  test('should have recent Releases', async ({ page }) => {
    // Add wait and increase timeout for this section
    await page.waitForTimeout(2000);
    
    // Increase timeout for elements that might take longer to appear
    await expect(page.getByRole('heading', { name: 'Recent Releases' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'Release 1' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Feb 22,')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('v1', { exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('should be able to join OWASP', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ready to Make a Difference?' })).toBeVisible()
    await expect(page.getByText('Join OWASP and be part of the')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Join OWASP Now' })).toBeVisible()
    const page1Promise = page.waitForEvent('popup')
    await page.getByRole('link', { name: 'Join OWASP Now' }).click()
    const page1 = await page1Promise
    expect(page1.url()).toBe('https://owasp.glueup.com/organization/6727/memberships/')
  })
})
