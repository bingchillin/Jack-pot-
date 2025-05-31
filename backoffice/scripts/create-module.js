const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utility functions
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const toKebabCase = (str) => str.toLowerCase().replace(/\s+/g, '-');
const toCamelCase = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
const createDirIfNotExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const replaceInFile = (filePath, replacements) => {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [oldStr, newStr] of replacements) {
        const regex = new RegExp(oldStr, 'g');
        content = content.replace(regex, newStr);
    }
    fs.writeFileSync(filePath, content);
};

const copyDir = (src, dest) => {
    createDirIfNotExists(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

const replaceInDirectory = (dir, replacements) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            replaceInDirectory(fullPath, replacements);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            replaceInFile(fullPath, replacements);
        }
    }
};

const createModule = async (pluralInput) => {
    const pluralKebab = toKebabCase(pluralInput); // e.g. plant-types
    const pluralCamel = toCamelCase(pluralKebab); // e.g. plantTypes
    const pluralPascal = capitalize(pluralCamel); // e.g. PlantTypes

    // Naively get singular by removing trailing 's'
    const singularKebab = pluralKebab.endsWith('s') ? pluralKebab.slice(0, -1) : pluralKebab;
    const singularCamel = pluralCamel.endsWith('s') ? pluralCamel.slice(0, -1) : pluralCamel;
    const singularPascal = capitalize(singularCamel);

    // === 1. Copy main module ===
    const sourceDir = path.join(__dirname, '..', 'src', 'app', 'persons');
    const targetDir = path.join(__dirname, '..', 'src', 'app', pluralKebab);
    copyDir(sourceDir, targetDir);

    replaceInDirectory(targetDir, [
        ['persons', pluralKebab],
        ['Persons', pluralPascal],
        ['person', singularKebab],
        ['Person', singularPascal],
    ]);

    // === 2. Copy components/person to components/<singular> ===
    const sourceComponentDir = path.join(__dirname, '..', 'src', 'components', 'person');
    const targetComponentDir = path.join(__dirname, '..', 'src', 'components', singularKebab);
    copyDir(sourceComponentDir, targetComponentDir);

    replaceInDirectory(targetComponentDir, [
        ['persons', pluralKebab],
        ['Persons', pluralPascal],
        ['person', singularKebab],
        ['Person', singularPascal],
    ]);

    // === 3. Update endpoints.ts ===
    const endpointsPath = path.join(__dirname, '..', 'src', 'utils', 'api', 'endpoints.ts');
    let endpointsContent = fs.readFileSync(endpointsPath, 'utf8');

    const resourceMapRegex = /const resourceMappings: { \[key: string\]: string } = {([\s\S]*?)}/;
    const match = endpointsContent.match(resourceMapRegex);

    if (match) {
        const currentMappings = match[1];
        const newMapping = `  "${pluralKebab}": "${singularKebab}",\n`;
        const updatedMappings = `const resourceMappings: { [key: string]: string } = {\n${currentMappings}${newMapping}}`;
        endpointsContent = endpointsContent.replace(resourceMapRegex, updatedMappings);
        fs.writeFileSync(endpointsPath, endpointsContent);
    }

    // === 4. Update layout.tsx sidebar ===
    const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');

    const resourcesRegex = /resources=\{\[([\s\S]*?)\]\}/;
    const iconComponent = '<UserOutlined />'; // Optional: replace with dynamic icon if needed

    if (resourcesRegex.test(layoutContent)) {
        const newResource = `  {\n` +
            `    name: "${pluralKebab}",\n` +
            `    list: "/${pluralKebab}",\n` +
            `    create: "/${pluralKebab}/create",\n` +
            `    edit: "/${pluralKebab}/edit/:id",\n` +
            `    show: "/${pluralKebab}/show/:id",\n` +
            `    meta: {\n` +
            `      canDelete: true,\n` +
            `      icon: ${iconComponent},\n` +
            `    },\n  },\n`;

        layoutContent = layoutContent.replace(
            resourcesRegex,
            (match, group) => `resources={[${group}${newResource}]}`
        );
        fs.writeFileSync(layoutPath, layoutContent);
    }

    // === ✅ Done ===
    console.log(`\n✅ Module "${pluralKebab}" created successfully!\n`);
    console.log(`📁 app/${pluralKebab} created from "persons"`);
    console.log(`📁 components/${singularKebab} created from "person"`);
    console.log(`🧩 layout.tsx sidebar updated`);
    console.log(`🔗 endpoints.ts mappings updated`);
};

// Prompt
rl.question('Enter the plural name of the new module: ', (pluralName) => {
    createModule(pluralName)
        .then(() => rl.close())
        .catch((error) => {
            console.error('❌ Error creating module:', error);
            rl.close();
        });
});
