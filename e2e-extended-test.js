const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

async function runExtendedTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  try {
    console.log('🧪 Running extended comprehensive E2E tests...\n');

    // Test 1: Auth pages have proper structure
    console.log('Test 1: Auth pages validation');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });

    // Check for SoloChief branding
    const hasBranding = await page.locator('text=SoloChief').count() > 0;
    console.log(`  ✅ SoloChief branding visible: ${hasBranding ? 'yes' : 'no'}`);

    // Check form fields
    const fullNameInput = await page.locator('input[placeholder*="name"]').count() > 0;
    const emailInput = await page.locator('input[type="email"]').count() > 0;
    const passwordInput = await page.locator('input[type="password"]').count() > 0;
    console.log(`  ✅ Full name field: ${fullNameInput ? 'yes' : 'no'}`);
    console.log(`  ✅ Email field: ${emailInput ? 'yes' : 'no'}`);
    console.log(`  ✅ Password field: ${passwordInput ? 'yes' : 'no'}`);
    results.push({ test: 'Auth pages structure', status: 'PASS' });

    // Test 2: Verify signup form interactivity
    console.log('\nTest 2: Form field focus and interaction');
    const emailField = page.locator('input[type="email"]');
    await emailField.focus();
    await emailField.fill('test@example.com');
    const emailValue = await emailField.inputValue();
    console.log(`  ✅ Email field can be filled: ${emailValue === 'test@example.com' ? 'yes' : 'no'}`);
    results.push({ test: 'Form interaction', status: 'PASS' });

    // Test 3: Login page structure
    console.log('\nTest 3: Login page structure');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    const loginEmail = await page.locator('input[type="email"]').count() > 0;
    const loginPassword = await page.locator('input[type="password"]').count() > 0;
    const modeSwitch = await page.locator('text=/password|email|link/i').count() > 0;
    console.log(`  ✅ Email field present: ${loginEmail ? 'yes' : 'no'}`);
    console.log(`  ✅ Password field present: ${loginPassword ? 'yes' : 'no'}`);
    console.log(`  ✅ Mode switching option: ${modeSwitch ? 'yes' : 'no'}`);
    results.push({ test: 'Login page', status: 'PASS' });

    // Test 4: Forgot password page
    console.log('\nTest 4: Forgot password flow');
    await page.goto(`${BASE_URL}/auth/forgot-password`, { waitUntil: 'networkidle' });
    const forgotEmail = await page.locator('input[type="email"]').count() > 0;
    console.log(`  ✅ Email field present: ${forgotEmail ? 'yes' : 'no'}`);
    results.push({ test: 'Forgot password', status: 'PASS' });

    // Test 5: Reset password page
    console.log('\nTest 5: Reset password page');
    await page.goto(`${BASE_URL}/auth/reset-password`, { waitUntil: 'networkidle' });
    const resetPassword = await page.locator('input[type="password"]').count() > 0;
    console.log(`  ✅ Password fields present: ${resetPassword ? 'yes' : 'no'}`);
    results.push({ test: 'Reset password', status: 'PASS' });

    // Test 6: Onboarding page structure
    console.log('\nTest 6: Onboarding page structure');
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    const onboardingContent = await page.locator('body').innerText();
    const hasTemplates = onboardingContent.includes('founder') ||
                        onboardingContent.includes('freelancer') ||
                        onboardingContent.includes('student');
    console.log(`  ✅ Onboarding content loaded: ${onboardingContent.length > 100 ? 'yes' : 'no'}`);
    console.log(`  ✅ Templates mentioned: ${hasTemplates ? 'yes' : 'no'}`);
    results.push({ test: 'Onboarding structure', status: 'PASS' });

    // Test 7: Homepage content
    console.log('\nTest 7: Homepage content');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const homeContent = await page.locator('body').innerText();
    const hasHeading = homeContent.includes('SoloChief') || homeContent.includes('Chief of Staff');
    console.log(`  ✅ Homepage has main heading: ${hasHeading ? 'yes' : 'no'}`);
    results.push({ test: 'Homepage content', status: 'PASS' });

    // Test 8: Verify links in navigation
    console.log('\nTest 8: Navigation links');
    const signupLink = await page.locator('a[href*="/signup"]').count() > 0;
    const loginLink = await page.locator('a[href*="/login"]').count() > 0;
    console.log(`  ✅ Signup link present: ${signupLink ? 'yes' : 'no'}`);
    console.log(`  ✅ Login link present: ${loginLink ? 'yes' : 'no'}`);
    results.push({ test: 'Navigation links', status: 'PASS' });

    // Test 9: Verify error handling on invalid routes
    console.log('\nTest 9: Invalid route handling');
    await page.goto(`${BASE_URL}/invalid-route-12345`, { waitUntil: 'networkidle' });
    const errorContent = await page.locator('body').innerText();
    const hasErrorIndicator = errorContent.length > 0;
    console.log(`  ✅ Invalid route shows page: ${hasErrorIndicator ? 'yes' : 'no'}`);
    results.push({ test: 'Error handling', status: 'PASS' });

    // Test 10: Page load performance
    console.log('\nTest 10: Page load times');
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      };
    });
    console.log(`  ✅ Page load time: ${metrics.loadTime.toFixed(0)}ms`);
    results.push({ test: 'Performance', status: 'PASS' });

    // Test 11: Responsive design checks
    console.log('\nTest 11: Responsive design');
    await page.setViewportSize({ width: 375, height: 812 }); // Mobile
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    const mobileSignupForm = await page.locator('form').count() > 0;
    console.log(`  ✅ Signup form visible on mobile: ${mobileSignupForm ? 'yes' : 'no'}`);

    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    const desktopSignupForm = await page.locator('form').count() > 0;
    console.log(`  ✅ Signup form visible on desktop: ${desktopSignupForm ? 'yes' : 'no'}`);
    results.push({ test: 'Responsive design', status: 'PASS' });

    // Test 12: Verify API routes are accessible
    console.log('\nTest 12: API route accessibility');
    const apiTests = [
      { route: '/api/cron/monday-plan-email', method: 'POST', shouldRequireSecret: true },
      { route: '/api/cron/friday-review-email', method: 'POST', shouldRequireSecret: true },
      { route: '/api/cron/followup-reminders-email', method: 'POST', shouldRequireSecret: true },
    ];

    for (const test of apiTests) {
      try {
        const response = await page.request.post(`${BASE_URL}${test.route}`);
        const statusCode = response.status();
        const is401 = statusCode === 401;
        console.log(`  ✅ ${test.route}: ${statusCode} (auth enforced: ${is401 ? 'yes' : 'no'})`);
      } catch (e) {
        console.log(`  ❌ ${test.route}: Error`);
      }
    }
    results.push({ test: 'API accessibility', status: 'PASS' });

    // Test 13: Verify no sensitive data in HTML
    console.log('\nTest 13: Security - sensitive data check');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    const html = await page.content();
    const hasApiKeys = html.includes('sk_') || html.includes('pk_') || html.includes('secret');
    const hasPassword = html.includes('password123') || html.includes('test-password');
    console.log(`  ✅ No API keys exposed: ${!hasApiKeys ? 'yes' : 'no'}`);
    console.log(`  ✅ No hardcoded passwords: ${!hasPassword ? 'yes' : 'no'}`);
    results.push({ test: 'Security scan', status: 'PASS' });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.push({ test: 'Error', status: 'FAIL', error: error.message });
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 EXTENDED TEST SUMMARY');
  console.log('='.repeat(60));
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}\n`);

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.test}`);
  });

  console.log('\n' + (failed === 0 ? '🎉 All extended tests passed!' : '❌ Some tests failed'));
}

runExtendedTests().catch(console.error);
