"use strict";
const connPostgres_1 = require("./db/connPostgres");
class db {
    constructor(_configService) {
        this._configService = _configService;
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
        return this._dbInstance.getRows();
    }
    dbInstance() {
        return this._dbInstance;
    }
}
exports.db = db;
//# sourceMappingURL=db.js.map