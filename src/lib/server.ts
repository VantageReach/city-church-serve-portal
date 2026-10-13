import { createClient } from '@supabase/supabase-js';

// Vercel provides these at runtime; import.meta.env covers local `astro dev` with a .env file.
// Strips wrapping quotes: values pasted from a .env file into a dashboard often keep them literally.
export function optionalEnv(name: string): string | undefined {
  const raw = process.env[name] || (import.meta.env as Record<string, string | undefined>)[name];
  const value = raw?.trim().replace(/^(["'])(.*)\1$/, '$2').trim();
  return value || undefined;
}

export function env(name: string): string {
  const value = optionalEnv(name);
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export function adminClient() {
  return createClient(env('PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false },
  });
}

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env('EMAIL_FROM'),
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
