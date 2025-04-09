import { test, expect } from '@playwright/test';

test('homepage loads and shows title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Frontend/i);
});

test('should navigate to Create User and register a new user', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('/login');

  // 2. Click the "Create one" link
  await page.getByRole('link', { name: /create one/i }).click();

  // 3. Expect to be on the Create User page
  await expect(page.locator('h1')).toHaveText(/create new user/i);

  // 4. Fill out the form
  await page.fill('input#username', 'test');
  await page.fill('input#firstname', 'Test');
  await page.fill('input#lastname', 'User');

  await page.fill('input#password', 'testtest');
  await page.fill('input#confirmPassword', 'testtest');

  // 5. Click submit
  const button = page.locator('button[type="submit"]');
  await expect(button).toBeEnabled(); // Optional: wait for button to become active
  await button.click();
});

test('should login and borrow the first available book', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('/login');

  // 2. Confirm we're on the login page
  await expect(page.locator('h1')).toHaveText(/login/i);

  // 3. Fill out login form
  await page.fill('input#username', 'test');
  await page.fill('input#password', 'testtest');

  // 4. Submit the form
  const loginButton = page.locator('button[type="submit"]');
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  // 5. Ensure we're redirected and see the library list
  await page.waitForURL('/library-list');
  await expect(page.locator('h2')).toHaveText(/library items/i);

  // 6. Borrow the first item in the list
  const firstBorrowButton = page.locator('ul > li .borrow-button').first();
  await expect(firstBorrowButton).toBeVisible();
  await firstBorrowButton.click();

  // 7. Optionally check that the "Copies Available" count decreased or a success message appeared
  // This depends on your app behavior. Here's a placeholder:
  // await expect(page.locator('.success-message')).toHaveText(/successfully borrowed/i);
});