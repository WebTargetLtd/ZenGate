"use strict";
const replace_1 = require("./replace");
class Setup {
    constructor(_args) {
        this._args = _args;
        console.log("Namespace is " + _args["namespace"]);
        this.doReplacements();
    }
    doReplacements() {
        let x = new replace_1.Replace('../templates/src/XTable.php', [
            ["{$table}", "User"],
            ["{$namespace}", this._args["namespace"]],
            ["{$created}", this._args["datecreated"]],
        ]).doReplace();
        console.log(x);
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