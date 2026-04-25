/* ----- Fade-in observer ----- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

/* ----- Hero terminal animation -----
   Subtil "scanner" der løber i baggrunden bag heroen.
   Vi typer linjer ind, holder en pause og starter forfra.
*/
(function runTerminal() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const SCRIPT = [
    { t: 'prompt', text: 'usec ~ $ ', cmd: 'nmap -sV -sC -p- --script vuln client-website.dk' },
    { t: 'mute',   text: 'Starting Nmap 7.94 ( https://nmap.org )' },
    { t: 'mute',   text: 'Nmap scan report for client-website.dk (185.45.12.7)' },
    { t: 'mute',   text: 'Host is up (0.018s latency).' },
    { t: 'blank' },
    { t: 'mute',   text: 'PORT      STATE  SERVICE   VERSION' },
    { t: 'mute',   text: '22/tcp    open   ssh       OpenSSH 7.6p1 (protocol 2.0)' },
    { t: 'mute',   text: '80/tcp    open   http      nginx 1.18.0' },
    { t: 'mute',   text: '443/tcp   open   ssl/http  nginx 1.18.0 (WordPress 6.2.1)' },
    { t: 'mute',   text: '3306/tcp  open   mysql     MySQL 5.7.32' },
    { t: 'blank' },
    { t: 'mute',   text: '| http-enum:' },
    { t: 'warn',   text: '|   /wp-admin/: Admin login page (no rate limiting)' },
    { t: 'mute',   text: '|   /wp-content/plugins/contact-form-7/' },
    { t: 'crit',   text: '|_  /backup.sql: Possible database dump exposed' },
    { t: 'blank' },
    { t: 'mute',   text: '| vulners:' },
    { t: 'crit',   text: '|   CVE-2023-2745  9.1  WordPress core path traversal' },
    { t: 'warn',   text: '|   CVE-2023-1234  6.5  contact-form-7 < 5.7.1' },
    { t: 'warn',   text: '|_  CVE-2022-9999  5.4  Missing security headers' },
    { t: 'blank' },
    { t: 'ok',     text: 'Nmap done: 1 IP address scanned in 42.18 seconds' },
    { t: 'prompt', text: 'usec ~ $ ', cmd: 'usec report --format pdf --priority high' },
    { t: 'ok',     text: '✓ remediation report generated · sent to client' },
  ];

  const TYPE_SPEED = 14;     // ms per char during typing
  const LINE_PAUSE = 90;     // ms between lines (non-typed)
  const RESTART_PAUSE = 4200;

  function makeLine(entry) {
    const span = document.createElement('span');
    span.className = 'terminal-line';
    if (entry.t === 'blank') {
      span.innerHTML = '&nbsp;';
      return { el: span, typed: '' };
    }
    if (entry.t === 'prompt') {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'term-prompt';
      promptSpan.textContent = entry.text;
      const cmdSpan = document.createElement('span');
      cmdSpan.className = 'term-cmd';
      span.appendChild(promptSpan);
      span.appendChild(cmdSpan);
      return { el: span, typed: cmdSpan, fullText: entry.cmd };
    }
    const cls = {
      mute: 'term-mute',
      ok:   'term-ok',
      warn: 'term-warn',
      crit: 'term-crit',
    }[entry.t] || 'term-mute';
    span.className += ' ' + cls;
    span.textContent = entry.text;
    return { el: span, typed: '' };
  }

  const cursor = document.createElement('span');
  cursor.className = 'term-cursor';

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  async function typeInto(el, text) {
    for (let i = 0; i < text.length; i++) {
      el.textContent += text[i];
      await sleep(TYPE_SPEED + (Math.random() * 30 - 10));
    }
  }

  async function loop() {
    while (true) {
      body.innerHTML = '';
      body.appendChild(cursor);

      for (const entry of SCRIPT) {
        const { el, typed, fullText } = makeLine(entry);
        body.insertBefore(el, cursor);

        if (typed && fullText) {
          await typeInto(typed, fullText);
          await sleep(280);
        } else {
          await sleep(LINE_PAUSE);
        }
      }

      await sleep(RESTART_PAUSE);
    }
  }

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    body.innerHTML = '';
    SCRIPT.forEach((entry) => {
      const { el, typed, fullText } = makeLine(entry);
      if (typed && fullText) typed.textContent = fullText;
      body.appendChild(el);
    });
    return;
  }

  loop();
})();
