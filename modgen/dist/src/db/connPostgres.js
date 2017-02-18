"use strict";
const cla_1 = require("../consts/cla");
const dbBase_1 = require("./dbBase");
class connPostgres extends dbBase_1.dbBase {
    constructor() {
        super();
        this.pg = require('pg');
        console.log("require('pg')");
    }
    configure() {
    }
    ;
    getRows() {
        console.log(this.getConnectString());
        return ["Noodle", "Doodle"];
    }
    getConnectString() {
        try {
            let _p = this.getDBParams();
            let _connstring = `postgres://${_p[cla_1.cla.username]}:${_p[cla_1.cla.password]}@${_p[cla_1.cla.server]}/${_p[cla_1.cla.dbname]}`;
            return _connstring;
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
//# sourceMappingURL=connPostgres.js.map