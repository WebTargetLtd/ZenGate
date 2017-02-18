"use strict";
const connPostgres_1 = require("./db/connPostgres");
class db {
    constructor(_args, _type) {
        this._args = _args;
        this._type = _type;
        switch (_type) {
            case 'pg':
                this._dbInstance = new connPostgres_1.connPostgres();
                break;
            case 'mysql':
                this._dbInstance = require('./db/connMysql');
                break;
            default:
                console.log(`DB Type '${_type}' does not exist. Cannot create a connection of Idb type`);
        }
    }
    getRows() {
        return this._dbInstance.getRows();
    }
    dbInstance() {
        return this._dbInstance;
    }
}
exports.db = db;
//# sourceMappingURL=db.js.map