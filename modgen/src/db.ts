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
import { connPgSQL } from './db/connPgSQL';

import { configService } from './configService';


export class db {

    private client: any;
    private _dbInstance: any;
    private _thingy: string;
    private _rows:string[];

    constructor(private _configService: configService) {
        // this._configService = new configService();
        try {
            switch (this._configService.getDBParams()["type"]) {
                case 'pg':
                    this._dbInstance = new connPgSQL(_configService); // require('connPostgres');
                    break;
                case 'mysql':
                    this._dbInstance = require('./db/connMysql');
                    break;
                default:
            }
        } catch (error) {
            console.log("Error in db.ts constructor :: " + error);
        }
        return;
    }
    getRows():Promise<string[]> {
        return new Promise((resolve, reject) => {
            resolve(this._dbInstance.getRows());
        }).then((res) => {
            return this._dbInstance.parseResults(res);        
        }).catch((err) => {
            console.log("Catch Error on db::getRows : " + err);  
        });                
    }
    
    private dbInstance() {
        return this._dbInstance;
    }
}
