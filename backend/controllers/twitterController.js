const axios = require('axios');
const supabase = require('../supabaseClient');

exports.getDisasterTweets = async (req, res) => {
  const { id: disaster_id } = req.params;
  if (!disaster_id) return res.status(400).json({ error: 'Missing disaster ID' });

  try {
    const { data: disaster, error } = await supabase
      .from('disasters')
      .select('id, title, description, location_name')
      .eq('id', disaster_id)
      .single();

    if (error || !disaster) throw new Error('Disaster not found');

    const keywords = [disaster.title, disaster.description, disaster.location_name]
      .filter(Boolean)
      .join(' OR ');

    const cacheKey = `tweets:${disaster_id}`;
    const now = new Date();

    const { data: cached } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .maybeSingle();

    let tweets = [];

    if (cached && new Date(cached.expires_at) > now) {
      console.log(`[CACHE] Using cached tweets for disaster ${disaster_id}`);
      tweets = cached.value;
    } else {
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
        params: {
          query: keywords,
          max_results: 10,
          'tweet.fields': 'author_id,text,created_at',
        },
        headers: { Authorization: `Bearer ${bearerToken}` },
      });

      tweets = response.data.data || [];

      await supabase.from('cache').upsert({
        key: cacheKey,
        value: tweets,
        expires_at: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
      });
    }

    // ✅ Emit initial tracking + tweets
    global.io.emit('start_tweet_tracking', {
      disaster_id,
      keywords,
      tweets,
    });

    return res.json(tweets);
  } catch (err) {
    console.error('Error fetching tweets:', err.message);
    return res.status(500).json({ error: 'Failed to fetch tweets' });
  }
};
