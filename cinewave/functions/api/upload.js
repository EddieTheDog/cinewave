/**
 * CineWave Upload API — Cloudflare Pages Function
 * POST /api/upload  → get a presigned R2 URL for direct upload
 *
 * R2 binding required:
 *   [[r2_buckets]]
 *   binding = "VIDEOS"
 *   bucket_name = "cinewave-videos"
 */

export async function onRequest({ request, env }) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'POST only' }), { status: 405, headers });

  // Auth check
  const auth = request.headers.get('Authorization');
  if (auth !== 'Bearer ' + (env.ADMIN_SECRET || 'cinewave-admin')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
  }

  const { filename, contentType, folder = 'videos' } = await request.json();
  if (!filename) return new Response(JSON.stringify({ error: 'filename required' }), { status: 400, headers });

  const key = `${folder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const publicUrl = `https://pub-${env.R2_PUBLIC_ID || 'YOUR_BUCKET_ID'}.r2.dev/${key}`;

  if (env.VIDEOS) {
    // Create a multipart upload
    const upload = await env.VIDEOS.createMultipartUpload(key, {
      httpMetadata: { contentType: contentType || 'video/mp4' },
    });
    return new Response(JSON.stringify({
      success: true,
      uploadId: upload.uploadId,
      key,
      publicUrl,
      note: 'Use uploadId + key with R2 multipart upload API to upload chunks'
    }), { headers });
  }

  // Fallback when R2 not configured
  return new Response(JSON.stringify({
    success: true,
    key,
    publicUrl,
    note: 'R2 not configured — set up [[r2_buckets]] binding in wrangler.toml'
  }), { headers });
}
