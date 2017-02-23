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
import { Replace } from './replace';

export class db {

    private client: any;
    private _dbInstance: any;
    private _thingy:string;

    constructor(private _configService: configService) {
        // this._configService = new configService();
        this._thingy = "Poop";
        console.log(_configService.getDBParams());
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
    getRows(): string[] {
        this._dbInstance.getRows(this.writeColumns, "Blimpy McBlimp");
        return;
    }
    writeColumns(_rows: string[], _message:string): void {
        console.log("A message " + _message);
        for (var item of _rows["rows"]){
          // this._columns.push(item);
          console.log("My Item " + JSON.stringify(item.column_name));
        }
        // let rp = new Replace('myfile', );
    }


    private dbInstance() {
        return this._dbInstance;
    }
}
