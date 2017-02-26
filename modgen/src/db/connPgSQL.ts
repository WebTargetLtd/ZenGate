import {configService} from '../configService';
import { dbConn } from './dbConn';

export class connPgSQL {

    private _pConn: Object;
    private _pgp = require('pg-promise');

    // private _client: pg-prom

    constructor(private _cs: configService) {
        try {
            this.configure();
        }
        catch (err) {
            console.log("Error in constructor of PgSQL : " + err);
        }
    }
    configure() {
       this._pConn = this._convertParams(); // ._cs.getDBParams();
        console.log(this._convertParams());
        console.log("PGP : " + this._pgp(this._convertParams()).connect());
        // this._client = new this._pg.Client(this.getConnectString());
        // console.log(this._client);
    }

    // Read http://stackoverflow.com/questions/34382796/where-should-i-initialize-pg-promise/34427278#34427278
    
    getConnectString(): string {
        try {
            return `postgres://${this._pConn.user}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    getRows(): string[] {

        return [""];

    }

    private _convertParams():Object{
      let _conn = {
        user:"",
        database: "",
        port: "",
        host:"",
        password: ""
      };


      try{
          _conn.user = this._cs.getDBParams().username;
          _conn.database = this._cs.getDBParams().dbname;
          _conn.port = this._cs.getDBParams().port;
          _conn.host = this._cs.getDBParams().server;
          _conn.password = this._cs.getDBParams().password;
      }
      catch(err){
        console.log("Error in _convertParams :: "  + err);
      }
      return _conn;

    }
}
