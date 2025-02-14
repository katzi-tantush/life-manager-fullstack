import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function getAllFiles(dir) {
  const files = [];
  
  readdirSync(dir).forEach(file => {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      const ext = extname(file);
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        files.push(fullPath);
      }
    }
  });
  
  return files;
}

const files = getAllFiles('.');
const longFiles = files
  .map(file => {
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    return { file, lines };
  })
  .filter(({ lines }) => lines > 80)
  .sort((a, b) => b.lines - a.lines);

console.log('Files with more than 80 lines:\n');
longFiles.forEach(({ file, lines }) => {
  console.log(`${lines}\t${file}`);
});