import { Setup } from './setup';

var _tablename = typeof process.argv[2] != 'undefined' ? process.argv[2] : 't_user';
var _namespace = typeof process.argv[3] != 'undefined' ? process.argv[3] : 'Auth';

console.log("TableName :: " + _tablename);

let x = new Setup('t_Users', 'Auth');
