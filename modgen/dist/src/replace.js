"use strict";
class Replace {
    constructor(_filename, _data) {
        this._data = _data;
        try {
            let fs = require('fs');
            console.log("Replace constructor");
            fs.readFile(_filename, "utf-8", (err, data) => {
                if (err)
                    throw err;
                let output = data;
                for (var _item of _data) {
                    console.log(_item[0] + " - " + _item[1]);
                    output = output.split(_item[0]).join(_item[1]);
                }
                console.log("Smarty" + output);
            });
        }
        catch (err) {
            console.log(err);
        }
    }
    doReplace(_index, _searchreplacearray) {
        return false;
    }
}
exports.Replace = Replace;
//# sourceMappingURL=replace.js.map