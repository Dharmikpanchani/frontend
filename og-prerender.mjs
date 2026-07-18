/**
 * og-prerender.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight Open-Graph prerender service for the Vite/React admin SPA.
 *
 * How it works:
 *  1. Nginx detects social-media / WhatsApp bot user-agents.
 *  2. Bot requests are proxied to this service (port 3035) instead of the
 *     static dist/ folder.
 *  3. This service extracts the school code from the Host header
 *     (e.g.  "gvms.admin.vidyasetudemo.in"  → schoolCode = "gvms").
 *  4. It fetches school name + logo from the backend API.
 *  5. It returns a minimal HTML page with correct <meta og:…> tags so that
 *     WhatsApp / Telegram / Facebook / Twitter show a rich preview.
 *  6. The preview HTML also does an instant JS redirect to the real SPA so
 *     that any human who opens the link still lands on the full admin portal.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import http from 'http';

// ── Config ───────────────────────────────────────────────────────────────────
const PORT          = 3035;
const API_BASE      = 'https://api.vidyasetudemo.in/v1';
const IMAGE_BASE    = 'https://api.vidyasetudemo.in/images';
const ADMIN_DOMAIN  = '.admin.vidyasetudemo.in';
// Fallback: platform logo served from the user portal (Next.js /public folder)
const FALLBACK_LOGO = 'https://vidyasetudemo.in/logo-img.png';

// ── Fetch school data from backend ───────────────────────────────────────────
async function fetchSchool(schoolCode) {
  const url = `${API_BASE}/user/get-school-image`;
  try {
    const res = await fetch(url, {
      method : 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body   : `schoolCode=${encodeURIComponent(schoolCode)}`,
      signal : AbortSignal.timeout(5000), // 5-second timeout
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// ── Build OG HTML ─────────────────────────────────────────────────────────────
function buildHtml({ schoolName, ogImage, pageUrl, description }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escHtml(schoolName)} — Admin Portal</title>
  <meta name="description" content="${escHtml(description)}"/>

  <!-- Open Graph -->
  <meta property="og:type"        content="website"/>
  <meta property="og:url"         content="${escHtml(pageUrl)}"/>
  <meta property="og:title"       content="${escHtml(schoolName)} — Admin Portal"/>
  <meta property="og:description" content="${escHtml(description)}"/>
  <meta property="og:image"       content="${escHtml(ogImage)}"/>
  <meta property="og:image:width" content="512"/>
  <meta property="og:image:height"content="512"/>
  <meta property="og:site_name"   content="${escHtml(schoolName)}"/>

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary"/>
  <meta name="twitter:title"       content="${escHtml(schoolName)} — Admin Portal"/>
  <meta name="twitter:description" content="${escHtml(description)}"/>
  <meta name="twitter:image"       content="${escHtml(ogImage)}"/>

  <!-- Instantly redirect real humans to the SPA -->
  <script>window.location.replace("${escHtml(pageUrl)}");</script>
</head>
<body>
  <p>Redirecting to <a href="${escHtml(pageUrl)}">${escHtml(schoolName)} Admin Portal</a>…</p>
</body>
</html>`;
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  try {
    // Extract host without port
    const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];

    // Derive school code from subdomain: "gvms.admin.vidyasetudemo.in" → "gvms"
    let schoolCode = '';
    if (host.endsWith(ADMIN_DOMAIN)) {
      schoolCode = host.slice(0, host.length - ADMIN_DOMAIN.length).toLowerCase();
    }

    const pageUrl = `https://${host}`;

    if (!schoolCode) {
      // Bare admin.vidyasetudemo.in — no school, return generic OG
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(buildHtml({
        schoolName : 'Vidyasetu Admin',
        ogImage    : FALLBACK_LOGO,
        pageUrl,
        description: 'Manage your school with ease using Vidyasetu.',
      }));
      return;
    }

    // Fetch school data
    const school = await fetchSchool(schoolCode);
    const schoolName  = school?.schoolName  || `${schoolCode.toUpperCase()} School`;
    const logoPath    = school?.logo || school?.banner || '';
    const ogImage     = logoPath ? `${IMAGE_BASE}/${logoPath}` : FALLBACK_LOGO;
    const description = `${schoolName} admin portal — manage students, teachers, fees and more.`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(buildHtml({ schoolName, ogImage, pageUrl, description }));

  } catch (err) {
    console.error('[og-prerender] Error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[og-prerender] Listening on http://127.0.0.1:${PORT}`);
});
