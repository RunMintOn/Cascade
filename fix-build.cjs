const fs = require('fs');
const path = require('path');

// Read the built HTML
const htmlPath = path.join(__dirname, 'dist/src/sidepanel/index.html');
const outputPath = path.join(__dirname, 'dist/sidepanel.html');

let html = fs.readFileSync(htmlPath, 'utf-8');
html = html.replace(/..\/..\/assets\//g, './assets/');
fs.writeFileSync(outputPath, html);

console.log('✓ Fixed sidepanel.html paths');

// Update manifest
const manifestPath = path.join(__dirname, 'dist/manifest.json');
let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
manifest.side_panel.default_path = 'sidepanel.html';
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('✓ Updated manifest.json');
