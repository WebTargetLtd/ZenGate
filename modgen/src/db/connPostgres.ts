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

    getRows(): string[] {

        try {
            let _cs = this.getConnectString();
            let _qry = this.getQuery();
            let _cl = this._client;
            // console.log(JSON.stringify(this._client));
            // return [""];
            this._client.connect(function(err: any) {
                if (err) throw err;

                // execute a query on our database
                _cl.query(_qry, function(err: any, result: any) {
                    if (err) throw err;

                    // just print the result to the console
                    console.log(result); //.rows[0]); // outputs: { name: 'brianc' }

                    // disconnect the client
                    _cl.end(function(err: any) {
                        if (err) throw err;
                    });
                });
            });
        }
        catch (err) {
            console.log(err);
        }
        return ["Noodle", "Doodle"];
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
