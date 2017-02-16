import { Replace } from './replace';


export class Home {
    constructor(private _tablename:string, private _namespace:string) {
        console.log("Hello world - the Home thingz");
        let x = new Replace([["table", "t_Users"], ["publics", "public var $Noodle;"]]);
    }
}

var _tablename = typeof process.argv[2] != 'undefined' ? process.argv[2] : 't_user';
var _namespace = typeof process.argv[3] != 'undefined' ? process.argv[3] : 'Auth';

let x = new Home('t_Users', 'Auth');
