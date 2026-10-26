// 四级单词小窝 · 离线缓存
// 更新了任何文件后，把下面的版本号改成新的（随便改几个字符即可），学生下次联网打开就会自动更新。
const VERSION = "v-9c0571f5";
const CACHE = "cet4-nest-" + VERSION;
const FILES = ["./", "index.html", "manifest.webmanifest", "cet4.json", "dict.json", "articles.json", "scenes.json", "translations.json", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png"];
// 拍照识别引擎（约 7MB）：尽量一起缓存，失败也不影响其他功能；第一次联网识别时也会自动缓存
const OCR_FILES = ["ocr/tesseract.min.js", "ocr/worker.min.js", "ocr/tesseract-core-simd-lstm.wasm.js", "ocr/lang/eng.traineddata.gz"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(FILES.map(f => new Request(f, {cache: "reload"})));
    await Promise.allSettled(OCR_FILES.map(f => c.add(new Request(f, {cache: "reload"}))));
  }).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("cet4-nest-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, {ignoreSearch: true}).then(hit => hit ||
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => req.mode === "navigate" ? caches.match("index.html") : Response.error())
    )
  );
});
