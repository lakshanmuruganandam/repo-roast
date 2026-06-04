#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import { Command } from 'commander';
import boxen from 'boxen';
import fg from 'fast-glob';

const program = new Command();

program
  .name('repo-roast')
  .description('Scans your repository architecture and brutally roasts your file structure.')
  .version('1.0.0')
  .parse(process.argv);

const banner = `
    ██████╗ ███████╗██████╗  ██████╗    ██████╗  ██████╗  █████╗  ██████╗████████╗
    ██╔══██╗██╔════╝██╔══██╗██╔═══██╗   ██╔══██╗██╔═══██╗██╔══██╗██╔════╝╚══██╔══╝
    ██████╔╝█████╗  ██████╔╝██║   ██║   ██████╔╝██║   ██║███████║╚█████╗    ██║   
    ██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║   ██╔══██╗██║   ██║██╔══██║ ╚═══██╗   ██║   
    ██║  ██║███████╗██║     ╚██████╔╝   ██║  ██║╚██████╔╝██║  ██║██████╔╝   ██║   
    ╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝    ╚═╝   
`;

console.log(pc.red(banner));
console.log(pc.gray('    Let\'s see what kind of mess you built.\n'));

const typeWriter = async (text, speed = 15) => {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    await new Promise(r => setTimeout(r, speed));
  }
  console.log();
};

const run = async () => {
  process.stdout.write(pc.blue('Scanning repository tree...\n'));
  
  const files = await fg(['**/*'], { dot: true, ignore: ['**/node_modules/**', '**/.git/**'] });
  
  await new Promise(r => setTimeout(r, 1000));
  console.log();

  const roasts = [];

  // Rule 1: .DS_Store
  if (files.some(f => f.includes('.DS_Store'))) {
    roasts.push("🍎 I see a .DS_Store file checked in. Do you even know what a .gitignore is?");
  }

  // Rule 2: utils.js
  if (files.some(f => f.includes('utils.js') || f.includes('utils.ts'))) {
    roasts.push("🗑️ Ah, 'utils.js'. The ultimate trash can for functions you were too lazy to name properly.");
  }

  // Rule 3: index.js over 1000 lines
  const indexFiles = files.filter(f => f.endsWith('index.js') || f.endsWith('index.ts') || f.endsWith('index.tsx'));
  for (const idx of indexFiles) {
    try {
      const stats = fs.statSync(idx);
      if (stats.size > 20000) { // approx 500+ lines
        roasts.push(`📜 ${idx} is massive. Are you allergic to code splitting?`);
      }
    } catch {}
  }

  // Rule 4: Too many files in one folder
  const folders = {};
  files.forEach(f => {
    const dir = path.dirname(f);
    folders[dir] = (folders[dir] || 0) + 1;
  });

  for (const [dir, count] of Object.entries(folders)) {
    if (count > 30 && dir !== '.') {
      roasts.push(`📁 You have ${count} files crammed into '${dir}'. Your architecture is a junk drawer.`);
      break; // Only roast once for this
    }
  }

  // Rule 5: .env checked in
  if (files.some(f => f === '.env')) {
    roasts.push("🚨 You checked in your .env file! Are you trying to get hacked or do you just hate money?");
  }

  // Rule 6: No tests
  const testFiles = files.filter(f => f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__'));
  if (testFiles.length === 0) {
    roasts.push("🧪 Zero test files found. 'Testing in production' isn't a valid architecture strategy.");
  }

  // Rule 7: old logs
  if (files.some(f => f.endsWith('.log'))) {
    roasts.push("📝 You actually committed .log files. Wow.");
  }

  if (roasts.length === 0) {
    await typeWriter(pc.green("Honestly... your repo structure is surprisingly clean. I can't even roast you. Good job."));
  } else {
    for (const roast of roasts) {
      await typeWriter(`↳ ${pc.white(roast)}`, 15);
      await new Promise(r => setTimeout(r, 500));
      console.log();
    }
    await typeWriter(pc.red("Do better."));
  }

  console.log(pc.cyan('\nArchitected by @lakshanmuruganandam\n'));
};

run().catch(e => {
  console.error(pc.red('\nAn unexpected error occurred:'), e.message);
  process.exit(1);
});
