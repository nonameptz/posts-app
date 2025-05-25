import { test, expect } from '@playwright/test';

test.describe('PostsList Component', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses with real-like data
    await page.route('**/api/posts', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 1,
            title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
            body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita',
            userId: 1
          },
          {
            id: 2,
            title: 'qui est esse',
            body: 'est rerum tempore vitae\nsequi sint nihil',
            userId: 2
          }
        ])
      });
    });

    await page.route('**/api/users', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          { id: 1, name: 'Leanne Graham' },
          { id: 2, name: 'Ervin Howell' }
        ])
      });
    });

    await page.goto('/');
  });

  test('displays posts list correctly', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Posts list' })).toBeVisible();
    await expect(page.getByText('sunt aut facere')).toBeVisible();
    await expect(page.getByText('qui est esse')).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    const searchInput = page.getByLabel('Search posts');
    await searchInput.fill('sunt aut');
    await expect(page.getByText('sunt aut facere')).toBeVisible();
    await expect(page.getByText('qui est esse')).not.toBeVisible();
    await searchInput.clear();
    await expect(page.getByText('qui est esse')).toBeVisible();
  });

  test('selection functionality works', async ({ page }) => {
    await page.locator('input[type="checkbox"][aria-label="Select post 1"]').click();
    await page.locator('input[type="checkbox"][aria-label="Select post 2"]').click();

    await page.waitForTimeout(1000);

    // Check if delete selected button appears
    const deleteButton = page.getByRole('button').filter({ hasText: /Delete Selected/ });
    await expect(deleteButton).toBeVisible();

    // Clear selection
    await page.getByRole('button', { name: 'Clear Selection' }).click();
  });

  test('delete functionality works', async ({ page }) => {
    // Mock delete API call
    await page.route('**/api/posts/1', route => route.fulfill({ status: 200 }));

    // Open menu and click delete
    await page.getByRole('button', { name: 'Post actions' }).first().click();

    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('menuitem', { name: 'Delete' }).click();

    // Verify post is removed
    await expect(page.getByText('Test Post 1')).not.toBeVisible();
  });

  test('create post button works', async ({ page }) => {
    await page.getByRole('button', { name: 'Create new post' }).click();

    // Verify modal appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
  });

  test('edit functionality works', async ({ page }) => {
    // Open menu and click edit
    await page.getByRole('button', { name: 'Post actions' }).first().click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    // Verify edit modal appears with correct data
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel('Title')).toHaveValue('sunt aut facere repellat provident occaecati excepturi optio reprehenderit');
  });
});
