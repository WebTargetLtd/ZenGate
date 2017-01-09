import { Injectable } from '@angular/core';
import { Dbtype } from './dbtype.enum'
import  { CfgPostgresql } from './instances/cfg-postgreql';
import  { CfgMysql } from './instances/cfg-mysql';


@Injectable()
export class DbsettingsService {

  private _settings: any;

  constructor(private _dbType: Dbtype) {

    switch (_dbType) {
      case Dbtype.postgreql:
        this._settings = new CfgPostgresql('localhost', 5432, 'username', 'password', 'mydb');
        break;
      case Dbtype.mysql:
        break;

    }
  }

  public getSettings() {
    return this._settings;
  }

}
