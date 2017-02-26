"use strict";
class connPgSQL {
    constructor(_cs) {
        this._cs = _cs;
        this._pgp = require('pg-promise');
        try {
            this.configure();
        }
        catch (err) {
            console.log("Error in constructor of PgSQL : " + err);
        }
    }
    configure() {
        this._pConn = this._convertParams();
        console.log(this._convertParams());
        console.log("PGP : " + this._pgp(this._convertParams()).connect());
    }
    getConnectString() {
        try {
            return `postgres://${this._pConn.user}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    getRows() {
        return [""];
    }
    _convertParams() {
        let _conn = {
            user: "",
            database: "",
            port: "",
            host: "",
            password: ""
        };
        try {
            _conn.user = this._cs.getDBParams().username;
            _conn.database = this._cs.getDBParams().dbname;
            _conn.port = this._cs.getDBParams().port;
            _conn.host = this._cs.getDBParams().server;
            _conn.password = this._cs.getDBParams().password;
        }
        catch (err) {
            console.log("Error in _convertParams :: " + err);
        }
        return _conn;
    }
}
exports.connPgSQL = connPgSQL;
//# sourceMappingURL=connPgSQL.js.map