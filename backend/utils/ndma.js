const puppeteer = require('puppeteer');

async function scrapeNDMANews() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://sachet.ndma.gov.in/', { waitUntil: 'networkidle2' });

  try {
    // Wait for the tab button to appear
    await page.waitForSelector('button.MuiTab-root', { timeout: 10000 });

    // Click the button/tab with label "All India CAP Alert"
    const buttons = await page.$$('button.MuiTab-root');
    for (const btn of buttons) {
      const label = await btn.evaluate(el => el.innerText.trim());
      if (label.includes('All India CAP Alert')) {
        await btn.click();
        break;
      }
    }

    // Wait for the divs to load inside the news card container
    await page.waitForSelector('div.FooterLogo_cardMAP__pjpUv.FooterLogo_cardMAP2__2u9zC > div', {
      timeout: 10000,
    });

    // Extract the news items
    const news = await page.$$eval(
      'div.FooterLogo_cardMAP__pjpUv.FooterLogo_cardMAP2__2u9zC > div',
      divs => divs.map(div => div.textContent.trim()).filter(text => text)
    );
     const structured = [];
    for (let i = 0; i < news.length - 1; i += 2) {
    structured.push({
        type: news[i],
        location: news[i + 1],
    });
    }
    console.log('[✅ NDMA NEWS]', structured);
    await browser.close();
    return structured;
  } catch (err) {
    console.error('[❌ ERROR]', err.message);
    await browser.close();
    return [];
  }
}

// Run
module.exports=scrapeNDMANews;
