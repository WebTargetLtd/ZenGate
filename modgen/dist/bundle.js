/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const replace_1 = __webpack_require__(2);
class Setup {
    constructor(_tablename, _namespace) {
        this._tablename = _tablename;
        this._namespace = _namespace;
        console.log(this.getDBParams("rimacondb"));
        let x = new replace_1.Replace('../templates/src/X.php', [["{$table}", "t_Users"], ["{$publics}", "public var $Noodle;"]]);
    }
    getDBParams(_key) {
        let cf = __webpack_require__(1);
        return cf;
    }
}
exports.Setup = Setup;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {
	"rimacondb": {
		"type": "pg",
		"server": "192.168.77.2",
		"port": "5432",
		"username": "postgres",
		"password": "password",
		"dbname": "RiMaConDB"
	},
	"default": "rimacondb"
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class Replace {
    constructor(_filename, _data) {
        this._data = _data;
        try {
            let fs = __webpack_require__(3);
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
// Similarly TypeScript has no trouble going through a string character by character using for...of:


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const setup_1 = __webpack_require__(0);
var _tablename = typeof process.argv[2] != 'undefined' ? process.argv[2] : 't_user';
var _namespace = typeof process.argv[3] != 'undefined' ? process.argv[3] : 'Auth';
console.log("TableName :: " + _tablename);
let x = new setup_1.Setup('t_Users', 'Auth');


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map