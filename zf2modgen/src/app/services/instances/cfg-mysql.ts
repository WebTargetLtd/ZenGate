import { Idbsettings } from '../idbsettings';
import { defmysql } from './definitions/defmysql';

export class CfgMysql implements Idbsettings {

  private _settings:defmysql;

  readonly storagekey:string = 'mysqlsettings';
  tablequery: string; // The query that get table meta data
  getConnectionString(): string {
    return "this._connString";
  }
  getTableQuery(_tablename:string){
    return "select column_name from information_schema.columns where table_name='" + _tablename + "';";    
  }
  getSettings():defmysql{
    return this._settings;
  }

}
