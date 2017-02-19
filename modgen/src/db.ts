/**
 * -----------------------------------------------------------------------------
 * Class        : db.ts
 * Description  :
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.SMith@Computors.com>
 * Created Date : 17 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

import { cla } from './consts/cla';
import { connPostgres } from './db/connPostgres';
import { configService } from './configService';

export class db {

    private client: any;
    private _dbInstance: any;
    // private _configService:configService;

    constructor(private _configService:configService) {
        // this._configService = new configService();

        console.log(_configService.getDBParams() );
        switch (this._configService.getDBParams()["type"]) {
            case 'pg':
                this._dbInstance = new connPostgres(_configService); // require('connPostgres');
                break;
            case 'mysql':
                this._dbInstance = require('./db/connMysql');
                break;
            default:
                // console.log(`DB Type '${_type}' does not exist. Cannot create a connection of Idb type`);
        }
         // console.log(JSON.stringify(this._dbInstance.getConnectString()));
         this.getRows();
    }
    getRows():string[]{
      return this._dbInstance.getRows();
    }

    private dbInstance(){
        return this._dbInstance;
    }
    /*
    retrieve(_callback): void {
        let _qry = this.getQuery();

        this.pg.connect(this.getConnectString(), function(err, client, done) {
            if (err) {
                return console.error('error fetching client from pool', err);
            }
            client.query(_qry, function(err, result) {
                done();
                // console.log(JSON.stringify(result));

                if (err) {
                    return console.log('error running query', err);
                } else {
                    _callback("this._args", result.rows);
                }
                return result;
            });
        });

    }
    */
}
