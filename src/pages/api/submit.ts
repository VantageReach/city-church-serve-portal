import type { APIRoute } from 'astro';
import { adminClient, env, json, sendEmail } from '../../lib/server';
import { isValidResults, staffAlertEmail } from '../../lib/results';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot: real people never see or fill this field.
  if (body?.website) return json({ id: null });

  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim().toLowerCase();
  const phone = String(body?.phone ?? '').trim();
  const answers = body?.answers;
  const results = body?.results;

  const phoneDigits = phone.replace(/\D/g, '');
  if (!name || name.length > 100) return json({ error: 'Enter your name.' }, 400);
  if (!EMAIL_RE.test(email) || email.length > 254) return json({ error: 'Enter a valid email address.' }, 400);
  if (phoneDigits.length < 7 || phoneDigits.length > 15 || phone.length > 30) return json({ error: 'Enter a valid phone number.' }, 400);
  if (!answers || typeof answers !== 'object' || Object.keys(answers).length > 300 ||
      !Object.values(answers).every((v) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 5)) {
    return json({ error: 'Invalid answers.' }, 400);
  }
  if (!isValidResults(results)) return json({ error: 'Invalid results.' }, 400);

  const { data, error } = await adminClient()
    .from('quiz_responses')
    .insert({
      name,
      email,
      phone,
      top_gifts: results.topGifts.slice(0, 3).map((g) => g.name),
      disc_style: results.disc.code,
      results,
      answers,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('submit insert failed', error);
    return json({ error: 'We couldn’t save your results. Please try again.' }, 500);
  }

  try {
    const notify = process.env.STAFF_NOTIFY_EMAIL;
    if (notify) {
      await sendEmail(
        notify,
        `New Spiritual Gifts Test: ${name}`,
        staffAlertEmail({ name, email, phone }, results, env('SITE_URL'), data.id),
        email,
      );
    }
  } catch (e) {
    console.error('staff alert failed', e);
  }

  return json({ id: data.id });
};
