const supabase = require('../supabaseClient');

exports.createDisaster = async (req, res) => {
  const {
    title,
    location_name,
    description,
    tags = [],
    owner_id = 'netrunnerX',
  } = req.body;

  try {
    const { lat, lng } = req.body;

    if (!title || !location_name || !description || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const location = `SRID=4326;POINT(${lng} ${lat})`;

    const { data, error } = await supabase.from('disasters').insert([
      {
        title,
        location_name,
        description,
        tags,
        location,
        owner_id,
        audit_trail: [
          {
            action: 'create',
            user_id: owner_id,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ]).select();

    if (error) {
      console.error('Supabase insert error:', error.message || error);
      return res.status(500).json({ error: 'Supabase insert failed' });
    }

    if (data && data[0]) {
     global.io.emit('disaster_updated', data[0]);
    }

    console.log(`[CREATE] Disaster created: ${title} @ ${location_name} by ${owner_id}`);
    return res.status(201).json({ message: 'Disaster created', data: data[0] });
  } catch (err) {
    console.error('Error creating disaster:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getDisasters = async (req, res) => {
  const { tag } = req.query;

  try {
  let query = supabase
  .from('disasters_with_coords')
  .select('*')
  .order('created_at', { ascending: false });


    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ disasters: data });
  } catch (err) {
    console.error('Error fetching disasters:', err.message);
    return res.status(500).json({ error: 'Failed to fetch disasters' });
  }
};

exports.updateDisaster = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const user = updates.owner_id || 'netrunnerX';

  try {
    updates.audit_trail = [
      {
        action: 'update',
        user_id: user,
        timestamp: new Date().toISOString(),
      },
    ];

    const { data, error } = await supabase
      .from('disasters')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    global.io.emit('disaster_updated', data[0]);

    console.log(`[UPDATE] Disaster updated: ${id} by ${user}`);
    return res.json({ message: 'Disaster updated', data: data[0] });
  } catch (err) {
    console.error('Update error:', err.message);
    return res.status(500).json({ error: 'Failed to update disaster' });
  }
};


exports.deleteDisaster = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('disasters')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    global.io.emit('disaster_updated', data[0]);

    console.log(`[DELETE] Disaster deleted: ${id}`);
    return res.json({ message: 'Disaster deleted', data: data[0] });
  } catch (err) {
    console.error('Delete error:', err.message);
    return res.status(500).json({ error: 'Failed to delete disaster' });
  }
};
