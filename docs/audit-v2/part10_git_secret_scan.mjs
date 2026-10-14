import { execSync } from 'child_process';
import fs from 'fs';

try {
  const diffs = execSync('git log -p -n 50', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  const keyMatches = diffs.match(/(?:AIza[0-9A-Za-z-_]{35}|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36})/g) || [];
  fs.writeFileSync('docs/audit-v2/test-logs/git_secret_matches.json', JSON.stringify({
    gitHistoryMatchesCount: keyMatches.length,
    matches: keyMatches
  }, null, 2));
  console.log('Secret scan completed. Found:', keyMatches.length);
} catch (err) {
  console.error('Error scanning git history:', err.message);
}
