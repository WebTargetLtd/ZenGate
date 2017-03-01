import { configService } from '../../configService';
import { dbConn } from '.././dbConn';
import { Idb } from '../Idb';

export class connPgSQL implements Idb {

    private _pConn: dbConn;
    private _pgp = require('pg-promise')({});
    private _db: Object;

    constructor(private _cs: configService) {
        try {
            this.configure();
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
     * Method       : @method configure
     * Description  : @description Sets up the PgSQL db connection
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    private configure() {
        try {
            this._pConn = this._cs.getDBParams();
            this._db = this._pgp(this.getConnectString());
        } catch (error) {
            console.log(`Error in configure :: ${error}`);
        }
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
            return `postgres://${this._pConn.username}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (error) {
            console.log(`Error in getConnectString :: ${error}`);
        }
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
