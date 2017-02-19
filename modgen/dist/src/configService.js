"use strict";
class configService {
    constructor(_clArgs) {
        this.cf = require("../dbconfig.json");
        try {
            this._ns = _clArgs["namespace"];
            this._table = _clArgs["tablename"];
        }
        catch (err) {
            console.log("Error creating configService :: " + err);
        }
    }
    getNamespace() {
        return this._ns;
    }
    getTable() {
        return this._table;
    }
    getDBParams(_key) {
        if (_key === undefined) {
            _key = this.cf.default;
        }
        return this.cf[_key];
    }
}
exports.configService = configService;
//# sourceMappingURL=configService.js.map