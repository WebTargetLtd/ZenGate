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

    /*
      Build our config
    */
    constructor(_clArgs: any) {
        try {
          this._ns = _clArgs["namespace"];
          this._table = _clArgs["tablename"];
        } catch (err) {
          console.log("Error creating configService :: " + err);
        }

    }

    public getNamespace():string{
      return this._ns;
    }
    public getTable():string{
      return this._table;
    }

    public getDBParams(_key?: string): dbConn {
        if (_key === undefined) {
            // Get default from the config file, and use it as a key
            _key = this.cf.default;
        }
        return this.cf[_key];
    }

}
