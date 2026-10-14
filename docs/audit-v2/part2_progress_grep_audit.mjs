import { execSync } from 'child_process';
import fs from 'fs';

function runGrep(pattern, target = 'src/') {
  try {
    const res = execSync(`git grep -i -E "${pattern}" -- ${target}`, { encoding: 'utf-8' });
    return { count: res.trim().split('\n').filter(Boolean).length, output: res.trim() };
  } catch (err) {
    return { count: 0, output: '' };
  }
}

const targets = [
  { name: 'DocumentVault', pattern: 'DocumentVault' },
  { name: 'EmergencyPhraseCards', pattern: 'EmergencyPhraseCards' },
  { name: 'CarbonCalculator', pattern: 'CarbonCalculator' },
  { name: 'StatusBar', pattern: 'StatusBar' },
  { name: 'FloatingSOS', pattern: 'FloatingSOS' },
  { name: 'SmartAssistant', pattern: 'SmartAssistant' },
  { name: 'BookingModal', pattern: 'BookingModal' },
  { name: 'Medical/CPR/Ambulance dispatch', pattern: 'ambulance-dispatch|cpr-guide|medical-crisis' }
];

const results = {};
for (const t of targets) {
  results[t.name] = {
    src: runGrep(t.pattern, 'src/'),
    server: runGrep(t.pattern, 'server/'),
    prisma: runGrep(t.pattern, 'prisma/'),
    packageJson: runGrep(t.pattern, 'package.json')
  };
}

// Check package.json dependencies
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

fs.writeFileSync('docs/audit-v2/test-logs/part2_grep_results.json', JSON.stringify({
  grepAudit: results,
  dependencies: allDeps
}, null, 2));

console.log('Part 2 grep audit completed.');
