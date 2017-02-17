"use strict";
const cla_1 = require("./consts/cla");
class Setup {
    constructor(_args) {
        console.log(this.getDBParams()[cla_1.cla.dbname]);
    }
    getDBParams(_key) {
        let cf = require("../dbconfig.json");
        if (_key === undefined) {
            _key = cf.default;
        }
        return cf[_key];
    }
}
exports.Setup = Setup;
//# sourceMappingURL=setup.js.map