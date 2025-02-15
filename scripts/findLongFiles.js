import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function getAllFiles(dir) {
  const files = [];

  readdirSync(dir).forEach(file => {
    const fullPath = join(dir, file);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      // Exclude node_modules and other unwanted directories
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file!=='build') { // Add more as needed
        files.push(...getAllFiles(fullPath));
      }
    } else {
      const ext = extname(file);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

const projectRoot = '.'; // Or specify the actual root if different
const files = getAllFiles(projectRoot);

const longFiles = files
  .map(file => {
    try { // Handle potential read errors
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      return { file, lines };
    } catch (error) {
      console.error(`Error reading file: ${file}`, error);
      return { file, lines: 0 }; // Or handle the error as you see fit
    }
  })
  .filter(({ lines }) => lines > 80)
  .sort((a, b) => b.lines - a.lines);

console.log('Files with more than 80 lines:\n');
longFiles.forEach(({ file, lines }) => {
  console.log(`${lines}\t${file}`);
});