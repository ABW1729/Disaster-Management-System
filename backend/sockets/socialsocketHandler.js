const tweetIntervals = new Map();

module.exports=function socialSocketListeners(socket,io) {
  io.on('connection', (socket) => {
    console.log('[SOCKET] Connected');

    socket.on('start_tweet_tracking', async ({ disaster_id, keywords }) => {
      if (tweetIntervals.has(disaster_id)) return;

      const cacheKey = `tweets:${disaster_id}`;

      const fetchAndEmitIfStale = async () => {
        try {
          const now = new Date();
          const { data: cached } = await supabase
            .from('cache')
            .select('value, expires_at')
            .eq('key', cacheKey)
            .maybeSingle();

          if (cached && new Date(cached.expires_at) > now) {
            console.log(`[CACHE] Skipping fetch, still fresh for ${disaster_id}`);
            return;
          }

          const bearerToken = process.env.TWITTER_BEARER_TOKEN;
          const res = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
            params: {
              query: keywords,
              max_results: 10,
              'tweet.fields': 'author_id,text,created_at',
            },
            headers: { Authorization: `Bearer ${bearerToken}` },
          });

          const tweets = res.data.data || [];

          await supabase.from('cache').upsert({
            key: cacheKey,
            value: tweets,
            expires_at: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
          });

          io.emit('social_media_updated', {
            disaster_id,
            posts: tweets,
          });

          console.log(`[SOCKET] Emitted ${tweets.length} tweets for ${disaster_id}`);
        } catch (err) {
          console.error('[SOCKET ERROR]', err.message);
        }
      };

      // Run once immediately to warm-up (in case cache is missing)
      await fetchAndEmitIfStale();

      const interval = setInterval(fetchAndEmitIfStale, 5 * 60 * 1000);
      tweetIntervals.set(disaster_id, interval);
    });
  });
}

