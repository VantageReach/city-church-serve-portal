import type { APIRoute } from 'astro';
import { adminClient, env, json, sendEmail } from '../../lib/server';
import { resultsEmail, type QuizResults } from '../../lib/results';

export const prerender = false;

const MAX_SENDS = 5;
const FOLLOW_UP =
  'Take your results to a staff member or team leader. Ask the people who know you whether they see these gifts in you too.';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Sends only to the address saved with the response, so this can't be used to email arbitrary people.
export const POST: APIRoute = async ({ request }) => {
  let id = '';
  try {
    id = String((await request.json())?.id ?? '');
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }
  if (!UUID_RE.test(id)) return json({ error: 'Invalid request.' }, 400);

  const db = adminClient();
  const { data: row, error } = await db
    .from('quiz_responses')
    .select('id, name, email, results, emails_sent')
    .eq('id', id)
    .single();

  if (error || !row) return json({ error: 'We couldn’t find your results. Please retake the test.' }, 404);
  if (row.emails_sent >= MAX_SENDS) return json({ error: 'These results have already been emailed several times. Check your inbox and spam folder.' }, 429);

  try {
    await sendEmail(row.email, 'Your Spiritual Gifts Test results', resultsEmail(row.name, row.results as QuizResults, env('SITE_URL'), FOLLOW_UP));
  } catch (e) {
    console.error('results email failed', e);
    return json({ error: 'We couldn’t send the email. Please try again in a minute.' }, 502);
  }

  await db.from('quiz_responses').update({ emails_sent: row.emails_sent + 1 }).eq('id', id);
  return json({ sent: true, email: row.email });
};
