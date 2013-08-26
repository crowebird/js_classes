var fs = require('fs');
var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;
var orig_code = fs.readFileSync('js_classes.js');
var ast = jsp.parse(orig_code);
ast = pro.ast_mangle(ast);
ast = pro.ast_squeeze(ast);
var final_code = pro.gen_code(ast);
console.log(final_code);
