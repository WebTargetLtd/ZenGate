"use strict";
const setup_1 = require("./setup");
const configService_1 = require("./configService");
const cycle_1 = require("./cycle");
var program = require('commander');
program
    .option('-c, --connection <Connection>', 'The connection specified in the dbconfig.json file.')
    .option('-t, --tablename <Table Name>', 'Name of the table or view to model')
    .option('-n, --namespace <Namespace>', 'The namespace for your table\'s class')
    .option('-a, --alias <Alias>', 'Alias a table; i.e. t_user for User')
    .parse(process.argv);
program.datecreated = new Date().toLocaleString();
let cs = new configService_1.configService(program);
let c = new cycle_1.Cycle(cs);
c.cycle();
let x = new setup_1.Setup(cs);
//# sourceMappingURL=index.js.map