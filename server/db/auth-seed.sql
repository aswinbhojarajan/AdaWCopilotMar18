INSERT INTO auth.users (email, password_hash, display_name, role, status, persona, mock_tier, mock_config)
VALUES
  ('aisha@demo.ada', '$2b$12$DoQ8jpZMNrt7zeRIb0WRvu83s/FWxuk9DC38dp6LLdff0zQhL9oZy', 'Aisha Al-Rashid', 'preview_user', 'active', 'user-aisha', 'platinum', '{"risk_level":"moderate","portfolio_value":93105.94}'),
  ('khalid@demo.ada', '$2b$12$DoQ8jpZMNrt7zeRIb0WRvu83s/FWxuk9DC38dp6LLdff0zQhL9oZy', 'Khalid Al-Mansoori', 'preview_user', 'active', 'user-khalid', 'gold', '{"risk_level":"conservative","portfolio_value":45200.00}'),
  ('raj@demo.ada', '$2b$12$DoQ8jpZMNrt7zeRIb0WRvu83s/FWxuk9DC38dp6LLdff0zQhL9oZy', 'Raj Patel', 'preview_user', 'active', 'user-raj', 'standard', '{"risk_level":"aggressive","portfolio_value":28750.00}'),
  ('admin@ada.app', '$2b$12$DoQ8jpZMNrt7zeRIb0WRvu83s/FWxuk9DC38dp6LLdff0zQhL9oZy', 'Admin', 'ops_admin', 'active', NULL, NULL, '{}')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  persona = EXCLUDED.persona,
  mock_tier = EXCLUDED.mock_tier,
  mock_config = EXCLUDED.mock_config,
  updated_at = NOW();
