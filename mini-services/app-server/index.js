// Serveur persistant pour NGP
const { spawn } = require('child_process');
const path = require('path');

function startServer() {
  console.log('[NGP] Starting server...');
  
  const server = spawn('bun', ['run', 'dev'], {
    cwd: '/home/z/my-project',
    stdio: 'inherit',
    detached: true
  });
  
  server.on('exit', (code) => {
    console.log(`[NGP] Server exited with code ${code}, restarting...`);
    setTimeout(startServer, 2000);
  });
  
  server.on('error', (err) => {
    console.error('[NGP] Server error:', err);
    setTimeout(startServer, 2000);
  });
}

startServer();
