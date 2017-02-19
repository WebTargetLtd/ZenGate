"use strict";
const db_1 = require("./db");
class Setup {
    constructor(_args) {
        this._args = _args;
        let _db = new db_1.db(_args);
    }
}
exports.Setup = Setup;
//# sourceMappingURL=setup.js.map