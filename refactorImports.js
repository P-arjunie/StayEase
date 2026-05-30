const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'screens');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content.replace(/'\.\/config/g, "'../../config");
            content = content.replace(/"\.\/config/g, '"../../config');
            content = content.replace(/'\.\/components/g, "'../../components");
            content = content.replace(/"\.\/components/g, '"../../components');
            content = content.replace(/'\.\/utils/g, "'../../utils");
            content = content.replace(/"\.\/utils/g, '"../../utils');
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir(screensDir);
console.log('Import paths updated.');
