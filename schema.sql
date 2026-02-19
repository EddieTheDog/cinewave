-- CineWave D1 Database Schema
-- Run: npx wrangler d1 execute cinewave-db --file=./schema.sql

CREATE TABLE IF NOT EXISTS catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('movie', 'series')),
  genre TEXT,
  year INTEGER,
  rating TEXT,
  dur TEXT,
  seasons INTEGER DEFAULT 1,
  badge TEXT,
  description TEXT,
  video_url TEXT,
  trailer_url TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  episodes_json TEXT DEFAULT '[]',
  color TEXT DEFAULT '#111111',
  status TEXT DEFAULT 'live' CHECK(status IN ('live', 'draft', 'archived')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS episodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  catalog_id INTEGER NOT NULL REFERENCES catalog(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 1,
  episode INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'live',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trailers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  catalog_id INTEGER NOT NULL REFERENCES catalog(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Official Trailer',
  url TEXT NOT NULL,
  type TEXT DEFAULT 'youtube' CHECK(type IN ('youtube', 'r2', 'external')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample seed data
INSERT INTO catalog (title, type, genre, year, rating, seasons, badge, description, color, status) VALUES
  ('Dark Matter', 'series', 'scifi', 2024, '8.7', 1, 'NEW', 'A physicist wakes in an alternate version of his life, navigating infinite parallel realities.', '#1a1040', 'live'),
  ('Dune: Part Two', 'movie', 'scifi', 2024, '8.8', NULL, '4K', 'Paul Atreides unites with the Fremen on a path of revenge against the conspirators who destroyed his family.', '#2a1800', 'live'),
  ('Shogun', 'series', 'drama', 2024, '9.0', 1, 'TOP 10', 'A shipwrecked English navigator becomes a key player in feudal Japanese power struggles.', '#1a0a0a', 'live'),
  ('The Bear', 'series', 'drama', 2024, '8.8', 3, NULL, 'A young chef comes home to run his family sandwich shop in Chicago.', '#0a1a0a', 'live'),
  ('Fallout', 'series', 'scifi', 2024, '8.5', 1, 'NEW', 'A young woman leaves her underground vault and ventures into the post-apocalyptic world.', '#1a1200', 'live');

-- Sample episodes for first series
INSERT INTO episodes (catalog_id, season, episode, title, duration) VALUES
  (1, 1, 1, 'Are You Happy in Your Life?', '54min'),
  (1, 1, 2, 'Trip of a Lifetime', '48min'),
  (1, 1, 3, 'The Box', '52min');
