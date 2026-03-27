// NGP Server - Mini service
const { spawn } = require('child_process');
const path = require('path');

function startServer() {
    console.log('[NGP] Starting server...');
    
    const server = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000'], {
        cwd: '/home/z/my-project',
        stdio: 'inherit',
        shell: true
    });
    
    server.on('exit', (code) => {
        console.log(`[NGP] Server exited with code ${code}`);
        setTimeout(startServer, 3000);
    });
    
    server.on('error', (err) => {
        console.error('[NGP] Server error:', err);
        setTimeout(startServer, 3000);
    });
}

startServer();
