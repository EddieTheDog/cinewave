# 🎬 CineWave — Streaming Platform

A Netflix-style streaming platform built with vanilla HTML/CSS/JS, deployed on **Cloudflare Pages** with **D1** (database), **R2** (video storage), and auto-deploy from **GitHub**.

---

## 📁 Project Structure

```
cinewave/
├── index.html              ← Main streaming frontend (Netflix-like)
├── admin.html              ← Admin panel (upload & manage content)
├── functions/
│   └── api/
│       ├── catalog.js      ← CRUD API for content (D1 database)
│       └── upload.js       ← R2 presigned upload URLs
├── schema.sql              ← D1 database schema + seed data
├── wrangler.toml           ← Cloudflare config
├── cors.json               ← R2 CORS rules
├── package.json
├── public/
│   ├── _headers            ← Cloudflare security headers
│   └── _redirects          ← URL redirects
└── .github/
    └── workflows/
        └── deploy.yml      ← Auto-deploy to Cloudflare on push
```

---

## 🚀 Quick Setup

### 1. Create GitHub Repository

```bash
git init
git add .
git commit -m "Initial CineWave commit"
git remote add origin https://github.com/YOUR_USERNAME/cinewave.git
git push -u origin main
```

### 2. Install Wrangler

```bash
npm install
npx wrangler login
```

### 3. Create Cloudflare D1 Database

```bash
npm run db:create
# Copy the database_id from the output
# Paste it into wrangler.toml → database_id
```

### 4. Create R2 Bucket for Videos

```bash
npm run r2:create
npm run r2:cors
# Enable public access in Cloudflare Dashboard → R2 → cinewave-videos → Settings → Public Access
# Copy the Public URL domain (e.g. pub-abc123.r2.dev)
# Paste it into wrangler.toml → R2_PUBLIC_ID
```

### 5. Apply Database Schema

```bash
npm run db:init
```

### 6. Set Admin Secret

```bash
npx wrangler secret put ADMIN_SECRET
# Enter a strong password when prompted
```

### 7. Deploy to Cloudflare Pages

```bash
npm run deploy
```

### 8. Connect GitHub for Auto-Deploy

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Select your **cinewave** project → **Settings** → **Git Integration**
3. Connect your GitHub repo

### 9. Add GitHub Secrets

In your GitHub repo → **Settings** → **Secrets and variables** → **Actions**:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token (with Pages + D1 + R2 permissions) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

---

## 🎬 Using the Admin Panel

Visit `https://your-site.pages.dev/admin` (or `/admin.html`)

### Upload a Movie
1. Click **Upload Movie** in sidebar
2. Fill in title, genre, year, rating, description
3. Drag & drop the movie file → uploads to R2
4. Drag & drop or paste YouTube URL for trailer
5. Upload poster and backdrop images
6. Click **🚀 Publish Movie**

### Upload a Series
1. Click **Upload Series** in sidebar
2. Fill in show details and set number of seasons
3. Add episodes per season with titles and durations
4. Upload trailer and poster
5. Click **🚀 Publish Series**

### Manage Seasons & Episodes
- Use **Seasons & Episodes** in sidebar to add/edit episodes for existing series
- Upload individual episode video files per episode

### Upload a Standalone Trailer
- Use **Upload Trailer** to attach trailers to existing titles
- Supports YouTube URLs or direct file upload

---

## 🏗️ Architecture

```
Browser → Cloudflare Pages (Edge CDN)
              ↓
         Pages Functions (API)
              ↓           ↓
         D1 Database    R2 Bucket
         (metadata)     (video files)
```

- **Frontend**: Static HTML/CSS/JS served from Cloudflare's global CDN
- **API**: Cloudflare Pages Functions (serverless, runs at the edge)
- **Database**: Cloudflare D1 (SQLite at the edge) — stores all show/movie metadata
- **Storage**: Cloudflare R2 (S3-compatible) — stores video files, posters, trailers
- **CI/CD**: GitHub Actions → auto-deploys on every push to `main`

---

## 🔧 API Reference

### GET /api/catalog
Returns all published content.

Query params:
- `type=movie|series`
- `genre=action|drama|scifi|...`
- `q=search+term`
- `id=123`

### POST /api/catalog
Add new content. Requires `Authorization: Bearer YOUR_ADMIN_SECRET`.

### PUT /api/catalog
Update content. Requires auth.

### DELETE /api/catalog?id=123
Delete content. Requires auth.

### POST /api/upload
Get a presigned R2 upload URL. Requires auth.

Body: `{ "filename": "movie.mp4", "contentType": "video/mp4", "folder": "movies" }`

---

## 📺 Features

- ✅ Netflix-like homepage with hero banner, categorized rows
- ✅ Continue Watching section with progress bars
- ✅ Genre filtering and search
- ✅ Movie/episode detail modal with video player
- ✅ YouTube & direct video file support
- ✅ My List functionality
- ✅ Full admin panel with content management
- ✅ Movie uploader with drag & drop
- ✅ Series uploader with season/episode builder
- ✅ Trailer manager
- ✅ Cloudflare D1 database backend
- ✅ Cloudflare R2 video storage
- ✅ GitHub → Cloudflare Pages auto-deploy
- ✅ Edge-deployed API (Pages Functions)

---

## 💡 Customization

### Rename from CineWave
Search and replace `CineWave` / `cinewave` in all files.

### Add Authentication
Consider adding Cloudflare Access in front of `/admin.html` for production security:
- Dashboard → Zero Trust → Access → Applications → Add an application

### Custom Domain
- Cloudflare Pages → your project → **Custom domains** → Add domain

---

## 📄 License

MIT — build whatever you want with this!
