// controllers/imageController.js
const axios = require('axios');
const supabase = require('../supabaseClient');


exports.addReport = async (req, res) => {
  const { id: disaster_id } = req.params;
  const { user_id, content, image_url } = req.body;

  if (!user_id || !content || !image_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        disaster_id,
        user_id,
        content,
        image_url,
        verification_status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select();
        await supabase
      .from('cache')
      .delete()
      .eq('key', 'all_reports');
    if (error) throw error;

    console.log(`[REPORT] New report submitted for disaster ${disaster_id}`);
    return res.status(201).json({ message: 'Report submitted', data: data[0] });
  } catch (err) {
    console.error('Add report error:', err.message);
    return res.status(500).json({ error: 'Failed to add report' });
  }
};



exports.verifyReport = async (req, res) => {
  const { report_id } = req.params;

  try {
    // 1. Get report by ID
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', report_id)
      .single();

    if (reportError || !report) throw new Error('Report not found');

    const { disaster_id, content, image_url } = report;
    if (!disaster_id || !image_url || !content) {
      return res.status(400).json({ error: 'Incomplete report data' });
    }

    // 2. Get disaster for context
    const { data: disaster, error: disasterError } = await supabase
      .from('disasters')
      .select('title, description, location_name')
      .eq('id', disaster_id)
      .single();

    if (disasterError || !disaster) throw new Error('Disaster not found');

    const cacheKey = `verify:${report_id}`;
    const now = new Date();

    // 3. Check cache
    const { data: cached } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .maybeSingle();

    if (cached && new Date(cached.expires_at) > now) {
      console.log(`[CACHE] Image verification loaded from cache for report ${report_id}`);
      return res.json(cached.value);
    }

    const prompt = `Disaster Context: ${disaster.title}, ${disaster.description}, ${disaster.location_name}.
        User Report: ${content}.
        Analyze the image at this URL: ${image_url}.
        Does it depict a real disaster situation?
        Is it manipulated?
        Explain briefly.`;

    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    const analysis = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!analysis) throw new Error('Empty response from Gemini');

    const result = {
      image_url,
      analysis,
      report_id,
      verified_at: new Date().toISOString(),
    };

    // 6. Cache result
    await supabase.from('cache').upsert({
      key: cacheKey,
      value: result,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    // 7. Update report status
    await supabase
      .from('reports')
      .update({
        verification_status: 'verified',
      })
      .eq('id', report_id);

    console.log(`[VERIFY] Verified image for report ${report_id}`);
    return res.json(result);
  } catch (err) {
    console.error('Verification error:', err.message);
    return res.status(500).json({ error: 'Image verification failed' });
  }
};

exports.getReport=async (req, res) => {
  const cacheKey = 'all_reports';
  const now = new Date();

  try {
    // 1. Try to load from cache
    const { data: cached } = await supabase
      .from('cache')
      .select('value, expires_at')
      .eq('key', cacheKey)
      .maybeSingle();

    if (cached && new Date(cached.expires_at) > now) {
      console.log('[CACHE] Served reports from cache');
      return res.json(cached.value);
    }

    // 2. Load from Supabase DB if not cached or expired
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 3. Cache the new result
    await supabase.from('cache').upsert({
      key: cacheKey,
      value: data,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // cache for 1 hour
    });

    console.log('[REPORT] Fetched reports from DB and updated cache');
    return res.json(data);
  } catch (err) {
    console.error('Report fetch error:', err.message || err);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
}
