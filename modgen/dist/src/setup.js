"use strict";
const replace_1 = require("./replace");
class Setup {
    constructor(_tablename, _namespace) {
        this._tablename = _tablename;
        this._namespace = _namespace;
        console.log(this.getDBParams("rimacondb"));
        let x = new replace_1.Replace('../templates/src/X.php', [["{$table}", "t_Users"], ["{$publics}", "public var $Noodle;"]]);
    }
    getDBParams(_key) {
        let cf = require("../dbconfig.json");
        return cf;
    }
}
exports.Setup = Setup;
//# sourceMappingURL=setup.js.map