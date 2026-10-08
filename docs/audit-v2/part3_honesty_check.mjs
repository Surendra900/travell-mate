import { execSync } from 'child_process';
import fs from 'fs';

function grepMatches(pattern, target = 'src/') {
  try {
    const res = execSync(`git grep -n -i -E "${pattern}" -- ${target}`, { encoding: 'utf-8' });
    return res.trim().split('\n').filter(Boolean).map(line => {
      const parts = line.split(':');
      return { file: parts[0], line: parts[1], text: parts.slice(2).join(':').trim() };
    });
  } catch (err) {
    return [];
  }
}

const terms = ['guarantee', 'guaranteed', 'confirmed'];
const report = {};

for (const term of terms) {
  report[term] = {
    src: grepMatches(`\\b${term}\\b`, 'src/'),
    server: grepMatches(`\\b${term}\\b`, 'server/')
  };
}

// Check for hardcoded on-time percentages like "94% on-time" or "\\d+%"
const percentagePatterns = ['[0-9]{2}%\\s+on-time', '[0-9]{2}%\\s+reliable'];
report.hardcodedPercentages = [];
for (const p of percentagePatterns) {
  report.hardcodedPercentages.push(...grepMatches(p, 'src/'));
}

fs.writeFileSync('docs/audit-v2/test-logs/part3_honesty_grep.json', JSON.stringify(report, null, 2));
console.log('Part 3 honesty grep complete.');
