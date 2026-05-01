const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

try {
  execSync('rm -rf .next', { cwd: projectRoot, stdio: 'inherit' });
} catch {}

try {
  fs.mkdirSync(path.join(projectRoot, '.next'), { recursive: true });
} catch {}

try {
  execSync('next build', { cwd: projectRoot, stdio: 'inherit' });
} catch (err) {
  const exportDir = path.join(projectRoot, '.next', 'export');
  try {
    fs.rmSync(exportDir, { recursive: true, force: true });
    execSync('next build', { cwd: projectRoot, stdio: 'inherit' });
  } catch (err2) {
    process.exit(1);
  }
}
