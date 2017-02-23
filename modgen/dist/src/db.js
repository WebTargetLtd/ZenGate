"use strict";
const connPostgres_1 = require("./db/connPostgres");
class db {
    constructor(_configService) {
        this._configService = _configService;
        this._thingy = "Poop";
        console.log(_configService.getDBParams());
        switch (this._configService.getDBParams()["type"]) {
            case 'pg':
                this._dbInstance = new connPostgres_1.connPostgres(_configService);
                break;
            case 'mysql':
                this._dbInstance = require('./db/connMysql');
                break;
            default:
        }
        this.getRows();
    }
    getRows() {
        this._dbInstance.getRows(this.writeColumns, "Blimpy McBlimp");
        return;
    }
    writeColumns(_rows, _message) {
        console.log("A message " + _message);
        for (var item of _rows["rows"]) {
            console.log("My Item " + JSON.stringify(item.column_name));
        }
    }
    dbInstance() {
        return this._dbInstance;
    }
}
exports.db = db;
//# sourceMappingURL=db.js.map