import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DbsettingsService as dbconf }  from './services/dbsettings.service';
import { Dbtype } from './services/dbtype.enum';
import { AppComponent } from './app.component';
import { MaterialModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
  ],
  providers: [dbconf],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private _dbServ: dbconf) {
    this.balls();
  }
  public balls() {
    this._dbServ.getSettings(Dbtype.postgreql);
    this._dbServ.setSetting("username", "poobum");

  }

}
