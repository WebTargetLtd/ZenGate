/**
 * -----------------------------------------------------------------------------
 * Class        : configService.ts
 * Description  : Generic configuration class.
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 19 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

import { dbConn } from './db/dbConn';

export class configService {

    private cf = require("../dbconfig.json");
    private _ns: string;
    private _table: string;
    private _alias: string;
    private _datecreated: string;
    private _author: string;
    private _fileroot: string;
    private _outputfolder: string;
    private _connection: string;
    private _rows: string[];

    constructor(_clArgs: any) {
        try {
            this._ns = _clArgs["namespace"] == null ? 'Application' : _clArgs["namespace"];
            this._table = _clArgs["tablename"] == null ? 't_user' : _clArgs["tablename"];
            this._alias = _clArgs["tablealias"] == null ? this._table : _clArgs["tablealias"];
            this._datecreated = _clArgs["datecreated"];
            this._author = _clArgs["author"] == null ? this.getParam("author") : _clArgs["author"];
            this._fileroot = this.getParam("fileroot");
            this._outputfolder = this.getParam("outputfolder");
            this._connection = _clArgs["connection"] == undefined ? this.cf.default : _clArgs["connection"];
        } catch (err) {
            console.log("Error creating configService :: " + err);
        }
    }

    public setRows(_rows: string[]): void { this._rows = _rows; }
    public getDateCreated(): string { return this._datecreated; }
    public getNamespace(): string { return this._ns; }
    public getTable(): string { return this._table; }
    public getAlias(): string { return this._alias; }
    public getAuthor(): string { return this._author; }
    public getFileroot(): string { return this._fileroot; }
    public getOutputfolder(): string { return this._outputfolder; }
    public getParam(_key: string): string { return this.cf[_key]; }
    public getDBParams(_key?: string): dbConn {
        if (_key === undefined) { _key = this._connection; }
        return this.cf[_key];
    }

    // Generating functions start here ---------------------------------------------

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method generateFilename
     * Description  : @description Replace the blank 'X' with the table name
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public generateFilename(_filename: string): string {
        try {
            return _filename.replace("X", this.getAlias());
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method createPublics
     * Description  : @description Creates a list of public variables representing 
     *                  the columns of the table
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public createPublics(_fields: string[]): string {
        let _varList: string = "";
        for (var field of _fields) {
            _varList += '\t' + "public $" + field + ';\n';
        }
        return _varList;
    }

    /**
      * -----------------------------------------------------------------------------
      * Method       : @method createExchangeArray
      * Description  : @description Creates an exchange array from columns 
      * Notes        : 
      * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
      * Created Date : 28 Feb 2017
      * -----------------------------------------------------------------------------
      * Date?        Whom?           Notes
      * _____________________________________________________________________________
      */
    public createExchangeArray(_fields: string[]): string {
        let _varList: string = "";
        for (var field of _fields) {
            _varList += `\t\t $this->${field} = $data[defs::${field.toUpperCase()}]; \n`;
        }
        return _varList;
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method createConsts
     * Description  : @description Creates constants for definitions from columns
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public createConsts(_fields: string[]) {
        let _varList: string = `\n\t const TABLENAME = '${this.getTable()}'\n`;
        for (var field of _fields) {
            _varList += `\t const ${field.toUpperCase()} = '${field}'; \n`;
        }
        return _varList;
    }

    // Generating functions end  here -----------------------------------------------
}

