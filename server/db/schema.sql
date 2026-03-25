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
  is_video BOOLEAN DEFAULT FALSE,
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'peer_segments_asset_class_key'
  ) THEN
    DELETE FROM peer_segments a USING peer_segments b
      WHERE a.id > b.id AND a.asset_class = b.asset_class;
    ALTER TABLE peer_segments ADD CONSTRAINT peer_segments_asset_class_key UNIQUE (asset_class);
  END IF;
END $$;

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

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'UAE',
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_configs (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT UNIQUE REFERENCES tenants(id),
  jurisdiction TEXT NOT NULL DEFAULT 'UAE',
  advisory_mode TEXT NOT NULL DEFAULT 'personalized_insights_only'
    CHECK (advisory_mode IN ('education_only', 'personalized_insights_only', 'restricted_advisory')),
  can_name_securities BOOLEAN NOT NULL DEFAULT TRUE,
  can_compare_products BOOLEAN NOT NULL DEFAULT FALSE,
  can_generate_recommendations BOOLEAN NOT NULL DEFAULT FALSE,
  can_generate_next_best_actions BOOLEAN NOT NULL DEFAULT TRUE,
  requires_advisor_handoff_for_specific_advice BOOLEAN NOT NULL DEFAULT TRUE,
  disclosure_profile TEXT NOT NULL DEFAULT 'uae_affluent_v1',
  allowed_tool_profiles TEXT[] NOT NULL DEFAULT '{portfolio_read,market_read,news_read,health_compute,workflow_light}',
  provider_config JSONB NOT NULL DEFAULT '{}',
  feature_flags JSONB NOT NULL DEFAULT '{}',
  tone TEXT NOT NULL DEFAULT 'professional',
  language TEXT NOT NULL DEFAULT 'en',
  blocked_phrases TEXT[] NOT NULL DEFAULT '{}',
  data_freshness_threshold_seconds INTEGER NOT NULL DEFAULT 300,
  execution_routing_mode TEXT NOT NULL DEFAULT 'rm_handoff'
    CHECK (execution_routing_mode IN ('rm_handoff', 'api_webhook', 'disabled')),
  execution_webhook_url TEXT,
  can_prepare_trade_plans BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Instruments
CREATE TABLE IF NOT EXISTS instruments (
  id SERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  sector TEXT,
  geography TEXT NOT NULL DEFAULT 'Global',
  currency TEXT NOT NULL DEFAULT 'USD',
  instrument_type TEXT NOT NULL DEFAULT 'equity'
    CHECK (instrument_type IN ('equity', 'etf', 'bond', 'commodity', 'crypto', 'fund', 'index')),
  isin TEXT,
  figi TEXT,
  exchange TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Quotes (current day snapshot, refreshed by providers)
CREATE TABLE IF NOT EXISTS market_quotes (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL REFERENCES instruments(symbol),
  price NUMERIC(18,6) NOT NULL,
  change NUMERIC(18,6) NOT NULL DEFAULT 0,
  change_percent NUMERIC(10,4) NOT NULL DEFAULT 0,
  volume BIGINT,
  high NUMERIC(18,6),
  low NUMERIC(18,6),
  open_price NUMERIC(18,6),
  previous_close NUMERIC(18,6),
  market_cap NUMERIC(20,2),
  source_provider TEXT NOT NULL DEFAULT 'mock',
  as_of TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, source_provider)
);

-- News Items
CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  publisher TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  url TEXT,
  symbols TEXT[] NOT NULL DEFAULT '{}',
  relevance_tags TEXT[] NOT NULL DEFAULT '{}',
  source_provider TEXT NOT NULL DEFAULT 'mock',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Observability
CREATE TABLE IF NOT EXISTS tool_runs (
  id SERIAL PRIMARY KEY,
  tool_name TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  outputs JSONB,
  latency_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('ok', 'error', 'partial', 'timeout')) DEFAULT 'ok',
  source_provider TEXT,
  conversation_id TEXT,
  message_id TEXT,
  user_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_traces (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT,
  message_id TEXT,
  tenant_id TEXT REFERENCES tenants(id),
  user_id TEXT REFERENCES users(id),
  intent_classification TEXT,
  policy_decision JSONB,
  model_name TEXT,
  reasoning_effort TEXT,
  tool_set_exposed TEXT[] NOT NULL DEFAULT '{}',
  tool_calls_made JSONB NOT NULL DEFAULT '[]',
  final_answer JSONB,
  response_time_ms INTEGER,
  step_timings JSONB,
  guardrail_interventions JSONB,
  escalation_decisions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_decisions (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id),
  user_id TEXT REFERENCES users(id),
  request_type TEXT NOT NULL,
  decision JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_summaries (
  id SERIAL PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  summary TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_summarized_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS working_memory (
  thread_id TEXT PRIMARY KEY,
  turns JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodic_memories' AND column_name='preferences') THEN
    ALTER TABLE episodic_memories ADD COLUMN preferences TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodic_memories' AND column_name='watched_entities') THEN
    ALTER TABLE episodic_memories ADD COLUMN watched_entities TEXT[] NOT NULL DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='episodic_memories' AND column_name='unresolved_topics') THEN
    ALTER TABLE episodic_memories ADD COLUMN unresolved_topics TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

-- Add tenant_id to users (nullable for backward compatibility)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='tenant_id') THEN
    ALTER TABLE users ADD COLUMN tenant_id TEXT REFERENCES tenants(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='previous_amount') THEN
    ALTER TABLE goals ADD COLUMN previous_amount NUMERIC(14,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='health_status') THEN
    ALTER TABLE goals ADD COLUMN health_status TEXT NOT NULL DEFAULT 'on-track' CHECK (health_status IN ('on-track','needs-attention','at-risk'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='ai_insight') THEN
    ALTER TABLE goals ADD COLUMN ai_insight TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='cta_text') THEN
    ALTER TABLE goals ADD COLUMN cta_text TEXT NOT NULL DEFAULT 'View details';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS advisor_action_queue (
  id SERIAL PRIMARY KEY,
  tenant_id TEXT REFERENCES tenants(id),
  user_id TEXT REFERENCES users(id),
  advisor_id TEXT,
  conversation_id TEXT,
  action_type TEXT NOT NULL,
  action_details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'acknowledged', 'completed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenant_configs' AND column_name='execution_routing_mode') THEN
    ALTER TABLE tenant_configs ADD COLUMN execution_routing_mode TEXT NOT NULL DEFAULT 'rm_handoff' CHECK (execution_routing_mode IN ('rm_handoff', 'api_webhook', 'disabled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenant_configs' AND column_name='execution_webhook_url') THEN
    ALTER TABLE tenant_configs ADD COLUMN execution_webhook_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenant_configs' AND column_name='can_prepare_trade_plans') THEN
    ALTER TABLE tenant_configs ADD COLUMN can_prepare_trade_plans BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
END $$;

-- ============================================================
-- Discover Pipeline Tables (Phase 1)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  geo_focus TEXT NOT NULL DEFAULT 'Global',
  investment_horizon TEXT NOT NULL DEFAULT 'medium' CHECK (investment_horizon IN ('short', 'medium', 'long')),
  income_preference TEXT NOT NULL DEFAULT 'balanced' CHECK (income_preference IN ('income', 'balanced', 'growth')),
  aum_tier TEXT NOT NULL DEFAULT 'affluent' CHECK (aum_tier IN ('mass_affluent', 'affluent', 'hnw', 'uhnw')),
  target_equities_pct NUMERIC(5,2) NOT NULL DEFAULT 50,
  target_fixed_income_pct NUMERIC(5,2) NOT NULL DEFAULT 25,
  target_alternatives_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  target_cash_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
  target_real_estate_pct NUMERIC(5,2) NOT NULL DEFAULT 5,
  risk_tolerance TEXT NOT NULL DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  interests TEXT[] NOT NULL DEFAULT '{}',
  top_asset_classes JSONB NOT NULL DEFAULT '[]',
  allocation_gaps JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='risk_tolerance') THEN
    ALTER TABLE user_profiles ADD COLUMN risk_tolerance TEXT NOT NULL DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='interests') THEN
    ALTER TABLE user_profiles ADD COLUMN interests TEXT[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS raw_articles (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  source_provider TEXT NOT NULL DEFAULT 'finnhub',
  url TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  image_url TEXT,
  publisher TEXT,
  published_at TIMESTAMPTZ,
  tickers TEXT[] NOT NULL DEFAULT '{}',
  regions TEXT[] NOT NULL DEFAULT '{}',
  category TEXT,
  is_processed BOOLEAN NOT NULL DEFAULT FALSE,
  ingested_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_articles_external_id ON raw_articles(external_id);
CREATE INDEX IF NOT EXISTS idx_raw_articles_is_processed ON raw_articles(is_processed) WHERE is_processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_raw_articles_published_at ON raw_articles(published_at DESC);

CREATE TABLE IF NOT EXISTS article_enrichment (
  id SERIAL PRIMARY KEY,
  article_id INTEGER UNIQUE REFERENCES raw_articles(id),
  tickers TEXT[] NOT NULL DEFAULT '{}',
  entities JSONB NOT NULL DEFAULT '{}',
  sentiment_score NUMERIC(5,3) NOT NULL DEFAULT 0,
  importance_score NUMERIC(5,3) NOT NULL DEFAULT 0,
  taxonomy_tags JSONB NOT NULL DEFAULT '{}',
  dedup_hash TEXT,
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_article_enrichment_article_id ON article_enrichment(article_id);
CREATE INDEX IF NOT EXISTS idx_article_enrichment_dedup_hash ON article_enrichment(dedup_hash);

CREATE TABLE IF NOT EXISTS article_clusters (
  id SERIAL PRIMARY KEY,
  theme TEXT NOT NULL,
  fingerprint TEXT UNIQUE,
  article_ids INTEGER[] NOT NULL DEFAULT '{}',
  article_count INTEGER NOT NULL DEFAULT 0,
  narrative_headline TEXT,
  aggregate_importance NUMERIC(5,3) NOT NULL DEFAULT 0,
  primary_asset_class TEXT,
  primary_geography TEXT,
  primary_themes TEXT[] NOT NULL DEFAULT '{}',
  is_synthesized BOOLEAN NOT NULL DEFAULT FALSE,
  last_article_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='article_clusters' AND column_name='fingerprint') THEN
    ALTER TABLE article_clusters ADD COLUMN fingerprint TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='article_clusters' AND column_name='last_article_at') THEN
    ALTER TABLE article_clusters ADD COLUMN last_article_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_article_clusters_is_synthesized ON article_clusters(is_synthesized) WHERE is_synthesized = FALSE;

CREATE TABLE IF NOT EXISTS discover_cards (
  id TEXT PRIMARY KEY,
  card_type TEXT NOT NULL CHECK (card_type IN (
    'portfolio_impact', 'trend_brief', 'market_pulse',
    'explainer', 'wealth_planning', 'allocation_gap',
    'event_calendar', 'ada_view', 'product_opportunity'
  )),
  tab TEXT NOT NULL DEFAULT 'whatsNew' CHECK (tab IN ('forYou', 'whatsNew', 'both')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  detail_sections JSONB NOT NULL DEFAULT '[]',
  supporting_articles JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  source_count INTEGER NOT NULL DEFAULT 0,
  intent_badge TEXT CHECK (intent_badge IS NULL OR intent_badge IN ('alert', 'opportunity', 'analysis', 'action')),
  topic_label TEXT,
  relevance_tags TEXT[] NOT NULL DEFAULT '{}',
  confidence TEXT NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high', 'medium', 'low')),
  taxonomy_tags JSONB NOT NULL DEFAULT '{}',
  ctas JSONB NOT NULL DEFAULT '[]',
  why_you_are_seeing_this TEXT,
  personalized_overlay TEXT,
  cluster_id INTEGER REFERENCES article_clusters(id),
  priority_score INTEGER NOT NULL DEFAULT 0,
  feed_position INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_editorial BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='discover_cards' AND column_name='priority_score') THEN
    ALTER TABLE discover_cards ADD COLUMN priority_score INTEGER NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='discover_cards' AND column_name='feed_position') THEN
    ALTER TABLE discover_cards ADD COLUMN feed_position INTEGER;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_discover_cards_active ON discover_cards(is_active, tab) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_discover_cards_priority ON discover_cards(tab, priority_score DESC) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_discover_cards_type ON discover_cards(card_type);
CREATE INDEX IF NOT EXISTS idx_discover_cards_created ON discover_cards(created_at DESC);

CREATE TABLE IF NOT EXISTS cta_templates (
  id SERIAL PRIMARY KEY,
  card_type TEXT NOT NULL,
  cta_family TEXT NOT NULL,
  template_text TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  intent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
