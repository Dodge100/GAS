const fs = require('fs');

const input = fs.readFileSync('example.gas', 'utf8')
const html = fs.readFileSync('example.html', 'utf8')
const output = 'example-output.css'

//vars
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

//mixins
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

//dynamic classes
const dynamicClassRegex = /\.(\w+)\[([^\]]+)\]\s*\{([\s\S]*?)\}/gm;
let templates = {};
code = code.replace(dynamicClassRegex, (_, className, params, block) => {
    templates[className] = {
        param: params.trim(),
        block: block.trim(),
    };
    return '';
});

console.log(templates)

const usedClassesRegex = /class=["']([^"']+)["']/g;
const usedClasses = new Set();
html.replace(usedClassesRegex, (_, classes) => {
    classes.split(/\s+/).forEach(clas => {
        usedClasses.add(clas);
    });
});

let dynamicCSS = '';
for (const clas of usedClasses) {
    const match = /^([^[]+)-?\[(.+?)\]$/.exec(clas);
    if (match) {
        const [_, baseName, values] = match;
        if (templates[baseName]) {
            const {block, param} = templates[baseName];

            const paramName = param.split(',').map(p => p.trim());
            const paramVals = values.split(',').map(v => v.trim());

            let fina = block;

            for (let i=0;i<paramName.length; i++) {
                const name = paramName[i];
                const vals = paramVals[i];
                fina = fina.replace(new RegExp(`\\b${name}\\b`, 'g'), vals);

            }

            const safeClass = clas.replace(/[^\w-]/g, s => '\\'+s)
            dynamicCSS += `.${safeClass} {\n${fina}\n}\n\n`;
        }
    }
}

console.log(dynamicCSS);

code = code.trimStart() + "\n\n" + dynamicCSS; //remove newlines at start of code

fs.writeFileSync(output, code);