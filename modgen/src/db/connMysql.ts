import { Idb } from './Idb';
import {dbConn } from './dbConn';
import { configService } from '../configService';

export class connMysql implements Idb {

  private _pConn: dbConn;

  constructor(private _cs:configService) {
      this.configure();
  }
  configure() {
      this._pConn = this._cs.getDBParams();
  }

    getConnectString(): string {
        return "";
    };
    getQuery(): string {
        return "";
    }
    getRows(): string[] {
        return [""];
    }
    testConnection() {
        return false;
    };
}
