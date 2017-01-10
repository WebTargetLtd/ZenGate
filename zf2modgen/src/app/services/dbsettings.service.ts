import { Injectable } from '@angular/core';
import { Dbtype } from './dbtype.enum'
import { CfgPostgresql } from './instances/cfg-postgreql';
import { CfgMysql } from './instances/cfg-mysql';
import { defpostgres } from './instances/definitions/defpostgres';
import { defmysql } from './instances/definitions/defmysql';

@Injectable()
export class DbsettingsService {

  private _settings: CfgPostgresql | CfgMysql;

  public getSettings(_dbType: Dbtype) {
    switch (_dbType) {
      case Dbtype.postgreql:
        this._settings = new CfgPostgresql();
        console.log("Opening PostGreSQL settings");
        break;
      case Dbtype.mysql:
        break;
    }
    return this._settings;
  }

  public setSetting(key: string, value: string) {
    if (this._settings.getSettings().hasOwnProperty(key)) {
      this._settings.getSettings()[key] = value;
      localStorage.setItem(this._settings.storagekey, JSON.stringify(this._settings.getSettings()));
      // Now persist
    }
    else {
      console.log(`Attempted to set non existant property "${key}"` );
    }
    console.log(`Property "${key}" changed to "${value}"`);
  }

}
