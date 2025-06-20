// controllers/updateController.js
const scrapeNDMANews = require('../utils/ndma');
const supabase = require('../supabaseClient'); // make sure this is imported
exports.getNDMAUpdates = async (req, res) => {
  const cacheKey = `ndma_updates`;
  const now = new Date();

  try {
    const { data: cached } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .maybeSingle();

    if (cached && new Date(cached.expires_at) > now) {
      console.log('[CACHE] Serving NDMA updates from cache');
      return res.json(cached.value);
    }

    // 2. Scrape live data
    const updates = await scrapeNDMANews();
    console.log(updates);
    if (!updates.length) {
      return res.status(404).json({ error: 'No NDMA updates found' });
    }

    // 3. Save to cache
    await supabase.from('cache').upsert({
      key: cacheKey,
      value: updates,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min TTL
    });


    return res.json(updates);
  } catch (err) {
    console.error('[NDMA UPDATES ERROR]', err.message);
    return res.status(500).json({ error: 'Failed to fetch NDMA updates' });
  }
};
