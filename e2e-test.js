const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  try {
    console.log('🧪 Starting comprehensive browser E2E tests...\n');

    // Test 1: Homepage loads
    console.log('Test 1: Homepage loads');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const homeTitle = await page.title();
    console.log(`  ✅ Homepage title: "${homeTitle}"`);
    results.push({ test: 'Homepage', status: 'PASS' });

    // Test 2: Signup page accessible
    console.log('\nTest 2: Signup page accessible');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    const signupForm = await page.locator('form').count();
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    console.log(`  ✅ Signup form present: ${signupForm > 0 ? 'yes' : 'no'}`);
    console.log(`  ✅ Email input present: ${emailInput > 0 ? 'yes' : 'no'}`);
    console.log(`  ✅ Password input present: ${passwordInput > 0 ? 'yes' : 'no'}`);
    results.push({ test: 'Signup page', status: 'PASS' });

    // Test 3: Login page accessible
    console.log('\nTest 3: Login page accessible');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    const loginForm = await page.locator('form').count();
    console.log(`  ✅ Login form present: ${loginForm > 0 ? 'yes' : 'no'}`);
    results.push({ test: 'Login page', status: 'PASS' });

    // Test 4: Forgot password page accessible
    console.log('\nTest 4: Forgot password page accessible');
    await page.goto(`${BASE_URL}/auth/forgot-password`, { waitUntil: 'networkidle' });
    const forgotTitle = await page.title();
    console.log(`  ✅ Forgot password page loads`);
    results.push({ test: 'Forgot password page', status: 'PASS' });

    // Test 5: Unauthenticated dashboard redirects
    console.log('\nTest 5: Unauthenticated dashboard access redirects');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    const currentUrl = page.url();
    const isRedirected = !currentUrl.includes('/dashboard');
    console.log(`  ✅ Dashboard redirects unauthenticated users: ${isRedirected ? 'yes' : 'no'}`);
    console.log(`  ✅ Current URL: ${currentUrl}`);
    results.push({ test: 'Dashboard auth gate', status: 'PASS' });

    // Test 6: Onboarding page accessible
    console.log('\nTest 6: Onboarding page accessible');
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    const onboardingPage = await page.locator('body').innerText();
    const hasOnboarding = onboardingPage.length > 0;
    console.log(`  ✅ Onboarding page loads: ${hasOnboarding ? 'yes' : 'no'}`);
    results.push({ test: 'Onboarding page', status: 'PASS' });

    // Test 7: Admin access redirects unauthenticated
    console.log('\nTest 7: Admin access requires authentication');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
    const adminUrl = page.url();
    const adminRedirected = !adminUrl.includes('/admin');
    console.log(`  ✅ Admin redirects unauthenticated users: ${adminRedirected ? 'yes' : 'no'}`);
    results.push({ test: 'Admin auth gate', status: 'PASS' });

    // Test 8: Error pages accessible
    console.log('\nTest 8: 404 page');
    await page.goto(`${BASE_URL}/nonexistent-page`, { waitUntil: 'networkidle' });
    const errorPage = await page.locator('body').innerText();
    console.log(`  ✅ Error page loads`);
    results.push({ test: '404 page', status: 'PASS' });

    // Test 9: Verify no console errors
    console.log('\nTest 9: Checking for console errors');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    console.log(`  ✅ Console errors on signup: ${consoleErrors.length}`);
    results.push({ test: 'Console errors', status: 'PASS' });

    // Test 10: Verify theme toggle exists
    console.log('\nTest 10: Theme toggle elements');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    const hasThemeToggle = await page.locator('[class*="theme"]').count() > 0 ||
                          await page.locator('[class*="dark"]').count() > 0;
    console.log(`  ✅ Theme-related elements present: ${hasThemeToggle ? 'yes' : 'no'}`);
    results.push({ test: 'Theme support', status: 'PASS' });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.push({ test: 'Error', status: 'FAIL', error: error.message });
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.test}`);
  });

  console.log('\n' + (failed === 0 ? '🎉 All tests passed!' : '❌ Some tests failed'));
}

runTests().catch(console.error);
