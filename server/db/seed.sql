-- Clean up deprecated personas (Fatima, Omar, Layla, Sara, Nadia, Abdullah) from pre-existing databases
DO $$
DECLARE
  deprecated_ids TEXT[] := ARRAY['user-fatima', 'user-omar', 'user-layla', 'user-sara', 'user-nadia', 'user-abdullah'];
BEGIN
  DELETE FROM action_contexts WHERE user_id = ANY(deprecated_ids);
  DELETE FROM chat_audit_log WHERE user_id = ANY(deprecated_ids);
  DELETE FROM tool_runs WHERE user_id = ANY(deprecated_ids);
  DELETE FROM agent_traces WHERE user_id = ANY(deprecated_ids);
  DELETE FROM policy_decisions WHERE user_id = ANY(deprecated_ids);
  DELETE FROM conversation_summaries WHERE user_id = ANY(deprecated_ids);
  DELETE FROM episodic_memories WHERE thread_id IN (SELECT id FROM chat_threads WHERE user_id = ANY(deprecated_ids));
  DELETE FROM semantic_facts WHERE source_thread_id IN (SELECT id FROM chat_threads WHERE user_id = ANY(deprecated_ids));
  DELETE FROM chat_messages WHERE thread_id IN (SELECT id FROM chat_threads WHERE user_id = ANY(deprecated_ids));
  DELETE FROM chat_threads WHERE user_id = ANY(deprecated_ids);
  DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = ANY(deprecated_ids));
  DELETE FROM positions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = ANY(deprecated_ids));
  DELETE FROM performance_history WHERE user_id = ANY(deprecated_ids);
  DELETE FROM portfolio_snapshots WHERE user_id = ANY(deprecated_ids);
  DELETE FROM goals WHERE user_id = ANY(deprecated_ids);
  DELETE FROM alerts WHERE user_id = ANY(deprecated_ids);
  DELETE FROM accounts WHERE user_id = ANY(deprecated_ids);
  DELETE FROM risk_profiles WHERE user_id = ANY(deprecated_ids);
  DELETE FROM advisor_action_queue WHERE user_id = ANY(deprecated_ids);
  DELETE FROM dismissed_life_gap_prompts WHERE user_id = ANY(deprecated_ids);
  DELETE FROM poll_votes WHERE user_id = ANY(deprecated_ids);
  DELETE FROM users WHERE id = ANY(deprecated_ids);
END $$;

-- Advisors
INSERT INTO advisors (id, name, title, photo_url, availability, email, phone)
VALUES ('advisor-sarah', 'Sarah Mitchell', 'Senior Wealth Advisor', NULL, 'Available today', 'sarah.mitchell@example.com', '+971-50-555-0100')
ON CONFLICT (id) DO NOTHING;

-- Users (3 personas)
INSERT INTO users (id, first_name, last_name, email, advisor_id) VALUES
  ('user-aisha', 'Aisha', 'Al-Rashid', 'aisha@example.com', 'advisor-sarah')
ON CONFLICT (id) DO NOTHING;

-- Risk Profiles
INSERT INTO risk_profiles (user_id, level, score, last_assessed) VALUES
  ('user-aisha', 'moderate', 62, '2025-11-15')
ON CONFLICT (user_id) DO NOTHING;

-- Accounts (Aisha)
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-aisha-1', 'user-aisha', 'HSBC', '#DB0011', 'HSBC', 'savings', 18966.04, '2 min ago', 'synced'),
  ('acc-aisha-2', 'user-aisha', 'Interactive Brokers', '#DA1F26', 'IB', 'brokerage', 64656.88, '5 min ago', 'synced'),
  ('acc-aisha-3', 'user-aisha', 'WIO Bank', '#6C63FF', 'WIO', 'checking', 9483.02, 'Just now', 'synced')
ON CONFLICT (id) DO NOTHING;

-- Positions (Aisha's brokerage)
INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-aisha-1', 'acc-aisha-2', 'NVDA', 'NVIDIA Corp.', 15, 135.40, 102.67, 'Stocks'),
  ('pos-aisha-2', 'acc-aisha-2', 'AAPL', 'Apple Inc.', 12, 208.63, 180.00, 'Stocks'),
  ('pos-aisha-3', 'acc-aisha-2', 'BTC', 'Bitcoin', 0.0195, 87535.00, 62000.00, 'Crypto'),
  ('pos-aisha-4', 'acc-aisha-2', 'MSFT', 'Microsoft Corp.', 8, 420.50, 391.25, 'Stocks'),
  ('pos-aisha-5', 'acc-aisha-2', 'AGG', 'iShares Core Bond ETF', 130, 109.42, 104.12, 'Bonds'),
  ('pos-aisha-6', 'acc-aisha-2', 'GLD', 'SPDR Gold Shares', 18, 210.73, 189.17, 'Commodities'),
  ('pos-aisha-7', 'acc-aisha-2', 'ETH', 'Ethereum', 1.5, 2450.00, 1800.00, 'Crypto')
ON CONFLICT (id) DO NOTHING;

-- Portfolio Snapshots (Aisha)
INSERT INTO portfolio_snapshots (id, user_id, total_value, daily_change_amount, daily_change_percent, recorded_at) VALUES
  ('snap-aisha-1', 'user-aisha', 93105.94, 744.85, 0.8, NOW())
ON CONFLICT (id) DO NOTHING;

-- Goals (Aisha)
INSERT INTO goals (id, user_id, title, target_amount, current_amount, previous_amount, deadline, icon_name, color, health_status, ai_insight, cta_text) VALUES
  ('goal-aisha-1', 'user-aisha', 'House deposit', 30000, 18966.04, 20500.00, 'Dec 2026', 'Home', '#a87174', 'needs-attention',
   'You''re slightly behind pace. Increasing monthly contributions by $919 keeps you on track.', 'Why am I off track?'),
  ('goal-aisha-2', 'user-aisha', 'Education fund', 100000, 33190.57, 31800.00, 'Sep 2035', 'GraduationCap', '#6d3f42', 'needs-attention',
   'You''re behind schedule. Consistent contributions now will help you catch up over time.', 'How can I get back on track?')
ON CONFLICT (id) DO NOTHING;

-- Clean up existing alerts and content for consistency updates
DELETE FROM alerts WHERE user_id = 'user-aisha';
DELETE FROM content_items WHERE id IN ('ci-1', 'ci-2', 'ci-3');
DELETE FROM semantic_facts WHERE source_thread_id IN (SELECT id FROM chat_threads WHERE user_id = 'user-aisha');
DELETE FROM episodic_memories WHERE thread_id IN (SELECT id FROM chat_threads WHERE user_id = 'user-aisha');
DELETE FROM chat_messages WHERE thread_id IN (SELECT id FROM chat_threads WHERE user_id = 'user-aisha');
DELETE FROM chat_threads WHERE user_id = 'user-aisha';

-- Alerts (Aisha)
INSERT INTO alerts (id, user_id, type, title, message, timestamp, unread, category) VALUES
  ('alert-aisha-1', 'user-aisha', 'PORTFOLIO_ALERT', 'Cash allocation at 66% of portfolio',
   'Your cash holdings now represent 66% of your portfolio. Consider deploying idle cash into income-generating assets.', '12 min ago', TRUE, 'alerts'),
  ('alert-aisha-2', 'user-aisha', 'ADVISOR_MESSAGE', 'Message from your advisor',
   'Hi Aisha, I''ve reviewed your Q4 performance. Let''s schedule a call. —Khalid', '2 hours ago', TRUE, 'updates'),
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

-- Performance History (Aisha - Moderate investor, gradual growth with bounded noise)
-- Start ~$76,500, end ~$93,106. Amplitude ±$4,000. Normalized cumulative walk ensures bounded values.
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
raw_walk AS (
  SELECT dt, n,
    SUM(
      0.085 * 0.012 * ((hashtext('AISHA_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.153 * 0.003 * ((hashtext('AISHA_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.058 * 0.030 * ((hashtext('AISHA_C' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.041 * 0.010 * ((hashtext('AISHA_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
),
normalized AS (
  SELECT dt, n, cum_r,
    cum_r / GREATEST(MAX(ABS(cum_r)) OVER (), 0.0001) as norm_r
  FROM raw_walk
)
SELECT 'user-aisha',
  76500 + n * 45.37 + 4000 * norm_r
    - CASE WHEN n BETWEEN 95 AND 110 THEN 1800 ELSE 0 END
    - CASE WHEN n BETWEEN 240 AND 255 THEN 1200 ELSE 0 END,
  dt
FROM normalized
ON CONFLICT (user_id, recorded_date) DO NOTHING;

UPDATE performance_history
SET value = 93105.94
WHERE user_id = 'user-aisha' AND recorded_date = CURRENT_DATE;
UPDATE performance_history
SET value = 92361.09
WHERE user_id = 'user-aisha' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

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

-- Chat Threads (Aisha)
INSERT INTO chat_threads (id, user_id, title, preview, created_at, updated_at) VALUES
  ('thread-aisha-1', 'user-aisha', 'Portfolio rebalancing and asset allocation',
   'If you want, I can estimate the new risk/return profile for you.', NOW() - INTERVAL '52 minutes', NOW() - INTERVAL '52 minutes'),
  ('thread-aisha-2', 'user-aisha', 'Portfolio concentration and risk management',
   'Your cash allocation is 66%, well above the typical 20–30% range for a moderate portfolio.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('thread-aisha-3', 'user-aisha', 'Portfolio diversification and hedging against macroeconomic risks',
   'Silver jumps above $32/oz amid global debt concerns.', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Chat Messages (Aisha)
INSERT INTO chat_messages (id, thread_id, sender, message, created_at) VALUES
  ('msg-aisha-1-1', 'thread-aisha-1', 'user', 'I want to review my portfolio rebalancing options.', NOW() - INTERVAL '55 minutes'),
  ('msg-aisha-1-2', 'thread-aisha-1', 'assistant', 'Your portfolio currently holds 66% in cash across savings, checking, and uninvested brokerage funds. With equities at only 8% (NVDA, AAPL, MSFT), there is room to deploy capital into growth or income assets. Would you like me to prepare a deployment plan?', NOW() - INTERVAL '54 minutes'),
  ('msg-aisha-1-3', 'thread-aisha-1', 'user', 'What about my risk/return profile?', NOW() - INTERVAL '53 minutes'),
  ('msg-aisha-1-4', 'thread-aisha-1', 'assistant', 'If you want, I can estimate the new risk/return profile for you.', NOW() - INTERVAL '52 minutes'),
  ('msg-aisha-2-1', 'thread-aisha-2', 'user', 'How concentrated is my portfolio?', NOW() - INTERVAL '2 days 1 hour'),
  ('msg-aisha-2-2', 'thread-aisha-2', 'assistant', 'Your cash allocation is 66%, well above the typical 20-30% range for a moderate investor. Deploying even 20% of idle cash into a diversified mix of equities and bonds could improve returns. Would you like to explore deployment options?', NOW() - INTERVAL '2 days'),
  ('msg-aisha-3-1', 'thread-aisha-3', 'user', 'What hedging options do I have?', NOW() - INTERVAL '3 days 1 hour'),
  ('msg-aisha-3-2', 'thread-aisha-3', 'assistant', 'Silver jumps above $32/oz amid global debt concerns. Consider commodities and precious metals as a hedge against macroeconomic uncertainty.', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Transactions (Aisha)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-aisha-1', 'acc-aisha-2', 'buy', 'NVDA', 5, 138.00, 690.00, NOW() - INTERVAL '15 days'),
  ('txn-aisha-1b', 'acc-aisha-2', 'buy', 'NVDA', 10, 85.00, 850.00, NOW() - INTERVAL '300 days'),
  ('txn-aisha-2', 'acc-aisha-2', 'buy', 'AAPL', 4, 200.00, 800.00, NOW() - INTERVAL '30 days'),
  ('txn-aisha-2b', 'acc-aisha-2', 'buy', 'AAPL', 8, 170.00, 1360.00, NOW() - INTERVAL '270 days'),
  ('txn-aisha-3', 'acc-aisha-2', 'buy', 'MSFT', 3, 410.00, 1230.00, NOW() - INTERVAL '45 days'),
  ('txn-aisha-3b', 'acc-aisha-2', 'buy', 'MSFT', 5, 380.00, 1900.00, NOW() - INTERVAL '240 days'),
  ('txn-aisha-4', 'acc-aisha-2', 'dividend', 'AAPL', NULL, NULL, 36.00, NOW() - INTERVAL '8 days'),
  ('txn-aisha-5', 'acc-aisha-1', 'deposit', NULL, NULL, NULL, 5000.00, NOW() - INTERVAL '20 days'),
  ('txn-aisha-6', 'acc-aisha-2', 'buy', 'GLD', 5, 200.00, 1000.00, NOW() - INTERVAL '60 days'),
  ('txn-aisha-6b', 'acc-aisha-2', 'buy', 'GLD', 13, 185.00, 2405.00, NOW() - INTERVAL '260 days'),
  ('txn-aisha-7', 'acc-aisha-2', 'buy', 'AGG', 30, 107.00, 3210.00, NOW() - INTERVAL '90 days'),
  ('txn-aisha-7b', 'acc-aisha-2', 'buy', 'AGG', 50, 104.00, 5200.00, NOW() - INTERVAL '210 days'),
  ('txn-aisha-7c', 'acc-aisha-2', 'buy', 'AGG', 50, 102.50, 5125.00, NOW() - INTERVAL '320 days'),
  ('txn-aisha-8', 'acc-aisha-2', 'buy', 'BTC', 0.0195, 62000.00, 1209.00, NOW() - INTERVAL '120 days'),
  ('txn-aisha-9', 'acc-aisha-2', 'buy', 'ETH', 1.5, 1800.00, 2700.00, NOW() - INTERVAL '100 days')
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
  '{portfolio_read,market_read,news_read,macro_read,fx_read,research_read,health_compute,workflow_light,execution_route}',
  '{}',
  '{"enable_agent_tracing":true,"enable_advisor_handoff":true,"enable_recommendations":false,"enable_wealth_engine":true,"verbose_mode":true}',
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
-- ADDITIONAL PERSONAS (Khalid, Raj)
-- ============================================================

-- New Users
INSERT INTO users (id, first_name, last_name, email, advisor_id, tenant_id) VALUES
  ('user-khalid', 'Khalid', 'Al-Mansouri', 'khalid@example.com', 'advisor-sarah', 'bank_demo_uae'),
  ('user-raj', 'Raj', 'Patel', 'raj@example.com', 'advisor-sarah', 'bank_demo_uae')
ON CONFLICT (id) DO NOTHING;

-- Risk Profiles for new personas
INSERT INTO risk_profiles (user_id, level, score, last_assessed) VALUES
  ('user-khalid', 'conservative', 28, '2025-11-01'),
  ('user-raj', 'aggressive', 92, '2026-01-15')
ON CONFLICT (user_id) DO NOTHING;

-- Khalid Al-Mansouri: Cash-heavy uncertain investor (KSA HNW conservative)
-- Storyline: High idle cash, very conservative, mostly bonds, worried about inflation eroding savings
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-kha-1', 'user-khalid', 'Saudi National Bank', '#004D3D', 'SNB', 'savings', 285000.00, '1 min ago', 'synced'),
  ('acc-kha-2', 'user-khalid', 'Riyad Bank', '#003399', 'RB', 'checking', 142000.00, '3 min ago', 'synced'),
  ('acc-kha-3', 'user-khalid', 'Saxo Bank', '#003366', 'SAXO', 'brokerage', 223000.00, '5 min ago', 'synced')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-kha-1', 'acc-kha-3', 'AGG', 'iShares Core Bond ETF', 450, 109.42, 106.83, 'Bonds'),
  ('pos-kha-2', 'acc-kha-3', 'BND', 'Vanguard Total Bond Market ETF', 320, 73.85, 72.10, 'Bonds'),
  ('pos-kha-3', 'acc-kha-3', 'TLT', 'iShares 20+ Year Treasury Bond ETF', 180, 92.30, 98.50, 'Bonds'),
  ('pos-kha-4', 'acc-kha-3', 'GLD', 'SPDR Gold Shares', 85, 210.73, 183.00, 'Commodities'),
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

-- Raj Patel: Self-directed active trader (tech-overexposed millennial)
-- Storyline: Heavy tech/crypto exposure, recent drawdown in crypto, very active trading
INSERT INTO accounts (id, user_id, institution_name, logo_color, logo_text, account_type, balance, last_synced, status) VALUES
  ('acc-raj-1', 'user-raj', 'Binance', '#F0B90B', 'BN', 'brokerage', 52000.00, '1 min ago', 'synced'),
  ('acc-raj-2', 'user-raj', 'Interactive Brokers', '#DA1F26', 'IB', 'brokerage', 120827.25, '2 min ago', 'synced'),
  ('acc-raj-3', 'user-raj', 'WIO Bank', '#6C63FF', 'WIO', 'checking', 8500.00, 'Just now', 'synced')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, account_id, symbol, name, quantity, current_price, cost_basis, asset_class) VALUES
  ('pos-raj-1', 'acc-raj-2', 'NVDA', 'NVIDIA Corp.', 45, 135.40, 103.33, 'Stocks'),
  ('pos-raj-2', 'acc-raj-2', 'AMD', 'Advanced Micro Devices', 80, 165.20, 120.00, 'Stocks'),
  ('pos-raj-3', 'acc-raj-2', 'TSLA', 'Tesla Inc.', 25, 245.80, 280.00, 'Stocks'),
  ('pos-raj-4', 'acc-raj-2', 'META', 'Meta Platforms Inc.', 18, 520.30, 350.00, 'Stocks'),
  ('pos-raj-5', 'acc-raj-2', 'QQQ', 'Invesco QQQ Trust', 50, 495.60, 380.00, 'Stocks'),
  ('pos-raj-6', 'acc-raj-1', 'BTC', 'Bitcoin', 0.15, 87535.00, 94000.00, 'Crypto'),
  ('pos-raj-7', 'acc-raj-1', 'ETH', 'Ethereum', 8.5, 2450.00, 3200.00, 'Crypto'),
  ('pos-raj-8', 'acc-raj-1', 'SOL', 'Solana', 120, 145.80, 177.92, 'Crypto'),
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

-- Transactions (Raj)
INSERT INTO transactions (id, account_id, type, symbol, quantity, price, amount, executed_at) VALUES
  ('txn-raj-1', 'acc-raj-1', 'buy', 'SOL', 50, 175.00, 8750.00, NOW() - INTERVAL '20 days'),
  ('txn-raj-2', 'acc-raj-2', 'sell', 'TSLA', 10, 260.00, 2600.00, NOW() - INTERVAL '5 days'),
  ('txn-raj-3', 'acc-raj-2', 'buy', 'NVDA', 15, 130.00, 1950.00, NOW() - INTERVAL '10 days'),
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

-- Khalid: Conservative — Normalized bounded walk for stable portfolio
-- Start ~$638,000, end ~$650,000. Amplitude ±$2,500. Very low volatility.
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
raw_walk AS (
  SELECT dt, n,
    SUM(
      0.024 * 0.012 * ((hashtext('KHA_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.138 * 0.003 * ((hashtext('KHA_B' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.028 * 0.010 * ((hashtext('KHA_M' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
),
normalized AS (
  SELECT dt, n, cum_r,
    cum_r / GREATEST(MAX(ABS(cum_r)) OVER (), 0.0001) as norm_r
  FROM raw_walk
)
SELECT 'user-khalid',
  638000 + n * 32.88 + 2500 * norm_r
    - CASE WHEN n BETWEEN 160 AND 170 THEN 900 ELSE 0 END,
  dt
FROM normalized
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 650000.00 WHERE user_id = 'user-khalid' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 651230.50 WHERE user_id = 'user-khalid' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

-- Raj: Aggressive — Normalized bounded walk with high amplitude
-- Start ~$155,000, end ~$181,327. Amplitude ±$12,000. Multiple drawdown events.
INSERT INTO performance_history (user_id, value, recorded_date)
WITH days AS (
  SELECT d::date as dt, ROW_NUMBER() OVER (ORDER BY d) as n
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, '1 day') AS d
),
raw_walk AS (
  SELECT dt, n,
    SUM(
      0.397 * 0.015 * ((hashtext('RAJ_S' || n::text) % 20001 - 10000)::numeric / 10000.0)
      + 0.284 * 0.035 * ((hashtext('RAJ_C' || n::text) % 20001 - 10000)::numeric / 10000.0)
    ) OVER (ORDER BY dt) as cum_r
  FROM days
),
normalized AS (
  SELECT dt, n, cum_r,
    cum_r / GREATEST(MAX(ABS(cum_r)) OVER (), 0.0001) as norm_r
  FROM raw_walk
)
SELECT 'user-raj',
  155000 + n * 71.86 + 12000 * norm_r
    - CASE WHEN n BETWEEN 80 AND 100 THEN 7500 ELSE 0 END
    - CASE WHEN n BETWEEN 180 AND 210 THEN 9000 ELSE 0 END
    + CASE WHEN n BETWEEN 210 AND 230 THEN 4000 ELSE 0 END
    - CASE WHEN n BETWEEN 300 AND 320 THEN 6000 ELSE 0 END,
  dt
FROM normalized
ON CONFLICT (user_id, recorded_date) DO NOTHING;
UPDATE performance_history SET value = 181327.25 WHERE user_id = 'user-raj' AND recorded_date = CURRENT_DATE;
UPDATE performance_history SET value = 184591.14 WHERE user_id = 'user-raj' AND recorded_date = CURRENT_DATE - INTERVAL '1 day';

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
-- Alerts for Khalid and Raj
-- ============================================================

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

-- ============================================================
-- Chat Threads for Khalid and Raj
-- ============================================================

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

-- ============================================================
-- User Profiles (Discover personalization metadata)
-- ============================================================
INSERT INTO user_profiles (user_id, geo_focus, investment_horizon, income_preference, aum_tier,
  target_equities_pct, target_fixed_income_pct, target_alternatives_pct, target_cash_pct, target_real_estate_pct,
  risk_tolerance, interests, top_asset_classes, allocation_gaps) VALUES
  ('user-aisha', 'UAE/GCC', 'medium', 'balanced', 'mass_affluent',
   50, 25, 10, 10, 5,
   'moderate', ARRAY['equities', 'crypto', 'ai_tech', 'gcc_markets'],
   '["Equities", "Fixed Income", "Crypto"]',
   '{"equities": -5.2, "fixed_income": -10.3, "alternatives": 2.1, "cash": 10.2, "real_estate": 0}'),
  ('user-khalid', 'Saudi Arabia/GCC', 'long', 'income', 'hnw',
   20, 45, 10, 20, 5,
   'conservative', ARRAY['fixed_income', 'commodities', 'gcc_markets', 'esg'],
   '["Fixed Income", "Equities", "Gold"]',
   '{"equities": -3.5, "fixed_income": -6.8, "alternatives": 1.2, "cash": 8.5, "real_estate": 0}'),
  ('user-raj', 'India/Global', 'short', 'growth', 'affluent',
   65, 5, 15, 10, 5,
   'aggressive', ARRAY['equities', 'ai_tech', 'crypto', 'macro'],
   '["Equities", "Crypto", "ETFs"]',
   '{"equities": 8.3, "fixed_income": -4.2, "alternatives": 12.5, "cash": -5.8, "real_estate": -5.0}')
ON CONFLICT (user_id) DO UPDATE SET
  geo_focus = EXCLUDED.geo_focus,
  investment_horizon = EXCLUDED.investment_horizon,
  income_preference = EXCLUDED.income_preference,
  aum_tier = EXCLUDED.aum_tier,
  target_equities_pct = EXCLUDED.target_equities_pct,
  target_fixed_income_pct = EXCLUDED.target_fixed_income_pct,
  target_alternatives_pct = EXCLUDED.target_alternatives_pct,
  target_cash_pct = EXCLUDED.target_cash_pct,
  target_real_estate_pct = EXCLUDED.target_real_estate_pct,
  risk_tolerance = EXCLUDED.risk_tolerance,
  interests = EXCLUDED.interests,
  top_asset_classes = EXCLUDED.top_asset_classes,
  allocation_gaps = EXCLUDED.allocation_gaps,
  updated_at = NOW();

-- ============================================================
-- CTA Templates (8 families × card types)
-- ============================================================
DELETE FROM cta_templates;
INSERT INTO cta_templates (card_type, cta_family, template_text, is_primary, intent) VALUES
  ('portfolio_impact', 'impact', 'How does this affect my portfolio?', TRUE, 'impact_analysis'),
  ('portfolio_impact', 'plan', 'Should I rebalance now?', FALSE, 'rebalance'),
  ('trend_brief', 'explain', 'Explain what this means for me', TRUE, 'explanation'),
  ('trend_brief', 'compare', 'Compare to my holdings', FALSE, 'comparison'),
  ('market_pulse', 'impact', 'What does this mean for me?', TRUE, 'impact_analysis'),
  ('market_pulse', 'watch', 'Keep me updated on this', FALSE, 'watch'),
  ('explainer', 'explain', 'Tell me more about this', TRUE, 'education'),
  ('explainer', 'compare', 'How does this compare to my current strategy?', FALSE, 'comparison'),
  ('wealth_planning', 'plan', 'Model this scenario for me', TRUE, 'planning'),
  ('wealth_planning', 'simulate', 'What would this look like for my portfolio?', FALSE, 'simulation'),
  ('allocation_gap', 'screen', 'Show me options that fit', TRUE, 'screening'),
  ('allocation_gap', 'impact', 'How would this change my risk?', FALSE, 'impact_analysis'),
  ('event_calendar', 'impact', 'How might this affect me?', TRUE, 'impact_analysis'),
  ('event_calendar', 'watch', 'Alert me after the event', FALSE, 'watch'),
  ('ada_view', 'impact', 'Dive deeper into these themes', TRUE, 'impact_analysis'),
  ('ada_view', 'explain', 'What should I focus on this week?', FALSE, 'explanation'),
  ('product_opportunity', 'screen', 'Show me suitable options', TRUE, 'screening'),
  ('product_opportunity', 'advisor', 'Connect me with my advisor', FALSE, 'advisor'),
  ('morning_briefing', 'explain', 'Walk me through today''s outlook', TRUE, 'explanation'),
  ('morning_briefing', 'impact', 'How does this affect my portfolio?', FALSE, 'impact_analysis'),
  ('milestone', 'explain', 'Review my journey so far', TRUE, 'explanation'),
  ('milestone', 'advisor', 'Share with my advisor', FALSE, 'advisor');

-- ============================================================
-- Editorial Discover Cards (seed content for Phase 1)
-- ============================================================
INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, image_url, source_count,
  intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
  why_you_are_seeing_this, supporting_articles, is_active, is_editorial, expires_at) VALUES
  ('disc-ed-1', 'wealth_planning', 'forYou',
   'Multi-generational wealth transfer: Structuring for tax efficiency',
   'New regulations create opportunities to reduce estate tax burden by up to 35% through strategic trust structures.',
   '[{"title":"Regulatory changes","type":"bullets","content":["Estate tax reduction up to 35%","Strategic trust structures","Multi-generational wealth planning"]},{"title":"Implementation approach","type":"paragraph","content":["Work with a financial advisor to model different scenarios and choose the most tax-efficient structure."]}]',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
   3, 'action', 'Planning', ARRAY['estate_planning', 'tax_efficiency'], 'high',
   '{"asset_classes":["Fixed Income"],"sectors":[],"geographies":["UAE","GCC"],"themes":["estate_planning","tax_optimization"],"wealth_topics":["succession","trusts"]}',
   '[{"text":"Model my estate tax scenarios","family":"plan","context":{"card_summary":"Estate tax reduction opportunities","entities":[],"evidence_facts":["Up to 35% tax reduction"]}},{"text":"Compare trust structures for me","family":"simulate","context":{"card_summary":"Trust structure comparison","entities":[],"evidence_facts":[]}}]',
   'Relevant to wealth planning',
   '[{"title":"GCC economic outlook 2026: Trade diversification and fiscal discipline","publisher":"Arabian Business","published_at":"2026-03-28T09:00:00Z","url":"https://www.arabianbusiness.com/politics-economics/gcc-economic-outlook-2026-trade-diversification-ai-deployment-and-fiscal-discipline-take-centre-stage","summary":"New GCC-wide economic policies and fiscal reforms promise to reshape wealth planning for HNW families."},{"title":"2025 Trends in trust and estate planning","publisher":"Wealth Management","published_at":"2026-03-27T14:30:00Z","url":"https://www.wealthmanagement.com/estate-planning/2025-trends-in-trust-and-estate-planning","summary":"Trust and estate planning trends evolve with new strategies to reduce tax liabilities by up to 35%."},{"title":"How rich are Gulf countries? Region''s wealth funds have $3 trillion to spend","publisher":"Bloomberg","published_at":"2026-03-26T11:00:00Z","url":"https://www.bloomberg.com/graphics/2023-middle-east-wealth-funds-with-more-money-than-uk-gdp-become-world-bankers/","summary":"Gulf families and sovereign funds are increasingly using sophisticated structures to preserve wealth across generations."}]',
   TRUE, TRUE, NOW() + INTERVAL '30 days'),

  ('disc-ed-2', 'allocation_gap', 'forYou',
   'Alternative investments show 23% lower correlation to public markets',
   'Your alternatives allocation is below the recommended range for portfolios seeking true diversification.',
   '[{"title":"Why alternatives matter","type":"bullets","content":["Hedged risk during market downturns","Access to unique return streams","Portfolio protection in high-inflation environments"]},{"title":"Available opportunities","type":"paragraph","content":["Private equity and private credit are available options beyond your current holdings."]}]',
   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
   3, 'opportunity', 'Opportunity', ARRAY['underweight_alternatives', 'diversification'], 'high',
   '{"asset_classes":["Alternatives","Private Equity","Private Credit"],"sectors":[],"geographies":["Global"],"themes":["diversification","alternative_investments"],"wealth_topics":["asset_allocation"]}',
   '[{"text":"Show me alternatives that fit my portfolio","family":"screen","context":{"card_summary":"Alternatives allocation gap","entities":[],"evidence_facts":["23% lower correlation"]}},{"text":"How would this change my risk?","family":"impact","context":{"card_summary":"Risk impact of alternatives","entities":[],"evidence_facts":[]}}]',
   'Low alternatives allocation',
   '[{"title":"What the retail boom in alternative assets means for risk, liquidity and portfolios","publisher":"CNBC","published_at":"2026-03-29T16:00:00Z","url":"https://www.cnbc.com/2025/12/04/retail-boom-in-alternative-assets-risk-liquidity-and-portfolios.html","summary":"Alternatives showed 23% lower correlation to public markets during recent volatility."},{"title":"Hassana, Brookfield ink deal for GCC-focused private equity fund","publisher":"Gulf News","published_at":"2026-03-28T08:00:00Z","url":"https://gulfnews.com/business/markets/hassana-brookfield-ink-deal-for-gcc-focused-private-equity-fund-1.1730364078094","summary":"GCC high-net-worth investors are increasing allocations to private equity and credit."},{"title":"Portfolio diversification is winning in 2025","publisher":"Morningstar","published_at":"2026-03-27T12:00:00Z","url":"https://www.morningstar.com/portfolios/portfolio-diversification-is-winning-2025","summary":"Research shows alternative assets reduce portfolio drawdowns significantly during stress periods."}]',
   TRUE, TRUE, NOW() + INTERVAL '7 days'),

  ('disc-ed-3', 'portfolio_impact', 'forYou',
   'Your tech allocation outperformed by 12% this quarter',
   'AI and semiconductor holdings drove strong gains. Consider rebalancing to lock in profits while maintaining growth exposure.',
   '[{"title":"Performance breakdown","type":"bullets","content":["Tech holdings: +12.3% vs +8.1% sector average","AI infrastructure stocks: +18.2%","Semiconductor positions: +15.7%"]},{"title":"Advisor recommendation","type":"paragraph","content":["Consider taking 20% profits from strongest performers to maintain your risk target while preserving upside potential."]}]',
   'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
   2, 'opportunity', 'Portfolio Impact', ARRAY['tech_holdings', 'outperformance'], 'high',
   '{"asset_classes":["Equities"],"sectors":["Technology","Semiconductors"],"geographies":["US"],"themes":["ai_infrastructure","tech_earnings"],"wealth_topics":["rebalancing"]}',
   '[{"text":"Should I rebalance now?","family":"plan","context":{"card_summary":"Tech outperformance rebalancing","entities":["AAPL","MSFT","NVDA"],"evidence_facts":["+12.3% vs +8.1% sector avg"]}},{"text":"Show optimal profit-taking strategy","family":"simulate","context":{"card_summary":"Profit-taking analysis","entities":["AAPL","MSFT","NVDA"],"evidence_facts":[]}}]',
   'Based on your tech holdings',
   '[{"title":"Chip stocks rally to start 2026 after third-straight winning year","publisher":"CNBC","published_at":"2026-03-30T18:00:00Z","url":"https://www.cnbc.com/2026/01/02/chipmakers-2026-ai-trade.html","summary":"AI infrastructure and semiconductor stocks led the market higher with double-digit gains this quarter."},{"title":"Infineon forecasts growing sales from AI data center demand","publisher":"Bloomberg","published_at":"2026-03-29T10:00:00Z","url":"https://www.bloomberg.com/news/articles/2026-02-04/infineon-forecasts-growing-revenue-from-ai-data-center-demand","summary":"Chip makers report record orders driven by AI data center expansion worldwide."}]',
   TRUE, TRUE, NOW() + INTERVAL '1 day'),

  ('disc-ed-4', 'explainer', 'whatsNew',
   'How private credit differs from public bonds',
   'Private credit offers higher yields with less liquidity. Understanding the trade-offs is key for portfolio construction.',
   '[{"title":"What it is","type":"paragraph","content":["Private credit involves direct lending to companies outside public bond markets, offering higher yields in exchange for less liquidity and longer lock-up periods."]},{"title":"Key data points","type":"bullets","content":["Average yield: 8-12% vs 4-6% for investment-grade bonds","Typical lock-up: 3-7 years","Default rate: 2.1% (lower than high-yield bonds at 3.8%)"]},{"title":"Considerations","type":"bullets","content":["Minimum investment typically $100K-$500K","Limited secondary market","Due diligence complexity","Manager selection is critical"]}]',
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
   2, NULL, 'Explainer', ARRAY['private_credit', 'fixed_income'], 'high',
   '{"asset_classes":["Fixed Income","Private Credit"],"sectors":[],"geographies":["Global"],"themes":["private_credit","yield_enhancement"],"wealth_topics":["education","asset_allocation"]}',
   '[{"text":"Tell me more about private credit","family":"explain","context":{"card_summary":"Private credit education","entities":[],"evidence_facts":["8-12% yield vs 4-6% bonds"]}},{"text":"How does this compare to my current bonds?","family":"compare","context":{"card_summary":"Private credit vs public bonds","entities":[],"evidence_facts":[]}}]',
   NULL,
   '[{"title":"High-yield bonds have outshone private debt, says Dimensional","publisher":"Bloomberg","published_at":"2026-03-28T07:00:00Z","url":"https://www.bloomberg.com/news/articles/2025-05-30/high-yield-bonds-have-outshone-private-debt-says-dimensional","summary":"Private credit assets under management surpass $2 trillion as investors seek higher yields."},{"title":"Private credit yields vs bonds: what investors need to know","publisher":"Bloomberg","published_at":"2026-03-27T15:00:00Z","url":"https://www.bloomberg.com/graphics/2018-private-credit-yields/","summary":"Direct lending offers 8-12% yields with lower default rates than high-yield bonds."}]',
   TRUE, TRUE, NOW() + INTERVAL '30 days'),

  ('disc-ed-5', 'explainer', 'whatsNew',
   'GCC real estate yields outpace global averages by 3.2%',
   'Dubai and Riyadh property markets deliver 7-9% rental yields, supported by population growth and economic diversification.',
   '[{"title":"Market overview","type":"paragraph","content":["GCC real estate has emerged as a compelling income-generating asset class, with rental yields in prime locations significantly exceeding global averages."]},{"title":"Key metrics","type":"bullets","content":["Dubai prime residential yield: 7.2%","Riyadh commercial yield: 8.5%","Global average comparable yield: 4.1%","Capital appreciation: 12-18% annually in prime segments"]},{"title":"Access options","type":"bullets","content":["Direct property investment","REIT exposure through listed vehicles","Private real estate funds with quarterly liquidity"]}]',
   'https://images.unsplash.com/photo-1764675107575-7a33cbdb7905?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
   3, NULL, 'Explainer', ARRAY['gcc_real_estate', 'income'], 'high',
   '{"asset_classes":["Real Estate"],"sectors":["Property"],"geographies":["UAE","Saudi Arabia","GCC"],"themes":["gcc_property","rental_yield"],"wealth_topics":["education","income_generation"]}',
   '[{"text":"Tell me more about GCC property yields","family":"explain","context":{"card_summary":"GCC real estate yields","entities":[],"evidence_facts":["7-9% rental yields"]}},{"text":"Should I increase property allocation?","family":"impact","context":{"card_summary":"Property allocation analysis","entities":[],"evidence_facts":[]}}]',
   NULL,
   '[{"title":"Dubai real estate: Property rentals set to surge 18% in 2025","publisher":"Arabian Business","published_at":"2026-03-29T10:00:00Z","url":"https://www.arabianbusiness.com/industries/real-estate/dubai-real-estate-property-rentals-set-to-surge-18-in-2025-driven-by-investor-demand","summary":"Strong population growth drives rental yields in Dubai prime residential to 7.2%."},{"title":"Saudi Arabia''s Vision 2030 projects reach $1.3 trillion in value","publisher":"Gulf News","published_at":"2026-03-28T06:00:00Z","url":"https://gulfnews.com/business/property/saudi-arabias-vision-2030-projects-reach-13-trillion-in-value-1.104058333","summary":"Saudi Vision 2030 projects fuel commercial real estate demand in Riyadh."},{"title":"GCC Property Wealth Report 2025","publisher":"Omnia Capital","published_at":"2026-03-27T09:00:00Z","url":"https://www.omniacapitalgroup.com/reports-intelligence/gcc-property-wealth-report-2025","summary":"International investors increase GCC real estate allocations citing yield premium over developed markets."}]',
   TRUE, TRUE, NOW() + INTERVAL '30 days'),

  ('disc-ed-6', 'explainer', 'whatsNew',
   'Sustainable investing delivers competitive returns with lower risk',
   'ESG-screened portfolios matched market returns with 18% less volatility over the past 5 years.',
   '[{"title":"Performance insights","type":"bullets","content":["ESG leaders: +9.8% annualized vs +9.6% for broad market","Sharpe ratio: 0.82 vs 0.69 for conventional portfolios","Downside capture: 82% vs market average of 95%"]},{"title":"Implementation","type":"paragraph","content":["Multiple ESG integration approaches exist, from negative screening to impact investing. The key is aligning your values with your return objectives."]}]',
   'https://images.unsplash.com/photo-1743352476730-056502fba10b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
   2, NULL, 'Explainer', ARRAY['esg', 'sustainable_investing'], 'high',
   '{"asset_classes":["Equities","Fixed Income"],"sectors":[],"geographies":["Global"],"themes":["esg","sustainable_investing"],"wealth_topics":["education","values_alignment"]}',
   '[{"text":"Analyze my portfolio ESG score","family":"impact","context":{"card_summary":"ESG portfolio analysis","entities":[],"evidence_facts":["18% less volatility"]}},{"text":"Show ESG alternatives for my holdings","family":"screen","context":{"card_summary":"ESG alternatives screening","entities":[],"evidence_facts":[]}}]',
   NULL,
   '[{"title":"ESG funds: 2025 closes with continued outflows amid persistent headwinds","publisher":"Morningstar","published_at":"2026-03-30T11:00:00Z","url":"https://global.morningstar.com/en-nd/sustainable-investing/esg-funds-2025-closes-with-continued-outflows-amid-persistent-headwinds","summary":"Five-year study shows ESG-screened portfolios delivered competitive returns with 18% less volatility."},{"title":"Saudi Arabia overtakes UAE as MENA sustainable finance tops $35bn","publisher":"Arabian Business","published_at":"2026-03-28T14:00:00Z","url":"https://www.arabianbusiness.com/industries/banking-finance/saudi-arabia-overtakes-uae-as-mena-sustainable-finance-tops-35bn","summary":"New regulations encourage sustainable investing practices among financial institutions."}]',
   TRUE, TRUE, NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  detail_sections = EXCLUDED.detail_sections,
  ctas = EXCLUDED.ctas,
  taxonomy_tags = EXCLUDED.taxonomy_tags,
  supporting_articles = EXCLUDED.supporting_articles,
  source_count = EXCLUDED.source_count,
  updated_at = NOW();

-- ============================================================
-- Product Opportunity Cards (Phase 3)
-- ============================================================
INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, image_url, source_count,
  intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
  why_you_are_seeing_this, supporting_articles, is_active, is_editorial, expires_at) VALUES
  ('disc-prod-1', 'product_opportunity', 'forYou',
   'Sukuk yields climb to 5.8%: A fixed-income opportunity for conservative portfolios',
   'Investment-grade sukuk offering attractive yields with Shariah compliance. Suitable for conservative to moderate risk profiles.',
   '[{"title":"Opportunity overview","type":"bullets","content":["Investment-grade sukuk yielding 5.8% annualized","Shariah-compliant fixed income","3-5 year maturities available","Minimum investment: $50,000"]},{"title":"Suitability","type":"paragraph","content":["Best suited for conservative to moderate investors seeking income with capital preservation. Complements existing fixed income allocation."]}]',
   NULL, 2, 'opportunity', 'Product', ARRAY['sukuk', 'fixed_income', 'shariah'], 'high',
   '{"asset_classes":["Fixed Income"],"sectors":[],"geographies":["GCC","UAE"],"themes":["sukuk","islamic_finance","yield"],"wealth_topics":["income_generation"]}',
   '[{"text":"Show me suitable sukuk options","family":"screen","context":{"card_summary":"Sukuk fixed-income opportunity","entities":[],"evidence_facts":["5.8% yield","Investment-grade"]}},{"text":"Connect me with my advisor","family":"advisor","context":{"card_summary":"Sukuk investment discussion","entities":[],"evidence_facts":[]}}]',
   'Matches your fixed-income allocation gap',
   '[{"title":"Sukuk hit a record in 2025: What''s driving the boom","publisher":"Musaffa Academy","published_at":"2026-03-29T13:00:00Z","url":"https://academy.musaffa.com/record-sukuk-issuance-in-2025-what-investors-need-to-know/","summary":"Investment-grade sukuk yields reach 5.8% as GCC issuers attract global demand for Shariah-compliant debt."},{"title":"Unlocking growth: Islamic finance sees global expansion","publisher":"Coalition Greenwich","published_at":"2026-03-28T08:30:00Z","url":"https://www.greenwich.com/corporate-banking/unlocking-growth-islamic-finance-sees-global-expansion","summary":"Sukuk markets expand with competitive yields drawing interest from both Islamic and conventional investors."}]',
   TRUE, TRUE, NOW() + INTERVAL '14 days'),

  ('disc-prod-2', 'product_opportunity', 'forYou',
   'Private equity co-investment: Access pre-IPO tech at institutional pricing',
   'Exclusive co-investment opportunity in late-stage technology companies approaching IPO. Limited allocation available.',
   '[{"title":"Opportunity details","type":"bullets","content":["Late-stage technology co-investment","Pre-IPO pricing with 2-3 year horizon","Minimum ticket: $100,000","Historical IRR: 22-28% for similar vintage"]},{"title":"Risk considerations","type":"bullets","content":["Illiquid investment with 2-3 year lock-up","Concentrated single-company exposure","Suitable for aggressive risk profiles only"]}]',
   NULL, 2, 'opportunity', 'Product', ARRAY['private_equity', 'tech', 'pre_ipo'], 'high',
   '{"asset_classes":["Alternatives","Private Equity"],"sectors":["Technology"],"geographies":["Global","US"],"themes":["private_equity","pre_ipo","tech_investing"],"wealth_topics":["growth","alternatives"]}',
   '[{"text":"Show me the investment details","family":"screen","context":{"card_summary":"Pre-IPO tech co-investment","entities":[],"evidence_facts":["22-28% historical IRR"]}},{"text":"Connect me with my advisor","family":"advisor","context":{"card_summary":"PE co-investment discussion","entities":[],"evidence_facts":[]}}]',
   'Matches your interest in alternatives and technology',
   '[{"title":"Robinhood''s $1 billion fund pitches pre-IPO stock as next craze","publisher":"Bloomberg","published_at":"2026-03-30T14:00:00Z","url":"https://www.bloomberg.com/news/articles/2026-02-17/robinhood-s-1-billion-fund-pitches-pre-ipo-stock-as-next-craze","summary":"Late-stage co-investments in technology companies approaching IPO deliver strong historical returns."},{"title":"How investment firms of the ultra-rich partner with PE funds to find top deals","publisher":"CNBC","published_at":"2026-03-28T16:00:00Z","url":"https://www.cnbc.com/2026/01/29/family-offices-private-equity.html","summary":"More institutional-quality deals open to qualified investors at lower minimum tickets."}]',
   TRUE, TRUE, NOW() + INTERVAL '14 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  detail_sections = EXCLUDED.detail_sections,
  ctas = EXCLUDED.ctas,
  taxonomy_tags = EXCLUDED.taxonomy_tags,
  supporting_articles = EXCLUDED.supporting_articles,
  source_count = EXCLUDED.source_count,
  updated_at = NOW();

-- ============================================================
-- Fix Ada View cards: enrich supporting_articles with publisher/url/summary from source cards
-- ============================================================
UPDATE discover_cards av
SET supporting_articles = (
  SELECT jsonb_agg(
    CASE
      WHEN src.supporting_articles IS NOT NULL AND jsonb_array_length(src.supporting_articles) > 0
      THEN jsonb_build_object(
        'title', elem->>'title',
        'card_id', elem->>'card_id',
        'card_type', elem->>'card_type',
        'publisher', (src.supporting_articles->0)->>'publisher',
        'published_at', COALESCE((src.supporting_articles->0)->>'published_at', '2026-03-30T12:00:00Z'),
        'url', (src.supporting_articles->0)->>'url',
        'summary', COALESCE((src.supporting_articles->0)->>'summary', elem->>'title')
      )
      ELSE jsonb_build_object(
        'title', elem->>'title',
        'card_id', elem->>'card_id',
        'card_type', elem->>'card_type',
        'publisher', null,
        'published_at', '2026-03-30T12:00:00Z',
        'url', null,
        'summary', elem->>'title'
      )
    END
  )
  FROM jsonb_array_elements(av.supporting_articles) elem
  LEFT JOIN discover_cards src ON src.id = elem->>'card_id'
),
updated_at = NOW()
WHERE av.card_type = 'ada_view'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(av.supporting_articles) e
    WHERE (e->>'publisher') IS NULL OR (e->>'publisher') = ''
       OR (e->>'url') IS NULL OR (e->>'url') = ''
  );

-- ============================================================
-- User Segments (Phase 2: Personalization)
-- ============================================================
INSERT INTO user_segments (id, label, description, scoring_weights) VALUES
  ('seg-conservative-gcc', 'Conservative GCC',
   'Risk-averse GCC investors focused on income and capital preservation',
   '{"portfolio_relevance": 0.25, "allocation_gap": 0.25, "suitability": 0.20, "geo": 0.15, "importance": 0.05, "freshness": 0.05, "novelty": 0.05}'),
  ('seg-balanced-gcc', 'Balanced GCC',
   'Moderate-risk GCC investors seeking growth with downside protection',
   '{"portfolio_relevance": 0.30, "allocation_gap": 0.20, "suitability": 0.15, "geo": 0.10, "importance": 0.10, "freshness": 0.10, "novelty": 0.05}'),
  ('seg-aggressive-global', 'Aggressive Global',
   'Growth-oriented investors with global exposure and higher risk appetite',
   '{"portfolio_relevance": 0.30, "allocation_gap": 0.15, "suitability": 0.15, "geo": 0.05, "importance": 0.15, "freshness": 0.15, "novelty": 0.05}')
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  scoring_weights = EXCLUDED.scoring_weights;

UPDATE user_profiles SET segment_id = 'seg-balanced-gcc' WHERE user_id = 'user-aisha' AND (segment_id IS NULL OR segment_id != 'seg-balanced-gcc');
UPDATE user_profiles SET segment_id = 'seg-conservative-gcc' WHERE user_id = 'user-khalid' AND (segment_id IS NULL OR segment_id != 'seg-conservative-gcc');
UPDATE user_profiles SET segment_id = 'seg-aggressive-global' WHERE user_id = 'user-raj' AND (segment_id IS NULL OR segment_id != 'seg-aggressive-global');

-- ============================================================
-- Backfill: Enrich supporting_articles for cluster-based cards
-- ============================================================
UPDATE discover_cards dc
SET supporting_articles = sub.enriched,
    source_count = sub.cnt,
    updated_at = NOW()
FROM (
  SELECT dc2.id AS card_id,
    (SELECT jsonb_agg(article_row ORDER BY article_row->>'importance' DESC NULLS LAST)
     FROM (
       SELECT jsonb_build_object(
         'title', ra.title,
         'publisher', COALESCE(ra.publisher, 'Unknown'),
         'published_at', ra.published_at,
         'url', ra.url,
         'summary', ra.summary
       ) AS article_row,
       ae.importance_score AS importance
       FROM unnest(ac.article_ids) AS aid
       JOIN raw_articles ra ON ra.id = aid
       LEFT JOIN article_enrichment ae ON ae.article_id = ra.id
       ORDER BY ae.importance_score DESC NULLS LAST
       LIMIT 3
     ) ranked
    ) AS enriched,
    LEAST(array_length(ac.article_ids, 1), 3) AS cnt
  FROM discover_cards dc2
  JOIN article_clusters ac ON ac.id = dc2.cluster_id
  WHERE dc2.is_active = TRUE
    AND dc2.cluster_id IS NOT NULL
    AND (dc2.supporting_articles IS NULL
         OR dc2.supporting_articles::text = '[]'
         OR NOT dc2.supporting_articles::text LIKE '%url%')
) sub
WHERE dc.id = sub.card_id
  AND sub.enriched IS NOT NULL;

