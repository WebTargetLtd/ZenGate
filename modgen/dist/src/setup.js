"use strict";
const db_1 = require("./db");
class Setup {
    constructor(_cs) {
        this._cs = _cs;
        let _db = new db_1.db(_cs);
    }
}
exports.Setup = Setup;
//# sourceMappingURL=setup.js.map