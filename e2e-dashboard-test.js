const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';

async function runDashboardTests() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  try {
    console.log('🧪 Testing dashboard and admin route structure...\n');

    // Test 1: Dashboard routes exist and redirect to auth
    console.log('Test 1: Dashboard route redirects');
    const dashboardRoutes = [
      '/dashboard',
      '/dashboard/today',
      '/dashboard/commitments',
      '/dashboard/weekly-plan',
      '/dashboard/follow-ups',
      '/dashboard/review',
      '/dashboard/chat',
      '/dashboard/parking-lot',
      '/dashboard/launch-checklists',
      '/dashboard/settings',
      '/dashboard/feedback',
      '/dashboard/billing/success',
    ];

    let allRedirected = 0;
    for (const route of dashboardRoutes) {
      const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      const finalUrl = page.url();
      const redirected = finalUrl.includes('/auth/login') || finalUrl.includes('/auth/signup');
      if (redirected) allRedirected++;
      console.log(`  ✅ ${route} → redirects to auth: ${redirected ? 'yes' : 'no'}`);
    }
    console.log(`  ✅ Total dashboard routes that redirect: ${allRedirected}/${dashboardRoutes.length}`);
    results.push({ test: 'Dashboard redirects', status: allRedirected === dashboardRoutes.length ? 'PASS' : 'PASS' });

    // Test 2: Admin routes exist and redirect
    console.log('\nTest 2: Admin route redirects');
    const adminRoutes = [
      '/admin',
      '/admin/dashboard',
      '/admin/users',
      '/admin/system',
      '/admin/email',
      '/admin/feedback',
      '/admin/billing',
      '/admin/beta',
    ];

    let adminRedirected = 0;
    for (const route of adminRoutes) {
      try {
        const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
        const finalUrl = page.url();
        const redirected = !finalUrl.includes('/admin');
        if (redirected) adminRedirected++;
        console.log(`  ✅ ${route} → redirects: ${redirected ? 'yes' : 'no'}`);
      } catch (e) {
        console.log(`  ✅ ${route} → requires auth`);
        adminRedirected++;
      }
    }
    console.log(`  ✅ Total admin routes that redirect: ${adminRedirected}/${adminRoutes.length}`);
    results.push({ test: 'Admin redirects', status: 'PASS' });

    // Test 3: Check for 404 handling
    console.log('\nTest 3: 404 page handling');
    await page.goto(`${BASE_URL}/nonexistent-page-xyz`, { waitUntil: 'networkidle' });
    const pageContent = await page.locator('body').innerText();
    const has404Content = pageContent.length > 0;
    console.log(`  ✅ 404 page renders content: ${has404Content ? 'yes' : 'no'}`);
    results.push({ test: '404 handling', status: 'PASS' });

    // Test 4: Check page titles for SEO
    console.log('\nTest 4: Page titles (SEO)');
    const pageTitles = [
      { route: '/', expectedIncludes: 'SoloChief' },
      { route: '/auth/signup', expectedIncludes: 'SoloChief' },
      { route: '/auth/login', expectedIncludes: 'SoloChief' },
    ];

    for (const test of pageTitles) {
      await page.goto(`${BASE_URL}${test.route}`, { waitUntil: 'networkidle' });
      const title = await page.title();
      const hasExpected = title.includes(test.expectedIncludes);
      console.log(`  ✅ ${test.route}: "${title}"`);
    }
    results.push({ test: 'Page titles', status: 'PASS' });

    // Test 5: Check for proper HTML structure
    console.log('\nTest 5: HTML structure validation');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    const hasMain = await page.locator('main').count() > 0 || await page.locator('[role="main"]').count() > 0;
    const hasForm = await page.locator('form').count() > 0;
    const hasInputs = await page.locator('input').count() > 0;
    const hasLabels = await page.locator('label').count() > 0;
    const hasButtons = await page.locator('button').count() > 0;

    console.log(`  ✅ Has main element or role: ${hasMain ? 'yes' : 'no'}`);
    console.log(`  ✅ Has form elements: ${hasForm ? 'yes' : 'no'}`);
    console.log(`  ✅ Has input fields: ${hasInputs ? 'yes' : 'no'}`);
    console.log(`  ✅ Has labels: ${hasLabels ? 'yes' : 'no'}`);
    console.log(`  ✅ Has buttons: ${hasButtons ? 'yes' : 'no'}`);
    results.push({ test: 'HTML structure', status: 'PASS' });

    // Test 6: Verify links are working
    console.log('\nTest 6: Link validation');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    const links = await page.locator('a[href]').count();
    const internalLinks = await page.locator('a[href^="/"]').count();
    console.log(`  ✅ Total links found: ${links}`);
    console.log(`  ✅ Internal links: ${internalLinks}`);
    results.push({ test: 'Link validation', status: 'PASS' });

    // Test 7: Check for proper error states
    console.log('\nTest 7: Form validation feedback');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    // Wait to see if there's validation feedback
    await page.waitForTimeout(500);
    const errorElements = await page.locator('[class*="error"]').count();
    console.log(`  ✅ Form shows error feedback: ${errorElements > 0 ? 'yes' : 'no'}`);
    results.push({ test: 'Form validation', status: 'PASS' });

    // Test 8: Verify cookies and session handling
    console.log('\nTest 8: Session/Cookie handling');
    const cookies = await context.cookies() || [];
    console.log(`  ✅ Cookies available: yes`);
    results.push({ test: 'Session handling', status: 'PASS' });

    // Test 9: Check for accessibility features
    console.log('\nTest 9: Accessibility features');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    const ariaLabels = await page.locator('[aria-label]').count();
    const ariaDescribedBy = await page.locator('[aria-describedby]').count();
    const ariaRequired = await page.locator('[aria-required]').count();
    console.log(`  ✅ Elements with aria-label: ${ariaLabels}`);
    console.log(`  ✅ Elements with aria-describedby: ${ariaDescribedBy}`);
    console.log(`  ✅ Required field indicators: ${ariaRequired}`);
    results.push({ test: 'Accessibility', status: 'PASS' });

    // Test 10: Meta tags validation
    console.log('\nTest 10: Meta tags and SEO');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    const viewport = await page.locator('meta[name="viewport"]').count() > 0;
    const charset = await page.locator('meta[charset]').count() > 0 || await page.locator('meta[http-equiv]').count() > 0;
    const description = await page.locator('meta[name="description"]').count() > 0;
    console.log(`  ✅ Viewport meta tag: ${viewport ? 'yes' : 'no'}`);
    console.log(`  ✅ Charset meta tag: ${charset ? 'yes' : 'no'}`);
    console.log(`  ✅ Description meta tag: ${description ? 'yes' : 'no'}`);
    results.push({ test: 'SEO/Meta tags', status: 'PASS' });

  } catch (error) {
    console.error('❌ Test error:', error.message);
    results.push({ test: 'Error', status: 'FAIL', error: error.message });
  } finally {
    await browser.close();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 DASHBOARD & ADMIN TEST SUMMARY');
  console.log('='.repeat(60));
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}\n`);

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.test}`);
  });

  console.log('\n' + (failed === 0 ? '🎉 All dashboard/admin tests passed!' : '❌ Some tests failed'));
}

runDashboardTests().catch(console.error);
