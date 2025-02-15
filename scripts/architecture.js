import * as fs from 'fs';
import * as path from 'path';

function generateProjectArchitecture(rootPath, level = 0) {
    const indent = '  '.repeat(level);
    let output = '';

    try {
        const entries = fs.readdirSync(rootPath);

        entries.forEach(entry => {
            const fullPath = path.join(rootPath, entry);
            let stats;

            try {
                stats = fs.statSync(fullPath);
            } catch (statErr) {
                console.error(`Error getting stats for ${fullPath}: ${statErr.message}`);
                return; // Skip this entry if stats can't be retrieved
            }


            output += `${indent}${entry}`;

            if (stats.isDirectory()) {
                output += '/\n';
                output += generateProjectArchitecture(fullPath, level + 1);
            } else if (stats.isFile()) {
                const ext = path.extname(entry);
                output += ` (${ext})\n`;
            }
        });
    } catch (err) {
        console.error(`Error reading directory ${rootPath}: ${err.message}`);
        return `${indent}Error: Could not read directory\n`; // Indicate the error in output
    }

    return output;
}

const projectRoot = '.'; // Start from the project root

const foldersToInclude = ['server', 'src']; // Specify the folders you want to include

let architecture = '';

foldersToInclude.forEach(folder => {
    const folderPath = path.join(projectRoot, folder);
    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) { // Check if the folder exists and is a directory
        architecture += `${folder}/\n`;
        architecture += generateProjectArchitecture(folderPath, 1); // Start indentation at 1 for these folders
    } else {
        architecture += `Warning: Folder '${folder}' not found. \n`;
    }
});

console.log(architecture);