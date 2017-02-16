"use strict";
const setup_1 = require("./setup");
var _tablename = typeof process.argv[2] != 'undefined' ? process.argv[2] : 't_user';
var _namespace = typeof process.argv[3] != 'undefined' ? process.argv[3] : 'Auth';
console.log("TableName :: " + _tablename);
let x = new setup_1.Setup('t_Users', 'Auth');
//# sourceMappingURL=index.js.map