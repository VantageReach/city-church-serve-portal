import type { APIRoute } from 'astro';
import { adminClient, cancelScheduledEmail, env, json, optionalEnv, sendEmail } from '../../lib/server';
import { interestAlertEmail, type QuizResults } from '../../lib/results';

export const prerender = false;

const SEND_DELAY_MS = 10 * 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Interest = { role: string; team: string; at: string };

// Interest can be marked on any role in the test, so only the team name is checked here.
const TEAMS = [
  'Worship', 'Kid City', 'Production', 'Impressions', 'Care Team', 'Prayer Team', 'Creative Team',
  'Safety Team', 'Student Ministry', 'Outreach', 'Next Steps', 'Life Groups', 'Milestones', 'Facilities',
];

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  const id = String(body?.id ?? '');
  const role = String(body?.role ?? '');
  const team = String(body?.team ?? '');
  const interested = body?.interested === true;
  if (!UUID_RE.test(id) || !role || !team) return json({ error: 'Invalid request.' }, 400);

  const db = adminClient();
  const { data: row, error } = await db
    .from('quiz_responses')
    .select('id, name, email, phone, results, interests, interest_email_id')
    .eq('id', id)
    .single();
  if (error || !row) return json({ error: 'We couldn’t find your results. Please retake the test.' }, 404);

  const results = row.results as QuizResults;
  if (!TEAMS.includes(team) || role.length > 80) return json({ error: 'Invalid request.' }, 400);

  const current: Interest[] = Array.isArray(row.interests) ? row.interests : [];
  const already = current.some((i) => i.role === role && i.team === team);
  const next = interested
    ? already ? current : [...current, { role, team, at: new Date().toISOString() }]
    : current.filter((i) => !(i.role === role && i.team === team));

  const { error: updateError } = await db
    .from('quiz_responses')
    .update({ interests: next, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (updateError) {
    console.error('interest update failed', updateError);
    return json({ error: 'We couldn’t save that. Please try again.' }, 500);
  }

  // One combined staff email per burst of taps: replace the pending one with the current list.
  if (interested !== already) {
    try {
      if (row.interest_email_id) await cancelScheduledEmail(row.interest_email_id);
      let pendingId: string | null = null;
      const notify = optionalEnv('STAFF_NOTIFY_EMAIL');
      if (notify && next.length) {
        const roles = next.map((i) => ({ role: i.role, team: i.team }));
        pendingId = (await sendEmail(
          notify,
          `${row.name} is interested in ${roles.map((x) => x.role).join(', ')}`,
          interestAlertEmail({ name: row.name, email: row.email, phone: row.phone }, roles, results, env('SITE_URL'), id),
          row.email,
          new Date(Date.now() + SEND_DELAY_MS),
        )) ?? null;
      }
      await db.from('quiz_responses').update({ interest_email_id: pendingId }).eq('id', id);
    } catch (e) {
      console.error('interest alert failed', e);
    }
  }

  return json({ interests: next.map((i) => ({ role: i.role, team: i.team })) });
};
