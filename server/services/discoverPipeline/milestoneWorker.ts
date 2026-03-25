import pool from '../../db/pool';

interface MilestoneCheck {
  type: string;
  title: string;
  summary: string;
  whySeeingThis: string;
  detailSections: Array<{ title: string; type: string; content: string | string[] }>;
  topicLabel: string;
}

const VALUE_THRESHOLDS = [25000, 50000, 75000, 100000, 150000, 200000, 250000, 500000, 1000000];

async function fetchCTAs(): Promise<Array<{ text: string; family: string }>> {
  const { rows } = await pool.query(
    `SELECT template_text, cta_family FROM cta_templates WHERE card_type = 'milestone' ORDER BY is_primary DESC LIMIT 2`,
  );
  if (rows.length === 0) {
    return [
      { text: 'Review my journey so far', family: 'explain' },
      { text: 'Share with my advisor', family: 'advisor' },
    ];
  }
  return rows.map((r: Record<string, unknown>) => ({
    text: r.template_text as string,
    family: r.cta_family as string,
  }));
}

async function getExistingMilestones(userId: string): Promise<Set<string>> {
  const { rows } = await pool.query(
    `SELECT id FROM discover_cards
     WHERE card_type = 'milestone' AND id LIKE $1
     ORDER BY created_at DESC`,
    [`disc-mile-${userId}%`],
  );
  return new Set(rows.map((r: { id: string }) => r.id));
}

function detectValueMilestones(
  userId: string,
  currentValue: number,
  previousValue: number,
  existingIds: Set<string>,
): MilestoneCheck | null {
  const reversedThresholds = [...VALUE_THRESHOLDS].reverse();
  for (const threshold of reversedThresholds) {
    const milestoneKey = `disc-mile-${userId}-val-${threshold}`;
    if (currentValue >= threshold && previousValue < threshold && !existingIds.has(milestoneKey)) {
      const formatted = threshold >= 1000000
        ? `$${(threshold / 1000000).toFixed(threshold % 1000000 === 0 ? 0 : 1)}M`
        : `$${(threshold / 1000).toFixed(0)}K`;
      return {
        type: 'value_crossed',
        title: `Your portfolio just crossed ${formatted}`,
        summary: `Congratulations! Your portfolio value has reached ${formatted}. This is a significant milestone in your wealth-building journey.`,
        whySeeingThis: `Your portfolio crossed the ${formatted} mark`,
        detailSections: [
          { title: 'Milestone reached', type: 'paragraph', content: [`Your portfolio has grown to ${formatted}, reflecting your disciplined investment approach.`] },
          { title: 'Next steps', type: 'bullets', content: ['Review your asset allocation at this new level', 'Consider whether your risk profile still fits', 'Discuss estate planning updates with your advisor'] },
        ],
        topicLabel: 'Milestone',
      };
    }
  }
  return null;
}

function detectPerformanceMilestones(
  userId: string,
  dailyChangePct: number,
  existingIds: Set<string>,
): MilestoneCheck | null {
  const today = new Date().toISOString().split('T')[0];

  if (dailyChangePct >= 2) {
    const key = `disc-mile-${userId}-perf-${today}`;
    if (!existingIds.has(key)) {
      return {
        type: 'strong_day',
        title: `Strong day: Your portfolio gained ${dailyChangePct.toFixed(1)}%`,
        summary: `Your portfolio outperformed with a ${dailyChangePct.toFixed(1)}% gain today. Here's what drove the move.`,
        whySeeingThis: 'Notable portfolio performance today',
        detailSections: [
          { title: 'Today\'s performance', type: 'paragraph', content: [`A ${dailyChangePct.toFixed(1)}% gain is well above the average daily move. This likely reflects strong positioning in today\'s market themes.`] },
        ],
        topicLabel: 'Performance',
      };
    }
  }

  return null;
}

export async function runMilestoneDetection(): Promise<number> {
  console.log('[MilestoneWorker] Checking for portfolio milestones...');
  try {
    const { rows: snapshots } = await pool.query(
      `SELECT DISTINCT ON (user_id) user_id, total_value, daily_change_percent
       FROM portfolio_snapshots
       ORDER BY user_id, recorded_at DESC`,
    );

    if (snapshots.length === 0) {
      console.log('[MilestoneWorker] No portfolio snapshots found');
      return 0;
    }

    let created = 0;
    const ctas = await fetchCTAs();

    for (const snap of snapshots) {
      const userId = snap.user_id;
      const currentValue = Number(snap.total_value);
      const dailyChangePct = Number(snap.daily_change_percent) || 0;

      const existingIds = await getExistingMilestones(userId);

      const { rows: prevSnapshots } = await pool.query(
        `SELECT total_value FROM portfolio_snapshots
         WHERE user_id = $1
         ORDER BY recorded_at DESC OFFSET 1 LIMIT 1`,
        [userId],
      );
      const previousValue = prevSnapshots.length > 0 ? Number(prevSnapshots[0].total_value) : 0;

      const milestones: MilestoneCheck[] = [];

      const valueMilestone = detectValueMilestones(userId, currentValue, previousValue, existingIds);
      if (valueMilestone) milestones.push(valueMilestone);

      const perfMilestone = detectPerformanceMilestones(userId, dailyChangePct, existingIds);
      if (perfMilestone) milestones.push(perfMilestone);

      for (const milestone of milestones) {
        const cardId = milestone.type === 'value_crossed'
          ? `disc-mile-${userId}-val-${VALUE_THRESHOLDS.find(t => currentValue >= t && previousValue < t)}`
          : `disc-mile-${userId}-perf-${new Date().toISOString().split('T')[0]}`;

        const ctasJson = ctas.map(c => ({
          text: c.text,
          family: c.family,
          context: {
            card_summary: milestone.summary,
            entities: [],
            evidence_facts: [],
          },
        }));

        await pool.query(
          `INSERT INTO discover_cards (id, card_type, tab, title, summary, detail_sections, supporting_articles,
            source_count, intent_badge, topic_label, relevance_tags, confidence, taxonomy_tags, ctas,
            why_you_are_seeing_this, is_active, is_editorial, priority_score, expires_at)
           VALUES ($1, 'milestone', 'forYou', $2, $3, $4, '[]', 0, 'action', $5, $6, 'high',
             $7, $8, $9, TRUE, TRUE, 85, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            cardId,
            milestone.title,
            milestone.summary,
            JSON.stringify(milestone.detailSections),
            milestone.topicLabel,
            ['milestone', milestone.type],
            JSON.stringify({
              asset_classes: [],
              sectors: [],
              geographies: [],
              themes: ['milestone', milestone.type],
              wealth_topics: ['portfolio_milestone'],
            }),
            JSON.stringify(ctasJson),
            milestone.whySeeingThis,
            new Date(Date.now() + 3 * 24 * 3600 * 1000),
          ],
        );

        created++;
        console.log(`[MilestoneWorker] Created milestone card: ${cardId}`);
      }
    }

    console.log(`[MilestoneWorker] Created ${created} milestone cards`);
    return created;
  } catch (err) {
    console.error('[MilestoneWorker] Error:', (err as Error).message);
    return 0;
  }
}
