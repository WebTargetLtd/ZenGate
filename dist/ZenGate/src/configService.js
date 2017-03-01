"use strict";
class configService {
    constructor(_clArgs) {
        this.cf = require("../settings/dbconfig.json");
        this._fs = require("fs");
        try {
            this._webtargetcomment = this._fs.readFileSync('../settings/Comments/WebTarget.js', 'utf8');
            this._ns = _clArgs["namespace"] == null ? 'Application' : _clArgs["namespace"];
            this._table = _clArgs["tablename"] == null ? 'Albums' : _clArgs["tablename"];
            this._alias = _clArgs["tablealias"] == null ? this._table : _clArgs["tablealias"];
            this._datecreated = _clArgs["datecreated"];
            this._author = _clArgs["author"] == null ? this.getParam("author") : _clArgs["author"];
            this._fileroot = this.getParam("fileroot");
            this._outputfolder = this.getParam("outputfolder");
            this._connection = _clArgs["connection"] == undefined ? this.cf.default : _clArgs["connection"];
        }
        catch (err) {
            console.log("Error creating configService :: " + err);
        }
    }
    setRows(_rows) { this._rows = _rows; }
    getDateCreated() { return this._datecreated; }
    getNamespace() { return this._ns; }
    getTable() { return this._table; }
    getAlias() { return this._alias; }
    getAuthor() { return this._author; }
    getFileroot() { return this._fileroot; }
    getOutputfolder() { return this._outputfolder; }
    getWebTargetComment() { return this._webtargetcomment; }
    getParam(_key) { return this.cf[_key]; }
    getDBParams(_key) {
        if (_key === undefined) {
            _key = this._connection;
        }
        return this.cf[_key];
    }
    generateFilename(_filename) {
        try {
            return _filename.replace("X", this.getAlias());
        }
        catch (error) {
            console.log(error);
        }
    }
    createPublics(_fields) {
        let _varList = "";
        for (var field of _fields) {
            _varList += '\t' + "public $" + field + ';\n';
        }
        return _varList;
    }
    createExchangeArray(_fields) {
        let _varList = "";
        for (var field of _fields) {
            _varList += `\t\t $this->${field} = $data[defs::${field.toUpperCase()}]; \n`;
        }
        return _varList;
    }
    createConsts(_fields) {
        let _varList = `\n\t const TABLENAME = '${this.getTable()}'\n`;
        for (var field of _fields) {
            _varList += `\t const ${field.toUpperCase()} = '${field}'; \n`;
        }
        return _varList;
    }
}
exports.configService = configService;
//# sourceMappingURL=configService.js.map