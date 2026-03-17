-- Advisors
INSERT INTO advisors (id, name, title, photo_url, availability, email, phone)
VALUES ('advisor-sarah', 'Sarah Mitchell', 'Senior Wealth Advisor', NULL, 'Available today', 'sarah.mitchell@example.com', '+971-50-555-0100')
ON CONFLICT (id) DO NOTHING;

-- Users (4 personas)
INSERT INTO users (id, first_name, last_name, email, advisor_id) VALUES
  ('user-abdullah', 'Abdullah', 'Al-Rashid', 'abdullah@example.com', 'advisor-sarah'),
  ('user-fatima', 'Fatima', 'Hassan', 'fatima@example.com', 'advisor-sarah'),
  ('user-omar', 'Omar', 'Khalil', 'omar@example.com', 'advisor-sarah'),
  ('user-layla', 'Layla', 'Mahmoud', 'layla@example.com', 'advisor-sarah')
ON CONFLICT (id) DO NOTHING;

-- Risk Profiles
INSERT INTO risk_profiles (user_id, level, score, last_assessed) VALUES
  ('user-abdullah', 'moderate', 62, '2025-11-15'),
  ('user-fatima', 'conservative', 35, '2025-10-01'),
  ('user-omar', 'aggressive', 85, '2025-12-01'),
  ('user-layla', 'moderate', 55, '2025-09-20')
ON CONFLICT (user_id) DO NOTHING;

-- Accounts (Abdullah)
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-abd-1', 'user-abdullah', 'HSBC', '#DB0011', 'HSBC', 'savings', 18966.04, '2 min ago', 'synced'),
  ('acc-abd-2', 'user-abdullah', 'Interactive Brokers', '#DA1F26', 'IB', 'brokerage', 66381.13, '5 min ago', 'synced'),
  ('acc-abd-3', 'user-abdullah', 'WIO Bank', '#6C63FF', 'WIO', 'checking', 9483.02, 'Just now', 'synced')
ON CONFLICT (id) DO NOTHING;

-- Accounts (Fatima)
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-fat-1', 'user-fatima', 'Emirates NBD', '#003B5C', 'ENBD', 'savings', 45200.00, '10 min ago', 'synced'),
  ('acc-fat-2', 'user-fatima', 'Vanguard', '#8B2131', 'VG', 'brokerage', 120500.00, '1 hour ago', 'synced')
ON CONFLICT (id) DO NOTHING;

-- Accounts (Omar)
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-omr-1', 'user-omar', 'ADCB', '#0066CC', 'ADCB', 'checking', 12800.00, '3 min ago', 'synced'),
  ('acc-omr-2', 'user-omar', 'Robinhood', '#00C805', 'RH', 'brokerage', 89300.00, '2 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

-- Accounts (Layla)
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-lay-1', 'user-layla', 'Mashreq Bank', '#ED1C24', 'MSHQ', 'savings', 32100.00, '15 min ago', 'synced'),
  ('acc-lay-2', 'user-layla', 'Charles Schwab', '#00A3E0', 'CS', 'brokerage', 78400.00, '8 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

-- Positions (Abdullah's brokerage)
INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-abd-1', 'acc-abd-2', 'NVDA', 'NVIDIA Corp.', 15, 250.35, 180.00, 'Stocks'),
  ('pos-abd-2', 'acc-abd-2', 'AAPL', 'Apple Inc.', 12, 208.63, 165.00, 'Stocks'),
  ('pos-abd-3', 'acc-abd-2', 'BTC', 'Bitcoin', 0.0195, 87535.00, 62000.00, 'Crypto'),
  ('pos-abd-4', 'acc-abd-2', 'MSFT', 'Microsoft Corp.', 8, 420.50, 320.00, 'Stocks'),
  ('pos-abd-5', 'acc-abd-2', 'AGG', 'iShares Core Bond ETF', 130, 109.42, 105.00, 'Bonds'),
  ('pos-abd-6', 'acc-abd-2', 'GLD', 'SPDR Gold Shares', 18, 210.73, 185.00, 'Commodities'),
  ('pos-abd-7', 'acc-abd-2', 'ETH', 'Ethereum', 1.5, 2450.00, 1800.00, 'Crypto')
ON CONFLICT (id) DO NOTHING;

-- Portfolio Snapshots (Abdullah)
INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-abd-1', 'user-abdullah', 94830.19, 758.64, 0.8, NOW())
ON CONFLICT (id) DO NOTHING;

-- Portfolio Snapshots (other personas)
INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-fat-1', 'user-fatima', 165700.00, 430.20, 0.26, NOW()),
  ('snap-omr-1', 'user-omar', 102100.00, 1250.00, 1.24, NOW()),
  ('snap-lay-1', 'user-layla', 110500.00, -320.50, -0.29, NOW())
ON CONFLICT (id) DO NOTHING;

-- Goals (Abdullah)
INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-abd-1', 'user-abdullah', 'House deposit', 30000, 18966.04, 'Dec 2026', 'Home', '#a87174', 'needs-attention',
   'You''re slightly behind pace. Increasing monthly contributions by $919 keeps you on track.', 'Why am I off track?'),
  ('goal-abd-2', 'user-abdullah', 'Education fund', 100000, 33190.57, 'Sep 2035', 'GraduationCap', '#6d3f42', 'needs-attention',
   'You''re behind schedule. Consistent contributions now will help you catch up over time.', 'How can I get back on track?')
ON CONFLICT (id) DO NOTHING;

-- Goals (Fatima)
INSERT INTO goals (id, user_id, title, target_amount, current_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-fat-1', 'user-fatima', 'Retirement', 500000, 165700.00, 'Dec 2040', 'Wallet', '#6d3f42', 'on-track',
   'You''re on track for your retirement goal. Keep up the consistent contributions.', 'Review my plan')
ON CONFLICT (id) DO NOTHING;

-- Alerts (Abdullah)
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-abd-1', 'user-abdullah', 'PORTFOLIO_ALERT', 'Stock allocation reached 55% of portfolio',
   'Your equity holdings now represent 55% of your portfolio, above your peers'' average of 45%.', '12 min ago', TRUE, 'alerts'),
  ('alert-abd-2', 'user-abdullah', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Hi Abdullah, I''ve reviewed your Q4 performance. Let''s schedule a call. —Khalid', '2 hours ago', TRUE, 'updates'),
  ('alert-abd-3', 'user-abdullah', 'MARKET_UPDATE', 'Federal Reserve signals pause on rate cuts',
   'The Fed maintained its cautious stance, keeping rates unchanged through Q2 2026.', '6 hours ago', FALSE, 'updates'),
  ('alert-abd-4', 'user-abdullah', 'DOCUMENT', 'Q4 2025 Portfolio Report ready',
   'Your quarterly performance report is now available. Portfolio value: $94,830.19.', '8 hours ago', FALSE, 'updates'),
  ('alert-abd-5', 'user-abdullah', 'OPPORTUNITY', 'Emerging market bonds offer 6.8% yields',
   'High-quality sovereign debt in stable economies now offers attractive income.', 'Yesterday', FALSE, 'opportunities'),
  ('alert-abd-6', 'user-abdullah', 'PORTFOLIO_ALERT', 'Portfolio up $758 today on equity gains',
   'Your portfolio gained $758.64 (+0.8%) today, driven by your 55% stock allocation.', 'Yesterday', FALSE, 'alerts'),
  ('alert-abd-7', 'user-abdullah', 'EVENT', 'Reminder: Estate planning consultation',
   'Your scheduled consultation with our estate planning specialist is tomorrow at 2:00 PM.', '2 days ago', FALSE, 'updates')
ON CONFLICT (id) DO NOTHING;

-- Content Items (Home cards)
INSERT INTO content_items (id, category, category_type, title, description, timestamp, button_text, secondary_button_text, image, sources_count, topic_label_color, target_screen) VALUES
  ('ci-1', 'PORTFOLIO RISK ALERT', 'PORTFOLIO RISK ALERT', 'Your growth stocks allocation has moved above target',
   'Current exposure is 33%, above your 20–30% target range.', '2 hours ago', 'What''s changed?', NULL, NULL, NULL, NULL, 'home'),
  ('ci-2', 'MARKET OPPORTUNITY INSIGHT', 'MARKET OPPORTUNITY INSIGHT', 'GCC bonds are seeing renewed investor demand',
   'Yields remain attractive for short-dated bonds.', '5 hours ago', 'Explore GCC bond opportunities', NULL, NULL, NULL, NULL, 'home'),
  ('ci-3', 'NEWS', 'NEWS', 'Markets jump on an unexpected year-end surge.',
   'Because your portfolio is tilted toward growth assets, this rally is likely to deliver larger short-term gains.', '37 min ago',
   'How does this impact my portfolio?', 'Should I consider a more balanced portfolio?',
   'https://images.unsplash.com/photo-1761850167081-473019536383?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 68, '#992929', 'home')
ON CONFLICT (id) DO NOTHING;

-- Peer Segments
INSERT INTO peer_segments (asset_class, user_percent, peer_percent, color) VALUES
  ('Equities', 55, 45, '#d9b3b5'),
  ('Fixed Income', 15, 25, '#6d3f42'),
  ('Cash', 20, 15, '#a87174'),
  ('Alternatives', 10, 15, '#8b5a5d')
ON CONFLICT DO NOTHING;

-- Chat Threads (Abdullah)
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-abd-1', 'user-abdullah', 'Portfolio rebalancing and asset allocation',
   'If you want, I can estimate the new risk/return profile for you.', NOW() - INTERVAL '52 minutes', NOW() - INTERVAL '52 minutes'),
  ('thread-abd-2', 'user-abdullah', 'Portfolio concentration and risk management',
   'Your tech exposure is 48%, compared to your target range of 30–40%.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('thread-abd-3', 'user-abdullah', 'Portfolio diversification and hedging against macroeconomic risks',
   'Silver jumps above $32/oz amid global debt concerns.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
