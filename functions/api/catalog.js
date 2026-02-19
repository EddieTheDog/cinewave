/**
 * CineWave API — Cloudflare Pages Functions
 * GET /api/catalog   → list all content
 * POST /api/catalog  → add new content (admin)
 * PUT /api/catalog   → update content
 * DELETE /api/catalog → delete content
 *
 * Bindings needed in wrangler.toml:
 *   [[d1_databases]]
 *   binding = "DB"
 *   database_name = "cinewave-db"
 *   database_id = "<your-d1-database-id>"
 *
 *   [[r2_buckets]]
 *   binding = "VIDEOS"
 *   bucket_name = "cinewave-videos"
 */

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const method = request.method;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') return new Response(null, { headers });

  // ===== INIT DB =====
  if (env.DB) {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS catalog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        genre TEXT,
        year INTEGER,
        rating TEXT,
        dur TEXT,
        seasons INTEGER,
        badge TEXT,
        description TEXT,
        video_url TEXT,
        trailer_url TEXT,
        poster_url TEXT,
        backdrop_url TEXT,
        episodes_json TEXT,
        status TEXT DEFAULT 'live',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
  }

  try {
    // GET /api/catalog
    if (method === 'GET') {
      const type = url.searchParams.get('type');
      const genre = url.searchParams.get('genre');
      const search = url.searchParams.get('q');
      const id = url.searchParams.get('id');

      if (env.DB) {
        let query = 'SELECT * FROM catalog WHERE status = "live"';
        const params = [];
        if (type) { query += ' AND type = ?'; params.push(type); }
        if (genre) { query += ' AND genre = ?'; params.push(genre); }
        if (search) { query += ' AND title LIKE ?'; params.push('%' + search + '%'); }
        if (id) { query += ' AND id = ?'; params.push(id); }
        query += ' ORDER BY created_at DESC LIMIT 100';

        const { results } = await env.DB.prepare(query).bind(...params).all();
        const data = results.map(r => ({
          ...r,
          episodes: r.episodes_json ? JSON.parse(r.episodes_json) : []
        }));
        return new Response(JSON.stringify({ success: true, data }), { headers });
      } else {
        // No DB — return empty (frontend uses localStorage)
        return new Response(JSON.stringify({ success: true, data: [], note: 'No D1 database configured' }), { headers });
      }
    }

    // POST /api/catalog — add content
    if (method === 'POST') {
      const auth = request.headers.get('Authorization');
      if (auth !== 'Bearer ' + (env.ADMIN_SECRET || 'cinewave-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
      }

      const body = await request.json();
      if (!body.title || !body.type) {
        return new Response(JSON.stringify({ error: 'title and type are required' }), { status: 400, headers });
      }

      if (env.DB) {
        const result = await env.DB.prepare(`
          INSERT INTO catalog (title, type, genre, year, rating, dur, seasons, badge, description, video_url, trailer_url, poster_url, backdrop_url, episodes_json, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          body.title, body.type, body.genre || null, body.year || null,
          body.rating || null, body.dur || null, body.seasons || null,
          body.badge || null, body.desc || null, body.videoUrl || null,
          body.trailerUrl || null, body.posterUrl || null, body.backdropUrl || null,
          JSON.stringify(body.episodes || []), body.status || 'live'
        ).run();

        return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { headers });
      }
      return new Response(JSON.stringify({ success: true, note: 'No DB — item would be saved here' }), { headers });
    }

    // PUT /api/catalog — update
    if (method === 'PUT') {
      const auth = request.headers.get('Authorization');
      if (auth !== 'Bearer ' + (env.ADMIN_SECRET || 'cinewave-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
      }
      const body = await request.json();
      if (!body.id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers });

      if (env.DB) {
        await env.DB.prepare(`
          UPDATE catalog SET title=?, genre=?, year=?, rating=?, dur=?, badge=?, description=?, video_url=?, trailer_url=?, poster_url=?, episodes_json=?, status=? WHERE id=?
        `).bind(
          body.title, body.genre, body.year, body.rating, body.dur, body.badge,
          body.desc, body.videoUrl, body.trailerUrl, body.posterUrl,
          JSON.stringify(body.episodes || []), body.status || 'live', body.id
        ).run();
      }
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // DELETE /api/catalog
    if (method === 'DELETE') {
      const auth = request.headers.get('Authorization');
      if (auth !== 'Bearer ' + (env.ADMIN_SECRET || 'cinewave-admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
      }
      const id = url.searchParams.get('id');
      if (!id) return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers });

      if (env.DB) {
        await env.DB.prepare('DELETE FROM catalog WHERE id = ?').bind(id).run();
      }
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
