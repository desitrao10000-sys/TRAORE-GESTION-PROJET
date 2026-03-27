import { spawn } from 'child_process';

const PROJECT_PATH = '/home/z/my-project';

console.log('Starting persistent NGP server...');

function startServer() {
  const server = spawn('bun', ['run', 'dev'], {
    cwd: PROJECT_PATH,
    stdio: 'inherit',
    shell: true
  });

  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}, restarting in 2 seconds...`);
    setTimeout(startServer, 2000);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    setTimeout(startServer, 2000);
  });
}

startServer();
