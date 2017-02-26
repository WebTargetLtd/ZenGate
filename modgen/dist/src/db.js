"use strict";
const connPgSQL_1 = require("./db/connPgSQL");
class db {
    constructor(_configService) {
        this._configService = _configService;
        switch (this._configService.getDBParams()["type"]) {
            case 'pg':
                this._dbInstance = new connPgSQL_1.connPgSQL(_configService);
                break;
            case 'mysql':
                this._dbInstance = require('./db/connMysql');
                break;
            default:
        }
        this.getRows();
    }
    getRows() {
        let g = new Promise((resolve, reject) => {
            resolve(this._dbInstance.getRows());
        }).then((res) => {
            console.log("The RES is " + res);
            return res;
        });
        return [""];
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