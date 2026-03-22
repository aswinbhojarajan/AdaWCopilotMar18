# Data Validation Checklist — Ada AI Wealth Copilot

> Run these checks after any seed data changes, persona additions, or portfolio data modifications.
> Last updated: 2026-03-22

---

## 1. Account Balance vs Position Reconciliation

For each persona, verify that every account's `balance` is greater than or equal to the sum of `quantity × current_price` for all positions in that account.

```sql
SELECT
  u.name,
  a.institution,
  a.balance AS account_balance,
  COALESCE(SUM(p.quantity * p.current_price), 0) AS position_total,
  a.balance - COALESCE(SUM(p.quantity * p.current_price), 0) AS cash_remainder
FROM users u
JOIN accounts a ON a.user_id = u.id
LEFT JOIN positions p ON p.account_id = a.id
GROUP BY u.name, a.institution, a.balance
ORDER BY u.name, a.institution;
```

**Pass criteria**: `cash_remainder >= 0` for all rows. A negative value means the account cannot cover its positions.

---

## 2. Cost Basis vs Weighted Transaction Prices

For each position, verify that `cost_basis` equals the weighted average price of all BUY transactions for that symbol within that account.

```sql
SELECT
  u.name,
  p.symbol,
  p.cost_basis AS position_cost_basis,
  ROUND(SUM(t.price * t.quantity) / SUM(t.quantity), 2) AS weighted_avg_price,
  ABS(p.cost_basis - ROUND(SUM(t.price * t.quantity) / SUM(t.quantity), 2)) AS discrepancy
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN positions p ON p.account_id = a.id
JOIN transactions t ON t.account_id = a.id AND t.symbol = p.symbol AND t.type = 'buy'
GROUP BY u.name, p.symbol, p.cost_basis
HAVING ABS(p.cost_basis - ROUND(SUM(t.price * t.quantity) / SUM(t.quantity), 2)) > 0.01
ORDER BY u.name, p.symbol;
```

**Pass criteria**: Query returns zero rows (no discrepancies greater than $0.01).

---

## 3. Transaction Quantity vs Position Quantity

For each position, verify that the net quantity (buys minus sells) from transactions equals the position quantity.

```sql
SELECT
  u.name,
  p.symbol,
  p.quantity AS position_qty,
  SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END) AS net_transaction_qty,
  p.quantity - SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END) AS qty_discrepancy
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN positions p ON p.account_id = a.id
JOIN transactions t ON t.account_id = a.id AND t.symbol = p.symbol
GROUP BY u.name, p.symbol, p.quantity
HAVING ABS(p.quantity - SUM(CASE WHEN t.type = 'buy' THEN t.quantity ELSE -t.quantity END)) > 0.001
ORDER BY u.name, p.symbol;
```

**Pass criteria**: Query returns zero rows.

---

## 4. Performance History Bounds Check

Verify that performance history values stay within realistic bounds for each persona's risk profile.

```sql
SELECT
  u.name,
  ps.total_value AS current_value,
  MIN(ph.value) AS min_history,
  MAX(ph.value) AS max_history,
  COUNT(ph.id) AS history_days,
  ROUND((MAX(ph.value) - MIN(ph.value)) / ps.total_value * 100, 1) AS range_pct
FROM users u
JOIN portfolio_snapshots ps ON ps.user_id = u.id
JOIN performance_history ph ON ph.user_id = u.id
GROUP BY u.name, ps.total_value
ORDER BY u.name;
```

**Pass criteria**:
- All personas have 366 history days
- `min_history > 0` (no negative portfolio values)
- `range_pct` is reasonable: Conservative <5%, Moderate <25%, Aggressive <30%
- `max_history` does not exceed `current_value × 1.5`
- `min_history` is not less than `current_value × 0.5`

---

## 5. Snapshot Total vs Account Balance Sum

Verify that each persona's portfolio snapshot `total_value` equals the sum of all their account balances.

```sql
SELECT
  u.name,
  ps.total_value AS snapshot_total,
  SUM(a.balance) AS account_sum,
  ABS(ps.total_value - SUM(a.balance)) AS discrepancy
FROM users u
JOIN portfolio_snapshots ps ON ps.user_id = u.id
JOIN accounts a ON a.user_id = u.id
GROUP BY u.name, ps.total_value
HAVING ABS(ps.total_value - SUM(a.balance)) > 0.01
ORDER BY u.name;
```

**Pass criteria**: Query returns zero rows.

---

## 6. Goal Current Amount Alignment

Verify that goal `current_amount` values are reasonable relative to portfolio values.

```sql
SELECT
  u.name,
  g.name AS goal_name,
  g.current_amount,
  g.target_amount,
  ps.total_value AS portfolio_value,
  ROUND(g.current_amount / ps.total_value * 100, 1) AS pct_of_portfolio
FROM users u
JOIN goals g ON g.user_id = u.id
JOIN portfolio_snapshots ps ON ps.user_id = u.id
ORDER BY u.name, g.name;
```

**Pass criteria**:
- `current_amount <= target_amount` (or goal is complete)
- `current_amount <= portfolio_value` (cannot have saved more than total portfolio)
- No `current_amount = 0` unless goal was just created

---

## 7. Allocation Totals Reconciliation

Verify that asset allocation percentages sum to 100% for each persona.

```sql
SELECT
  u.name,
  SUM(aa.percentage) AS total_pct
FROM users u
JOIN asset_allocations aa ON aa.user_id = u.id
GROUP BY u.name
HAVING ABS(SUM(aa.percentage) - 100) > 0.1
ORDER BY u.name;
```

**Pass criteria**: Query returns zero rows (all sum to 100% within 0.1% tolerance).

---

## 8. Position Current Price vs Market Quote Consistency

Verify that position `current_price` values are consistent with the latest market quotes.

```sql
SELECT
  p.symbol,
  p.current_price AS position_price,
  mq.price AS market_price,
  ABS(p.current_price - mq.price) AS price_discrepancy
FROM positions p
LEFT JOIN market_quotes mq ON mq.symbol = p.symbol
WHERE mq.price IS NOT NULL
  AND ABS(p.current_price - mq.price) > 1.00
ORDER BY p.symbol;
```

**Pass criteria**: Query returns zero rows (position prices match market quotes within $1.00).

---

## 9. Transaction Price Reasonableness

Verify that transaction prices are within a reasonable range of the position's current price.

```sql
SELECT
  u.name,
  t.symbol,
  t.type,
  t.price AS transaction_price,
  p.current_price,
  ROUND(ABS(t.price - p.current_price) / p.current_price * 100, 1) AS deviation_pct
FROM users u
JOIN accounts a ON a.user_id = u.id
JOIN transactions t ON t.account_id = a.id
JOIN positions p ON p.account_id = a.id AND p.symbol = t.symbol
WHERE ABS(t.price - p.current_price) / p.current_price > 0.50
ORDER BY deviation_pct DESC;
```

**Pass criteria**: No transactions deviate more than 50% from current price (unless representing a legitimate historical purchase at a very different price level).

---

## 10. Persona Completeness Check

Verify that each persona has all required data entities.

```sql
SELECT
  u.name,
  (SELECT COUNT(*) FROM accounts WHERE user_id = u.id) AS accounts,
  (SELECT COUNT(*) FROM positions p JOIN accounts a ON p.account_id = a.id WHERE a.user_id = u.id) AS positions,
  (SELECT COUNT(*) FROM portfolio_snapshots WHERE user_id = u.id) AS snapshots,
  (SELECT COUNT(*) FROM performance_history WHERE user_id = u.id) AS perf_history,
  (SELECT COUNT(*) FROM goals WHERE user_id = u.id) AS goals,
  (SELECT COUNT(*) FROM alerts WHERE user_id = u.id) AS alerts,
  (SELECT COUNT(*) FROM chat_threads WHERE user_id = u.id) AS chat_threads
FROM users u
WHERE u.id LIKE 'user-%'
ORDER BY u.name;
```

**Pass criteria**:
- `accounts >= 1`
- `positions >= 1`
- `snapshots = 1`
- `perf_history = 366`
- `goals >= 1`
- `alerts >= 1`
- `chat_threads >= 1`

---

## Automated Parity Tests

The checks above are also partially covered by the automated test suite:

```bash
npm run test:parity
```

This runs `tests/persona-parity.test.ts` which validates:
- Each persona has positions, performance history (366 days), alerts, and chat threads
- Allocation percentages sum to 100% (within tolerance)
- Goals exist for personas that should have them
- Account balances reconcile with snapshot totals

Currently: **29 tests** covering 3 personas (Abdullah, Khalid, Raj).
