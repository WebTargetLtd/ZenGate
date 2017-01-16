"use strict";
var replace_1 = require("./replace");
var Home = (function () {
    function Home(_tablename, _namespace) {
        this._tablename = _tablename;
        this._namespace = _namespace;
        console.log("Hello world - the Home thing");
        var x = new replace_1.Replace([["table", "t_Users"], ["publics", "public var $Noodle;"]]);
    }
    return Home;
}());
exports.Home = Home;
var _tablename = typeof process.argv[2] != 'undefined' ? process.argv[2] : 't_user';
var _namespace = typeof process.argv[3] != 'undefined' ? process.argv[3] : 'Auth';
var x = new Home('t_Users', 'Auth');
