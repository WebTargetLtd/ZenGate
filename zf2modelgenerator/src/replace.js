"use strict";
var Replace = (function () {
    function Replace(_data) {
        this._data = _data;
        console.log("Replace constructor");
        var _file = "";
    }
    Replace.prototype.doReplace = function (_index, _searchreplacearray) {
        return false;
    };
    return Replace;
}());
exports.Replace = Replace;
