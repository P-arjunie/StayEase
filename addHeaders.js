const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'screens');

function processDir(dir, role) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath, file);
        } else if (fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const componentName = file.replace('.js', '');
            
            if (content.includes('/**\\n * @file')) continue; // Skip if already has header

            let desc = `Renders the ${componentName} screen for the ${role || 'common'} role.`;
            if (componentName.includes('Registration')) desc = `Handles the registration flow, validation, and account creation for a new ${role}.`;
            if (componentName.includes('Dashboard')) desc = `Primary landing screen for the ${role}. Displays high-level metrics, alerts, and navigation points.`;
            if (componentName === 'BrowseProperties') desc = `Displays a searchable, filterable list of active properties for students to browse and apply to.`;
            if (componentName === 'PropertyDetail') desc = `Shows in-depth details, images, and actions for a specific property.`;

            const header = `/**
 * @file ${file}
 * @description ${desc}
 * 
 * @module screens/${role}/${componentName}
 */

`;
            // Add function comments
            content = content.replace(
                `const ${componentName} = ({ navigation`,
                `/**\n * Main Component: ${componentName}\n * @param {object} props - Component props\n * @param {object} props.navigation - React Navigation object\n */\nconst ${componentName} = ({ navigation`
            );

            content = content.replace(
                `const ${componentName} = ({ route, navigation`,
                `/**\n * Main Component: ${componentName}\n * @param {object} props - Component props\n * @param {object} props.route - React Navigation route params\n * @param {object} props.navigation - React Navigation object\n */\nconst ${componentName} = ({ route, navigation`
            );

            fs.writeFileSync(fullPath, header + content);
        }
    }
}
processDir(screensDir, '');
console.log('Documentation headers injected.');
