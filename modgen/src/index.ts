import { Setup } from './setup';
var program = require('commander');
program
  .option('-c, --connection <Connection>', 'The connection specified in the dbconfig.json file.')
  .option('-d, --db <database name>', 'The database name')
  .option('-dt, --dbtype <Database Type>', 'PostGreSQL or MySQL')
.parse(process.argv);



// console.log("TableName :: " + _tablename);
// console.log(program);
let x = new Setup(program);
