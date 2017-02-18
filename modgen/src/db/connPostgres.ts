import { Idb } from './Idb';
import { cla } from '../consts/cla';
import { dbBase } from './dbBase';

export class connPostgres extends dbBase implements Idb {

    private _client: any;
    private pg = require('pg');

    constructor() {
        super();
        console.log("require('pg')");
        // this._client = new this.pg.Client();
    }
    configure() {

    };

    getRows(): string[] {

        // Get connection
        console.log(this.getConnectString());

        return ["Noodle", "Doodle"];
    }

    getConnectString(): string {
        try {
            let _p = this.getDBParams();
            let _connstring = `postgres://${_p[cla.username]}:${_p[cla.password]}@${_p[cla.server]}/${_p[cla.dbname]}`;
            return _connstring;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    getQuery(_tableName: string): string {
        return `select column_name from information_schema.columns where table_name='${_tableName}';`;
    }

}
