const supabase = require('../supabaseClient');

module.exports = function resourceSocketHandler(socket, io) {
  const activeDisasters = new Map(); 

  socket.on('start_tracking', async (payload) => {
    const { disaster_id,radiusInMeters } = payload;

    const { data: disaster, error } = await supabase
      .from('disasters_with_coords')
      .select('lat, lon')
      .eq('id', disaster_id)
      .single();

    if (error || !disaster) {
      console.error(`[TRACK] Disaster not found: ${disaster_id}`);
      return;
    }

    const lat = disaster.lat;
    const lon = disaster.lon;
    activeDisasters.set(disaster_id, { lat, lon }); 

    const { data: nearby, error: nearbyError } = await supabase.rpc('get_nearby_resources', {
      lat,
      lon,
      radius:radiusInMeters,
    });

    if (nearbyError) {
      console.error('Nearby fetch error:', nearbyError.message);
      return;
    }

    socket.emit('nearby_fetched', {
      disaster_id,
      data: nearby,
    });

    console.log(`[SOCKET] Tracking started for disaster ${disaster_id}`);
  });

  socket.on('resource_added', async ({ disaster_id, resource }) => {
    const tracked = activeDisasters.get(disaster_id);
    if (!tracked) return;

    const { lat, lon } = tracked;

    // Check if the new resource is within 10km
    const { data: nearby, error } = await supabase.rpc('get_nearby_resources', {
      lat,
      lon,
      radius:radiusInMeters,
    });

    if (error) {
      console.error('[SOCKET] Resource update failed:', error.message);
      return;
    }

    socket.emit('nearby_fetched', {
      disaster_id,
      data: nearby,
    });

    console.log(`[SOCKET] Resource update emitted for disaster ${disaster_id}`);
  });
}