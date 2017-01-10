
import { Idbsettings } from '../idbsettings';
import { defpostgres } from './definitions/defpostgres';

export class CfgPostgresql implements Idbsettings {

  readonly storagekey:string = "zf2modgenPostGres";
  tablequery: string; // The query that get table meta data
  private _settings:defpostgres;

  constructor() {
    this.readSettings();
  }

  /**
    @function readSettings - Reads the settings from the JSON file.
    @returns boolean - true if loaded and parsed.
  */
  private readSettings(): boolean {

    let _status: boolean = false;
    try {

      let data = localStorage.getItem(this.storagekey);
      this._settings = data==null ? new defpostgres : JSON.parse(data);
      if (data === null){
        localStorage.setItem(this.storagekey, JSON.stringify(this._settings));
      }
      _status = true;
    }
    catch(err) {
      console.log('Error in CfgPostgresql::readSettings : ' + err.message);
    }

    return _status;
  }

  getConnectionString() {

    return "uts";
  }
  getTableQuery(_tablename:string) {
    return "select column_name from information_schema.columns where table_name='" + _tablename + "';";    
  }
  getSettings():defpostgres{
    return this._settings;
  }
}
