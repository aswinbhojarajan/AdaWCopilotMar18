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

-- Content Items (Discover - For You)
INSERT INTO content_items (id, category, category_type, title, context_title, description, timestamp, button_text, secondary_button_text, image, sources_count, target_screen, tab, detail_sections) VALUES
  ('disc-fy-1', 'YOUR PORTFOLIO', 'YOUR PORTFOLIO', 'Alternative investments show 23% lower correlation to public markets', 'Low alternatives allocation',
   'Your 10% alternatives allocation (crypto and commodities) is below the 12-15% recommended for portfolios of your size seeking true diversification.',
   '2 days ago', 'Show me alternatives that fit my portfolio', 'How would this change my risk?',
   'https://s.wsj.net/public/resources/images/IF-AD336_retire_M_20171129173731.jpg', 41, 'discover', 'forYou',
   '[{"title":"Why alternatives matter:","content":["Hedged risk during market downturns","Access to unique return streams","Portfolio protection in high-inflation environments"]},{"title":"Available opportunities:","content":"Private equity and private credit are available options beyond your current holdings."}]'),
  ('disc-fy-2', 'YOUR PORTFOLIO', 'YOUR PORTFOLIO', 'Your tech allocation outperformed by 12% this quarter', 'Tech outperformance this quarter',
   'AI and semiconductor holdings drove strong gains. Consider rebalancing to lock in profits while maintaining growth exposure.',
   '8 min ago', 'Should I rebalance now?', 'Show optimal profit-taking strategy',
   'https://static01.nyt.com/images/2024/08/27/climate/26cli-askclimate-ai/26cli-askclimate-ai-articleLarge.jpg?quality=75&auto=webp&disable=upscale', NULL, 'discover', 'forYou',
   '[{"title":"Performance breakdown:","content":["Tech holdings: +12.3% vs +8.1% sector average","AI infrastructure stocks: +18.2%","Semiconductor positions: +15.7%"]},{"title":"Advisor recommendation:","content":"Consider taking 20% profits from strongest performers to maintain your risk target while preserving upside potential."}]'),
  ('disc-fy-3', 'OPPORTUNITY', 'OPPORTUNITY', 'Emerging market bonds offer 6.8% yields with improving credit profiles', 'EM bonds opportunity',
   'Your current 15% fixed income allocation could benefit from higher-yielding sovereign debt in stable economies.',
   '5 hours ago', 'Compare to my current fixed income', 'Show me top-rated EM bonds',
   'https://images.unsplash.com/photo-1760971439988-b236b4207d47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 63, 'discover', 'forYou',
   '[{"title":"Why you are seeing this:","content":["Fixed income allocation: 8% (below 20% target)","Current yield on holdings: 4.2%","Credit ratings improving across EM sovereigns"]},{"title":"Opportunity details:","content":"Allocate 5-7% to EM bonds to boost income generation while maintaining diversification across geographies and credit quality."}]'),
  ('disc-fy-4', 'WEALTH PLANNING', 'WEALTH PLANNING', 'Multi-generational wealth transfer: Structuring for tax efficiency', 'Estate tax efficiency',
   'New regulations create opportunities to reduce estate tax burden by up to 35% through strategic trust structures.',
   '3 days ago', 'Model my estate tax scenarios', 'Compare trust structures for me',
   'https://m.wsj.net/video-atmo/20251114/768af122-9e27-4ad1-9835-a287a62d07dd/1/dynasty-header_562x1000.jpg', 28, 'discover', 'forYou',
   '[{"title":"Regulatory changes:","content":["Estate tax reduction up to 35%","Strategic trust structures","Multi-generational wealth planning"]},{"title":"Implementation approach:","content":"Work with a financial advisor to model different scenarios and choose the most tax-efficient structure."}]')
ON CONFLICT (id) DO NOTHING;

-- Content Items (Discover - What's Happening)
INSERT INTO content_items (id, category, category_type, title, context_title, description, timestamp, button_text, secondary_button_text, image, sources_count, target_screen, tab, detail_sections) VALUES
  ('disc-wh-1', 'MARKET NEWS', 'MARKET NEWS', 'GCC sovereign wealth funds pivot to alternative assets', 'GCC wealth funds alternative assets pivot',
   'Regional institutions allocate $8.2B to private equity and infrastructure this month.',
   '42 min ago', 'How does this affect my portfolio?', 'Show me similar opportunities',
   'https://images.unsplash.com/photo-1766214272421-ca9354ba2cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 54, 'discover', 'whatsHappening', NULL),
  ('disc-wh-2', 'MARKET NEWS', 'MARKET NEWS', 'Federal Reserve signals pause on rate cuts through Q2 2026', 'Fed signals rate cut pause',
   'Central bank maintains cautious stance as inflation remains above target. Impact on bond yields expected.',
   '1 hour ago', 'Impact on my bond holdings?', 'Should I adjust my allocations?',
   'https://images.unsplash.com/photo-1711967152819-f493f7ab4cf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 82, 'discover', 'whatsHappening', NULL),
  ('disc-wh-3', 'MARKET NEWS', 'MARKET NEWS', 'GCC equity markets outperform global indices for third straight quarter', 'GCC markets outperformance',
   'Strong earnings and economic diversification drive regional market leadership amid global uncertainty.',
   '3 hours ago', 'Compare to my regional exposure', 'Show top GCC opportunities',
   'https://images.unsplash.com/photo-1764675107575-7a33cbdb7905?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 47, 'discover', 'whatsHappening', NULL),
  ('disc-wh-4', 'INVESTMENT EDUCATION', 'INVESTMENT EDUCATION', 'Sustainable investing delivers competitive returns with lower risk', 'ESG investing returns',
   'ESG-screened portfolios matched market returns with 18% less volatility over the past 5 years.',
   '5 hours ago', 'Analyze my portfolio''s ESG score', 'Show ESG alternatives for my holdings',
   'https://images.unsplash.com/photo-1743352476730-056502fba10b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', NULL, 'discover', 'whatsHappening',
   '[{"title":"Performance insights:","content":["ESG leaders: +9.8% annualized vs +9.6% for broad market","Sharpe ratio: 0.82 vs 0.69 for conventional portfolios","Downside capture: 82% vs market average of 95%"]}]'),
  ('disc-wh-5', 'INVESTMENT EDUCATION', 'INVESTMENT EDUCATION', 'Fine wine and rare spirits: An uncorrelated 12% annual return', 'Wine and spirits investment',
   'Investment-grade collectibles offer portfolio diversification with tangible asset backing and strong historical performance.',
   '8 hours ago', 'How much should I allocate?', 'Show available collectibles funds',
   'https://images.unsplash.com/photo-1765850258622-9d9afa7cf4e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', NULL, 'discover', 'whatsHappening',
   '[{"title":"Asset class performance:","content":["Fine wine index: +11.8% annualized (10 years)","Rare whisky: +15.2% annualized (10 years)","Correlation to S&P 500: 0.12"]},{"title":"Access and liquidity:","content":"Professional-managed funds provide authentication, insurance, optimal storage, and quarterly liquidity windows."}]'),
  ('disc-wh-6', 'INVESTMENT EDUCATION', 'INVESTMENT EDUCATION', 'Institutional crypto adoption reaches inflection point', 'Institutional crypto adoption',
   'Major custody solutions and regulatory clarity make digital assets viable for 2-5% portfolio allocation.',
   'Yesterday', 'How have crypto prices been moving?', 'Which institutions have been investing?',
   'https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', NULL, 'discover', 'whatsHappening',
   '[{"title":"Why now:","content":["SEC-approved Bitcoin and Ethereum ETFs","Institutional-grade custody through prime brokers","Improved correlation characteristics during inflation","Enhanced regulatory framework in UAE"]},{"title":"Recommended approach:","content":"Your holding is primarily in Bitcoin, consider other coins to increase growth exposure."}]'),
  ('disc-wh-7', 'MARKET NEWS', 'MARKET NEWS', 'Luxury real estate prices surge 14% in prime Dubai locations', 'Dubai luxury real estate surge',
   'Strong international demand and limited inventory drive continued appreciation in premium segments.',
   'Yesterday', 'Should I increase property allocation?', 'Show prime Dubai opportunities',
   'https://images.unsplash.com/photo-1764675107575-7a33cbdb7905?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 38, 'discover', 'whatsHappening', NULL)
ON CONFLICT (id) DO NOTHING;

-- Peer Segments
INSERT INTO peer_segments (asset_class, user_percent, peer_percent, color) VALUES
  ('Equities', 55, 45, '#d9b3b5'),
  ('Fixed Income', 15, 25, '#6d3f42'),
  ('Cash', 20, 15, '#a87174'),
  ('Alternatives', 10, 15, '#8b5a5d')
ON CONFLICT DO NOTHING;

-- Performance History (Abdullah - 1 year of daily data)
INSERT INTO performance_history (user_id, value, recorded_date)
SELECT 'user-abdullah',
       78000 + (ROW_NUMBER() OVER (ORDER BY d))::numeric * 46.19,
       d::date
FROM generate_series(
  CURRENT_DATE - INTERVAL '365 days',
  CURRENT_DATE,
  '1 day'
) AS d
ON CONFLICT (user_id, recorded_date) DO NOTHING;

-- Update the most recent performance_history entry to match snapshot
UPDATE performance_history
SET value = 94830.19
WHERE user_id = 'user-abdullah' AND recorded_date = CURRENT_DATE;

-- Poll Questions
INSERT INTO poll_questions (id, question, created_at) VALUES
  ('poll-1', 'Which region do you feel most confident investing in right now?', NOW())
ON CONFLICT (id) DO NOTHING;

-- Poll Options
INSERT INTO poll_options (id, poll_id, label, vote_count) VALUES
  ('opt-1-1', 'poll-1', 'North America', 32),
  ('opt-1-2', 'poll-1', 'Europe', 18),
  ('opt-1-3', 'poll-1', 'Asia Pacific', 24),
  ('opt-1-4', 'poll-1', 'Emerging Markets', 12),
  ('opt-1-5', 'poll-1', 'Global/Diversified', 14)
ON CONFLICT (id) DO NOTHING;

-- Chat Threads (Abdullah)
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-abd-1', 'user-abdullah', 'Portfolio rebalancing and asset allocation',
   'If you want, I can estimate the new risk/return profile for you.', NOW() - INTERVAL '52 minutes', NOW() - INTERVAL '52 minutes'),
  ('thread-abd-2', 'user-abdullah', 'Portfolio concentration and risk management',
   'Your tech exposure is 48%, compared to your target range of 30–40%.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('thread-abd-3', 'user-abdullah', 'Portfolio diversification and hedging against macroeconomic risks',
   'Silver jumps above $32/oz amid global debt concerns.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Chat Messages (Abdullah)
INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-abd-1-1', 'thread-abd-1', 'user', 'I want to review my portfolio rebalancing options.', NOW() - INTERVAL '55 minutes'),
  ('msg-abd-1-2', 'thread-abd-1', 'assistant', 'Your technology allocation currently stands at 48% (AAPL, MSFT, AMZN), which exceeds your target range of 35-40%. I recommend rebalancing 8-10% into diversified equities or fixed income. Would you like me to prepare a detailed rebalancing plan?', NOW() - INTERVAL '54 minutes'),
  ('msg-abd-1-3', 'thread-abd-1', 'user', 'What about my risk/return profile?', NOW() - INTERVAL '53 minutes'),
  ('msg-abd-1-4', 'thread-abd-1', 'assistant', 'If you want, I can estimate the new risk/return profile for you.', NOW() - INTERVAL '52 minutes'),
  ('msg-abd-2-1', 'thread-abd-2', 'user', 'How concentrated is my portfolio?', NOW() - INTERVAL '2 days 1 hour'),
  ('msg-abd-2-2', 'thread-abd-2', 'assistant', 'Your tech exposure is 48%, compared to your target range of 30-40%. This represents significant concentration risk. Would you like to explore diversification options?', NOW() - INTERVAL '2 days'),
  ('msg-abd-3-1', 'thread-abd-3', 'user', 'What hedging options do I have?', NOW() - INTERVAL '3 days 1 hour'),
  ('msg-abd-3-2', 'thread-abd-3', 'assistant', 'Silver jumps above $32/oz amid global debt concerns. Consider commodities and precious metals as a hedge against macroeconomic uncertainty.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
