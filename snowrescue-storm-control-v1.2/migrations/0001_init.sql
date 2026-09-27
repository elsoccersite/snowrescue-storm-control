CREATE TABLE IF NOT EXISTS storm_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  status TEXT NOT NULL DEFAULT 'standby',
  snowfall TEXT NOT NULL DEFAULT '5 cm',
  route_start TEXT NOT NULL DEFAULT '04:00',
  buffer_minutes INTEGER NOT NULL DEFAULT 30,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  timing_paused INTEGER NOT NULL DEFAULT 0,
  message_preset TEXT NOT NULL DEFAULT 'standard-standby',
  custom_message TEXT NOT NULL DEFAULT '',
  active_areas TEXT NOT NULL DEFAULT '["Milton","Oakville","Burlington","West Mississauga"]',
  updated_by TEXT NOT NULL DEFAULT 'system',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO storm_state (
  id, status, snowfall, route_start, buffer_minutes, delay_minutes,
  timing_paused, message_preset, custom_message, active_areas,
  updated_by, updated_at
) VALUES (
  1, 'standby', '5 cm', '04:00', 30, 0,
  0, 'standard-standby', '', '["Milton","Oakville","Burlington","West Mississauga"]',
  'system', CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS storm_change_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  changed_by TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  summary TEXT NOT NULL,
  before_json TEXT NOT NULL,
  after_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_storm_change_log_changed_at
  ON storm_change_log(changed_at DESC);

CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  ip TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_email_time
  ON auth_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_time
  ON auth_attempts(ip, attempted_at DESC);
