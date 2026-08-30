import { createHash } from 'node:crypto';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const outputDirectory = resolve(process.cwd(), 'dist');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

const files = walk(outputDirectory)
  .map((absolute) => relative(outputDirectory, absolute).split(sep).join('/'))
  .filter((file) => file !== 'sw.js' && !file.endsWith('.map'))
  .sort();

const urls = new Set(['/']);
for (const file of files) {
  urls.add(`/${file}`);
  if (file === 'index.html') urls.add('/');
  else if (file.endsWith('.html')) urls.add(`/${file.slice(0, -5)}`);
}

const fingerprint = createHash('sha256')
  .update(files.map((file) => `${file}:${statSync(resolve(outputDirectory, file)).size}`).join('|'))
  .digest('hex')
  .slice(0, 12);

const serviceWorker = `const CACHE_NAME = 'ruleswitch-${fingerprint}';
const PRECACHE_URLS = ${JSON.stringify([...urls], null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok && new URL(event.request.url).origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => event.request.mode === 'navigate' ? caches.match('/') : Response.error());
    })
  );
});
`;

writeFileSync(resolve(outputDirectory, 'sw.js'), serviceWorker);
console.log(`PWA cache finalized with ${urls.size} offline URLs (${fingerprint}).`);
