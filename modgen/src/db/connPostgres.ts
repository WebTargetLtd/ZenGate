/**
 * -----------------------------------------------------------------------------
 * Class        : connPostgres.ts
 * Description  : PostGreSQL implementation.
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 19 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

import { Idb } from './Idb';
import { dbConn } from './dbConn';
import { configService } from '../configService';


export class connPostgres implements Idb {

    private _client: any;
    private _pConn: dbConn;
    private _pg = require('pg');

    constructor(private _cs: configService) {
        this.configure();
    }
    configure() {
        this._pConn = this._cs.getDBParams();
        this._client = new this._pg.Client(this.getConnectString());
    }

    getRows(_callback:any, _message:string): string[] {
      let _rows:string[];
        try {
            let _cs = this.getConnectString();
            let _qry = this.getQuery();
            let _cl = this._client;
            let _dbconf = this._cs;
            this._client.connect(function(err: any) {
                if (err) throw err;
                console.log("The query is " + _qry);
                _cl.query(_qry, null, function(err: any, _res: any) {
                    if (err) throw err;
                    if (_res.length === undefined){ console.log("No rows found"); }
                    _callback(_res, _message);
                    // Disconnect the client
                    _cl.end(function(err: any) {
                        if (err) throw err;
                    });
                });
            });
        }
        catch (err) {
            console.log("Query error: " + err);
        }
        return [];
    }

    getConnectString(): string {
        try {
            return `postgres://${this._pConn.username}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    getQuery(_tableName?: string): string {

        return `select column_name from information_schema.columns where table_name='${this._cs.getTable()}';`;
    }

    testConnection() {
        return true;
    };

}
