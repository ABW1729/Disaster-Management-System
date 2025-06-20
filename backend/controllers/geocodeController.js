// controllers/geocodeController.js
const axios = require('axios');
require('dotenv').config();

exports.geocodeFromDescription = async (req, res) => {
  const { description } = req.body;

  if (!description) return res.status(400).json({ error: 'Missing description' });

  try {
    const prompt = `Extract the location name from this disaster description:\n"${description}"\nRespond with only the location name.`;

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

    const rawLocation = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawLocation) throw new Error('Gemini could not extract location');

    console.log(`[GEMINI] Extracted location: "${rawLocation}"`);

    const mapboxRes = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(rawLocation)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          limit: 1,
        },
      }
    );

    const feature = mapboxRes.data.features?.[0];
    if (!feature) throw new Error('No coordinates found');

    const [lng, lat] = feature.center;

    return res.json({
      extracted_location: rawLocation,
      lat,
      lng,
    });
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return res.status(500).json({ error: 'Failed to geocode location' });
  }
};
