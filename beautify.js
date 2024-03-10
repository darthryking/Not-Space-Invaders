const beautify = require('js-beautify/js').js;
const fs = require('node:fs/promises');
const path = require('node:path');

const BASE_PATH = path.join(__dirname, 'src');


const doBeautify = async () => {
    for (item of await fs.readdir(BASE_PATH, {recursive: true})) {
        const itemPath = path.join(BASE_PATH, item);

        const data = await fs.readFile(itemPath, 'utf-8');
        const beautifiedData = beautify(data, {indent_size: 4});

        const outFile = await fs.open(itemPath, 'w')
        await outFile.writeFile(beautifiedData);
    }
};

doBeautify();
