// SolVox service worker: makes the app work offline.
// Bump CACHE whenever you change any file so phones pick up the update.
const CACHE='solvox-v3';
const FILES=['./','./index.html','./css/styles.css','./css/looks.css','./js/app.js','./img/bud-left.webp','./img/bud-right.webp','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// cache first, refresh in the background (stale-while-revalidate)
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>hit||caches.match('./index.html'));
    return hit||net;
  }));
});
