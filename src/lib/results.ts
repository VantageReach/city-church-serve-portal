export interface GiftResult { name: string; score: number; pct: number; def?: string; ref?: string; about?: string; signs?: string[] }
export interface DiscStyle { k: string; name: string; line: string; use: string; grow: string }
export interface RoleResult { role: string; team: string; description?: string; why?: string; url?: string }

export interface QuizResults {
  topGifts: GiftResult[];
  allGifts: GiftResult[];
  disc: {
    code: string;
    label: string;
    primary: DiscStyle;
    secondary: DiscStyle;
    bars: { k: string; name: string; pct: number }[];
  };
  roles: RoleResult[];
}

const str = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

export function isValidResults(r: any): r is QuizResults {
  if (!r || typeof r !== 'object') return false;
  const gift = (g: any) => g && str(g.name, 80) && num(g.score) && num(g.pct);
  const style = (s: any) => s && str(s.k, 1) && str(s.name, 40) && str(s.line, 300) && str(s.use, 400) && str(s.grow, 400);
  return (
    Array.isArray(r.topGifts) && r.topGifts.length >= 3 && r.topGifts.length <= 10 && r.topGifts.every(gift) &&
    Array.isArray(r.allGifts) && r.allGifts.length <= 40 && r.allGifts.every(gift) &&
    r.disc && str(r.disc.code, 3) && str(r.disc.label, 80) && style(r.disc.primary) && style(r.disc.secondary) &&
    Array.isArray(r.disc.bars) && r.disc.bars.length === 4 &&
    Array.isArray(r.roles) && r.roles.length <= 5 && r.roles.every((x: any) => x && str(x.role, 80) && str(x.team, 80))
  );
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const NAVY = '#101B2E';
const GREEN = '#8CC640';
const GREEN_DARK = '#5E8C24';
const MUTED = '#5A6275';
const LINE = '#E3E6EC';

function bar(pct: number, color: string) {
  const w = Math.max(0, Math.min(100, Math.round(pct)));
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0"><tr>
    <td style="background:#E8ECF3;border-radius:999px;height:8px;line-height:8px;font-size:0;padding:0">
      <div style="width:${w}%;background:${color};height:8px;border-radius:999px"></div>
    </td></tr></table>`;
}

function shell(inner: string, preheader: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F5F7">
  <div style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F5F7"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;font-family:'Open Sans',Helvetica,Arial,sans-serif;color:${NAVY}">
      <tr><td style="background:${NAVY};padding:22px 28px">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.55);font-weight:700">City Church Lufkin</div>
        <div style="font-size:20px;letter-spacing:1px;text-transform:uppercase;color:#FFFFFF;font-weight:800">Serve Portal</div>
      </td></tr>
      <tr><td style="padding:28px">${inner}</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function h2(text: string) {
  return `<h2 style="margin:28px 0 12px;font-size:20px;text-transform:uppercase;letter-spacing:.5px;color:${NAVY}">${esc(text)}</h2>`;
}

function giftsBlock(r: QuizResults) {
  return r.topGifts
    .map((g, i) => {
      const top = i < 3;
      return `<div style="border:1px solid ${LINE};border-left:5px solid ${top ? GREEN : '#3A5490'};border-radius:10px;padding:14px 16px;margin-bottom:10px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-weight:800;font-size:16px;text-transform:uppercase">${esc(g.name)}</td>
          <td align="right" style="font-size:13px;color:${MUTED};white-space:nowrap">${g.score} of 20</td>
        </tr></table>
        ${bar(g.pct, top ? GREEN : '#3A5490')}
        ${g.def ? `<p style="margin:6px 0;font-size:14px;line-height:1.55;font-weight:600">${esc(g.def)}</p>` : ''}
        ${top && g.about ? `<p style="margin:6px 0;font-size:14px;line-height:1.55">${esc(g.about)}</p>` : ''}
        ${g.ref ? `<p style="margin:0;font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px">${esc(g.ref)}</p>` : ''}
      </div>`;
    })
    .join('');
}

function discBlock(r: QuizResults) {
  const style = (s: DiscStyle, second: boolean) => `<div style="border:1px solid ${LINE};border-radius:10px;padding:14px 16px;margin-bottom:10px">
      <div style="font-weight:800;font-size:16px;text-transform:uppercase">${esc(s.name)}${second ? ' (your second style)' : ''}</div>
      <p style="margin:6px 0;font-size:14px;line-height:1.55">${esc(s.line)} ${esc(s.use)}</p>
      <p style="margin:0;font-size:13px;color:${MUTED};line-height:1.55">To grow: ${esc(s.grow)}</p>
    </div>`;
  const bars = r.disc.bars
    .map((b) => `<tr><td style="font-size:13px;font-weight:600;width:90px;padding:2px 0">${esc(b.name)}</td><td>${bar(b.pct, '#3A5490')}</td><td align="right" style="font-size:13px;color:${MUTED};width:32px">${b.pct}</td></tr>`)
    .join('');
  return `<p style="margin:0 0 6px;font-size:14px"><span style="font-size:34px;font-weight:900;color:${GREEN_DARK};vertical-align:middle">${esc(r.disc.code)}</span>
      <span style="color:${MUTED};margin-left:8px">${esc(r.disc.label)}</span></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 14px">${bars}</table>
    ${style(r.disc.primary, false)}${style(r.disc.secondary, true)}`;
}

function rolesBlock(r: QuizResults, siteUrl: string) {
  return r.roles
    .map((m) => `<div style="border:1px solid ${LINE};border-left:5px solid ${GREEN};border-radius:10px;padding:14px 16px;margin-bottom:10px">
        <div style="font-weight:800;font-size:16px;text-transform:uppercase">${esc(m.role)}</div>
        <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${esc(m.team)}</div>
        ${m.description ? `<p style="margin:0 0 6px;font-size:14px;line-height:1.55">${esc(m.description)}</p>` : ''}
        ${m.why ? `<p style="margin:0 0 6px;font-size:13px;color:${MUTED}">${esc(m.why)}</p>` : ''}
        ${m.url ? `<a href="${esc(siteUrl + m.url)}" style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${GREEN_DARK};text-decoration:none">View team page &rarr;</a>` : ''}
      </div>`)
    .join('');
}

export function resultsEmail(name: string, r: QuizResults, siteUrl: string, followUp: string) {
  const first = name.trim().split(/\s+/)[0];
  const inner = `
    <h1 style="margin:0 0 10px;font-size:26px;text-transform:uppercase;letter-spacing:.5px">Your spiritual gifts results</h1>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.6">Hi ${esc(first)}, here are your results from the City Church Spiritual Gifts Test.</p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:${MUTED}">Your strongest gifts are ${esc(r.topGifts[0].name)}, ${esc(r.topGifts[1].name)}, and ${esc(r.topGifts[2].name)}. Your personality style is ${esc(r.disc.label)}.</p>
    ${h2('Your top spiritual gifts')}${giftsBlock(r)}
    ${h2('Your personality style')}${discBlock(r)}
    ${r.roles.length ? h2('Where you could serve') + `<p style="margin:0 0 12px;font-size:14px;color:${MUTED}">These roles fit your gifts and style best. They are suggestions, not assignments.</p>` + rolesBlock(r, siteUrl) : ''}
    <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${LINE};font-size:13px;color:${MUTED};line-height:1.6">This is a tool for reflection, not a diagnosis, and it is not a formal or validated assessment. ${esc(followUp)}</p>
    <p style="margin:20px 0 0"><a href="${esc(siteUrl)}/teams/" style="display:inline-block;background:${GREEN};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;padding:12px 22px;border-radius:4px">Explore all serve teams</a></p>`;
  return shell(inner, `Your top gifts: ${r.topGifts.slice(0, 3).map((g) => g.name).join(', ')}`);
}

export function staffAlertEmail(p: { name: string; email: string; phone: string }, r: QuizResults, siteUrl: string, id: string) {
  const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;font-size:13px;color:${MUTED};white-space:nowrap">${k}</td><td style="padding:4px 0;font-size:14px">${v}</td></tr>`;
  const inner = `
    <h1 style="margin:0 0 14px;font-size:22px;text-transform:uppercase;letter-spacing:.5px">New Spiritual Gifts Test result</h1>
    <table role="presentation" cellpadding="0" cellspacing="0">
      ${row('Name', esc(p.name))}
      ${row('Email', `<a href="mailto:${esc(p.email)}" style="color:${GREEN_DARK}">${esc(p.email)}</a>`)}
      ${row('Phone', `<a href="tel:${esc(p.phone)}" style="color:${GREEN_DARK}">${esc(p.phone)}</a>`)}
      ${row('Top gifts', esc(r.topGifts.slice(0, 3).map((g) => g.name).join(', ')))}
      ${row('Style', esc(`${r.disc.code} · ${r.disc.label}`))}
      ${row('Suggested', esc(r.roles.map((m) => `${m.role} (${m.team})`).join(', ')))}
    </table>
    <p style="margin:22px 0 0"><a href="${esc(siteUrl)}/dashboard/?id=${esc(id)}" style="display:inline-block;background:${NAVY};color:#FFFFFF;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;padding:12px 22px;border-radius:4px">Open in staff dashboard</a></p>`;
  return shell(inner, `${p.name} finished the test`);
}
