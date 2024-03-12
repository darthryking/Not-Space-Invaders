const beautify = require('js-beautify/js').js;
const fs = require('node:fs/promises');
const path = require('node:path');

const BASE_PATH = path.join(__dirname, 'src');
const BEAUTIFY_CONFIG = {
    "indent_size": "4",
    "indent_char": " ",
    "max_preserve_newlines": "2",
    "preserve_newlines": true,
    "keep_array_indentation": false,
    "break_chained_methods": false,
    "indent_scripts": "normal",
    "brace_style": "end-expand",
    "space_before_conditional": true,
    "unescape_strings": false,
    "jslint_happy": false,
    "end_with_newline": true,
    "wrap_line_length": "0",
    "indent_inner_html": false,
    "comma_first": false,
    "e4x": false,
    "indent_empty_lines": false
};

const doBeautify = async () => {
    for (item of await fs.readdir(BASE_PATH, {recursive: true})) {
        const itemPath = path.join(BASE_PATH, item);

        const data = await fs.readFile(itemPath, 'utf-8');
        const beautifiedData = beautify(data, BEAUTIFY_CONFIG);

        let outFile = null;
        try {
            outFile = await fs.open(itemPath, 'w');
            await outFile.writeFile(beautifiedData);
        }
        finally {
            await outFile?.close();
        }
    }
};

doBeautify();
