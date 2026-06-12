const CACHE = "ensei-navi-v15";
const ASSETS = ["./", "./index.html", "./styles.css", "./app.js", "./data.js", "./native.js", "./manifest.json", "./icon.svg"];

self.addEventListener("install", e => {
  // cache:"reload" でブラウザHTTPキャッシュを無視し、必ずネットワークから最新を取得する
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(ASSETS.map(u => new Request(u, { cache: "reload" })))
  ));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// アプリ本体はキャッシュ優先（オフライン対応）、為替APIはネットワークのみ
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
