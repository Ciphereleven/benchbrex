export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = 'https://zowbwgzslqxrqdpoimac.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_I7_Xi25VO1-xaDjpi7VDsA_l5938yBC';
  const RESEND_KEY   = 're_PnVzBDj9_E47gmat7hxtc3jG9sxnU8kBZ';
  const FROM_ADDR    = 'Parth Patel at Benchbrex <contact@benchbrex.co>';
  const REPLY_TO     = 'contact@benchbrex.co';
  const INTERNAL_TO  = 'benchbrex@gmail.com';

  const d = req.body;

  // ── Save to Supabase ──────────────────────────────────────────────
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        first_name: d.first_name, last_name: d.last_name, email: d.email,
        company: d.company, job_title: d.job_title, company_size: d.company_size,
        service: d.service, jurisdiction: d.jurisdiction, timeline: d.timeline,
        notes: d.notes, budget: d.budget, source: d.source,
        nda_required: d.nda_required, extra: d.extra,
        quote_services: d.quote_services ? JSON.stringify(d.quote_services) : null,
        quote_total: d.quote_total, quote_express: d.quote_express || false,
        status: 'new'
      })
    });
  } catch(e) { console.warn('Supabase save:', e); }

  const hasQuote = d.quote_services && d.quote_services.length > 0;

  const quoteRows = hasQuote
    ? d.quote_services.map(s =>
        `<tr><td style="padding:7px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#f0f0f0">${s.name}</td><td style="padding:7px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#fff;text-align:right;font-weight:600">${s.range}</td></tr>`).join('')
    : '<tr><td colspan="2" style="padding:7px 0;font-size:13px;color:#666;font-style:italic">No services selected in calculator</td></tr>';

  const expressRow = d.quote_express
    ? `<tr><td style="padding:7px 0;border-bottom:1px solid #1a1a1a;font-size:13px;color:#f0f0f0">Express 48-hour delivery</td><td style="padding:7px 0;border-bottom:1px solid #1a1a1a;font-size:13px;text-align:right;font-weight:600;color:#f0f0f0">+$499</td></tr>`
    : '';

  // ── INTERNAL EMAIL (to Parth) ─────────────────────────────────────
  const internalHtml = `<div style="font-family:monospace;max-width:640px;margin:0 auto;background:#0d0d0d;color:#f0f0f0;border:1px solid #222">
  <div style="background:#080808;padding:26px 32px;border-bottom:2px solid #f0f0f0">
    <div style="font-size:9px;letter-spacing:0.22em;color:#555;margin-bottom:5px">// NEW_LEAD · benchbrex.co · ${new Date().toLocaleString('en-GB',{timeZone:'UTC'})} UTC</div>
    <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em">BENCHBREX LLC — New Lead</div>
  </div>
  ${hasQuote ? `<div style="background:#111;padding:22px 32px;border-bottom:1px solid #222">
    <div style="font-size:9px;letter-spacing:0.2em;color:#666;margin-bottom:12px">// PRICING_QUOTE</div>
    <table style="width:100%;border-collapse:collapse">${quoteRows}${expressRow}
      <tr><td style="padding:12px 0 0;font-size:10px;color:#888">FIXED TOTAL (WY · 0% tax)</td><td style="padding:12px 0 0;font-size:24px;font-weight:700;text-align:right;color:#fff">${d.quote_total}</td></tr>
    </table>
  </div>` : ''}
  <div style="padding:22px 32px;border-bottom:1px solid #222">
    <div style="font-size:9px;letter-spacing:0.2em;color:#666;margin-bottom:12px">// CONTACT</div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666;width:36%">NAME</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px">${d.first_name} ${d.last_name}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666">EMAIL</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px"><a href="mailto:${d.email}" style="color:#f0f0f0">${d.email}</a></td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666">COMPANY</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px">${d.company}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666">JOB TITLE</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px">${d.job_title || '—'}</td></tr>
      <tr><td style="padding:6px 0;font-size:10px;color:#666">COMPANY SIZE</td><td style="padding:6px 0;font-size:13px">${d.company_size}</td></tr>
    </table>
  </div>
  <div style="padding:22px 32px;border-bottom:1px solid #222">
    <div style="font-size:9px;letter-spacing:0.2em;color:#666;margin-bottom:12px">// PROJECT</div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666;width:36%">SERVICE</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px;font-weight:700;color:#fff">${d.service}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666">JURISDICTION</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px">${d.jurisdiction}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666">TIMELINE</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px">${d.timeline}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666">BUDGET</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px;font-weight:700;color:#fff">${d.budget}</td></tr>
      <tr><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:10px;color:#666">NDA</td><td style="padding:6px 0;border-bottom:1px solid #1a1a1a;font-size:13px">${d.nda_required ? '✓ Yes' : 'No'}</td></tr>
      <tr><td style="padding:6px 0;font-size:10px;color:#666">SOURCE</td><td style="padding:6px 0;font-size:13px">${d.source}</td></tr>
    </table>
  </div>
  ${d.notes ? `<div style="padding:22px 32px;border-bottom:1px solid #222"><div style="font-size:9px;letter-spacing:0.2em;color:#666;margin-bottom:8px">// NOTES</div><div style="font-size:13px;color:#ccc;line-height:1.8">${d.notes}</div></div>` : ''}
  <div style="padding:22px 32px;text-align:center">
    <a href="mailto:${d.email}?subject=Re: Your Benchbrex Compliance Consultation&body=Hi ${d.first_name}," style="display:inline-block;background:#f0f0f0;color:#080808;font-family:monospace;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:12px 28px;text-decoration:none">REPLY TO ${d.first_name.toUpperCase()} →</a>
  </div>
  <div style="padding:14px 32px;border-top:1px solid #1a1a1a;font-size:10px;color:#444;text-align:center">benchbrex.co · contact@benchbrex.co</div>
</div>`;

  // ── CLIENT EMAIL (to customer) ────────────────────────────────────
  const clientHtml = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;color:#0a0a0a">
  <div style="background:#0a0a0a;padding:36px 40px">
    <div style="font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.12em;color:#ffffff;text-transform:uppercase">BENCHBREX LLC</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;letter-spacing:0.06em">Compliance Intelligence · benchbrex.co</div>
  </div>
  <div style="padding:40px 40px 32px;border-bottom:1px solid #f0f0f0">
    <div style="font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#0a0a0a;line-height:1.2;margin-bottom:16px">Thank you, ${d.first_name}.<br>We've received your request.</div>
    <p style="font-size:15px;color:#444;line-height:1.8;margin:0">A member of our compliance team will reach out within <strong style="color:#0a0a0a">2 business hours</strong> to confirm your consultation and walk you through next steps.</p>
  </div>
  <div style="padding:32px 40px;border-bottom:1px solid #f0f0f0;background:#fafafa">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#888;margin-bottom:20px">Your Request Summary</div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:12px;color:#888;width:40%">Name</td><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:14px;font-weight:600;color:#0a0a0a">${d.first_name} ${d.last_name}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:12px;color:#888">Company</td><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:14px;color:#0a0a0a">${d.company}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:12px;color:#888">Service Requested</td><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:14px;font-weight:600;color:#0a0a0a">${d.service}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:12px;color:#888">Jurisdiction</td><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:14px;color:#0a0a0a">${d.jurisdiction}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:12px;color:#888">Timeline</td><td style="padding:8px 0;border-bottom:1px solid #efefef;font-size:14px;color:#0a0a0a">${d.timeline}</td></tr>
      <tr><td style="padding:8px 0;font-size:12px;color:#888">Budget</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#0a0a0a">${d.budget}</td></tr>
    </table>
    ${hasQuote ? `<div style="margin-top:24px;padding:20px;background:#0a0a0a">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:14px">Your Fixed Price Quote</div>
      ${d.quote_services.map(s=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;color:rgba(255,255,255,0.8)"><span>${s.name}</span><span style="font-weight:600;color:#fff">${s.range}</span></div>`).join('')}
      ${d.quote_express ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;color:rgba(255,255,255,0.8)"><span>Express 48-hour delivery</span><span style="font-weight:600;color:#fff">+$499</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:14px 0 4px;border-top:1px solid rgba(255,255,255,0.1);margin-top:6px">
        <span style="font-size:10px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;align-self:flex-end">Fixed Total (Wyoming LLC · 0% tax)</span>
        <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em">${d.quote_total}</span>
      </div>
    </div>` : ''}
  </div>
  <div style="padding:32px 40px;border-bottom:1px solid #f0f0f0">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#888;margin-bottom:20px">What Happens Next</div>
    <div style="display:flex;gap:16px;margin-bottom:16px;align-items:flex-start">
      <div style="width:28px;height:28px;min-width:28px;background:#0a0a0a;color:#fff;font-family:monospace;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center">01</div>
      <div><div style="font-size:14px;font-weight:600;margin-bottom:3px">Consultation confirmed</div><div style="font-size:13px;color:#666;line-height:1.6">You'll receive a calendar invite within 2 hours for your free 30-minute consultation.</div></div>
    </div>
    <div style="display:flex;gap:16px;margin-bottom:16px;align-items:flex-start">
      <div style="width:28px;height:28px;min-width:28px;background:#0a0a0a;color:#fff;font-family:monospace;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center">02</div>
      <div><div style="font-size:14px;font-weight:600;margin-bottom:3px">Intake form sent</div><div style="font-size:13px;color:#666;line-height:1.6">A 10-minute intake form to gather the details needed to begin your report.</div></div>
    </div>
    <div style="display:flex;gap:16px;align-items:flex-start">
      <div style="width:28px;height:28px;min-width:28px;background:#0a0a0a;color:#fff;font-family:monospace;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center">03</div>
      <div><div style="font-size:14px;font-weight:600;margin-bottom:3px">Report delivered in 48 hours</div><div style="font-size:13px;color:#666;line-height:1.6">Your branded PDF — AI-researched, expert-reviewed — guaranteed to your inbox.</div></div>
    </div>
  </div>
  <div style="padding:24px 40px;background:#f8f8f8;border-bottom:1px solid #f0f0f0">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:6px 16px 6px 0;font-size:12px;color:#0a0a0a;width:50%"><strong>✓ On-time delivery</strong><br><span style="color:#888">or 20% discount — guaranteed</span></td>
        <td style="padding:6px 0;font-size:12px;color:#0a0a0a"><strong>✓ 100% satisfaction</strong><br><span style="color:#888">guaranteed on every report</span></td>
      </tr>
      <tr>
        <td style="padding:6px 16px 6px 0;font-size:12px;color:#0a0a0a"><strong>✓ Mutual NDA</strong><br><span style="color:#888">available on request</span></td>
        <td style="padding:6px 0;font-size:12px;color:#0a0a0a"><strong>✓ Free 30-min call</strong><br><span style="color:#888">included with every project</span></td>
      </tr>
    </table>
  </div>
  <div style="padding:28px 40px;text-align:center;border-bottom:1px solid #f0f0f0">
    <p style="font-size:14px;color:#666;margin:0 0 16px">Questions? Reply to this email or contact us directly:</p>
    <a href="mailto:contact@benchbrex.co" style="font-size:14px;font-weight:600;color:#0a0a0a;text-decoration:none">contact@benchbrex.co</a>
    <span style="margin:0 12px;color:#ddd">·</span>
    <a href="https://benchbrex.co" style="font-size:14px;color:#666;text-decoration:none">benchbrex.co</a>
  </div>
  <div style="padding:20px 40px;text-align:center">
    <div style="font-size:11px;color:#bbb;line-height:1.7">Benchbrex LLC · Wyoming, USA · Est. 2025<br>This email confirms receipt of your request. Reports are informational and do not constitute legal advice.</div>
  </div>
</div>`;

  // ── Send both emails — BOTH fully awaited ─────────────────────────
  try {
    // 1. Internal notification to Parth
    const internalRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_ADDR,
        to: [INTERNAL_TO],
        reply_to: d.email,
        subject: `🔔 New Lead: ${d.first_name} ${d.last_name} — ${d.company} | ${hasQuote ? d.quote_total : d.budget}`,
        html: internalHtml,
      }),
    });
    const internalData = await internalRes.json();
    if (!internalRes.ok) throw new Error('Internal email failed: ' + JSON.stringify(internalData));

    // 2. Client confirmation — fully awaited (was fire-and-forget before — THIS was the bug)
    const clientRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_ADDR,
        to: [d.email],
        reply_to: REPLY_TO,
        subject: `We've received your request, ${d.first_name} — Benchbrex`,
        html: clientHtml,
      }),
    });
    const clientData = await clientRes.json();
    if (!clientRes.ok) {
      console.error('Client email failed:', JSON.stringify(clientData));
      // Still return success — internal email worked, lead is saved
      return res.status(200).json({ success: true, warning: 'Client email failed: ' + clientData.message });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
