// Simple keep-alive script to prevent Render free tier from sleeping
// Run this locally or use a cron service like cron-job.org

import https from 'https';

const BACKEND_URL = 'https://fashion-ecommerce-platform-ohou.onrender.com/api/health';

function pingBackend() {
  console.log(`[${new Date().toISOString()}] Pinging backend...`);
  
  https.get(BACKEND_URL, (res) => {
    console.log(`✅ Backend responded with status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`❌ Error pinging backend:`, err.message);
  });
}

// Ping immediately
pingBackend();

// Then ping every 10 minutes
setInterval(pingBackend, 10 * 60 * 1000);

console.log('Keep-alive service started. Backend will be pinged every 10 minutes.');
