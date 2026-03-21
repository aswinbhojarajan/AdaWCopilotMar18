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
  ('acc-abd-2', 'user-abdullah', 'Interactive Brokers', '#DA1F26', 'IB', 'brokerage', 64656.88, '5 min ago', 'synced'),
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
  ('acc-omr-2', 'user-omar', 'Robinhood', '#00C805', 'RH', 'brokerage', 87001.00, '2 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

-- Accounts (Layla)
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-lay-1', 'user-layla', 'Mashreq Bank', '#ED1C24', 'MSHQ', 'savings', 32100.00, '15 min ago', 'synced'),
  ('acc-lay-2', 'user-layla', 'Charles Schwab', '#00A3E0', 'CS', 'brokerage', 78400.00, '8 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

-- Positions (Abdullah's brokerage)
INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-abd-1', 'acc-abd-2', 'NVDA', 'NVIDIA Corp.', 15, 135.40, 90.00, 'Stocks'),
  ('pos-abd-2', 'acc-abd-2', 'AAPL', 'Apple Inc.', 12, 208.63, 165.00, 'Stocks'),
  ('pos-abd-3', 'acc-abd-2', 'BTC', 'Bitcoin', 0.0195, 87535.00, 62000.00, 'Crypto'),
  ('pos-abd-4', 'acc-abd-2', 'MSFT', 'Microsoft Corp.', 8, 420.50, 320.00, 'Stocks'),
  ('pos-abd-5', 'acc-abd-2', 'AGG', 'iShares Core Bond ETF', 130, 109.42, 105.00, 'Bonds'),
  ('pos-abd-6', 'acc-abd-2', 'GLD', 'SPDR Gold Shares', 18, 210.73, 185.00, 'Commodities'),
  ('pos-abd-7', 'acc-abd-2', 'ETH', 'Ethereum', 1.5, 2450.00, 1800.00, 'Crypto')
ON CONFLICT (id) DO NOTHING;

-- Portfolio Snapshots (Abdullah)
INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-abd-1', 'user-abdullah', 93105.94, 744.85, 0.8, NOW())
ON CONFLICT (id) DO NOTHING;

-- Portfolio Snapshots (other personas)
INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-fat-1', 'user-fatima', 165700.00, 430.20, 0.26, NOW()),
  ('snap-omr-1', 'user-omar', 99801.00, 1237.53, 1.24, NOW()),
  ('snap-lay-1', 'user-layla', 110500.00, -320.50, -0.29, NOW())
ON CONFLICT (id) DO NOTHING;

-- Goals (Abdullah)
INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-abd-1', 'user-abdullah', 'House deposit', 30000, 18966.04, 20500.00, 'Dec 2026', 'Home', '#a87174', 'needs-attention',
   'You''re slightly behind pace. Increasing monthly contributions by $919 keeps you on track.', 'Why am I off track?'),
  ('goal-abd-2', 'user-abdullah', 'Education fund', 100000, 33190.57, 31800.00, 'Sep 2035', 'GraduationCap', '#6d3f42', 'needs-attention',
   'You''re behind schedule. Consistent contributions now will help you catch up over time.', 'How can I get back on track?')
ON CONFLICT (id) DO NOTHING;

-- Goals (Fatima)
INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-fat-1', 'user-fatima', 'Retirement', 500000, 165700.00, 162300.00, 'Dec 2040', 'Wallet', '#6d3f42', 'on-track',
   'You''re on track for your retirement goal. Keep up the consistent contributions.', 'Review my plan')
ON CONFLICT (id) DO NOTHING;

-- Clean up existing alerts and content for consistency updates
DELETE FROM alerts WHERE user_id = 'user-abdullah';
DELETE FROM content_items WHERE id IN ('ci-1', 'ci-2', 'ci-3');
DELETE FROM chat_messages WHERE thread_id IN ('thread-abd-1', 'thread-abd-2', 'thread-abd-3');
DELETE FROM chat_threads WHERE user_id = 'user-abdullah';

-- Alerts (Abdullah)
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-abd-1', 'user-abdullah', 'PORTFOLIO_ALERT', 'Cash allocation at 66% of portfolio',
   'Your cash holdings now represent 66% of your portfolio. Consider deploying idle cash into income-generating assets.', '12 min ago', TRUE, 'alerts'),
  ('alert-abd-2', 'user-abdullah', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Hi Abdullah, I''ve reviewed your Q4 performance. Let''s schedule a call. —Khalid', '2 hours ago', TRUE, 'updates'),
  ('alert-abd-3', 'user-abdullah', 'MARKET_UPDATE', 'Federal Reserve signals pause on rate cuts',
   'The Fed maintained its cautious stance, keeping rates unchanged through Q2 2026.', '6 hours ago', FALSE, 'updates'),
  ('alert-abd-4', 'user-abdullah', 'DOCUMENT', 'Q4 2025 Portfolio Report ready',
   'Your quarterly performance report is now available. Portfolio value: $93,105.94.', '8 hours ago', FALSE, 'updates'),
  ('alert-abd-5', 'user-abdullah', 'OPPORTUNITY', 'Emerging market bonds offer 6.8% yields',
   'High-quality sovereign debt in stable economies now offers attractive income.', 'Yesterday', FALSE, 'opportunities'),
  ('alert-abd-6', 'user-abdullah', 'PORTFOLIO_ALERT', 'Portfolio up $745 today on equity gains',
   'Your portfolio gained $744.85 (+0.8%) today, driven by your equity allocation.', 'Yesterday', FALSE, 'alerts'),
  ('alert-abd-7', 'user-abdullah', 'EVENT', 'Reminder: Estate planning consultation',
   'Your scheduled consultation with our estate planning specialist is tomorrow at 2:00 PM.', '2 days ago', FALSE, 'updates')
ON CONFLICT (id) DO NOTHING;

-- Content Items (Home cards)
INSERT INTO content_items (id, category, category_type, title, description, timestamp, button_text, secondary_button_text, image, sources_count, topic_label_color, target_screen) VALUES
  ('ci-1', 'PORTFOLIO RISK ALERT', 'PORTFOLIO RISK ALERT', 'Your cash allocation is well above target',
   'Cash at 66% of portfolio — consider deploying into income-generating assets.', '2 hours ago', 'What''s changed?', NULL, NULL, NULL, NULL, 'home'),
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
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 41, 'discover', 'forYou',
   '[{"title":"Why alternatives matter:","content":["Hedged risk during market downturns","Access to unique return streams","Portfolio protection in high-inflation environments"]},{"title":"Available opportunities:","content":"Private equity and private credit are available options beyond your current holdings."}]'),
  ('disc-fy-2', 'YOUR PORTFOLIO', 'YOUR PORTFOLIO', 'Your tech allocation outperformed by 12% this quarter', 'Tech outperformance this quarter',
   'AI and semiconductor holdings drove strong gains. Consider rebalancing to lock in profits while maintaining growth exposure.',
   '8 min ago', 'Should I rebalance now?', 'Show optimal profit-taking strategy',
   'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', NULL, 'discover', 'forYou',
   '[{"title":"Performance breakdown:","content":["Tech holdings: +12.3% vs +8.1% sector average","AI infrastructure stocks: +18.2%","Semiconductor positions: +15.7%"]},{"title":"Advisor recommendation:","content":"Consider taking 20% profits from strongest performers to maintain your risk target while preserving upside potential."}]'),
  ('disc-fy-3', 'OPPORTUNITY', 'OPPORTUNITY', 'Emerging market bonds offer 6.8% yields with improving credit profiles', 'EM bonds opportunity',
   'Your current 15% fixed income allocation could benefit from higher-yielding sovereign debt in stable economies.',
   '5 hours ago', 'Compare to my current fixed income', 'Show me top-rated EM bonds',
   'https://images.unsplash.com/photo-1760971439988-b236b4207d47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 63, 'discover', 'forYou',
   '[{"title":"Why you are seeing this:","content":["Fixed income allocation: 8% (below 20% target)","Current yield on holdings: 4.2%","Credit ratings improving across EM sovereigns"]},{"title":"Opportunity details:","content":"Allocate 5-7% to EM bonds to boost income generation while maintaining diversification across geographies and credit quality."}]'),
  ('disc-fy-4', 'WEALTH PLANNING', 'WEALTH PLANNING', 'Multi-generational wealth transfer: Structuring for tax efficiency', 'Estate tax efficiency',
   'New regulations create opportunities to reduce estate tax burden by up to 35% through strategic trust structures.',
   '3 days ago', 'Model my estate tax scenarios', 'Compare trust structures for me',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080', 28, 'discover', 'forYou',
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
DELETE FROM peer_segments;
INSERT INTO peer_segments (asset_class, user_percent, peer_percent, color) VALUES
  ('Equities', 55, 45, '#d9b3b5'),
  ('Fixed Income', 15, 25, '#6d3f42'),
  ('Cash', 20, 15, '#a87174'),
  ('Alternatives', 10, 15, '#8b5a5d')
ON CONFLICT (asset_class) DO NOTHING;

-- Performance History (Abdullah - Holdings-weighted compound return model)
-- Allocation: Stocks $7,449 (8%), Bonds $14,225 (15%), Crypto $5,382 (6%), Commodities $3,793 (4%), Cash $62,258 (66%)
-- Daily returns: deterministic hash-based pseudo-random per asset class, weighted by allocation, compounded via cumulative sum
-- No trigonometric functions — returns derived from hashtext() for deterministic reproducibility
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.08 * 0.012 * ((hashtext('ABD_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.15 * 0.003 * ((hashtext('ABD_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.06 * 0.030 * ((hashtext('ABD_C' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.04 * 0.010 * ((hashtext('ABD_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-abdullah',
  76500 + n * 45.37 + 93106 * cum_r
    - CASE WHEN n BETWEEN 95 AND 110 THEN 1800 ELSE 0 END
    - CASE WHEN n BETWEEN 240 AND 255 THEN 1200 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;

UPDATE performance_history
SET value = 93105.94
WHERE user_id = 'user-abdullah' AND recorded_date = CURRENT_DATE;
UPDATE performance_history
SET value = 92361.09
WHERE user_id = 'user-abdullah' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

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
   'Your cash allocation is 66%, well above the typical 20–30% range for a moderate portfolio.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('thread-abd-3', 'user-abdullah', 'Portfolio diversification and hedging against macroeconomic risks',
   'Silver jumps above $32/oz amid global debt concerns.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Chat Messages (Abdullah)
INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-abd-1-1', 'thread-abd-1', 'user', 'I want to review my portfolio rebalancing options.', NOW() - INTERVAL '55 minutes'),
  ('msg-abd-1-2', 'thread-abd-1', 'assistant', 'Your portfolio currently holds 66% in cash across savings, checking, and uninvested brokerage funds. With equities at only 8% (NVDA, AAPL, MSFT), there is room to deploy capital into growth or income assets. Would you like me to prepare a deployment plan?', NOW() - INTERVAL '54 minutes'),
  ('msg-abd-1-3', 'thread-abd-1', 'user', 'What about my risk/return profile?', NOW() - INTERVAL '53 minutes'),
  ('msg-abd-1-4', 'thread-abd-1', 'assistant', 'If you want, I can estimate the new risk/return profile for you.', NOW() - INTERVAL '52 minutes'),
  ('msg-abd-2-1', 'thread-abd-2', 'user', 'How concentrated is my portfolio?', NOW() - INTERVAL '2 days 1 hour'),
  ('msg-abd-2-2', 'thread-abd-2', 'assistant', 'Your cash allocation is 66%, well above the typical 20-30% range for a moderate investor. Deploying even 20% of idle cash into a diversified mix of equities and bonds could improve returns. Would you like to explore deployment options?', NOW() - INTERVAL '2 days'),
  ('msg-abd-3-1', 'thread-abd-3', 'user', 'What hedging options do I have?', NOW() - INTERVAL '3 days 1 hour'),
  ('msg-abd-3-2', 'thread-abd-3', 'assistant', 'Silver jumps above $32/oz amid global debt concerns. Consider commodities and precious metals as a hedge against macroeconomic uncertainty.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Abdullah)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-abd-1', 'acc-abd-2', 'buy', 'NVDA', 5, 235.00, 1175.00, NOW() - INTERVAL '15 days'),
  ('txn-abd-1b', 'acc-abd-2', 'buy', 'NVDA', 10, 85.00, 850.00, NOW() - INTERVAL '300 days'),
  ('txn-abd-2', 'acc-abd-2', 'buy', 'AAPL', 4, 200.00, 800.00, NOW() - INTERVAL '30 days'),
  ('txn-abd-2b', 'acc-abd-2', 'buy', 'AAPL', 8, 170.00, 1360.00, NOW() - INTERVAL '270 days'),
  ('txn-abd-3', 'acc-abd-2', 'buy', 'MSFT', 3, 410.00, 1230.00, NOW() - INTERVAL '45 days'),
  ('txn-abd-3b', 'acc-abd-2', 'buy', 'MSFT', 5, 380.00, 1900.00, NOW() - INTERVAL '240 days'),
  ('txn-abd-4', 'acc-abd-2', 'dividend', 'AAPL', NULL, NULL, 36.00, NOW() - INTERVAL '8 days'),
  ('txn-abd-5', 'acc-abd-1', 'deposit', NULL, NULL, NULL, 5000.00, NOW() - INTERVAL '20 days'),
  ('txn-abd-6', 'acc-abd-2', 'buy', 'GLD', 5, 200.00, 1000.00, NOW() - INTERVAL '60 days'),
  ('txn-abd-6b', 'acc-abd-2', 'buy', 'GLD', 13, 185.00, 2405.00, NOW() - INTERVAL '260 days'),
  ('txn-abd-7', 'acc-abd-2', 'buy', 'AGG', 30, 107.00, 3210.00, NOW() - INTERVAL '90 days'),
  ('txn-abd-7b', 'acc-abd-2', 'buy', 'AGG', 50, 104.00, 5200.00, NOW() - INTERVAL '210 days'),
  ('txn-abd-7c', 'acc-abd-2', 'buy', 'AGG', 50, 102.50, 5125.00, NOW() - INTERVAL '320 days'),
  ('txn-abd-8', 'acc-abd-2', 'buy', 'BTC', 0.0195, 62000.00, 1209.00, NOW() - INTERVAL '120 days'),
  ('txn-abd-9', 'acc-abd-2', 'buy', 'ETH', 1.5, 1800.00, 2700.00, NOW() - INTERVAL '100 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Fatima)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-fat-1', 'acc-fat-2', 'buy', 'AGG', 50, 108.00, 5400.00, NOW() - INTERVAL '20 days'),
  ('txn-fat-1b', 'acc-fat-2', 'buy', 'AGG', 150, 105.00, 15750.00, NOW() - INTERVAL '250 days'),
  ('txn-fat-1c', 'acc-fat-2', 'buy', 'AGG', 150, 103.50, 15525.00, NOW() - INTERVAL '330 days'),
  ('txn-fat-2', 'acc-fat-2', 'dividend', 'AGG', NULL, NULL, 125.00, NOW() - INTERVAL '5 days'),
  ('txn-fat-3', 'acc-fat-1', 'deposit', NULL, NULL, NULL, 8000.00, NOW() - INTERVAL '10 days'),
  ('txn-fat-4', 'acc-fat-2', 'buy', 'BND', 40, 72.50, 2900.00, NOW() - INTERVAL '40 days'),
  ('txn-fat-4b', 'acc-fat-2', 'buy', 'BND', 110, 71.00, 7810.00, NOW() - INTERVAL '220 days'),
  ('txn-fat-4c', 'acc-fat-2', 'buy', 'BND', 100, 70.50, 7050.00, NOW() - INTERVAL '300 days'),
  ('txn-fat-5', 'acc-fat-2', 'buy', 'TLT', 120, 96.00, 11520.00, NOW() - INTERVAL '60 days'),
  ('txn-fat-6', 'acc-fat-2', 'buy', 'GLD', 55, 180.00, 9900.00, NOW() - INTERVAL '80 days'),
  ('txn-fat-7', 'acc-fat-2', 'buy', 'JNJ', 50, 150.00, 7500.00, NOW() - INTERVAL '90 days'),
  ('txn-fat-8', 'acc-fat-2', 'buy', 'PG', 40, 155.00, 6200.00, NOW() - INTERVAL '100 days'),
  ('txn-fat-9', 'acc-fat-2', 'buy', 'VEA', 100, 45.00, 4500.00, NOW() - INTERVAL '110 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Omar)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-omr-1', 'acc-omr-2', 'buy', 'TSLA', 15, 255.00, 3825.00, NOW() - INTERVAL '12 days'),
  ('txn-omr-2', 'acc-omr-2', 'sell', 'AMZN', 8, 188.00, 1504.00, NOW() - INTERVAL '3 days'),
  ('txn-omr-3', 'acc-omr-2', 'buy', 'META', 10, 505.00, 5050.00, NOW() - INTERVAL '25 days'),
  ('txn-omr-3b', 'acc-omr-2', 'buy', 'META', 5, 400.00, 2000.00, NOW() - INTERVAL '200 days'),
  ('txn-omr-4', 'acc-omr-2', 'buy', 'BTC', 0.10, 85000.00, 8500.00, NOW() - INTERVAL '50 days'),
  ('txn-omr-4b', 'acc-omr-2', 'buy', 'BTC', 0.02, 95000.00, 1900.00, NOW() - INTERVAL '280 days'),
  ('txn-omr-5', 'acc-omr-1', 'deposit', NULL, NULL, NULL, 3000.00, NOW() - INTERVAL '7 days'),
  ('txn-omr-6', 'acc-omr-2', 'buy', 'NVDA', 20, 90.00, 1800.00, NOW() - INTERVAL '180 days'),
  ('txn-omr-7', 'acc-omr-2', 'buy', 'AMD', 30, 130.00, 3900.00, NOW() - INTERVAL '60 days'),
  ('txn-omr-8', 'acc-omr-2', 'buy', 'AMZN', 33, 160.00, 5280.00, NOW() - INTERVAL '90 days'),
  ('txn-omr-9', 'acc-omr-2', 'buy', 'ETH', 3.5, 3000.00, 10500.00, NOW() - INTERVAL '70 days'),
  ('txn-omr-10', 'acc-omr-2', 'buy', 'SOL', 40, 170.00, 6800.00, NOW() - INTERVAL '45 days'),
  ('txn-omr-11', 'acc-omr-2', 'buy', 'TSLA', 10, 280.00, 2800.00, NOW() - INTERVAL '120 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Layla)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-lay-1', 'acc-lay-2', 'buy', 'JNJ', 20, 155.00, 3100.00, NOW() - INTERVAL '18 days'),
  ('txn-lay-2', 'acc-lay-2', 'buy', 'PG', 15, 160.00, 2400.00, NOW() - INTERVAL '35 days'),
  ('txn-lay-2b', 'acc-lay-2', 'buy', 'PG', 10, 152.00, 1520.00, NOW() - INTERVAL '200 days'),
  ('txn-lay-3', 'acc-lay-2', 'dividend', 'KO', NULL, NULL, 85.00, NOW() - INTERVAL '6 days'),
  ('txn-lay-4', 'acc-lay-1', 'deposit', NULL, NULL, NULL, 4000.00, NOW() - INTERVAL '14 days'),
  ('txn-lay-5', 'acc-lay-2', 'buy', 'SPY', 30, 450.00, 13500.00, NOW() - INTERVAL '150 days'),
  ('txn-lay-6', 'acc-lay-2', 'buy', 'AGG', 120, 107.00, 12840.00, NOW() - INTERVAL '120 days'),
  ('txn-lay-7', 'acc-lay-2', 'buy', 'GLD', 30, 190.00, 5700.00, NOW() - INTERVAL '90 days'),
  ('txn-lay-8', 'acc-lay-2', 'buy', 'KO', 80, 57.00, 4560.00, NOW() - INTERVAL '100 days'),
  ('txn-lay-9', 'acc-lay-2', 'buy', 'AAPL', 15, 175.00, 2625.00, NOW() - INTERVAL '60 days'),
  ('txn-lay-10', 'acc-lay-2', 'buy', 'VWO', 80, 40.00, 3200.00, NOW() - INTERVAL '130 days'),
  ('txn-lay-11', 'acc-lay-2', 'buy', 'JNJ', 15, 148.00, 2220.00, NOW() - INTERVAL '140 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- AGENT ARCHITECTURE FOUNDATION DATA
-- ============================================================

-- Tenant
INSERT INTO tenants (id, name, jurisdiction, status) VALUES
  ('bank_demo_uae', 'Demo Bank UAE', 'UAE', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenant_configs (tenant_id, jurisdiction, advisory_mode, can_name_securities, can_compare_products, can_generate_recommendations, can_generate_next_best_actions, requires_advisor_handoff_for_specific_advice, disclosure_profile, allowed_tool_profiles, provider_config, feature_flags, tone, language, execution_routing_mode, can_prepare_trade_plans)
VALUES (
  'bank_demo_uae', 'UAE', 'personalized_insights_only',
  TRUE, FALSE, FALSE, TRUE, TRUE,
  'uae_affluent_v1',
  '{portfolio_read,market_read,news_read,macro_read,fx_read,health_compute,workflow_light,execution_route}',
  '{"market_primary":"mock","news_primary":"mock","macro_primary":"mock","fx_primary":"mock","filing_primary":"mock","identity_primary":"mock"}',
  '{"enable_agent_tracing":true,"enable_advisor_handoff":true,"enable_recommendations":false,"enable_wealth_engine":true}',
  'professional', 'en',
  'rm_handoff', TRUE
)
ON CONFLICT (tenant_id) DO NOTHING;

-- Update existing users with tenant_id
UPDATE users SET tenant_id = 'bank_demo_uae' WHERE tenant_id IS NULL;

-- Instruments (40 instruments covering existing positions + broader market)
INSERT INTO instruments (symbol, name, asset_class, sector, geography, currency, instrument_type, isin, exchange) VALUES
  ('NVDA', 'NVIDIA Corporation', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US67066G1040', 'NASDAQ'),
  ('AAPL', 'Apple Inc.', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US0378331005', 'NASDAQ'),
  ('MSFT', 'Microsoft Corporation', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US5949181045', 'NASDAQ'),
  ('GOOGL', 'Alphabet Inc.', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US02079K3059', 'NASDAQ'),
  ('AMZN', 'Amazon.com Inc.', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US0231351067', 'NASDAQ'),
  ('META', 'Meta Platforms Inc.', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US30303M1027', 'NASDAQ'),
  ('TSLA', 'Tesla Inc.', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US88160R1014', 'NASDAQ'),
  ('JPM', 'JPMorgan Chase & Co.', 'Stocks', 'Financials', 'US', 'USD', 'equity', 'US46625H1005', 'NYSE'),
  ('V', 'Visa Inc.', 'Stocks', 'Financials', 'US', 'USD', 'equity', 'US92826C8394', 'NYSE'),
  ('JNJ', 'Johnson & Johnson', 'Stocks', 'Healthcare', 'US', 'USD', 'equity', 'US4781601046', 'NYSE'),
  ('UNH', 'UnitedHealth Group', 'Stocks', 'Healthcare', 'US', 'USD', 'equity', 'US91324P1021', 'NYSE'),
  ('PG', 'Procter & Gamble Co.', 'Stocks', 'Consumer Staples', 'US', 'USD', 'equity', 'US7427181091', 'NYSE'),
  ('XOM', 'Exxon Mobil Corporation', 'Stocks', 'Energy', 'US', 'USD', 'equity', 'US30231G1022', 'NYSE'),
  ('ARAMCO', 'Saudi Aramco', 'Stocks', 'Energy', 'Saudi Arabia', 'SAR', 'equity', 'SA14TG012N13', 'TADAWUL'),
  ('EMAAR', 'Emaar Properties', 'Stocks', 'Real Estate', 'UAE', 'AED', 'equity', 'AEE000301011', 'DFM'),
  ('FAB', 'First Abu Dhabi Bank', 'Stocks', 'Financials', 'UAE', 'AED', 'equity', 'AEA000201013', 'ADX'),
  ('ADNOCDIST', 'ADNOC Distribution', 'Stocks', 'Energy', 'UAE', 'AED', 'equity', 'AEA006101017', 'ADX'),
  ('STC', 'Saudi Telecom Company', 'Stocks', 'Telecom', 'Saudi Arabia', 'SAR', 'equity', 'SA0007879543', 'TADAWUL'),
  ('AGG', 'iShares Core US Aggregate Bond ETF', 'Bonds', 'Fixed Income', 'US', 'USD', 'etf', 'US4642872422', 'NYSE'),
  ('BND', 'Vanguard Total Bond Market ETF', 'Bonds', 'Fixed Income', 'US', 'USD', 'etf', 'US9219378356', 'NASDAQ'),
  ('TLT', 'iShares 20+ Year Treasury Bond ETF', 'Bonds', 'Fixed Income', 'US', 'USD', 'etf', 'US4642874659', 'NASDAQ'),
  ('LQD', 'iShares Investment Grade Corporate Bond ETF', 'Bonds', 'Fixed Income', 'US', 'USD', 'etf', 'US4642872265', 'NYSE'),
  ('EMB', 'iShares JP Morgan USD Emerging Markets Bond ETF', 'Bonds', 'Fixed Income', 'Emerging Markets', 'USD', 'etf', 'US4642882819', 'NASDAQ'),
  ('GLD', 'SPDR Gold Shares', 'Commodities', 'Precious Metals', 'Global', 'USD', 'etf', 'US78463V1070', 'NYSE'),
  ('SLV', 'iShares Silver Trust', 'Commodities', 'Precious Metals', 'Global', 'USD', 'etf', 'US46428Q1094', 'NYSE'),
  ('USO', 'United States Oil Fund', 'Commodities', 'Energy', 'Global', 'USD', 'etf', 'US91232N2071', 'NYSE'),
  ('VWO', 'Vanguard FTSE Emerging Markets ETF', 'Stocks', 'Diversified', 'Emerging Markets', 'USD', 'etf', 'US9220428588', 'NYSE'),
  ('VEA', 'Vanguard FTSE Developed Markets ETF', 'Stocks', 'Diversified', 'International', 'USD', 'etf', 'US9219438580', 'NYSE'),
  ('SPY', 'SPDR S&P 500 ETF Trust', 'Stocks', 'Diversified', 'US', 'USD', 'etf', 'US78462F1030', 'NYSE'),
  ('QQQ', 'Invesco QQQ Trust', 'Stocks', 'Technology', 'US', 'USD', 'etf', 'US46090E1038', 'NASDAQ'),
  ('BTC', 'Bitcoin', 'Crypto', 'Digital Assets', 'Global', 'USD', 'crypto', NULL, NULL),
  ('ETH', 'Ethereum', 'Crypto', 'Digital Assets', 'Global', 'USD', 'crypto', NULL, NULL),
  ('SOL', 'Solana', 'Crypto', 'Digital Assets', 'Global', 'USD', 'crypto', NULL, NULL),
  ('VNQ', 'Vanguard Real Estate ETF', 'Stocks', 'Real Estate', 'US', 'USD', 'etf', 'US9229085538', 'NYSE'),
  ('IBIT', 'iShares Bitcoin Trust ETF', 'Crypto', 'Digital Assets', 'Global', 'USD', 'etf', 'US46438F1012', 'NASDAQ'),
  ('DIS', 'Walt Disney Co.', 'Stocks', 'Communication Services', 'US', 'USD', 'equity', 'US2546871060', 'NYSE'),
  ('NFLX', 'Netflix Inc.', 'Stocks', 'Communication Services', 'US', 'USD', 'equity', 'US64110L1061', 'NASDAQ'),
  ('AMD', 'Advanced Micro Devices', 'Stocks', 'Technology', 'US', 'USD', 'equity', 'US0079031078', 'NASDAQ'),
  ('BA', 'Boeing Co.', 'Stocks', 'Industrials', 'US', 'USD', 'equity', 'US0970231058', 'NYSE'),
  ('KO', 'Coca-Cola Co.', 'Stocks', 'Consumer Staples', 'US', 'USD', 'equity', 'US1912161007', 'NYSE')
ON CONFLICT (symbol) DO NOTHING;

-- Market Quotes (seeded for all 40 instruments)
INSERT INTO market_quotes (symbol, price, change, change_percent, volume, high, low, open_price, previous_close, source_provider, as_of) VALUES
  ('NVDA', 135.40, 3.15, 2.38, 45200000, 137.43, 133.37, 134.50, 132.25, 'mock', NOW()),
  ('AAPL', 208.63, -1.24, -0.59, 32100000, 211.75, 207.10, 209.50, 209.87, 'mock', NOW()),
  ('MSFT', 420.50, 3.15, 0.75, 18700000, 426.81, 414.21, 419.56, 417.35, 'mock', NOW()),
  ('GOOGL', 175.20, 2.10, 1.21, 22300000, 177.83, 172.57, 174.57, 173.10, 'mock', NOW()),
  ('AMZN', 192.50, 1.85, 0.97, 28400000, 195.39, 189.61, 191.95, 190.65, 'mock', NOW()),
  ('META', 520.30, 8.45, 1.65, 15600000, 528.11, 512.49, 517.77, 511.85, 'mock', NOW()),
  ('TSLA', 245.80, -4.20, -1.68, 52800000, 249.49, 242.11, 247.06, 250.00, 'mock', NOW()),
  ('JPM', 198.50, 2.30, 1.17, 8900000, 201.48, 195.52, 197.81, 196.20, 'mock', NOW()),
  ('V', 285.40, 1.60, 0.56, 6200000, 289.68, 281.12, 284.92, 283.80, 'mock', NOW()),
  ('JNJ', 158.20, 0.45, 0.29, 5800000, 160.57, 155.83, 157.87, 157.75, 'mock', NOW()),
  ('UNH', 520.10, -2.80, -0.54, 3200000, 527.90, 512.30, 521.54, 522.90, 'mock', NOW()),
  ('PG', 165.40, 0.78, 0.47, 4100000, 167.88, 162.92, 165.17, 164.62, 'mock', NOW()),
  ('XOM', 108.60, 1.92, 1.80, 12500000, 110.23, 106.97, 108.02, 106.68, 'mock', NOW()),
  ('ARAMCO', 32.80, 0.45, 1.39, 15000000, 33.29, 32.31, 32.67, 32.35, 'mock', NOW()),
  ('EMAAR', 9.85, 0.12, 1.23, 22000000, 10.00, 9.70, 9.82, 9.73, 'mock', NOW()),
  ('FAB', 14.20, 0.08, 0.57, 8500000, 14.41, 13.99, 14.18, 14.12, 'mock', NOW()),
  ('ADNOCDIST', 4.15, 0.05, 1.22, 12000000, 4.21, 4.09, 4.14, 4.10, 'mock', NOW()),
  ('STC', 55.40, 0.30, 0.54, 6300000, 56.23, 54.57, 55.24, 55.10, 'mock', NOW()),
  ('AGG', 109.42, -0.18, -0.16, 7300000, 111.06, 107.78, 109.47, 109.60, 'mock', NOW()),
  ('BND', 73.85, -0.12, -0.16, 5100000, 74.96, 72.74, 73.89, 73.97, 'mock', NOW()),
  ('TLT', 92.30, -0.65, -0.70, 14200000, 93.69, 90.91, 92.50, 92.95, 'mock', NOW()),
  ('LQD', 108.90, -0.22, -0.20, 3800000, 110.54, 107.26, 108.97, 109.12, 'mock', NOW()),
  ('EMB', 86.50, 0.35, 0.41, 4600000, 87.80, 85.20, 86.24, 86.15, 'mock', NOW()),
  ('GLD', 210.73, 3.42, 1.65, 9800000, 213.90, 207.56, 209.10, 207.31, 'mock', NOW()),
  ('SLV', 24.15, 0.58, 2.46, 11200000, 24.51, 23.79, 23.94, 23.57, 'mock', NOW()),
  ('USO', 78.50, 1.25, 1.62, 4200000, 79.68, 77.32, 78.27, 77.25, 'mock', NOW()),
  ('VWO', 43.20, 0.28, 0.65, 8900000, 43.85, 42.55, 43.07, 42.92, 'mock', NOW()),
  ('VEA', 48.70, 0.15, 0.31, 7200000, 49.43, 47.97, 48.56, 48.55, 'mock', NOW()),
  ('SPY', 520.30, 2.85, 0.55, 55000000, 528.10, 512.50, 519.74, 517.45, 'mock', NOW()),
  ('QQQ', 495.60, 4.10, 0.83, 32000000, 503.03, 488.17, 494.37, 491.50, 'mock', NOW()),
  ('BTC', 87535.00, -2150.00, -2.40, 28500000000, 88848.00, 86226.00, 89160.50, 89685.00, 'mock', NOW()),
  ('ETH', 2450.00, -85.00, -3.35, 12800000000, 2486.75, 2413.25, 2520.50, 2535.00, 'mock', NOW()),
  ('SOL', 145.80, -5.20, -3.44, 3200000000, 147.99, 143.61, 149.56, 151.00, 'mock', NOW()),
  ('VNQ', 85.10, 0.42, 0.50, 3100000, 86.38, 83.82, 84.85, 84.68, 'mock', NOW()),
  ('IBIT', 42.80, -1.05, -2.39, 25000000, 43.44, 42.16, 43.44, 43.85, 'mock', NOW()),
  ('DIS', 112.40, -0.85, -0.75, 7600000, 114.09, 110.71, 112.74, 113.25, 'mock', NOW()),
  ('NFLX', 685.40, 12.30, 1.83, 5400000, 695.68, 675.12, 679.74, 673.10, 'mock', NOW()),
  ('AMD', 165.20, 3.80, 2.35, 38500000, 167.68, 162.72, 163.86, 161.40, 'mock', NOW()),
  ('BA', 185.90, -2.40, -1.27, 6800000, 188.69, 183.11, 187.62, 188.30, 'mock', NOW()),
  ('KO', 62.30, 0.22, 0.35, 9100000, 63.23, 61.37, 62.11, 62.08, 'mock', NOW())
ON CONFLICT (symbol, source_provider) DO NOTHING;

-- ============================================================
-- NEW PERSONAS (4 additional, bringing total to 8)
-- ============================================================

-- New Users
INSERT INTO users (id, first_name, last_name, email, advisor_id, tenant_id) VALUES
  ('user-khalid', 'Khalid', 'Al-Mansouri', 'khalid@example.com', 'advisor-sarah', 'bank_demo_uae'),
  ('user-sara', 'Sara', 'Al-Fahad', 'sara@example.com', 'advisor-sarah', 'bank_demo_uae'),
  ('user-raj', 'Raj', 'Patel', 'raj@example.com', 'advisor-sarah', 'bank_demo_uae'),
  ('user-nadia', 'Nadia', 'Khoury', 'nadia@example.com', 'advisor-sarah', 'bank_demo_uae')
ON CONFLICT (id) DO NOTHING;

-- Risk Profiles for new personas
INSERT INTO risk_profiles (user_id, level, score, last_assessed) VALUES
  ('user-khalid', 'conservative', 28, '2025-11-01'),
  ('user-sara', 'moderate', 58, '2025-12-10'),
  ('user-raj', 'aggressive', 92, '2026-01-15'),
  ('user-nadia', 'moderate', 48, '2025-10-20')
ON CONFLICT (user_id) DO NOTHING;

-- Khalid Al-Mansouri: Cash-heavy uncertain investor (KSA HNW conservative)
-- Storyline: High idle cash, very conservative, mostly bonds, worried about inflation eroding savings
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-kha-1', 'user-khalid', 'Saudi National Bank', '#004D3D', 'SNB', 'savings', 285000.00, '1 min ago', 'synced'),
  ('acc-kha-2', 'user-khalid', 'Riyad Bank', '#003399', 'RB', 'checking', 142000.00, '3 min ago', 'synced'),
  ('acc-kha-3', 'user-khalid', 'Saxo Bank', '#003366', 'SAXO', 'brokerage', 223000.00, '5 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-kha-1', 'acc-kha-3', 'AGG', 'iShares Core Bond ETF', 450, 109.42, 106.50, 'Bonds'),
  ('pos-kha-2', 'acc-kha-3', 'BND', 'Vanguard Total Bond Market ETF', 320, 73.85, 72.10, 'Bonds'),
  ('pos-kha-3', 'acc-kha-3', 'TLT', 'iShares 20+ Year Treasury Bond ETF', 180, 92.30, 98.50, 'Bonds'),
  ('pos-kha-4', 'acc-kha-3', 'GLD', 'SPDR Gold Shares', 85, 210.73, 178.00, 'Commodities'),
  ('pos-kha-5', 'acc-kha-3', 'JNJ', 'Johnson & Johnson', 45, 158.20, 162.00, 'Stocks'),
  ('pos-kha-6', 'acc-kha-3', 'PG', 'Procter & Gamble Co.', 30, 165.40, 150.00, 'Stocks'),
  ('pos-kha-7', 'acc-kha-3', 'KO', 'Coca-Cola Co.', 60, 62.30, 58.00, 'Stocks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-kha-1', 'user-khalid', 650000.00, -1230.50, -0.19, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-kha-1', 'user-khalid', 'Preserve capital', 700000, 650000.00, 655000.00, 'Dec 2030', 'Shield', '#6d3f42', 'on-track',
   'Capital preservation is on track. Consider inflation-hedged bonds for better real returns.', 'Review strategy')
ON CONFLICT (id) DO NOTHING;

-- Sara Al-Fahad: Goal-based family investor
-- Storyline: Balanced portfolio, multiple family goals, concerned about education costs
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-sar-1', 'user-sara', 'Emirates NBD', '#003B5C', 'ENBD', 'savings', 45000.00, '5 min ago', 'synced'),
  ('acc-sar-2', 'user-sara', 'Interactive Brokers', '#DA1F26', 'IB', 'brokerage', 128500.00, '2 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-sar-1', 'acc-sar-2', 'SPY', 'SPDR S&P 500 ETF', 85, 520.30, 445.00, 'Stocks'),
  ('pos-sar-2', 'acc-sar-2', 'AGG', 'iShares Core Bond ETF', 200, 109.42, 107.00, 'Bonds'),
  ('pos-sar-3', 'acc-sar-2', 'VWO', 'Vanguard EM ETF', 150, 43.20, 40.50, 'Stocks'),
  ('pos-sar-4', 'acc-sar-2', 'AAPL', 'Apple Inc.', 20, 208.63, 175.00, 'Stocks'),
  ('pos-sar-5', 'acc-sar-2', 'GLD', 'SPDR Gold Shares', 40, 210.73, 190.00, 'Commodities'),
  ('pos-sar-6', 'acc-sar-2', 'VNQ', 'Vanguard Real Estate ETF', 60, 85.10, 82.00, 'Stocks'),
  ('pos-sar-7', 'acc-sar-2', 'EMB', 'iShares EM Bond ETF', 100, 86.50, 88.00, 'Bonds'),
  ('pos-sar-8', 'acc-sar-2', 'V', 'Visa Inc.', 15, 285.40, 240.00, 'Stocks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-sar-1', 'user-sara', 173500.00, 892.30, 0.52, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-sar-1', 'user-sara', 'Children education fund', 200000, 65000.00, 62000.00, 'Sep 2032', 'GraduationCap', '#6d3f42', 'needs-attention',
   'Education costs are rising 6% annually. Increase monthly contributions by $400 to stay on track.', 'How can I catch up?'),
  ('goal-sar-2', 'user-sara', 'Family emergency fund', 50000, 45000.00, 43000.00, 'Jun 2026', 'Shield', '#a87174', 'on-track',
   'Almost there. 3 more months of contributions should complete this goal.', 'View progress'),
  ('goal-sar-3', 'user-sara', 'Family vacation', 15000, 8200.00, 7500.00, 'Aug 2026', 'Plane', '#8b5a5d', 'on-track',
   'On track for your summer trip. Consider a short-term fixed deposit for this goal.', 'Explore options')
ON CONFLICT (id) DO NOTHING;

-- Raj Patel: Self-directed active trader (tech-overexposed millennial)
-- Storyline: Heavy tech/crypto exposure, recent drawdown in crypto, very active trading
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-raj-1', 'user-raj', 'Binance', '#F0B90B', 'BN', 'brokerage', 35200.00, '1 min ago', 'synced'),
  ('acc-raj-2', 'user-raj', 'Interactive Brokers', '#DA1F26', 'IB', 'brokerage', 137627.25, '2 min ago', 'synced'),
  ('acc-raj-3', 'user-raj', 'WIO Bank', '#6C63FF', 'WIO', 'checking', 8500.00, 'Just now', 'synced')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-raj-1', 'acc-raj-2', 'NVDA', 'NVIDIA Corp.', 45, 135.40, 90.00, 'Stocks'),
  ('pos-raj-2', 'acc-raj-2', 'AMD', 'Advanced Micro Devices', 80, 165.20, 120.00, 'Stocks'),
  ('pos-raj-3', 'acc-raj-2', 'TSLA', 'Tesla Inc.', 25, 245.80, 280.00, 'Stocks'),
  ('pos-raj-4', 'acc-raj-2', 'META', 'Meta Platforms Inc.', 18, 520.30, 350.00, 'Stocks'),
  ('pos-raj-5', 'acc-raj-2', 'QQQ', 'Invesco QQQ Trust', 50, 495.60, 380.00, 'Stocks'),
  ('pos-raj-6', 'acc-raj-1', 'BTC', 'Bitcoin', 0.15, 87535.00, 95000.00, 'Crypto'),
  ('pos-raj-7', 'acc-raj-1', 'ETH', 'Ethereum', 8.5, 2450.00, 3200.00, 'Crypto'),
  ('pos-raj-8', 'acc-raj-1', 'SOL', 'Solana', 120, 145.80, 180.00, 'Crypto'),
  ('pos-raj-9', 'acc-raj-2', 'NFLX', 'Netflix Inc.', 12, 685.40, 520.00, 'Stocks'),
  ('pos-raj-10', 'acc-raj-2', 'AMZN', 'Amazon.com Inc.', 22, 192.50, 155.00, 'Stocks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-raj-1', 'user-raj', 181327.25, -3263.89, -1.80, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-raj-1', 'user-raj', 'Early retirement', 500000, 181327.25, 186827.25, 'Dec 2038', 'Target', '#a87174', 'needs-attention',
   'Recent crypto drawdown has set back progress. Consider diversifying to reduce volatility impact.', 'How to recover?')
ON CONFLICT (id) DO NOTHING;

-- Nadia Khoury: Advisor-led conservative client
-- Storyline: Relies heavily on advisor, moderate but cautious, dividend-focused
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-nad-1', 'user-nadia', 'FAB', '#00558C', 'FAB', 'savings', 62000.00, '10 min ago', 'synced'),
  ('acc-nad-2', 'user-nadia', 'HSBC', '#DB0011', 'HSBC', 'brokerage', 195000.00, '5 min ago', 'synced'),
  ('acc-nad-3', 'user-nadia', 'Mashreq Bank', '#ED1C24', 'MSHQ', 'checking', 18500.00, '2 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-nad-1', 'acc-nad-2', 'JNJ', 'Johnson & Johnson', 80, 158.20, 145.00, 'Stocks'),
  ('pos-nad-2', 'acc-nad-2', 'PG', 'Procter & Gamble Co.', 65, 165.40, 148.00, 'Stocks'),
  ('pos-nad-3', 'acc-nad-2', 'KO', 'Coca-Cola Co.', 100, 62.30, 55.00, 'Stocks'),
  ('pos-nad-4', 'acc-nad-2', 'JPM', 'JPMorgan Chase & Co.', 35, 198.50, 165.00, 'Stocks'),
  ('pos-nad-5', 'acc-nad-2', 'AGG', 'iShares Core Bond ETF', 250, 109.42, 108.00, 'Bonds'),
  ('pos-nad-6', 'acc-nad-2', 'LQD', 'iShares Investment Grade Bond ETF', 120, 108.90, 110.50, 'Bonds'),
  ('pos-nad-7', 'acc-nad-2', 'VEA', 'Vanguard Developed Markets ETF', 100, 48.70, 44.00, 'Stocks'),
  ('pos-nad-8', 'acc-nad-2', 'GLD', 'SPDR Gold Shares', 50, 210.73, 175.00, 'Commodities'),
  ('pos-nad-9', 'acc-nad-2', 'XOM', 'Exxon Mobil', 40, 108.60, 95.00, 'Stocks'),
  ('pos-nad-10', 'acc-nad-2', 'DIS', 'Walt Disney Co.', 55, 112.40, 125.00, 'Stocks')
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-nad-1', 'user-nadia', 275500.00, 1105.20, 0.40, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-nad-1', 'user-nadia', 'Retirement income', 400000, 275500.00, 272000.00, 'Dec 2035', 'Wallet', '#6d3f42', 'on-track',
   'Steady progress toward retirement. Your dividend income provides a good foundation.', 'Review income plan'),
  ('goal-nad-2', 'user-nadia', 'Travel fund', 25000, 12500.00, 11800.00, 'Mar 2027', 'Plane', '#a87174', 'on-track',
   'Halfway there. Your consistent savings are keeping this goal on track.', 'See details')
ON CONFLICT (id) DO NOTHING;

-- Transactions for new personas
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-kha-1', 'acc-kha-3', 'buy', 'AGG', 100, 108.00, 10800.00, NOW() - INTERVAL '30 days'),
  ('txn-kha-2', 'acc-kha-3', 'buy', 'GLD', 25, 195.00, 4875.00, NOW() - INTERVAL '60 days'),
  ('txn-kha-3', 'acc-kha-1', 'deposit', NULL, NULL, NULL, 50000.00, NOW() - INTERVAL '14 days'),
  ('txn-kha-4', 'acc-kha-3', 'buy', 'AGG', 350, 106.50, 37275.00, NOW() - INTERVAL '200 days'),
  ('txn-kha-5', 'acc-kha-3', 'buy', 'BND', 320, 72.10, 23072.00, NOW() - INTERVAL '180 days'),
  ('txn-kha-6', 'acc-kha-3', 'buy', 'TLT', 180, 98.50, 17730.00, NOW() - INTERVAL '160 days'),
  ('txn-kha-7', 'acc-kha-3', 'buy', 'JNJ', 45, 162.00, 7290.00, NOW() - INTERVAL '140 days'),
  ('txn-kha-8', 'acc-kha-3', 'buy', 'KO', 60, 58.00, 3480.00, NOW() - INTERVAL '120 days'),
  ('txn-kha-9', 'acc-kha-3', 'buy', 'PG', 30, 150.00, 4500.00, NOW() - INTERVAL '100 days'),
  ('txn-kha-10', 'acc-kha-3', 'buy', 'GLD', 60, 178.00, 10680.00, NOW() - INTERVAL '150 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Sara)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-sar-1', 'acc-sar-2', 'buy', 'SPY', 20, 510.00, 10200.00, NOW() - INTERVAL '15 days'),
  ('txn-sar-2', 'acc-sar-2', 'buy', 'EMB', 50, 87.00, 4350.00, NOW() - INTERVAL '45 days'),
  ('txn-sar-3', 'acc-sar-2', 'dividend', 'AAPL', NULL, NULL, 48.00, NOW() - INTERVAL '7 days'),
  ('txn-sar-4', 'acc-sar-2', 'buy', 'AAPL', 20, 175.00, 3500.00, NOW() - INTERVAL '90 days'),
  ('txn-sar-5', 'acc-sar-2', 'buy', 'AGG', 200, 107.00, 21400.00, NOW() - INTERVAL '120 days'),
  ('txn-sar-6', 'acc-sar-2', 'buy', 'GLD', 40, 190.00, 7600.00, NOW() - INTERVAL '100 days'),
  ('txn-sar-7', 'acc-sar-2', 'buy', 'V', 15, 240.00, 3600.00, NOW() - INTERVAL '60 days'),
  ('txn-sar-8', 'acc-sar-2', 'buy', 'VNQ', 60, 82.00, 4920.00, NOW() - INTERVAL '80 days'),
  ('txn-sar-9', 'acc-sar-2', 'buy', 'VWO', 150, 40.50, 6075.00, NOW() - INTERVAL '110 days'),
  ('txn-sar-10', 'acc-sar-2', 'buy', 'SPY', 65, 445.00, 28925.00, NOW() - INTERVAL '150 days'),
  ('txn-sar-11', 'acc-sar-2', 'buy', 'EMB', 50, 88.00, 4400.00, NOW() - INTERVAL '130 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Raj)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-raj-1', 'acc-raj-1', 'buy', 'SOL', 50, 175.00, 8750.00, NOW() - INTERVAL '20 days'),
  ('txn-raj-2', 'acc-raj-2', 'sell', 'TSLA', 10, 260.00, 2600.00, NOW() - INTERVAL '5 days'),
  ('txn-raj-3', 'acc-raj-2', 'buy', 'NVDA', 15, 240.00, 3600.00, NOW() - INTERVAL '10 days'),
  ('txn-raj-4', 'acc-raj-1', 'buy', 'BTC', 0.05, 92000.00, 4600.00, NOW() - INTERVAL '35 days'),
  ('txn-raj-5', 'acc-raj-2', 'buy', 'AMD', 80, 120.00, 9600.00, NOW() - INTERVAL '90 days'),
  ('txn-raj-6', 'acc-raj-2', 'buy', 'AMZN', 22, 155.00, 3410.00, NOW() - INTERVAL '80 days'),
  ('txn-raj-7', 'acc-raj-2', 'buy', 'META', 18, 350.00, 6300.00, NOW() - INTERVAL '70 days'),
  ('txn-raj-8', 'acc-raj-2', 'buy', 'NFLX', 12, 520.00, 6240.00, NOW() - INTERVAL '60 days'),
  ('txn-raj-9', 'acc-raj-2', 'buy', 'QQQ', 50, 380.00, 19000.00, NOW() - INTERVAL '120 days'),
  ('txn-raj-10', 'acc-raj-2', 'buy', 'TSLA', 35, 280.00, 9800.00, NOW() - INTERVAL '100 days'),
  ('txn-raj-11', 'acc-raj-2', 'buy', 'NVDA', 30, 90.00, 2700.00, NOW() - INTERVAL '180 days'),
  ('txn-raj-12', 'acc-raj-1', 'buy', 'BTC', 0.10, 95000.00, 9500.00, NOW() - INTERVAL '150 days'),
  ('txn-raj-13', 'acc-raj-1', 'buy', 'ETH', 8.5, 3200.00, 27200.00, NOW() - INTERVAL '140 days'),
  ('txn-raj-14', 'acc-raj-1', 'buy', 'SOL', 70, 180.00, 12600.00, NOW() - INTERVAL '110 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Nadia)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-nad-1', 'acc-nad-2', 'buy', 'JNJ', 20, 155.00, 3100.00, NOW() - INTERVAL '25 days'),
  ('txn-nad-2', 'acc-nad-2', 'dividend', 'KO', NULL, NULL, 112.00, NOW() - INTERVAL '10 days'),
  ('txn-nad-3', 'acc-nad-2', 'dividend', 'PG', NULL, NULL, 97.50, NOW() - INTERVAL '12 days'),
  ('txn-nad-4', 'acc-nad-2', 'buy', 'XOM', 15, 102.00, 1530.00, NOW() - INTERVAL '40 days'),
  ('txn-nad-5', 'acc-nad-2', 'buy', 'AGG', 250, 108.00, 27000.00, NOW() - INTERVAL '150 days'),
  ('txn-nad-6', 'acc-nad-2', 'buy', 'DIS', 55, 125.00, 6875.00, NOW() - INTERVAL '80 days'),
  ('txn-nad-7', 'acc-nad-2', 'buy', 'GLD', 50, 175.00, 8750.00, NOW() - INTERVAL '100 days'),
  ('txn-nad-8', 'acc-nad-2', 'buy', 'JNJ', 60, 145.00, 8700.00, NOW() - INTERVAL '130 days'),
  ('txn-nad-9', 'acc-nad-2', 'buy', 'JPM', 35, 165.00, 5775.00, NOW() - INTERVAL '90 days'),
  ('txn-nad-10', 'acc-nad-2', 'buy', 'KO', 100, 55.00, 5500.00, NOW() - INTERVAL '120 days'),
  ('txn-nad-11', 'acc-nad-2', 'buy', 'LQD', 120, 110.50, 13260.00, NOW() - INTERVAL '140 days'),
  ('txn-nad-12', 'acc-nad-2', 'buy', 'PG', 65, 148.00, 9620.00, NOW() - INTERVAL '110 days'),
  ('txn-nad-13', 'acc-nad-2', 'buy', 'VEA', 100, 44.00, 4400.00, NOW() - INTERVAL '160 days'),
  ('txn-nad-14', 'acc-nad-2', 'buy', 'XOM', 25, 95.00, 2375.00, NOW() - INTERVAL '170 days')
ON CONFLICT (id) DO NOTHING;

-- Khalid: Conservative — Holdings-weighted compound return model
-- Allocation: Stocks $17,930 (3%), Bonds $92,297 (14%), Commodities $17,912 (3%), Cash $521,861 (80%)
-- Conservative: bonds/cash dominate → very low volatility
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.03 * 0.012 * ((hashtext('KHA_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.14 * 0.003 * ((hashtext('KHA_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.03 * 0.010 * ((hashtext('KHA_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-khalid',
  638000 + n * 32.88 + 650000 * cum_r
    - CASE WHEN n BETWEEN 160 AND 170 THEN 900 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 650000.00 WHERE user_id = 'user-khalid' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 651230.50 WHERE user_id = 'user-khalid' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- Sara: Moderate — Holdings-weighted compound return model
-- Allocation: Stocks $54,960 (32%), Bonds $30,200 (17%), Commodities $13,580 (8%), Cash $74,760 (43%)
-- Balanced moderate: stocks and bonds drive volatility
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.32 * 0.012 * ((hashtext('SAR_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.17 * 0.003 * ((hashtext('SAR_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.08 * 0.010 * ((hashtext('SAR_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-sara',
  143000 + n * 83.29 + 173500 * cum_r
    - CASE WHEN n BETWEEN 120 AND 132 THEN 1500 ELSE 0 END
    - CASE WHEN n BETWEEN 280 AND 290 THEN 1100 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 173500.00 WHERE user_id = 'user-sara' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 172607.70 WHERE user_id = 'user-sara' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- Raj: Aggressive — Holdings-weighted compound return model
-- Allocation: Stocks $68,927 (38%), Crypto $52,325 (29%), Cash $60,075 (33%)
-- Aggressive: heavy stocks + crypto → high volatility with drawdowns
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.38 * 0.015 * ((hashtext('RAJ_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.29 * 0.035 * ((hashtext('RAJ_C' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-raj',
  155000 + n * 71.86 + 181327 * cum_r
    - CASE WHEN n BETWEEN 80 AND 100 THEN 7500 ELSE 0 END
    - CASE WHEN n BETWEEN 180 AND 210 THEN 9000 ELSE 0 END
    + CASE WHEN n BETWEEN 210 AND 230 THEN 4000 ELSE 0 END
    - CASE WHEN n BETWEEN 300 AND 320 THEN 6000 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 181327.25 WHERE user_id = 'user-raj' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 184591.14 WHERE user_id = 'user-raj' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- Nadia: Moderate-conservative — Holdings-weighted compound return model
-- Allocation: Stocks $44,615 (16%), Bonds $40,460 (15%), Commodities $10,537 (4%), Cash $179,888 (65%)
-- Dividend-focused: stock component emphasizes stable dividend payers, lower vol
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.16 * 0.008 * ((hashtext('NAD_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.15 * 0.003 * ((hashtext('NAD_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.04 * 0.010 * ((hashtext('NAD_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-nadia',
  244000 + n * 86.16 + 275500 * cum_r
    - CASE WHEN n BETWEEN 200 AND 210 THEN 1000 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 275500.00 WHERE user_id = 'user-nadia' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 274394.80 WHERE user_id = 'user-nadia' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- News Items (20 seeded articles tied to instrument symbols)
INSERT INTO news_items (id, title, summary, publisher, published_at, url, symbols, relevance_tags, source_provider) VALUES
  ('news-1', 'NVIDIA reports record Q4 revenue driven by AI demand', 'NVIDIA posted $22.1B in Q4 revenue, beating estimates by 10%, driven by data center GPU demand for AI training and inference workloads.', 'Reuters', NOW() - INTERVAL '2 hours', 'https://example.com/nvda-q4', '{NVDA}', '{earnings,AI,technology}', 'mock'),
  ('news-2', 'Apple announces new AI features for iPhone lineup', 'Apple unveiled Apple Intelligence features coming to all iPhone models, including on-device LLM capabilities and enhanced Siri integration.', 'Bloomberg', NOW() - INTERVAL '4 hours', 'https://example.com/aapl-ai', '{AAPL}', '{AI,product_launch,technology}', 'mock'),
  ('news-3', 'Federal Reserve holds rates steady, signals patience on cuts', 'The Fed maintained the federal funds rate at 5.25-5.50%, citing persistent inflation. Chair Powell emphasized data-dependent approach to future decisions.', 'CNBC', NOW() - INTERVAL '6 hours', 'https://example.com/fed-rates', '{AGG,BND,TLT,LQD}', '{macro,rates,bonds}', 'mock'),
  ('news-4', 'Bitcoin drops 8% as regulatory concerns mount', 'Bitcoin fell sharply after reports of potential new crypto regulations in major markets. Ethereum and altcoins followed with similar declines.', 'CoinDesk', NOW() - INTERVAL '1 day', 'https://example.com/btc-drop', '{BTC,ETH,SOL}', '{crypto,regulation,volatility}', 'mock'),
  ('news-5', 'Gold hits new all-time high above $2,150 per ounce', 'Gold prices surged to record levels driven by geopolitical tensions, central bank buying, and expectations of eventual rate cuts.', 'Financial Times', NOW() - INTERVAL '3 hours', 'https://example.com/gold-ath', '{GLD,SLV}', '{commodities,gold,safe_haven}', 'mock'),
  ('news-6', 'Saudi Aramco announces $50B expansion in gas production', 'Aramco plans to significantly expand its gas production capacity to meet growing domestic demand and support the Kingdom Vision 2030 program.', 'Arab News', NOW() - INTERVAL '5 hours', 'https://example.com/aramco-gas', '{ARAMCO,XOM}', '{energy,GCC,expansion}', 'mock'),
  ('news-7', 'Microsoft Cloud revenue grows 29% year-over-year', 'Azure and Microsoft 365 drove strong cloud growth, with AI services contributing an estimated $2B in incremental annual revenue.', 'Wall Street Journal', NOW() - INTERVAL '8 hours', 'https://example.com/msft-cloud', '{MSFT}', '{earnings,cloud,AI}', 'mock'),
  ('news-8', 'Emaar Properties reports 35% profit surge on Dubai real estate boom', 'Dubai developer Emaar posted record profits as luxury property sales and hospitality revenues hit all-time highs.', 'Gulf News', NOW() - INTERVAL '1 day', 'https://example.com/emaar-profit', '{EMAAR}', '{real_estate,GCC,earnings}', 'mock'),
  ('news-9', 'Emerging market bonds attract record inflows', 'EM sovereign debt sees largest monthly inflows in 3 years as investors seek yield amid expectations of a softer dollar environment.', 'Bloomberg', NOW() - INTERVAL '12 hours', 'https://example.com/em-bonds', '{EMB,VWO}', '{bonds,emerging_markets,yields}', 'mock'),
  ('news-10', 'Tesla deliveries miss estimates as EV competition intensifies', 'Tesla reported Q4 deliveries of 484K vehicles, below the 510K consensus, as Chinese EV makers gained market share globally.', 'Reuters', NOW() - INTERVAL '2 days', 'https://example.com/tsla-deliveries', '{TSLA}', '{EVs,competition,deliveries}', 'mock'),
  ('news-11', 'JPMorgan beats earnings estimates on strong trading revenue', 'JPM reported $4.37 EPS vs $3.95 expected, with fixed income and equity trading desks posting their best quarter in two years.', 'CNBC', NOW() - INTERVAL '1 day', 'https://example.com/jpm-earnings', '{JPM,V}', '{financials,earnings,banking}', 'mock'),
  ('news-12', 'AMD unveils next-gen AI accelerators challenging NVIDIA', 'AMD launched its MI400 series GPU targeting AI training workloads, claiming 40% better price-performance than competing solutions.', 'TechCrunch', NOW() - INTERVAL '3 days', 'https://example.com/amd-ai', '{AMD,NVDA}', '{AI,semiconductors,competition}', 'mock'),
  ('news-13', 'US Treasury yields climb as inflation expectations rise', 'The 10-year Treasury yield reached 4.65% as inflation data came in hotter than expected, pressuring bond prices lower.', 'Financial Times', NOW() - INTERVAL '1 day', 'https://example.com/treasury-yields', '{TLT,AGG,BND,LQD}', '{bonds,yields,inflation}', 'mock'),
  ('news-14', 'ADNOC Distribution expands retail network across GCC', 'ADNOC Distribution announced plans to open 60 new fuel and convenience retail stations across the UAE and Saudi Arabia.', 'The National', NOW() - INTERVAL '2 days', 'https://example.com/adnoc-expand', '{ADNOCDIST}', '{energy,GCC,expansion}', 'mock'),
  ('news-15', 'S&P 500 hits new record as tech rally broadens', 'The index closed above 5,200 for the first time, with gains spreading beyond mega-cap tech into industrials and financials.', 'Bloomberg', NOW() - INTERVAL '5 hours', 'https://example.com/spy-record', '{SPY,QQQ}', '{markets,rally,indices}', 'mock'),
  ('news-16', 'Solana network activity surges 300% amid DeFi growth', 'Solana processed record transaction volumes as decentralized finance applications and NFT markets saw renewed interest.', 'The Block', NOW() - INTERVAL '2 days', 'https://example.com/sol-defi', '{SOL}', '{crypto,DeFi,network}', 'mock'),
  ('news-17', 'Netflix adds 13M subscribers, beats guidance', 'Streaming giant Netflix reported its strongest quarter of subscriber growth, driven by its ad-supported tier and password-sharing crackdown.', 'Variety', NOW() - INTERVAL '4 days', 'https://example.com/nflx-subs', '{NFLX,DIS}', '{streaming,earnings,growth}', 'mock'),
  ('news-18', 'GCC bond market reaches $1 trillion milestone', 'The combined GCC bond and sukuk market crossed $1T in outstanding issuance, marking the region maturation as a global fixed income hub.', 'Gulf Business', NOW() - INTERVAL '3 days', 'https://example.com/gcc-bonds', '{EMB}', '{bonds,GCC,milestone}', 'mock'),
  ('news-19', 'Oil prices rise on OPEC+ production cut extension', 'Brent crude climbed to $82/barrel after OPEC+ agreed to extend production cuts through Q2, supporting energy sector stocks.', 'Reuters', NOW() - INTERVAL '6 hours', 'https://example.com/oil-opec', '{XOM,USO,ARAMCO}', '{energy,oil,OPEC}', 'mock'),
  ('news-20', 'Meta launches new AR glasses, stock jumps 4%', 'Meta unveiled its next-generation augmented reality glasses at a hardware event, signaling renewed commitment to its metaverse strategy.', 'The Verge', NOW() - INTERVAL '1 day', 'https://example.com/meta-ar', '{META}', '{technology,AR,product_launch}', 'mock')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DATA PARITY: Missing positions for Fatima, Omar, Layla
-- ============================================================

-- Fatima Hassan: Conservative investor — heavy bonds, gold, blue-chip defensives
INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-fat-1', 'acc-fat-2', 'AGG', 'iShares Core Bond ETF', 350, 109.42, 106.00, 'Bonds'),
  ('pos-fat-2', 'acc-fat-2', 'BND', 'Vanguard Total Bond Market ETF', 250, 73.85, 72.00, 'Bonds'),
  ('pos-fat-3', 'acc-fat-2', 'TLT', 'iShares 20+ Year Treasury Bond ETF', 120, 92.30, 96.00, 'Bonds'),
  ('pos-fat-4', 'acc-fat-2', 'GLD', 'SPDR Gold Shares', 55, 210.73, 180.00, 'Commodities'),
  ('pos-fat-5', 'acc-fat-2', 'JNJ', 'Johnson & Johnson', 50, 158.20, 150.00, 'Stocks'),
  ('pos-fat-6', 'acc-fat-2', 'PG', 'Procter & Gamble Co.', 40, 165.40, 155.00, 'Stocks'),
  ('pos-fat-7', 'acc-fat-2', 'VEA', 'Vanguard Developed Markets ETF', 100, 48.70, 45.00, 'Stocks')
ON CONFLICT (id) DO NOTHING;

-- Omar Khalil: Aggressive investor — tech, crypto, growth stocks
INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-omr-1', 'acc-omr-2', 'TSLA', 'Tesla Inc.', 25, 245.80, 280.00, 'Stocks'),
  ('pos-omr-2', 'acc-omr-2', 'META', 'Meta Platforms Inc.', 15, 520.30, 400.00, 'Stocks'),
  ('pos-omr-3', 'acc-omr-2', 'NVDA', 'NVIDIA Corp.', 20, 135.40, 90.00, 'Stocks'),
  ('pos-omr-4', 'acc-omr-2', 'AMD', 'Advanced Micro Devices', 30, 165.20, 130.00, 'Stocks'),
  ('pos-omr-5', 'acc-omr-2', 'AMZN', 'Amazon.com Inc.', 25, 192.50, 160.00, 'Stocks'),
  ('pos-omr-6', 'acc-omr-2', 'BTC', 'Bitcoin', 0.12, 87535.00, 95000.00, 'Crypto'),
  ('pos-omr-7', 'acc-omr-2', 'ETH', 'Ethereum', 3.5, 2450.00, 3000.00, 'Crypto'),
  ('pos-omr-8', 'acc-omr-2', 'SOL', 'Solana', 40, 145.80, 170.00, 'Crypto')
ON CONFLICT (id) DO NOTHING;

-- Layla Mahmoud: Moderate balanced investor — mix of stocks, bonds, some gold
INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-lay-1', 'acc-lay-2', 'SPY', 'SPDR S&P 500 ETF', 30, 520.30, 450.00, 'Stocks'),
  ('pos-lay-2', 'acc-lay-2', 'AGG', 'iShares Core Bond ETF', 120, 109.42, 107.00, 'Bonds'),
  ('pos-lay-3', 'acc-lay-2', 'JNJ', 'Johnson & Johnson', 35, 158.20, 148.00, 'Stocks'),
  ('pos-lay-4', 'acc-lay-2', 'PG', 'Procter & Gamble Co.', 25, 165.40, 152.00, 'Stocks'),
  ('pos-lay-5', 'acc-lay-2', 'KO', 'Coca-Cola Co.', 80, 62.30, 57.00, 'Stocks'),
  ('pos-lay-6', 'acc-lay-2', 'GLD', 'SPDR Gold Shares', 30, 210.73, 190.00, 'Commodities'),
  ('pos-lay-7', 'acc-lay-2', 'AAPL', 'Apple Inc.', 15, 208.63, 175.00, 'Stocks'),
  ('pos-lay-8', 'acc-lay-2', 'VWO', 'Vanguard EM ETF', 80, 43.20, 40.00, 'Stocks')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Performance History for Fatima, Omar, Layla (365-day series)
-- ============================================================

-- Fatima: Conservative — Holdings-weighted compound return model
-- Allocation: Stocks $14,650 (9%), Bonds $68,002 (41%), Commodities $11,590 (7%), International $4,600 (3%), Cash $66,858 (40%)
-- Conservative: heavy bonds/cash → low volatility
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.09 * 0.008 * ((hashtext('FAT_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.41 * 0.003 * ((hashtext('FAT_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.07 * 0.010 * ((hashtext('FAT_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.03 * 0.012 * ((hashtext('FAT_I' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-fatima',
  139000 + n * 73.01 + 165700 * cum_r
    - CASE WHEN n BETWEEN 180 AND 188 THEN 700 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 165700.00 WHERE user_id = 'user-fatima' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 165269.80 WHERE user_id = 'user-fatima' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- Omar: Aggressive — Holdings-weighted compound return model
-- Allocation: Stocks $44,710 (45%), Crypto $29,491 (30%), Cash $25,600 (25%)
-- Aggressive: heavy stocks + crypto → high volatility with sharp drawdowns
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.45 * 0.015 * ((hashtext('OMR_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.30 * 0.035 * ((hashtext('OMR_C' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-omar',
  80000 + n * 54.25 + 99801 * cum_r
    - CASE WHEN n BETWEEN 70 AND 85 THEN 5000 ELSE 0 END
    - CASE WHEN n BETWEEN 150 AND 175 THEN 7000 ELSE 0 END
    + CASE WHEN n BETWEEN 175 AND 195 THEN 3500 ELSE 0 END
    - CASE WHEN n BETWEEN 310 AND 325 THEN 4000 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 99801.00 WHERE user_id = 'user-omar' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 98563.47 WHERE user_id = 'user-omar' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- Layla: Moderate — Holdings-weighted compound return model
-- Allocation: Stocks $22,968 (21%), Bonds $13,130 (12%), Commodities $6,322 (6%), International $6,680 (6%), Cash $61,400 (55%)
-- Moderate balanced: diversified across stocks, bonds, international
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
returns AS (
  SELECT dt, n,
    SUM(
      0.21 * 0.012 * ((hashtext('LAY_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.12 * 0.003 * ((hashtext('LAY_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.06 * 0.010 * ((hashtext('LAY_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.06 * 0.012 * ((hashtext('LAY_I' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
)
SELECT 'user-layla',
  96000 + n * 39.73 + 110500 * cum_r
    - CASE WHEN n BETWEEN 140 AND 150 THEN 1300 ELSE 0 END
    - CASE WHEN n BETWEEN 260 AND 272 THEN 1000 ELSE 0 END,
  dt
FROM returns
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 110500.00 WHERE user_id = 'user-layla' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 110820.50 WHERE user_id = 'user-layla' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- ============================================================
-- Goals for Omar and Layla (they had none)
-- ============================================================

INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-omr-1', 'user-omar', 'Start a business', 150000, 99801.00, 96500.00, 'Jun 2028', 'Target', '#a87174', 'needs-attention',
   'Heavy crypto exposure is adding volatility. Diversifying could protect your runway toward this goal.', 'How should I de-risk?'),
  ('goal-omr-2', 'user-omar', 'Emergency fund', 25000, 12800.00, 12000.00, 'Dec 2026', 'Wallet', '#6d3f42', 'needs-attention',
   'Your emergency fund is just over half funded. Consider redirecting some trading gains here.', 'Help me plan contributions')
ON CONFLICT (id) DO NOTHING;

INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-lay-1', 'user-layla', 'Children education', 120000, 45000.00, 43200.00, 'Sep 2033', 'GraduationCap', '#6d3f42', 'on-track',
   'Consistent contributions are keeping you on track. Consider adding a small equity tilt for growth.', 'Review my plan'),
  ('goal-lay-2', 'user-layla', 'House renovation', 35000, 18500.00, 17200.00, 'Mar 2027', 'Home', '#a87174', 'needs-attention',
   'You''re slightly behind. Increasing monthly savings by $350 would close the gap.', 'How can I catch up?')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Alerts for all non-Abdullah personas
-- ============================================================

-- Fatima alerts
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-fat-1', 'user-fatima', 'PORTFOLIO_ALERT', 'Bond allocation at 41% — consider rebalancing',
   'Your fixed income holdings represent 41% of your portfolio ($67,836 across AGG, BND, TLT). Combined with 40% cash, 81% of your portfolio is in low-risk assets.', '15 min ago', TRUE, 'alerts'),
  ('alert-fat-2', 'user-fatima', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Hi Fatima, I''ve prepared a review of your bond ladder strategy. Let''s discuss when you''re free. —Sarah', '3 hours ago', TRUE, 'updates'),
  ('alert-fat-3', 'user-fatima', 'MARKET_UPDATE', 'Treasury yields decline on economic data',
   'The 10-year Treasury yield fell to 4.35%, benefiting your long-duration bond positions.', '5 hours ago', FALSE, 'updates'),
  ('alert-fat-4', 'user-fatima', 'OPPORTUNITY', 'High-grade corporate bonds offering 5.2% yields',
   'Investment-grade corporate debt provides higher yields than Treasuries with modest additional risk.', 'Yesterday', FALSE, 'opportunities')
ON CONFLICT (id) DO NOTHING;

-- Omar alerts
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-omr-1', 'user-omar', 'PORTFOLIO_ALERT', 'Crypto allocation down 12% this week',
   'Your Bitcoin, Ethereum, and Solana positions have declined sharply. Total crypto exposure is now 25% of portfolio ($24,911).', '8 min ago', TRUE, 'alerts'),
  ('alert-omr-2', 'user-omar', 'MARKET_UPDATE', 'NVIDIA surges on AI infrastructure demand',
   'NVDA gained 4.2% today on strong data center revenue guidance. Your 20-share position is up $114.', '1 hour ago', FALSE, 'updates'),
  ('alert-omr-3', 'user-omar', 'PORTFOLIO_ALERT', 'Portfolio volatility exceeds risk tolerance',
   'Your 30-day portfolio volatility is 28%, significantly above the 20% threshold for aggressive profiles.', '4 hours ago', TRUE, 'alerts'),
  ('alert-omr-4', 'user-omar', 'OPPORTUNITY', 'Tech sector pullback creates entry points',
   'Several quality tech names are trading below their 50-day moving averages. Consider selective additions.', 'Yesterday', FALSE, 'opportunities'),
  ('alert-omr-5', 'user-omar', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Omar, your crypto losses are creating tax-loss harvesting opportunities. Let''s review before quarter-end. —Sarah', '2 days ago', FALSE, 'updates')
ON CONFLICT (id) DO NOTHING;

-- Layla alerts
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-lay-1', 'user-layla', 'PORTFOLIO_ALERT', 'Portfolio slightly below target return',
   'Your portfolio returned -0.29% today, driven by equity weakness. Year-to-date return remains positive at 4.8%.', '20 min ago', TRUE, 'alerts'),
  ('alert-lay-2', 'user-layla', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Hi Layla, your education fund is progressing well. I have some ideas to optimize the allocation. —Sarah', '2 hours ago', TRUE, 'updates'),
  ('alert-lay-3', 'user-layla', 'MARKET_UPDATE', 'Gold reaches new highs on geopolitical tensions',
   'Gold prices hit $2,150/oz, benefiting your GLD position. Your commodities allocation gained 2.1%.', '6 hours ago', FALSE, 'updates'),
  ('alert-lay-4', 'user-layla', 'DOCUMENT', 'Q4 2025 Portfolio Report ready',
   'Your quarterly performance report is available. Portfolio value: $110,500.', 'Yesterday', FALSE, 'updates')
ON CONFLICT (id) DO NOTHING;

-- Khalid alerts
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-kha-1', 'user-khalid', 'PORTFOLIO_ALERT', 'Cash allocation at 81% — inflation eroding value',
   'With SAR 527,000 in cash, inflation is costing you approximately SAR 21,000 per year in purchasing power.', '10 min ago', TRUE, 'alerts'),
  ('alert-kha-2', 'user-khalid', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Khalid, I''ve prepared conservative deployment options for your idle cash. Let me know when to discuss. —Sarah', '1 hour ago', TRUE, 'updates'),
  ('alert-kha-3', 'user-khalid', 'OPPORTUNITY', 'Saudi government sukuk offering 5.5% yield',
   'New issuance of government-backed sukuk provides attractive returns with minimal credit risk.', '4 hours ago', FALSE, 'opportunities'),
  ('alert-kha-4', 'user-khalid', 'MARKET_UPDATE', 'GCC bond yields stabilize after recent volatility',
   'Regional fixed income markets have calmed, with investment-grade spreads tightening by 15bps this week.', 'Yesterday', FALSE, 'updates')
ON CONFLICT (id) DO NOTHING;

-- Sara alerts
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-sar-1', 'user-sara', 'PORTFOLIO_ALERT', 'Education fund needs attention',
   'Rising education costs (6% annually) mean your current contribution pace may fall short by $18,000.', '25 min ago', TRUE, 'alerts'),
  ('alert-sar-2', 'user-sara', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Sara, I have updated projections for your children''s education fund. Good news on the emergency fund! —Sarah', '3 hours ago', TRUE, 'updates'),
  ('alert-sar-3', 'user-sara', 'MARKET_UPDATE', 'Emerging market bonds see strong inflows',
   'Your EMB position benefits from renewed interest in EM sovereign debt. Yields remain attractive.', '5 hours ago', FALSE, 'updates'),
  ('alert-sar-4', 'user-sara', 'OPPORTUNITY', 'Education savings plans with tax advantages',
   'New tax-advantaged education savings vehicles could accelerate your children''s education fund.', 'Yesterday', FALSE, 'opportunities')
ON CONFLICT (id) DO NOTHING;

-- Raj alerts
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-raj-1', 'user-raj', 'PORTFOLIO_ALERT', 'Tech + crypto concentration at 68% of portfolio',
   'Your combined tech ($71,320) and crypto ($51,451) exposure represents 68% of your portfolio, creating significant sector concentration risk.', '5 min ago', TRUE, 'alerts'),
  ('alert-raj-2', 'user-raj', 'PORTFOLIO_ALERT', 'Crypto positions down $4,200 this month',
   'Bitcoin, Ethereum, and Solana have all declined. Your crypto allocation is 28% of portfolio ($51,451 across 3 assets).', '2 hours ago', TRUE, 'alerts'),
  ('alert-raj-3', 'user-raj', 'MARKET_UPDATE', 'AMD unveils new AI accelerators',
   'AMD launched MI400 series targeting AI workloads. Your 80-share position could benefit from the catalyst.', '4 hours ago', FALSE, 'updates'),
  ('alert-raj-4', 'user-raj', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Raj, your recent TSLA sell was well-timed. Let''s discuss redeploying those proceeds more broadly. —Sarah', '1 day ago', FALSE, 'updates'),
  ('alert-raj-5', 'user-raj', 'OPPORTUNITY', 'Diversification opportunities in quality dividends',
   'Adding dividend-paying stocks could reduce portfolio volatility while maintaining growth exposure.', '2 days ago', FALSE, 'opportunities')
ON CONFLICT (id) DO NOTHING;

-- Nadia alerts
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-nad-1', 'user-nadia', 'PORTFOLIO_ALERT', 'Dividend income on track for quarterly target',
   'Your dividend portfolio has generated $1,245 in income this quarter, on pace to meet your $1,600 target.', '30 min ago', FALSE, 'alerts'),
  ('alert-nad-2', 'user-nadia', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Nadia, your portfolio review is ready. The dividend strategy is performing well. Let''s catch up soon. —Sarah', '2 hours ago', TRUE, 'updates'),
  ('alert-nad-3', 'user-nadia', 'MARKET_UPDATE', 'Consumer staples outperform as investors seek safety',
   'Your JNJ, PG, and KO positions benefited from the flight to quality. Combined gain of 1.2% today.', '5 hours ago', FALSE, 'updates'),
  ('alert-nad-4', 'user-nadia', 'OPPORTUNITY', 'High-dividend international REITs yielding 5.8%',
   'International real estate investment trusts offer attractive income with geographic diversification.', 'Yesterday', FALSE, 'opportunities')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Chat Threads for all non-Abdullah personas
-- ============================================================

-- Fatima threads
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-fat-1', 'user-fatima', 'Bond portfolio strategy review',
   'Your bond ladder is well-structured. Consider adding some shorter-duration positions for liquidity.', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  ('thread-fat-2', 'user-fatima', 'Inflation protection options',
   'TIPS and I-Bonds can provide direct inflation hedging for your conservative portfolio.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-fat-1-1', 'thread-fat-1', 'user', 'Can you review my bond allocation?', NOW() - INTERVAL '1 hour 10 minutes'),
  ('msg-fat-1-2', 'thread-fat-1', 'assistant', 'Your bond ladder is well-structured. Consider adding some shorter-duration positions for liquidity.', NOW() - INTERVAL '1 hour'),
  ('msg-fat-2-1', 'thread-fat-2', 'user', 'How can I protect my savings from inflation?', NOW() - INTERVAL '3 days 1 hour'),
  ('msg-fat-2-2', 'thread-fat-2', 'assistant', 'TIPS and I-Bonds can provide direct inflation hedging for your conservative portfolio.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Omar threads
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-omr-1', 'user-omar', 'Crypto market outlook and strategy',
   'Given the recent pullback, dollar-cost averaging into quality crypto assets may be prudent.', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'),
  ('thread-omr-2', 'user-omar', 'Growth stock opportunities in AI sector',
   'NVDA and AMD continue to lead AI infrastructure buildout. Consider position sizing relative to your risk tolerance.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-omr-1-1', 'thread-omr-1', 'user', 'My crypto positions are down significantly. What should I do?', NOW() - INTERVAL '50 minutes'),
  ('msg-omr-1-2', 'thread-omr-1', 'assistant', 'Given the recent pullback, dollar-cost averaging into quality crypto assets may be prudent.', NOW() - INTERVAL '45 minutes'),
  ('msg-omr-2-1', 'thread-omr-2', 'user', 'Which AI stocks should I focus on?', NOW() - INTERVAL '2 days 1 hour'),
  ('msg-omr-2-2', 'thread-omr-2', 'assistant', 'NVDA and AMD continue to lead AI infrastructure buildout. Consider position sizing relative to your risk tolerance.', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Layla threads
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-lay-1', 'user-layla', 'Education savings planning',
   'A balanced approach with 60% equities and 40% bonds can help grow the fund while managing risk.', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  ('thread-lay-2', 'user-layla', 'Portfolio rebalancing for house renovation goal',
   'Setting aside a portion in a short-term fixed deposit could help protect your renovation savings.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-lay-1-1', 'thread-lay-1', 'user', 'How should I invest for my children''s education?', NOW() - INTERVAL '2 hours 15 minutes'),
  ('msg-lay-1-2', 'thread-lay-1', 'assistant', 'A balanced approach with 60% equities and 40% bonds can help grow the fund while managing risk.', NOW() - INTERVAL '2 hours'),
  ('msg-lay-2-1', 'thread-lay-2', 'user', 'I want to save for a house renovation. How should I plan?', NOW() - INTERVAL '4 days 1 hour'),
  ('msg-lay-2-2', 'thread-lay-2', 'assistant', 'Setting aside a portion in a short-term fixed deposit could help protect your renovation savings.', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Khalid threads
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-kha-1', 'user-khalid', 'Deploying idle cash conservatively',
   'A laddered approach with government sukuk and high-grade bonds can put your cash to work safely.', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
  ('thread-kha-2', 'user-khalid', 'Capital preservation in uncertain markets',
   'Your current bond-heavy allocation provides stability. Adding inflation-linked securities could further protect purchasing power.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-kha-1-1', 'thread-kha-1', 'user', 'I have a lot of cash sitting idle. What should I do with it?', NOW() - INTERVAL '35 minutes'),
  ('msg-kha-1-2', 'thread-kha-1', 'assistant', 'A laddered approach with government sukuk and high-grade bonds can put your cash to work safely.', NOW() - INTERVAL '30 minutes'),
  ('msg-kha-2-1', 'thread-kha-2', 'user', 'How can I preserve my capital in these markets?', NOW() - INTERVAL '5 days 1 hour'),
  ('msg-kha-2-2', 'thread-kha-2', 'assistant', 'Your current bond-heavy allocation provides stability. Adding inflation-linked securities could further protect purchasing power.', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Sara threads
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-sar-1', 'user-sara', 'Children education fund strategy',
   'Increasing monthly contributions by $400 and adding a small equity tilt can help close the gap.', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  ('thread-sar-2', 'user-sara', 'Emergency fund completion plan',
   'You''re 90% funded. Three more months of regular contributions should complete your emergency fund.', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-sar-1-1', 'thread-sar-1', 'user', 'Am I saving enough for my children''s education?', NOW() - INTERVAL '1 hour 20 minutes'),
  ('msg-sar-1-2', 'thread-sar-1', 'assistant', 'Increasing monthly contributions by $400 and adding a small equity tilt can help close the gap.', NOW() - INTERVAL '1 hour'),
  ('msg-sar-2-1', 'thread-sar-2', 'user', 'How close am I to completing my emergency fund?', NOW() - INTERVAL '6 days 1 hour'),
  ('msg-sar-2-2', 'thread-sar-2', 'assistant', 'You''re 90% funded. Three more months of regular contributions should complete your emergency fund.', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Raj threads
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-raj-1', 'user-raj', 'Managing crypto drawdown and recovery',
   'Consider rebalancing 10-15% of crypto into diversified ETFs to reduce concentration while maintaining growth exposure.', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'),
  ('thread-raj-2', 'user-raj', 'Building a diversified retirement strategy',
   'At your age, even a small allocation to index funds alongside your active trading can compound significantly.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-raj-1-1', 'thread-raj-1', 'user', 'My crypto portfolio has taken a big hit. How do I recover?', NOW() - INTERVAL '45 minutes'),
  ('msg-raj-1-2', 'thread-raj-1', 'assistant', 'Consider rebalancing 10-15% of crypto into diversified ETFs to reduce concentration while maintaining growth exposure.', NOW() - INTERVAL '40 minutes'),
  ('msg-raj-2-1', 'thread-raj-2', 'user', 'Should I start thinking about retirement planning?', NOW() - INTERVAL '1 day 2 hours'),
  ('msg-raj-2-2', 'thread-raj-2', 'assistant', 'At your age, even a small allocation to index funds alongside your active trading can compound significantly.', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Nadia threads
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-nad-1', 'user-nadia', 'Dividend income optimization',
   'Your current yield is 3.2%. Adding some high-dividend international stocks could boost income to 3.8%.', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
  ('thread-nad-2', 'user-nadia', 'Travel fund progress review',
   'You''re halfway to your travel fund goal. Consistent monthly deposits of $700 will get you there by March 2027.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-nad-1-1', 'thread-nad-1', 'user', 'Can I increase my dividend income without taking on too much risk?', NOW() - INTERVAL '1 hour 15 minutes'),
  ('msg-nad-1-2', 'thread-nad-1', 'assistant', 'Your current yield is 3.2%. Adding some high-dividend international stocks could boost income to 3.8%.', NOW() - INTERVAL '1 hour'),
  ('msg-nad-2-1', 'thread-nad-2', 'user', 'How is my travel fund looking?', NOW() - INTERVAL '3 days 1 hour'),
  ('msg-nad-2-2', 'thread-nad-2', 'assistant', 'You''re halfway to your travel fund goal. Consistent monthly deposits of $700 will get you there by March 2027.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;
