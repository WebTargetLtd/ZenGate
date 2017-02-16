import { Replace } from './replace';


export class Setup {
    constructor(private _tablename:string, private _namespace:string) {

        console.log(this.getDBParams("rimacondb"));
        let x = new Replace('../templates/src/X.php', [["{$table}", "t_Users"], ["{$publics}", "public var $Noodle;"]]);

    }

    getDBParams(_key?:string):Object{

      let cf = require("../dbconfig.json");
      return cf;

    }

}
