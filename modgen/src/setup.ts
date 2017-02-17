import { Replace } from './replace';
import { cla } from './consts/cla';


export class Setup {
    constructor(_args:string) {
      console.log(this.getDBParams()[cla.dbname]); //_args.connection));
        // let x = new Replace('../templates/src/X.php', [["{$table}", "t_Users"], ["{$publics}", "public var $Noodle;"]]);
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
