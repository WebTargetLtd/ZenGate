import { Replace } from './replace';
import { db } from './db';
import { cla } from './consts/cla';


export class Setup {
    constructor(private _args:Object) {
      // console.log(this.getDBParams()[cla.username]);
      // let _db = new db(_args, 'pg');
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
