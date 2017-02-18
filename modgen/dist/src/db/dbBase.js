"use strict";
class dbBase {
    constructor() {
        this.cf = require("../../dbconfig.json");
    }
    getDBParams(_key) {
        if (_key === undefined) {
            _key = this.cf.default;
        }
        return this.cf[_key];
    }
}
exports.dbBase = dbBase;
//# sourceMappingURL=dbBase.js.map