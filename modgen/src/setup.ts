/**
 * -----------------------------------------------------------------------------
 * Class        : setup.ts
 * Description  : Starts the process rolling.
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 19 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */
 import { Replace } from './replace';
import { db } from './db';
import { cla } from './consts/cla';
import { configService } from './configService';

export class Setup {
    constructor(private _cs:configService) {

      let _db = new db(_cs);
      // _db.retrieve(this.doReplacements);
      // console.log("Namespace is " + _args["namespace"]);
      // this.doReplacements();

    }
/*
    doReplacements(_args:Object, _rows:Object){
      let xTable = new Replace('../templates/src/XTable.php', [
        ["{$table}", "User"],
        ["{$namespace}", _args["namespace"]],
        ["{$created}", _args["datecreated"]],
      ]).doReplace();
*/


      // console.log(xTable);



}
