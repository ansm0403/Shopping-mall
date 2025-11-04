const { spawn } = require('child_process');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

let serverProcess = null;
let restartTimer = null;
const serverFile = path.join(__dirname, 'dist', 'main.js');
const DEBOUNCE_DELAY = 5000; // 2초 대기

function startServer() {
  // 이전 프로세스가 있으면 종료
  if (serverProcess) {
    console.log('Restarting server...');
    serverProcess.kill();
    serverProcess = null;
  }

  // 파일이 존재하는지 확인
  if (!fs.existsSync(serverFile)) {
    console.log('Waiting for build...');
    return;
  }

  console.log('Starting server...');
  serverProcess = spawn('node', [serverFile], {
    stdio: 'inherit',
    cwd: __dirname
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
  });
}

function scheduleRestart() {
  // 기존 타이머가 있으면 취소
  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  // 2초 후에 재시작하도록 예약
  restartTimer = setTimeout(() => {
    console.log('File changed, restarting...');
    startServer();
    restartTimer = null;
  }, DEBOUNCE_DELAY);
}

// 파일 감시 시작
const watcher = chokidar.watch(serverFile, {
  persistent: true,
  ignoreInitial: false,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100
  }
});

watcher.on('ready', () => {
  console.log('Watching for file changes...');
  startServer();
});

watcher.on('change', () => {
  console.log('File change detected, waiting for stabilization...');
  scheduleRestart();
});

watcher.on('add', () => {
  if (!serverProcess) {
    startServer();
  }
});

// 종료 처리
process.on('SIGINT', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  watcher.close();
  process.exit();
});

