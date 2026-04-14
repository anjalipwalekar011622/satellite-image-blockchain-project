const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "satverify.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
    created_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cid TEXT NOT NULL,
    hash TEXT NOT NULL,
    geohash TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    place_name TEXT,
    image_type TEXT NOT NULL,
    filename TEXT NOT NULL,
    tx_hash TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    is_admin_only INTEGER DEFAULT 1,
    integrity_token TEXT,
    ecdsa_signature TEXT,
    signer_address TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL CHECK(action_type IN ('search', 'verify')),
    image_id INTEGER,
    latitude REAL,
    longitude REAL,
    geohash TEXT,
    image_type TEXT,
    result TEXT,
    hash TEXT,
    cid TEXT,
    place_name TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`).run();

function hasAdminUser() {
  return !!db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
}

function findUserByUsername(username) {
  return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
}

function getUsersForAdmin() {
  return db.prepare(`
    SELECT id, username, role, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();
}

function insertImageRecord(record) {
  return db.prepare(`
    INSERT INTO images (
      cid, hash, geohash, latitude, longitude, place_name,
      image_type, filename, tx_hash, uploaded_at, is_admin_only,
      integrity_token, ecdsa_signature, signer_address
    )
    VALUES (
      @cid, @hash, @geohash, @latitude, @longitude, @place_name,
      @image_type, @filename, @tx_hash, @uploaded_at, @is_admin_only,
      @integrity_token, @ecdsa_signature, @signer_address
    )
  `).run({
    cid: record.cid,
    hash: record.hash,
    geohash: record.geohash,
    latitude: record.latitude,
    longitude: record.longitude,
    place_name: record.place_name || "",
    image_type: record.image_type,
    filename: record.filename,
    tx_hash: record.tx_hash,
    uploaded_at: record.uploaded_at || new Date().toISOString(),
    is_admin_only: record.is_admin_only ?? 1,
    integrity_token: record.integrity_token || "",
    ecdsa_signature: record.ecdsa_signature || "",
    signer_address: record.signer_address || ""
  });
}

function findImagesByGeohash(geohash) {
  return db.prepare("SELECT * FROM images WHERE geohash = ? ORDER BY uploaded_at DESC").all(geohash);
}

function findImageByHash(hash) {
  return db.prepare("SELECT * FROM images WHERE hash = ? ORDER BY uploaded_at DESC LIMIT 1").get(hash);
}

function getImageHistory() {
  return db.prepare("SELECT * FROM images ORDER BY uploaded_at DESC").all();
}

function getImageAnalytics() {
  return {
    totalImages: db.prepare("SELECT COUNT(*) AS count FROM images").get().count,
    byType: db.prepare(`
      SELECT image_type, COUNT(*) AS count
      FROM images
      GROUP BY image_type
      ORDER BY count DESC
    `).all(),
    byGeohash: db.prepare(`
      SELECT geohash, COUNT(*) AS count
      FROM images
      GROUP BY geohash
      ORDER BY count DESC
    `).all()
  };
}

function insertUserActivity(record) {
  return db.prepare(`
    INSERT INTO user_activity (
      user_id, action_type, image_id, latitude, longitude, geohash,
      image_type, result, hash, cid, place_name, created_at
    )
    VALUES (
      @user_id, @action_type, @image_id, @latitude, @longitude, @geohash,
      @image_type, @result, @hash, @cid, @place_name, @created_at
    )
  `).run({
    user_id: record.user_id,
    action_type: record.action_type,
    image_id: record.image_id || null,
    latitude: record.latitude || null,
    longitude: record.longitude || null,
    geohash: record.geohash || "",
    image_type: record.image_type || "",
    result: record.result || "",
    hash: record.hash || "",
    cid: record.cid || "",
    place_name: record.place_name || "",
    created_at: record.created_at || new Date().toISOString()
  });
}

function getUserActivity(userId) {
  return db.prepare(`
    SELECT *
    FROM user_activity
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId);
}

function getUserAnalytics(userId) {
  const rows = getUserActivity(userId);
  const typeCounts = {};
  let authenticCount = 0;
  let tamperedCount = 0;

  rows.forEach((row) => {
    if (row.image_type) typeCounts[row.image_type] = (typeCounts[row.image_type] || 0) + 1;
    if ((row.result || "").toLowerCase().includes("authentic")) authenticCount++;
    if ((row.result || "").toLowerCase().includes("tampered")) tamperedCount++;
  });

  return {
    totalActivities: rows.length,
    authenticCount,
    tamperedCount,
    typeCounts
  };
}

module.exports = {
  db,
  hasAdminUser,
  findUserByUsername,
  getUsersForAdmin,
  insertImageRecord,
  findImagesByGeohash,
  findImageByHash,
  getImageHistory,
  getImageAnalytics,
  insertUserActivity,
  getUserActivity,
  getUserAnalytics
};
