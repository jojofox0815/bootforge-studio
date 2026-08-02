PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE iso_images (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  sha256 TEXT NOT NULL UNIQUE,
  size_bytes INTEGER NOT NULL CHECK(size_bytes >= 0),
  family TEXT NOT NULL,
  product TEXT NOT NULL,
  version TEXT NOT NULL,
  architecture TEXT NOT NULL,
  confidence TEXT NOT NULL CHECK(confidence IN ('high','medium','low')),
  metadata_json TEXT NOT NULL,
  imported_at TEXT NOT NULL,
  last_verified_at TEXT
);

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  family TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  current_revision_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE profile_revisions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_revision_id TEXT REFERENCES profile_revisions(id),
  content_json TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE secret_refs (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  field_path TEXT NOT NULL,
  vault_locator TEXT NOT NULL,
  UNIQUE(profile_id, field_path)
);

CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  vendor TEXT NOT NULL,
  model TEXT NOT NULL,
  serial TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  removable INTEGER NOT NULL,
  system_disk INTEGER NOT NULL,
  last_seen_at TEXT NOT NULL
);

CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('queued','running','paused','failed','cancelled','succeeded')),
  progress REAL NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
  profile_revision_id TEXT REFERENCES profile_revisions(id),
  iso_sha256 TEXT,
  target_device_serial TEXT,
  tool_versions_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT,
  ended_at TEXT,
  resumable_from_step TEXT
);

CREATE TABLE job_steps (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  state TEXT NOT NULL,
  progress REAL NOT NULL DEFAULT 0,
  redacted_payload_json TEXT NOT NULL DEFAULT '{}',
  started_at TEXT,
  ended_at TEXT,
  UNIQUE(job_id, sequence)
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id),
  kind TEXT NOT NULL,
  path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE plugins (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  signature_status TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  installed_at TEXT NOT NULL
);
