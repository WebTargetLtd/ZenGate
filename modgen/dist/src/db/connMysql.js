"use strict";
class connMysql {
    constructor(_cs) {
        this._cs = _cs;
        this.configure();
    }
    configure() {
        this._pConn = this._cs.getDBParams();
    }
    getConnectString() {
        return "";
    }
    ;
    getQuery() {
        return "";
    }
    getRows() {
        return [""];
    }
    testConnection() {
        return false;
    }
    ;
}
exports.connMysql = connMysql;
//# sourceMappingURL=connMysql.js.map