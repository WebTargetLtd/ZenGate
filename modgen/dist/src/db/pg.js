"use strict";
const cla_1 = require("../consts/cla");
class connPostgres {
    getConnectString(_dbParams) {
        try {
            let _conn = `postgres://${_dbParams[cla_1.cla.username]}:${_dbParams[cla_1.cla.password]}@${_dbParams[cla_1.cla.server]}/${_dbParams[cla_1.cla.dbname]}`;
            console.log("Conn :: " + _conn);
            return _conn;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    getQuery(_tableName) {
        return `select column_name from information_schema.columns where table_name='${_tableName}';`;
    }
}
exports.connPostgres = connPostgres;
//# sourceMappingURL=pg.js.map