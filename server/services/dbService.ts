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
  CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    username TEXT,
    stars TEXT,
    starsToday TEXT,
    url TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS project_meta (
    title TEXT PRIMARY KEY,
    avatarUrl TEXT,
    topics TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS project_summaries (
    title TEXT PRIMARY KEY,
    aiSummary TEXT,
    aiKeywords TEXT,
    date TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_summaries (
    date TEXT PRIMARY KEY,
    summary TEXT,
    hashtags TEXT
  );

  CREATE TABLE IF NOT EXISTS platform_sessions (
    platform TEXT PRIMARY KEY,
    state TEXT
  );
`);

// Lightweight migrations: add columns if missing (better-sqlite3 has no ALTER IF NOT EXISTS)
function ensureColumn(table: string, column: string, ddl: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

ensureColumn("project_summaries", "aiSummaryEn", "aiSummaryEn TEXT");
ensureColumn("project_summaries", "aiKeywordsEn", "aiKeywordsEn TEXT");
ensureColumn("project_summaries", "readme", "readme TEXT");
ensureColumn("daily_summaries", "summaryEn", "summaryEn TEXT");
ensureColumn("daily_summaries", "hashtagsEn", "hashtagsEn TEXT");

export const dbService = {
  getProjectsByDate(date: string) {
    return db.prepare(`
      SELECT 
        r.*, 
        m.avatarUrl, m.topics as keywords,
        s.aiSummary, s.aiKeywords,
        s.aiSummaryEn, s.aiKeywordsEn
      FROM repositories r
      LEFT JOIN project_meta m ON r.title = m.title
      LEFT JOIN project_summaries s ON r.title = s.title
      WHERE r.date = ?
      ORDER BY r.id ASC
    `).all(date);
  },

  getGlobalStateByDate(date: string) {
    return db.prepare("SELECT * FROM daily_summaries WHERE date = ?").get(date) as any;
  },

  getProjectSummary(title: string): { readme?: string | null; aiSummary?: string | null; aiSummaryEn?: string | null } | undefined {
    return db.prepare("SELECT * FROM project_summaries WHERE title = ?").get(title) as
      | { readme?: string | null; aiSummary?: string | null; aiSummaryEn?: string | null }
      | undefined;
  },

  saveTrendingProjects(date: string, projects: any[]) {
    const deleteStmt = db.prepare("DELETE FROM repositories WHERE date = ?");
    const insertStmt = db.prepare(`
      INSERT INTO repositories (title, content, username, stars, starsToday, url, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((data) => {
      deleteStmt.run(date);
      for (const item of data) {
        insertStmt.run(item.title, item.content, item.username, item.stars, item.starsToday, item.url, date);
      }
    });
    transaction(projects);
  },

  saveProjectMeta(title: string, avatarUrl: string, topics: string, date: string) {
    db.prepare(`
      INSERT INTO project_meta (title, avatarUrl, topics, date)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(title) DO UPDATE SET
        avatarUrl = excluded.avatarUrl,
        topics = excluded.topics,
        date = excluded.date
    `).run(title, avatarUrl, topics, date);
  },

  saveProjectSummary(
    title: string,
    summary: string,
    keywords: string,
    date: string,
    extras?: { summaryEn?: string; keywordsEn?: string; readme?: string }
  ) {
    db.prepare(`
      INSERT INTO project_summaries (title, aiSummary, aiKeywords, date)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(title) DO UPDATE SET
        aiSummary = COALESCE(excluded.aiSummary, aiSummary),
        aiKeywords = COALESCE(excluded.aiKeywords, aiKeywords),
        date = excluded.date
    `).run(title, summary || null, keywords || null, date);

    if (extras?.summaryEn || extras?.keywordsEn || extras?.readme) {
      db.prepare(`
        UPDATE project_summaries SET
          aiSummaryEn = COALESCE(?, aiSummaryEn),
          aiKeywordsEn = COALESCE(?, aiKeywordsEn),
          readme = COALESCE(?, readme)
        WHERE title = ?
      `).run(extras.summaryEn || null, extras.keywordsEn || null, extras.readme || null, title);
    }
  },

  saveGlobalState(date: string, summary: string, hashtags: string, lang: "zh" | "en" = "zh") {
    db.prepare(`
      INSERT INTO daily_summaries (date, summary, hashtags, summaryEn, hashtagsEn)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        ${lang === "en" ? "summaryEn = excluded.summaryEn, hashtagsEn = excluded.hashtagsEn" : "summary = excluded.summary, hashtags = excluded.hashtags"}
    `).run(date, lang === "zh" ? summary : "", lang === "zh" ? hashtags : "", lang === "en" ? summary : "", lang === "en" ? hashtags : "");
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
