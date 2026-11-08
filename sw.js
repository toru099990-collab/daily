// ふたりの旅アルバム：オフラインでも開けるようにアプリ本体を保存しておく
// 更新したときは VERSION を変えると、新しい版に切り替わります
const VERSION="v20";
const CACHE="tabi-album-"+VERSION;
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  // アプリ本体：まずネットから最新を取り、つながらないときは保存したものを使う
  if(url.origin===location.origin){
    // 更新がすぐ反映されるよう、ブラウザの一時保存を使わずにGitHubへ確認する
    e.respondWith(fetch(req,{cache:"no-cache"}).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));return r;}).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html"))));
    return;
  }
  // 文字のフォント：一度読んだら保存しておく
  if(/fonts\.(googleapis|gstatic)\.com/.test(url.host)){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));return res;})));
  }
});
