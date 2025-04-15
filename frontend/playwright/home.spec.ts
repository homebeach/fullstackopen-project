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

  // 6. Expect success message
  await expect(page.locator('text=User created successfully!')).toBeVisible();
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

  // 7. Click the Logout button in the user info section
  const logoutButton = page.locator('button.logout-btn', { hasText: 'Logout' });
  await expect(logoutButton).toBeVisible();
  await logoutButton.click();

  // 8. Optionally verify redirect to login or home
  await expect(page).toHaveURL(/\/login|\/$/);
});

test('should login, return the first borrowed book, and logout', async ({ page }) => {
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

  // 5. Wait for redirect to library list
  await page.waitForURL('/library-list');
  await expect(page.locator('h2')).toHaveText(/library items/i);

  // 6. Click on the "My Borrowed Items" link in the menu
  const borrowedLink = page.locator('a[href="/borrowed"]', { hasText: 'My Borrowed Items' });
  await expect(borrowedLink).toBeVisible();
  await borrowedLink.click();

  // 7. Wait for navigation to borrowed items page
  await page.waitForURL('/borrowed');
  await expect(page.locator('h1')).toHaveText(/my borrowed items/i);

  // 8. Get the first borrowed item
  const firstBorrowedItem = page.locator('.borrowed-item').first();
  await expect(firstBorrowedItem).toBeVisible();

  // 9. Click the "Return" button inside it
  const returnButton = firstBorrowedItem.locator('button.return-button');
  await expect(returnButton).toBeVisible();
  await returnButton.click();

  // 10. Click the Logout button in the user info section
  const logoutButton = page.locator('button.logout-btn', { hasText: 'Logout' });
  await expect(logoutButton).toBeVisible();
  await logoutButton.click();

  // 11. Optionally verify redirect to login or home
  await expect(page).toHaveURL(/\/login|\/$/);
});

test('should log in, delete test user, and log out', async ({ page }) => {

  // 1. Go to login page
  await page.goto('/login'); // adjust if route differs

  // 2. Log in as testuser
  await expect(page.locator('h1')).toHaveText(/login/i);

  // 3. Fill out login form
  await page.fill('input#username', 'testuser');
  await page.fill('input#password', 'testuser');

  // 4. Submit the form
  const loginButton = page.locator('button[type="submit"]');
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  // 5. Wait for redirect to library list
  await page.waitForURL('/library-list');
  await expect(page.locator('h2')).toHaveText(/library items/i);

  // 6. Navigate to User Management
  await page.click('a[href="/user-management"]');
  await expect(page.locator('h1')).toHaveText('User Management');
  await page.waitForSelector('.user-table');

  // Handle browser confirm dialog
  page.on('dialog', async dialog => {
    await dialog.accept(); // clicks "OK"
  });

  // 7. Find row with username "test"
  const rows = page.locator('table.user-table tbody tr');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const usernameInput = row.locator('input[placeholder="Username"]');
    const username = await usernameInput.inputValue();

    if (username === 'test') {
      await row.locator('button.delete-button').click();
      break;
    }
  }

  // 8. Log out
  await page.click('button:has-text("Logout")'); // or the correct selector
});

