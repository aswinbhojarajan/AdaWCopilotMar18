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
  previous_amount NUMERIC(14,2),
  deadline TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Target',
  color TEXT NOT NULL DEFAULT '#a87174',
  health_status TEXT NOT NULL CHECK (health_status IN ('on-track', 'needs-attention', 'at-risk')) DEFAULT 'on-track',
  ai_insight TEXT,
  cta_text TEXT NOT NULL DEFAULT 'View details'
);

CREATE TABLE IF NOT EXISTS dismissed_life_gap_prompts (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  prompt_key TEXT NOT NULL,
  dismissed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_key)
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
  target_screen TEXT DEFAULT 'home',
  tab TEXT,
  detail_sections JSONB,
  stack_buttons BOOLEAN DEFAULT FALSE,
  hide_intent BOOLEAN DEFAULT FALSE,
  custom_topic TEXT
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
  widgets JSONB,
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

CREATE TABLE IF NOT EXISTS performance_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  value NUMERIC(14,2) NOT NULL,
  recorded_date DATE NOT NULL,
  UNIQUE(user_id, recorded_date)
);

CREATE TABLE IF NOT EXISTS episodic_memories (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  thread_id TEXT REFERENCES chat_threads(id),
  summary TEXT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS semantic_facts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  fact TEXT NOT NULL,
  category TEXT NOT NULL,
  source_thread_id TEXT REFERENCES chat_threads(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_audit_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  thread_id TEXT,
  action TEXT NOT NULL,
  intent TEXT,
  pii_detected BOOLEAN DEFAULT FALSE,
  input_preview TEXT,
  model TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_options (
  id TEXT PRIMARY KEY,
  poll_id TEXT REFERENCES poll_questions(id),
  label TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT REFERENCES poll_questions(id),
  user_id TEXT REFERENCES users(id),
  option_id TEXT REFERENCES poll_options(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);
