import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const MAIN_PROJECT_PATH = '/home/z/my-project';
const MAIN_PORT = 3000;
const CHECK_INTERVAL = 5000; // Check every 5 seconds

let mainServerProcess: any = null;

async function isServerRunning(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}`);
    const code = stdout.trim();
    return code === '200' || code === '304';
  } catch {
    return false;
  }
}

async function startMainServer(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Starting Next.js server...`);
  
  mainServerProcess = spawn('npm', ['run', 'dev'], {
    cwd: MAIN_PROJECT_PATH,
    detached: true,
    stdio: 'ignore',
    shell: true
  });
  
  mainServerProcess.unref();
  
  // Wait for server to start
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(r => setTimeout(r, 1000));
    if (await isServerRunning(MAIN_PORT)) {
      console.log(`[${new Date().toISOString()}] ✅ Next.js server is running on port ${MAIN_PORT}`);
      return;
    }
    attempts++;
  }
  
  console.log(`[${new Date().toISOString()}] ⚠️ Server may not have started properly`);
}

async function checkAndRestart(): Promise<void> {
  const running = await isServerRunning(MAIN_PORT);
  
  if (!running) {
    console.log(`[${new Date().toISOString()}] ⚠️ Server not responding, restarting...`);
    await startMainServer();
  }
}

async function main(): Promise<void> {
  console.log('========================================');
  console.log('  NGP Keep-Alive Service Started');
  console.log('========================================');
  console.log(`Main server port: ${MAIN_PORT}`);
  console.log(`Check interval: ${CHECK_INTERVAL}ms`);
  console.log('');
  
  // Initial start
  await startMainServer();
  
  // Periodic check
  setInterval(async () => {
    await checkAndRestart();
  }, CHECK_INTERVAL);
  
  console.log('Keep-alive service running. Press Ctrl+C to stop.');
}

main().catch(console.error);
