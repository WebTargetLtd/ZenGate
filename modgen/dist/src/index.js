"use strict";
const setup_1 = require("./setup");
const configService_1 = require("./configService");
var program = require('commander');
program
    .option('-c, --connection <Connection>', 'The connection specified in the dbconfig.json file.')
    .option('-t, --tablename <Table Name>', 'Name of the table or view to model')
    .option('-n, --namespace <Namespace>', 'The namespace for your table\'s class')
    .parse(process.argv);
program.datecreated = new Date().toLocaleString();
let cs = new configService_1.configService(program);
let x = new setup_1.Setup(cs);
//# sourceMappingURL=index.js.map