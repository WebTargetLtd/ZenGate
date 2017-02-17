import { Setup } from './setup';
var program = require('commander');
program
  .option('-c, --connection <Connection>', 'The connection specified in the dbconfig.json file.')
  .option('-t, --tabletype <Table Name>', 'Name of the table or view to model')
  .option('-n, --namespace <Namespace>', 'The namespace for your table\'s class')
.parse(process.argv);

program.datecreated = new Date().toLocaleString();

// console.log("TableName :: " + _tablename);
// console.log(program);
let x = new Setup(program);
