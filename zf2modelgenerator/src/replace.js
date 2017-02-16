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
var hello = "is it me you're looking for?";
for (var _i = 0, hello_1 = hello; _i < hello_1.length; _i++) {
    var char = hello_1[_i];
    console.log(char);
}
