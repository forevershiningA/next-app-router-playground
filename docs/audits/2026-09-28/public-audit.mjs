import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseHTML } from 'linkedom';

const out = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1'));
const base = 'https://forevershining.org';
const save = (name, data) => fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2));
function fetchPublic(url) {
  const raw = execFileSync('curl.exe', ['-sS', '--compressed', '--max-time', '30', '-D', '-', '-w', '\nAUDIT_TIMING:%{http_code}|%{time_starttransfer}|%{time_total}', url], { encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });
  const split = raw.indexOf('\r\n\r\n');
  const headers = raw.slice(0, split);
  const body = raw.slice(split + 4).split('\nAUDIT_TIMING:')[0];
  const timing = raw.split('\nAUDIT_TIMING:').at(-1).split('|');
  return { status: Number(timing[0]), ttfbSeconds: Number(timing[1]), totalSeconds: Number(timing[2]), headers, body };
}
function csv(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const parse = line => [...line.matchAll(/(?:^|,)(?:"((?:[^"]|"")*)"|([^,]*))/g)].map(m => (m[1] ?? m[2]).replaceAll('""', '"'));
  const keys = parse(lines.shift());
  return lines.map(line => Object.fromEntries(parse(line).map((v, i) => [keys[i], v])));
}

if (process.argv.includes('--browser')) {
  const { chromium, devices } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const targets = ['/', '/designs', '/designs/bronze-plaque', '/memorials/plaques', '/products/bronze-plaque'];
  for (const device of ['mobile', 'desktop']) {
    for (const pathname of targets) {
      const context = await browser.newContext(device === 'mobile' ? devices['Pixel 7'] : { viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      const errors = [], failed = [], httpErrors = [];
      page.on('pageerror', e => errors.push(e.message));
      page.on('requestfailed', r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
      page.on('response', r => { if (r.status() >= 400) httpErrors.push({ url: r.url(), status: r.status() }); });
      await page.addInitScript(() => {
        window.__audit = { lcp: null, shifts: [], longTasks: [] };
        new PerformanceObserver(list => { for (const e of list.getEntries()) window.__audit.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__audit.shifts.push({ time: e.startTime, value: e.value }); }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(list => { for (const e of list.getEntries()) window.__audit.longTasks.push(e.duration); }).observe({ type: 'longtask', buffered: true });
      });
      try {
        const response = await page.goto(base + pathname, { waitUntil: 'load', timeout: 45000 });
        // Fixed observation window for comparable lab samples; no interaction / writes.
        await page.waitForTimeout(5000);
        const metrics = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource');
          let cls = 0, windowScore = 0, windowStart = 0, previous = 0;
          for (const shift of window.__audit.shifts) {
            if (shift.time - previous > 1000 || shift.time - windowStart > 5000) { windowScore = 0; windowStart = shift.time; }
            windowScore += shift.value; previous = shift.time; cls = Math.max(cls, windowScore);
          }
          return {
            title: document.title, h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
            width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
            ttfbMs: nav.responseStart - nav.startTime, dclMs: nav.domContentLoadedEventEnd,
            lcpMs: window.__audit.lcp, cls,
            longTaskCount: window.__audit.longTasks.length,
            blockingTimeProxyMs: window.__audit.longTasks.reduce((s, d) => s + Math.max(0, d - 50), 0),
            jsTransferBytes: resources.filter(e => e.initiatorType === 'script').reduce((s, e) => s + e.transferSize, 0),
            totalResourceTransferBytes: resources.reduce((s, e) => s + e.transferSize, 0),
            resources: resources.map(e => ({ url: e.name, type: e.initiatorType, transfer: e.transferSize, duration: e.duration })),
            missingImageAlt: document.querySelectorAll('img:not([alt])').length,
            brokenImages: [...document.images].filter(e => e.complete && e.naturalWidth === 0).map(e => e.currentSrc),
          };
        });
        const name = `${device}-${pathname === '/' ? 'home' : pathname.slice(1).replaceAll('/', '-')}.png`;
        await page.screenshot({ path: path.join(out, name), fullPage: true });
        results.push({ device, pathname, status: response.status(), finalUrl: page.url(), ...metrics, errors, failed, httpErrors });
        console.log(device, pathname, JSON.stringify({ lcp: metrics.lcpMs, cls: metrics.cls, js: metrics.jsTransferBytes, errors: errors.length }));
      } catch (error) { results.push({ device, pathname, error: String(error), errors, failed, httpErrors }); }
      await context.close();
      save('browser-results.json', results);
    }
  }
  await browser.close();
} else if (process.argv.includes('--followup')) {
  const urls = [
    '/products/bronze-plaque/dedication', '/products/bronze-plaque/memorial',
    '/products/bronze-plaque/achievement', '/products/bronze-plaque/honor',
    '/products/bronze-plaque/dedication/the-science-hall/knowledge-is-the-seed-of-progress',
    '/products/audit-invalid-product/audit-invalid-type/the-science-hall/knowledge-is-the-seed-of-progress',
    '/designs/bronze-plaque/nonexistent-audit-category',
    '/designs/audit-invalid-product/audit-invalid-category/serpentine-the-lord-is-my-shepherd-headstone',
    '/designs/bronze-plaque/nurse-memorial',
  ];
  const results = [];
  for (const pathname of urls) {
    try {
      const r = fetchPublic(base + pathname);
      const { document } = parseHTML(r.body);
      results.push({ pathname, status: r.status, headers: r.headers,
        title: document.querySelector('title')?.textContent,
        robots: [...document.querySelectorAll('meta[name="robots"]')].map(e => e.getAttribute('content')),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
        schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent)),
        hasPlaceholderDomain: r.body.includes('https://yourdomain.com'),
        hasNextRedirect: r.body.includes('NEXT_REDIRECT'),
      });
      console.log(r.status, pathname);
    } catch (error) { results.push({ pathname, error: String(error) }); }
    save('followup-http.json', results);
  }
} else {
  const chart = csv('gsc/Wykres.csv');
  const pages = csv('gsc/Strony.csv');
  const queries = csv('gsc/Zapytania.csv');
  const sum = (rows, key) => rows.reduce((s, row) => s + Number(row[key]), 0);
  save('gsc-summary.json', {
    period: [chart[0].Data, chart.at(-1).Data], clicks: sum(chart, 'Kliknięcia'), impressions: sum(chart, 'Wyświetlenia'),
    pageRows: pages.length, queryRows: queries.length,
    wwwPages: pages.filter(row => Object.values(row)[0].includes('://www.')),
    topPages: pages.slice(0, 20), topQueries: queries.slice(0, 30),
    opportunities: queries.filter(r => Number(r.Pozycja) >= 5 && Number(r.Pozycja) <= 20).sort((a,b) => Number(b['Wyświetlenia']) - Number(a['Wyświetlenia'])).slice(0, 20),
    devices: csv('gsc/Urządzenia.csv'), countries: csv('gsc/Kraje.csv').slice(0, 10),
  });
  const robots = fetchPublic(base + '/robots.txt');
  fs.writeFileSync(path.join(out, 'robots.txt'), robots.body);
  const sitemap = fetchPublic(base + '/sitemap.xml');
  fs.writeFileSync(path.join(out, 'sitemap.xml'), sitemap.body);
  const entries = [...sitemap.body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => ({
    url: m[1].match(/<loc>(.*?)<\/loc>/)?.[1], lastmod: m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
  }));
  const duplicateUrls = entries.filter((e, i) => entries.findIndex(other => other.url === e.url) !== i);
  save('sitemap-summary.json', { status: sitemap.status, bytes: Buffer.byteLength(sitemap.body), total: entries.length, duplicateUrls, futureDates: entries.filter(e => new Date(e.lastmod) > new Date()), fixedLaunchDateCount: entries.filter(e => e.lastmod?.startsWith('2026-02-13')).length, groups: Object.fromEntries([...new Set(entries.map(e => new URL(e.url).pathname.split('/')[1]))].map(k => [k || 'home', entries.filter(e => new URL(e.url).pathname.split('/')[1] === k).length])) });
  const sampled = [base, base + '/designs', base + '/designs?q=butterfly', base + '/designs?page=2', base + '/seo', base + '/select-size', base + '/products', base + '/products/bronze-plaque', base + '/memorials/plaques', base + '/designs/guide/buying-guide', base + '/audit-not-found-20260928', 'https://www.forevershining.org/', 'http://forevershining.org/', base + '/login', base + '/privacy', ...pages.slice(0, 16).map(r => Object.values(r)[0]), ...entries.filter(e => new URL(e.url).pathname.split('/').length === 5).slice(0, 3).map(e => e.url)];
  const results = [];
  const queue = [...new Set(sampled)];
  for (let i = 0; i < queue.length && i < 55; i++) {
    const url = queue[i];
    try {
      const response = fetchPublic(url);
      const { document } = parseHTML(response.body);
      const get = selector => document.querySelector(selector)?.getAttribute('content') ?? null;
      const links = [...document.querySelectorAll('a[href]')].map(e => e.getAttribute('href'));
      const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => { try { return JSON.parse(e.textContent); } catch { return { invalidJson: true }; } });
      results.push({ url, status: response.status, ttfbSeconds: response.ttfbSeconds, totalSeconds: response.totalSeconds, headers: response.headers,
        htmlBytes: Buffer.byteLength(response.body), title: document.querySelector('title')?.textContent,
        description: get('meta[name="description"]'), robots: get('meta[name="robots"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        h1: [...document.querySelectorAll('h1')].map(e => e.textContent),
        hreflangs: [...document.querySelectorAll('link[hreflang]')].map(e => ({ lang: e.getAttribute('hreflang'), href: e.getAttribute('href') })),
        ogImage: get('meta[property="og:image"]'), schemas, links,
        missingImageAlt: document.querySelectorAll('img:not([alt])').length,
      });
      if (url === base + '/products/bronze-plaque') {
        const template = links.find(l => l.startsWith('/products/bronze-plaque/dedication/'));
        if (template) { queue.push(base + template); queue.push(base + template.replace('/bronze-plaque/dedication/', '/audit-invalid-product/audit-invalid-type/')); }
      }
      console.log(response.status, url);
    } catch (error) { results.push({ url, error: String(error) }); }
    save('http-results.json', results);
  }
}
