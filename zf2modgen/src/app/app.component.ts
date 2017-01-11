import { Component } from '@angular/core';
import {  MdTabsModule } from '@angular/material';
import { DbsettingsService as dbconn } from './services/dbsettings.service';
import { Dbtype } from './services/dbtype.enum';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';


   private _fields:any
  constructor(private _dbconn:dbconn){
      this.getConn();
      this._fields = this._dbconn.getSettings(Dbtype.postgreql).getSettings();
  }
  public getConn(){

    console.log(JSON.stringify(this._fields));
    return this._dbconn;
  }

}
