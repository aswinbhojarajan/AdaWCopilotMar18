import pool from '../db/pool';
import type { PollQuestion, PollOption } from '../../shared/types';

export async function getActivePolls(userId: string): Promise<PollQuestion[]> {
  const { rows: questions } = await pool.query(
    `SELECT id, question, created_at FROM poll_questions ORDER BY created_at DESC`,
  );

  const polls: PollQuestion[] = [];

  for (const q of questions) {
    const { rows: optionRows } = await pool.query(
      `SELECT id, poll_id, label, vote_count FROM poll_options WHERE poll_id = $1 ORDER BY id`,
      [q.id],
    );

    const { rows: voteRows } = await pool.query(
      `SELECT option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [q.id, userId],
    );

    const options: PollOption[] = optionRows.map((r) => ({
      id: String(r.id),
      pollId: String(r.poll_id),
      label: String(r.label),
      voteCount: Number(r.vote_count),
    }));

    polls.push({
      id: String(q.id),
      question: String(q.question),
      createdAt: new Date(q.created_at as string).toISOString(),
      options,
      userVote: voteRows.length > 0 ? String(voteRows[0].option_id) : undefined,
    });
  }

  return polls;
}

export async function vote(
  pollId: string,
  userId: string,
  optionId: string,
): Promise<PollQuestion | null> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: pollCheck } = await client.query(
      `SELECT id FROM poll_questions WHERE id = $1`,
      [pollId],
    );
    if (pollCheck.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const { rows: optionCheck } = await client.query(
      `SELECT id FROM poll_options WHERE id = $1 AND poll_id = $2`,
      [optionId, pollId],
    );
    if (optionCheck.length === 0) {
      await client.query('ROLLBACK');
      throw new Error(`Option ${optionId} does not belong to poll ${pollId}`);
    }

    const { rows: existing } = await client.query(
      `SELECT id, option_id FROM poll_votes WHERE poll_id = $1 AND user_id = $2`,
      [pollId, userId],
    );

    if (existing.length > 0) {
      const oldOptionId = String(existing[0].option_id);
      await client.query(
        `UPDATE poll_options SET vote_count = vote_count - 1 WHERE id = $1 AND poll_id = $2`,
        [oldOptionId, pollId],
      );
      await client.query(
        `UPDATE poll_votes SET option_id = $1 WHERE poll_id = $2 AND user_id = $3`,
        [optionId, pollId, userId],
      );
    } else {
      await client.query(
        `INSERT INTO poll_votes (id, poll_id, user_id, option_id) VALUES ($1, $2, $3, $4)`,
        [`vote-${userId}-${pollId}`, pollId, userId, optionId],
      );
    }

    await client.query(
      `UPDATE poll_options SET vote_count = vote_count + 1 WHERE id = $1 AND poll_id = $2`,
      [optionId, pollId],
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const polls = await getActivePolls(userId);
  return polls.find((p) => p.id === pollId) ?? null;
}
