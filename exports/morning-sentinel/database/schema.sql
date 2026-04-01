CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  advisor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  institution_name TEXT NOT NULL,
  logo_color TEXT NOT NULL,
  logo_text TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('brokerage', 'savings', 'checking', 'retirement')),
  balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_synced TEXT NOT NULL DEFAULT 'Just now',
  status TEXT NOT NULL CHECK (status IN ('synced', 'error', 'pending')) DEFAULT 'synced'
);

CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity NUMERIC(18,8) NOT NULL,
  current_price NUMERIC(14,2) NOT NULL,
  cost_basis NUMERIC(14,2) NOT NULL,
  asset_class TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  total_value NUMERIC(14,2) NOT NULL,
  daily_change_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_change_percent NUMERIC(6,2) NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  target_amount NUMERIC(14,2) NOT NULL,
  current_amount NUMERIC(14,2) NOT NULL,
  previous_amount NUMERIC(14,2),
  deadline TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Target',
  color TEXT NOT NULL DEFAULT '#a87174',
  health_status TEXT NOT NULL CHECK (health_status IN ('on-track', 'needs-attention', 'at-risk')) DEFAULT 'on-track',
  ai_insight TEXT,
  cta_text TEXT NOT NULL DEFAULT 'View details'
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  unread BOOLEAN NOT NULL DEFAULT TRUE,
  category TEXT NOT NULL CHECK (category IN ('alerts', 'opportunities', 'updates')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
