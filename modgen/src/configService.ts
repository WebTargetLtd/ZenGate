/**
 * -----------------------------------------------------------------------------
 * Class        : dbBase.ts
 * Description  : Any generic database functionality can be stuffed in here
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

    private _rows: string[];

    /*
      Build our config
    */
    constructor(_clArgs: any) {
        try {
            this._ns = _clArgs["namespace"] == null ? 'Risk' : _clArgs["namespace"];
            this._table = _clArgs["tablename"] == null ? 't_user' : _clArgs["tablename"];
            this._alias = _clArgs["tablealias"] == null ? this._table : _clArgs["tablealias"];
            this._datecreated = _clArgs["datecreated"];
            this._author = _clArgs["author"] == null ? this.getParam("author") : _clArgs["author"];
            this._fileroot = this.getParam("fileroot");
            this._outputfolder = this.getParam("outputfolder");

        } catch (err) {
            console.log("Error creating configService :: " + err);
        }
    }


    public setRows(_rows: string[]): void {this._rows = _rows;}
    public getDateCreated(): string { return this._datecreated; }
    public getNamespace(): string { return this._ns; }
    public getTable(): string { return this._table; }
    public getAlias(): string { return this._alias; }
    public getAuthor(): string { return this._author; }
    public getFileroot(): string { return this._fileroot; }
    public getOutputfolder(): string { return this._outputfolder; }
    public getParam(_key: string): string { return this.cf[_key]; }
    public getDBParams(_key?: string): dbConn {
        if (_key === undefined) {
            // Get default from the config file, and use it as a key
            _key = this.cf.default;
        }
        return this.cf[_key];
    }
}
