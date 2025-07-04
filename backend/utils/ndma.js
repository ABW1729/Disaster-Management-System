const cheerio = require('cheerio');
const supabase = require('../supabaseClient');
const axios = require('axios');



async function scrapeNDMANews() {
  const cacheKey = 'ndma:alerts';

  const { data: cached } = await supabase
    .from('cache')
    .select('value, expires_at')
    .eq('key', cacheKey)
    .maybeSingle();

  const now = new Date();
  if (cached && new Date(cached.expires_at) > now) {
    console.log('[CACHE] Serving  alerts from cache');
    return cached.value;
  }

  

  try {
    const { data: html } = await axios.get('https://www.fema.gov');
    const $ = cheerio.load(html);
    const alerts = [];

   $('div.wp-block-group .fema-heading').each((_, el) => {
      const heading = $(el).find('h3').first().text().trim();
      const description = $(el).next('p').text().trim(); 

      if (heading) {
        alerts.push({ heading, description });
      }
    });

 

    // 2. Cache result in Supabase for 1 hour
    await supabase.from('cache').upsert({
      key: cacheKey,
      value: alerts,
      expires_at: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    });
    
    console.log('[✅ NEWS] Fetched & cached');
    
    return alerts;
  } catch (err) {
    console.error('[❌ CHEERIO ERROR]', err.message);
    return [];
  }
}

module.exports = scrapeNDMANews;
