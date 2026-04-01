INSERT INTO users (id, first_name, last_name, email) VALUES
  ('user-aisha', 'Aisha', 'Al-Rashid', 'aisha@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-aisha-1', 'user-aisha', 'HSBC', '#DB0011', 'HSBC', 'savings', 18966.04, '2 min ago', 'synced'),
  ('acc-aisha-2', 'user-aisha', 'Interactive Brokers', '#DA1F26', 'IB', 'brokerage', 64656.88, '5 min ago', 'synced'),
  ('acc-aisha-3', 'user-aisha', 'WIO Bank', '#6C63FF', 'WIO', 'checking', 9483.02, 'Just now', 'synced')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-aisha-1', 'acc-aisha-2', 'NVDA', 'NVIDIA Corp.', 15, 135.40, 102.67, 'Stocks'),
  ('pos-aisha-2', 'acc-aisha-2', 'AAPL', 'Apple Inc.', 12, 208.63, 180.00, 'Stocks'),
  ('pos-aisha-3', 'acc-aisha-2', 'BTC', 'Bitcoin', 0.0195, 87535.00, 62000.00, 'Crypto'),
  ('pos-aisha-4', 'acc-aisha-2', 'MSFT', 'Microsoft Corp.', 8, 420.50, 391.25, 'Stocks'),
  ('pos-aisha-5', 'acc-aisha-2', 'AGG', 'iShares Core Bond ETF', 130, 109.42, 104.12, 'Bonds'),
  ('pos-aisha-6', 'acc-aisha-2', 'GLD', 'SPDR Gold Shares', 18, 210.73, 189.17, 'Commodities'),
  ('pos-aisha-7', 'acc-aisha-2', 'ETH', 'Ethereum', 1.5, 2450.00, 1800.00, 'Crypto')
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-aisha-1', 'user-aisha', 93105.94, 744.85, 0.8, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-aisha-1', 'user-aisha', 'House deposit', 30000, 18966.04, 20500.00, 'Dec 2026', 'Home', '#a87174', 'needs-attention',
   'You''re slightly behind pace. Increasing monthly contributions by $919 keeps you on track.', 'Why am I off track?'),
  ('goal-aisha-2', 'user-aisha', 'Education fund', 100000, 33190.57, 31800.00, 'Sep 2035', 'GraduationCap', '#6d3f42', 'needs-attention',
   'You''re behind schedule. Consistent contributions now will help you catch up over time.', 'How can I get back on track?')
ON CONFLICT (id) DO NOTHING;

INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-aisha-1', 'user-aisha', 'PORTFOLIO_ALERT', 'Cash allocation at 66% of portfolio',
   'Your cash holdings now represent 66% of your portfolio. Consider deploying idle cash into income-generating assets.', '12 min ago', TRUE, 'alerts'),
  ('alert-aisha-2', 'user-aisha', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Hi Aisha, I''ve reviewed your Q4 performance. Let''s schedule a call. --Khalid', '2 hours ago', TRUE, 'updates'),
  ('alert-aisha-3', 'user-aisha', 'MARKET_UPDATE', 'Federal Reserve signals pause on rate cuts',
   'The Fed maintained its cautious stance, keeping rates unchanged through Q2 2026.', '6 hours ago', FALSE, 'updates'),
  ('alert-aisha-4', 'user-aisha', 'DOCUMENT', 'Q4 2025 Portfolio Report ready',
   'Your quarterly performance report is now available. Portfolio value: $93,105.94.', '8 hours ago', FALSE, 'updates'),
  ('alert-aisha-5', 'user-aisha', 'OPPORTUNITY', 'Emerging market bonds offer 6.8% yields',
   'High-quality sovereign debt in stable economies now offers attractive income.', 'Yesterday', FALSE, 'opportunities'),
  ('alert-aisha-6', 'user-aisha', 'PORTFOLIO_ALERT', 'Portfolio up $745 today on equity gains',
   'Your portfolio gained $744.85 (+0.8%) today, driven by your equity allocation.', 'Yesterday', FALSE, 'alerts'),
  ('alert-aisha-7', 'user-aisha', 'EVENT', 'Reminder: Estate planning consultation',
   'Your scheduled consultation with our estate planning specialist is tomorrow at 2:00 PM.', '2 days ago', FALSE, 'updates')
ON CONFLICT (id) DO NOTHING;
