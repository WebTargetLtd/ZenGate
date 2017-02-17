import { Replace } from './replace';
import { db } from './db';
import { cla } from './consts/cla';


export class Setup {
    constructor(private _args:Object) {
      // console.log(this.getDBParams()[cla.username]);
      // let g = new db();
      console.log("Namespace is " + _args["namespace"]);
      this.doReplacements();


    }
    doReplacements(){
      let x = new Replace('../templates/src/XTable.php', [
        ["{$table}", "User"],
        ["{$namespace}", this._args["namespace"]],
        ["{$created}", this._args["datecreated"]],
      ]).doReplace();
      console.log(x);

    }
    getDBParams(_key?:string):Object{
      let cf = require("../dbconfig.json");
      if (_key === undefined){
        // Get default from the config file.
        // And use it as a key
        _key = cf.default;
      }
      return cf[_key];

    }

}
