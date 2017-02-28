// https://github.com/mysqljs/mysql
// https://www.npmjs.com/package/promise-mysql

import { Idb } from '.././Idb';
import { dbConn } from '.././dbConn';
import { configService } from '../../configService';

export class connMysql implements Idb {
    private _pConn: dbConn;
    private _mysql = require('mysql');
    private _db: Object;

    constructor(private _cs: configService) {
        try {
            console.log("WOOHOO");
            this._pConn = this._cs.getDBParams();
            this._db = this._mysql.createConnection(this.getConnectString());
        }
        catch (error) {
            console.log(`Error in constructor :: ${error}`);
        }
    }
    public getColumns(): string[] {
        return this._db.query(this.getQuery());
    }
    public testConnection(): boolean {
        return true;
    }


    /**
     * -----------------------------------------------------------------------------
     * Method       : @method parseResults
     * Description  : @description Takes the results that come in as {column_name: 'user_id'}
     *                  and makes them into a string array of just columns.
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public parseResults(_results: string[]): string[] {
        let _columns: string[] = [];
        try {
            for (var column of _results) {
                _columns.push(column["column_name"]);
            }
        } catch (error) {
            console.log(`Error in parseResults :: ${error}`);
        }
        console.log("Have returned these columns::" + JSON.stringify(_columns));
        return _columns;

    }

    /**
      * -----------------------------------------------------------------------------
      * Method       : @method getConnectString
      * Description  : @description Builds a connection string from our config service
      * Notes        : 
      * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
      * Created Date : 28 Feb 2017
      * -----------------------------------------------------------------------------
      * Date?        Whom?           Notes
      * _____________________________________________________________________________
      */
    private getConnectString(): string {
        try {
            return `mysql://${this._pConn.username}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (error) {
            console.log(`Error in getConnectString :: ${error}`);
        }
    }

    /**
    * -----------------------------------------------------------------------------
    * Method       : @method getQuery
    * Description  : @description The query that gets the column names
    * Notes        : 
    * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
    * Created Date : 28 Feb 2017
    * -----------------------------------------------------------------------------
    * Date?        Whom?           Notes
    * _____________________________________________________________________________
    */
    private getQuery(_tableName?: string): string {
        return `select column_name from information_schema.columns where table_name='${this._cs.getTable()}';`;
    }


}
