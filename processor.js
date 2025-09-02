const fs = require('fs');

const input = fs.readFileSync('example.gas', 'utf8')

const varRegex = /^(\w+)\s*=\s*(.+?);$/gm;
let vars = {};
let code = input.replace(varRegex, (_, name, value) => {
    vars[name] = value.trim()
    return '';
})

function varSolve(value, depth=0) {
    if (depth > 10) return value;
    return value.replace(/\b(\w+)\b/g, (_, name) => {
        return name in vars ? varSolve(vars[name], depth + 1) : name;
    });
}

for (const name in vars) {
    vars[name] = varSolve(vars[name]);
}

const mixinRegex = /@(\w+)\s*\{([\s\S]*?)\}/gm;
let mixins = {};
code = code.replace(mixinRegex, (_, name, content) => {
    mixins[name] = content.trim()
    return '';
})

code = code.replace(/@(\w+)/g, (_, name) => {
    return mixins[name] || `@${name}`;
});

code = code.replace(/!(\w+)/g, (_, name) => {
    return name in vars ? vars[name] : `!${name}`;
})

code = code.trimStart(); //remove newlines at start of code

fs.writeFileSync('example-output.css', code);