import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "offline-game",
      closeBundle() {
        const files = readdirSync("dist/assets").map((f) => "/assets/" + f);
        const version = createHash("sha256")
          .update(files.join(","))
          .digest("hex")
          .slice(0, 12);
        writeFileSync(
          "dist/sw.js",
          `const CACHE='space-v2-${version}';const FILES=['/','/index.html',${files.map((f) => JSON.stringify(f)).join(",")}];self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('space-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request,{ignoreVary:true}).then(r=>r||(e.request.mode==='navigate'?caches.match('/index.html',{ignoreVary:true}):Response.error()))))});`,
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
});
