const fs = require('fs');
const path = require('path');

const colorTokensPath = path.join(__dirname, 'color-tokens.json');
const typoTokensPath = path.join(__dirname, 'typography-tokens.tokens.json');
const outputPath = path.join(__dirname, 'variables.css');

const colorTokens = JSON.parse(fs.readFileSync(colorTokensPath, 'utf8'));
const typoTokens = JSON.parse(fs.readFileSync(typoTokensPath, 'utf8'));

let rootCss = '/* Auto-generated CSS variables from tokens */\n:root {\n';
let darkCss = '@media (prefers-color-scheme: dark) {\n  :root {\n';

function toCssVarName(pathArray) {
  return '--' + pathArray.join('-')
    .replace(/\s+/g, '-')
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2') // Camel to kebab
    .toLowerCase();
}

function resolveValue(val) {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    const path = val.slice(1, -1).split('.');
    return `var(${toCssVarName(path)})`;
  }
  return val;
}

// 1. Base Colors
function processColors(obj, currentPath = []) {
  for (const key in obj) {
    if (currentPath.length === 1 && currentPath[0] === 'color' && key === 'role') continue; // Skip role for now
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processColors(obj[key], [...currentPath, key]);
    } else {
      rootCss += `  ${toCssVarName([...currentPath, key])}: ${resolveValue(obj[key])};\n`;
    }
  }
}
processColors({ color: colorTokens.color }, []);

// 2. Light Theme Colors
rootCss += '\n  /* Light Theme */\n';
if (colorTokens.color.role && colorTokens.color.role.light) {
  for (const key in colorTokens.color.role.light) {
    rootCss += `  ${toCssVarName(['color', key])}: ${resolveValue(colorTokens.color.role.light[key])};\n`;
  }
}

// 3. Typography
rootCss += '\n  /* Typography */\n';
function processTypo(obj, currentPath = []) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !('value' in obj[key])) {
      processTypo(obj[key], [...currentPath, key]);
    } else if (typeof obj[key] === 'object' && 'value' in obj[key]) {
      let val = obj[key].value;
      if (obj[key].type === 'dimension' && typeof val === 'number') val += 'px';
      rootCss += `  ${toCssVarName([...currentPath, key])}: ${val};\n`;
    }
  }
}
processTypo({ typography: typoTokens.typography }, []);

rootCss += '}\n\n';

// 4. Dark Theme Colors
if (colorTokens.color.role && colorTokens.color.role.dark) {
  for (const key in colorTokens.color.role.dark) {
    darkCss += `    ${toCssVarName(['color', key])}: ${resolveValue(colorTokens.color.role.dark[key])};\n`;
  }
}
darkCss += '  }\n}\n';

fs.writeFileSync(outputPath, rootCss + darkCss);
console.log('Successfully generated variables.css!');
