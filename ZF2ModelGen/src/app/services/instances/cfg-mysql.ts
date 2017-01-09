import { Idbsettings } from '../idbsettings';
import { dbconfig } from '../dbconfig.abstract';

export class CfgMysql extends dbconfig implements Idbsettings {


  tablequery: string; // The query that get table meta data
  getConnectionString(): string {
    return this._connString;
  }
  setConnectionString(connstring: string) {
    this._connString = connstring;
  }
  getTableQuery(){
    return "select * from thistable";
  }
}
