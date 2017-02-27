import { Setup } from './setup';
import { configService } from './configService';
import { Cycle } from './cycle';

var program = require('commander');
program
  .option('-c, --connection <Connection>', 'The connection specified in the dbconfig.json file.')
  .option('-t, --tablename <Table Name>', 'Name of the table or view to model')
  .option('-n, --namespace <Namespace>', 'The namespace for your table\'s class')
  .option('-a, --tablealias <Alias>', 'Alias a table; i.e. User instead of t_user')
  .option('-u, --author <Author>', 'Software author. Can be defaulted in dbconfig.json')
.parse(process.argv);

program.datecreated = new Date().toLocaleString();

// console.log("TableName :: " + _tablename);
let cs = new configService(program);
let c = new Cycle(cs);
