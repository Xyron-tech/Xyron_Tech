const CACHE_NAME="xyron-offline-v1";
const OFFLINE_URL="/offline.html";

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await cache.addAll([OFFLINE_URL,"/logo.webp"]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname==="/logo.webp"){
    event.respondWith(caches.match(request).then(cached=>cached||fetch(request)));
    return;
  }
  if(request.mode!=="navigate")return;
  event.respondWith(fetch(new Request(request,{cache:"no-store"})).catch(async()=>{
    const cache=await caches.open(CACHE_NAME);
    const offlinePage=await cache.match(OFFLINE_URL);
    if(offlinePage)return offlinePage;
    throw new Error("Offline fallback is missing from the cache.");
  }));
});
