"use strict";
class connPostgres {
    constructor(_cs) {
        this._cs = _cs;
        this._pg = require('pg');
        this.configure();
    }
    configure() {
        this._pConn = this._cs.getDBParams();
        this._client = new this._pg.Client(this.getConnectString());
    }
    getRows() {
        try {
            let _cs = this.getConnectString();
            let _qry = this.getQuery();
            let _cl = this._client;
            this._client.connect(function (err) {
                if (err)
                    throw err;
                _cl.query(_qry, function (err, result) {
                    if (err)
                        throw err;
                    console.log(result);
                    _cl.end(function (err) {
                        if (err)
                            throw err;
                    });
                });
            });
        }
        catch (err) {
            console.log(err);
        }
        return ["Noodle", "Doodle"];
    }
    getConnectString() {
        try {
            return `postgres://${this._pConn.username}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    getQuery(_tableName) {
        return `select column_name from information_schema.columns where table_name='${this._cs.getTable()}';`;
    }
    testConnection() {
        return true;
    }
    ;
}
exports.connPostgres = connPostgres;
//# sourceMappingURL=connPostgres.js.map