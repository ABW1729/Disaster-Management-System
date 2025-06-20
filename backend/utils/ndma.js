const puppeteer = require('puppeteer');
const supabase = require('../supabaseClient');

const getBrowser = async () => {
  if (process.env.BROWSER_WS_ENDPOINT) {
    return await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSER_WS_ENDPOINT,
    });
  } else {
    return await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
};

async function scrapeNDMANews() {
  const cacheKey = 'ndma:alerts';

  // 1. Check Supabase cache
  const { data: cached } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', cacheKey)
    .maybeSingle();

  const now = new Date();
  if (cached && new Date(cached.expires_at) > now) {
    console.log('[CACHE] Serving NDMA alerts from cache');
    return cached.value;
  }

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto('https://sachet.ndma.gov.in/', { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('button.MuiTab-root', { timeout: 15000 });
    const buttons = await page.$$('button.MuiTab-root');

    for (const btn of buttons) {
      const label = await btn.evaluate(el => el.innerText.trim());
      if (label.includes('All India CAP Alert')) {
        await btn.click();
        break;
      }
    }

    await page.waitForSelector('div.FooterLogo_cardMAP__pjpUv.FooterLogo_cardMAP2__2u9zC > div', {
      timeout: 15000,
    });

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

    // 2. Cache result in Supabase for 1 hour
    await supabase.from('cache').upsert({
      key: cacheKey,
      value: structured,
      expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    });

    console.log('[✅ NDMA NEWS] Fetched & cached');
    await browser.close();
    return structured;
  } catch (err) {
    console.error('[❌ NDMA SCRAPER ERROR]', err.message);
    await browser.close();
    return [];
  }
}

module.exports = scrapeNDMANews;
