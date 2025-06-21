// controllers/resourceController.js
const supabase = require('../supabaseClient');
const axios = require('axios');
exports.getNearbyResources = async (req, res) => {
  const { id } = req.params;
  const { lat, lon, radius } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }

  const radiusInMeters = radius ? parseFloat(radius) : 10000; 

  try {
  

    const { data, error } = await supabase.rpc('get_nearby_resources', {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      radius: parseFloat(radiusInMeters),
    });

    if (error) throw error;
     global.io.emit('start_tracking', {id,radiusInMeters});
    console.log(`[RESOURCE] Found ${data.length} resources near disaster ${id}`);
    return res.json({ nearby_resources: data });
  } catch (err) {
    console.error('Resource lookup error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch nearby resources' });
  }
};

exports.addResource = async (req, res) => {
  const { disasterId } = req.params;
  const { name, location_name, type } = req.body;
  const disaster_id= disasterId;
  if (!name || !location_name || !type || !disaster_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const geoResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: location_name,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'disaster-response-platform/1.0 (your@email.com)',
      },
    });

    const geo = geoResponse.data[0];
    if (!geo) {
      return res.status(400).json({ error: 'Could not geocode location name' });
    }

    const lat = parseFloat(geo.lat);
    const lng = parseFloat(geo.lon);
    const location = `SRID=4326;POINT(${lng} ${lat})`;

    const { data, error } = await supabase
      .from('resources')
      .insert([{
        disaster_id,
        name,
        location_name,
        type,
        location,
        created_at: new Date().toISOString(),
      }])
      .select();

    if (error) throw error;

    global.io.emit('resources_added', { disaster_id, resource: data[0] });

    console.log(`[RESOURCE] Added: ${name} for disaster ${disaster_id}`);
    return res.status(201).json({ message: 'Resource added', data: data[0] });
  } catch (err) {
    console.error('Resource add error:', err.message);
    return res.status(500).json({ error: 'Failed to add resource' });
  }
};
