"use strict";
const setup_1 = require("./setup");
var program = require('commander');
program
    .option('-c, --connection <Connection>', 'The connection specified in the dbconfig.json file.')
    .option('-d, --db <database name>', 'The database name')
    .option('-dt, --dbtype <Database Type>', 'PostGreSQL or MySQL')
    .parse(process.argv);
let x = new setup_1.Setup(program);
//# sourceMappingURL=index.js.map