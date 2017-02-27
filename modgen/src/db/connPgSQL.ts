import { configService } from '../configService';
import { dbConn } from './dbConn';

export class connPgSQL {

    private _pConn: dbConn;
    private _pgp = require('pg-promise')({});
    private _db: Object;

    constructor(private _cs: configService) {
        try {
            this.configure();
            console.log("Conn String :: " + this.getConnectString());
        }
        catch (err) {
            console.log("Error in constructor of PgSQL : " + err);
        }
    }
    configure() {
        try {
            this._pConn = this._cs.getDBParams();
            this._db = this._pgp(this.getConnectString());

        } catch (error) {
            console.log("Error in PgSQL->configure : " + error);
        }
    }

    // Read http://stackoverflow.com/questions/34382796/where-should-i-initialize-pg-promise/34427278#34427278

    getConnectString(): string {
        try {
            return `postgres://${this._pConn.username}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    /**
     * function: getRows()
     * 
     */
    getRows(): string[] {
        return this._db.query(this.getQuery());
   }
    parseResults(_results: string[]): string[] {
        let _columns:string[]= [];
        try {
            for (var column of _results) {
                _columns.push(column.column_name);
            }
        } catch (error) {
            console.log("Error in parseResults :: " + error);
        }
        // console.log("Have returned these columns::" + JSON.stringify(_columns));
        return _columns;

    }
    getQuery(_tableName?: string): string {
        return `select column_name from information_schema.columns where table_name='${this._cs.getTable()}';`;
    }

    private _convertParams(): Object {
        let _conn = {
            user: "",
            database: "",
            port: "",
            host: "",
            password: ""
        };


        try {
            _conn.user = this._cs.getDBParams().username;
            _conn.database = this._cs.getDBParams().dbname;
            _conn.port = this._cs.getDBParams().port;
            _conn.host = this._cs.getDBParams().server;
            _conn.password = this._cs.getDBParams().password;
        }
        catch (err) {
            console.log("Error in _convertParams :: " + err);
        }
        return _conn;

    }
}
