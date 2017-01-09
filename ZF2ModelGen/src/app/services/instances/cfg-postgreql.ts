
import { Idbsettings } from '../idbsettings';
import { dbconfig } from '../dbconfig.abstract';

export class CfgPostgresql extends dbconfig implements Idbsettings {


  tablequery: string; // The query that get table meta data
  setConnectionString(connstring: string) {
    this._connString = connstring;
  }
  getTableQuery(){
    return "select * from thistable";
  }
}
