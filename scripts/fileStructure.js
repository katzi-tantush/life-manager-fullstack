import fs from 'fs/promises';
import path from 'path';

async function listProjectStructure(dir, excludeDirs = ['node_modules', '.git']) {
  try {
    const entries = await fs.readdir(dir);
    const structure = {};

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stats = await fs.stat(fullPath);

      if (excludeDirs.includes(entry)) {
        continue;
      }

      if (stats.isDirectory()) {
        structure[entry] = await listProjectStructure(fullPath, excludeDirs);
      } else if (stats.isFile()) {
        structure[entry] = 'file';
      }
    }
    return structure;
  } catch (err) {
    console.error(`Error reading directory ${dir}: ${err}`);
    return {};
  }
}

function printStructure(structure, indent = "") {
  for (const key in structure) {
    const value = structure[key];
    console.log(indent + key);

    if (typeof value === 'object') {
      printStructure(value, indent + "  ");
    }
  }
}

async function main() {
  const foldersToScan = ['server', 'src']; // Array of folders to scan
  const projectStructure = {};

  for (const folder of foldersToScan) {
    const folderPath = path.join('.', folder); // Path relative to current directory

    try {
      const stats = await fs.stat(folderPath); // Check if the folder exists
      if (stats.isDirectory()) {
        projectStructure[folder] = await listProjectStructure(folderPath);
      } else {
        console.error(`Error: ${folder} is not a directory.`);
      }
    } catch (err) {
      console.error(`Error accessing folder ${folder}: ${err}`);
    }
  }

  console.log("Project Structure:");
  printStructure(projectStructure);

  try {
    await fs.writeFile('project_structure.json', JSON.stringify(projectStructure, null, 2));
    console.log(`Project structure saved to project_structure.json`);
  } catch (err) {
    console.error(`Error saving structure to file: ${err}`);
  }
}

main();