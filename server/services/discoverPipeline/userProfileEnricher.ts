import pool from '../../db/pool';

interface HoldingRow {
  user_id: string;
  asset_class: string;
  total_value: number;
}

interface ProfileRow {
  user_id: string;
  target_equities_pct: number;
  target_fixed_income_pct: number;
  target_alternatives_pct: number;
  target_cash_pct: number;
  target_real_estate_pct: number;
}

const ASSET_CLASS_MAP: Record<string, string> = {
  'Equities': 'equities',
  'Fixed Income': 'fixed_income',
  'Bonds': 'fixed_income',
  'Sukuk': 'fixed_income',
  'Alternatives': 'alternatives',
  'Private Equity': 'alternatives',
  'Hedge Fund': 'alternatives',
  'Real Estate': 'real_estate',
  'REITs': 'real_estate',
  'Cash': 'cash',
  'Money Market': 'cash',
  'Crypto': 'alternatives',
  'Commodities': 'alternatives',
  'Gold': 'alternatives',
  'ETF': 'equities',
};

export async function computeUserProfileGaps(): Promise<void> {
  console.log('[UserProfileEnricher] Computing allocation gaps from holdings...');
  try {
    const { rows: profiles } = await pool.query(
      `SELECT user_id, target_equities_pct, target_fixed_income_pct, target_alternatives_pct,
              target_cash_pct, target_real_estate_pct
       FROM user_profiles`,
    );

    if (profiles.length === 0) {
      console.log('[UserProfileEnricher] No user profiles found');
      return;
    }

    for (const profile of profiles as ProfileRow[]) {
      try {
        const { rows: accounts } = await pool.query(
          `SELECT id, balance FROM accounts WHERE user_id = $1`,
          [profile.user_id],
        );

        if (accounts.length === 0) continue;

        const accountIds = accounts.map(a => a.id);
        const cashBalance = accounts.reduce((sum: number, a: { balance: string | number }) => sum + Number(a.balance || 0), 0);

        const { rows: positions } = await pool.query(
          `SELECT p.asset_class, SUM(p.quantity * p.current_price) as total_value
           FROM positions p
           WHERE p.account_id = ANY($1) AND p.asset_class IS NOT NULL
           GROUP BY p.asset_class`,
          [accountIds],
        );

        const totalPortfolioValue = positions.reduce((sum: number, p: HoldingRow) => sum + Number(p.total_value), 0) + cashBalance;
        if (totalPortfolioValue === 0) continue;

        const actualPcts: Record<string, number> = {
          equities: 0,
          fixed_income: 0,
          alternatives: 0,
          cash: 0,
          real_estate: 0,
        };

        for (const pos of positions as HoldingRow[]) {
          const mapped = ASSET_CLASS_MAP[pos.asset_class] || 'equities';
          actualPcts[mapped] += (Number(pos.total_value) / totalPortfolioValue) * 100;
        }
        if (cashBalance > 0) {
          actualPcts.cash += (cashBalance / totalPortfolioValue) * 100;
        }

        const gaps: Record<string, number> = {
          equities: parseFloat((actualPcts.equities - Number(profile.target_equities_pct)).toFixed(1)),
          fixed_income: parseFloat((actualPcts.fixed_income - Number(profile.target_fixed_income_pct)).toFixed(1)),
          alternatives: parseFloat((actualPcts.alternatives - Number(profile.target_alternatives_pct)).toFixed(1)),
          cash: parseFloat((actualPcts.cash - Number(profile.target_cash_pct)).toFixed(1)),
          real_estate: parseFloat((actualPcts.real_estate - Number(profile.target_real_estate_pct)).toFixed(1)),
        };

        const topClasses = Object.entries(actualPcts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cls]) => cls.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));

        await pool.query(
          `UPDATE user_profiles SET
            allocation_gaps = $1,
            top_asset_classes = $2,
            updated_at = NOW()
           WHERE user_id = $3`,
          [JSON.stringify(gaps), JSON.stringify(topClasses), profile.user_id],
        );

        console.log(`[UserProfileEnricher] Updated gaps for ${profile.user_id}: ${JSON.stringify(gaps)}`);
      } catch (err) {
        console.warn(`[UserProfileEnricher] Failed for ${profile.user_id}: ${(err as Error).message}`);
      }
    }

    console.log('[UserProfileEnricher] Completed allocation gap computation');
  } catch (err) {
    console.error('[UserProfileEnricher] Fatal error:', (err as Error).message);
  }
}
