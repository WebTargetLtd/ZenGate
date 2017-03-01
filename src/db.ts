/**
 * -----------------------------------------------------------------------------
 * Class        : db.ts
 * Description  :
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 17 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

import { connPgSQL } from './db/types/connPgSQL';
import { connMysql } from './db/types/connMysql';
import { configService } from './configService';

export class db {

    private client: any;
    private _dbInstance: any;
    private _thingy: string;
    private _rows:string[];

    constructor(private _configService: configService) {        
        try {
            console.log("TYPE" + this._configService.getDBParams()["type"]);
            switch (this._configService.getDBParams()["type"]) {
                case 'pg':
                    this._dbInstance = new connPgSQL(_configService);
                    break;
                case 'mysql':
                    this._dbInstance = new connMysql(_configService);
                    break;
                default:
            }
        } catch (error) {
            console.log(`Error in db::constructor :: ${error}`);
        }
        return;
    }
    getColumns():Promise<string[]> {
        return new Promise((resolve, reject) => {
            resolve(this._dbInstance.getColumns());
        }).then((res) => {
            return this._dbInstance.parseResults(res);
        }).catch((error) => {
            console.log(`Error in db::getColumns :: ${error}`);
        });                
    }
    
    private dbInstance() {
        return this._dbInstance;
    }
}
