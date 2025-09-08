#!/usr/bin/env node

const fs = require('fs');
const { processGAS } = require('../lib/index.js');

const args = process.argv.slice(2);

const inputGas = args[0];
const inputHtml = args[1];

if (!inputGas || !inputHtml) {
    console.error('Usage: gas <input.gas> <input.html> [-o output.css]');
    process.exit(1);
}

const input = fs.readFileSync(inputGas, 'utf-8');
const html = fs.readFileSync(inputHtml, 'utf-8');
const output = args.includes('-o') ? args[args.indexOf('-o') + 1] : 'output.css';

const code = processGAS(input, html);

fs.writeFileSync(output, code);
console.log(`CSS written to ${output}`);