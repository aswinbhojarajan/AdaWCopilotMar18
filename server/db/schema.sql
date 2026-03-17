CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  advisor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  level TEXT NOT NULL CHECK (level IN ('conservative', 'moderate', 'aggressive')),
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  last_assessed DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS advisors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  photo_url TEXT,
  availability TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
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

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  category_type TEXT NOT NULL,
  title TEXT NOT NULL,
  context_title TEXT,
  description TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  button_text TEXT NOT NULL,
  secondary_button_text TEXT,
  image TEXT,
  sources_count INTEGER,
  topic_label_color TEXT,
  target_screen TEXT DEFAULT 'home'
);

CREATE TABLE IF NOT EXISTS peer_segments (
  id SERIAL PRIMARY KEY,
  asset_class TEXT NOT NULL,
  user_percent NUMERIC(5,2) NOT NULL,
  peer_percent NUMERIC(5,2) NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  preview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT REFERENCES chat_threads(id),
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS action_contexts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  category TEXT NOT NULL,
  category_type TEXT NOT NULL,
  title TEXT NOT NULL,
  source_screen TEXT NOT NULL,
  ada_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  price NUMERIC(14,2) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id),
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'deposit', 'withdrawal')),
  symbol TEXT,
  quantity NUMERIC(18,8),
  price NUMERIC(14,2),
  amount NUMERIC(14,2) NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
