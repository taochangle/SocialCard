import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS trending_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    keywords TEXT,
    username TEXT,
    stars TEXT,
    starsToday TEXT,
    url TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS project_summaries (
    title TEXT PRIMARY KEY,
    aiSummary TEXT,
    aiKeywords TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS global_state (
    date TEXT PRIMARY KEY,
    summary TEXT,
    hashtags TEXT
  );

  CREATE TABLE IF NOT EXISTS platform_sessions (
    platform TEXT PRIMARY KEY,
    state TEXT
  );
`);

export default db;
