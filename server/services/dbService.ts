import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path relative to project root
const dbPath = path.resolve(__dirname, '../../data.db');
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
    avatarUrl TEXT,
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

export const dbService = {
  getProjectsByDate(date: string) {
    return db.prepare(`
      SELECT tp.*, ps.aiSummary, ps.aiKeywords 
      FROM trending_projects tp
      LEFT JOIN project_summaries ps ON tp.title = ps.title
      WHERE tp.date = ?
      ORDER BY tp.id ASC
    `).all(date);
  },

  getGlobalStateByDate(date: string) {
    return db.prepare("SELECT * FROM global_state WHERE date = ?").get(date) as any;
  },

  saveTrendingProjects(date: string, projects: any[]) {
    const deleteStmt = db.prepare("DELETE FROM trending_projects WHERE date = ?");
    const insertStmt = db.prepare(`
      INSERT INTO trending_projects (title, content, keywords, username, stars, starsToday, url, avatarUrl, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((data) => {
      deleteStmt.run(date);
      for (const item of data) {
        insertStmt.run(item.title, item.content, item.keywords, item.username, item.stars, item.starsToday, item.url, item.avatarUrl || "", date);
      }
    });
    transaction(projects);
  },

  saveProjectSummary(title: string, summary: string, keywords: string, date: string) {
    db.prepare(`
      INSERT INTO project_summaries (title, aiSummary, aiKeywords, date)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(title) DO UPDATE SET
        aiSummary = excluded.aiSummary,
        aiKeywords = excluded.aiKeywords,
        date = excluded.date
    `).run(title, summary, keywords, date);
  },

  saveGlobalState(date: string, summary: string, hashtags: string) {
    db.prepare(`
      INSERT INTO global_state (date, summary, hashtags)
      VALUES (?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        summary = excluded.summary,
        hashtags = excluded.hashtags
    `).run(date, summary, hashtags);
  },

  getPlatformSession(platform: string) {
    return db.prepare("SELECT * FROM platform_sessions WHERE platform = ?").get(platform) as any;
  },

  savePlatformSession(platform: string, state: string) {
    db.prepare(`
      INSERT INTO platform_sessions (platform, state)
      VALUES (?, ?)
      ON CONFLICT(platform) DO UPDATE SET state = excluded.state
    `).run(platform, state);
  }
};

export default db;
