"use strict";
class Replace {
    constructor(_filename, _data) {
        this._filename = _filename;
        this._data = _data;
        try {
        }
        catch (err) {
            console.log(err);
        }
    }
    doReplace() {
        try {
            let fs = require('fs');
            console.log("doReplace");
            return fs.readFile(this._filename, "utf-8", (err, data) => {
                if (err)
                    throw err;
                let output = data;
                for (var _item of this._data) {
                    console.log(_item[0] + " - " + _item[1]);
                    output = output.split(_item[0]).join(_item[1]);
                }
                console.log("Smarty" + output);
                return output;
            });
        }
        catch (err) {
            console.log(err);
        }
    }
}
exports.Replace = Replace;
//# sourceMappingURL=replace.js.map