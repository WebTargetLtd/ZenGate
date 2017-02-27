import { configService } from './configService';
import { db } from './db';
import { Replace } from './replace';


export class Cycle {

    private _db: db;
    private _columns: string[];
    private _replace: Replace;

    public constructor(private _confService: configService) {
        try {
            this._db = new db(_confService);
            this.doThing();
            // this.cycle();



        } catch (error) {

        }
    }
    doThing() {
        let xTable = new Replace(this._confService.getFileroot() + 'XTable.php', [
            ["${table}", this._confService.getAlias()],
            ["${namespace}", this._confService.getNamespace()],
            ["${created}", this._confService.getDateCreated()],
            ["${author}", this._confService.getAuthor()]
        ]);
        let xFile = xTable.getFile();
        let ff = eval('`' + xFile + '`');

    }

    doReplacements(_columns: string[]) {
        let xTable = new Replace(this._confService.getFileroot() + 'XTable.php', [
            ["${table}", this._confService.getAlias()],
            ["${namespace}", this._confService.getNamespace()],
            ["${created}", this._confService.getDateCreated()],
            ["${author}", this._confService.getAuthor()]
        ]);
        // console.log(xTable.createPublics(_columns));
        let X = new Replace(this._confService.getFileroot() + 'X.php', [
            ["{$table}", this._confService.getAlias()],
            ["{$namespace}", this._confService.getNamespace()],
            ["{$created}", this._confService.getDateCreated()],
            ["{$author}", this._confService.getAuthor()],
            ["{$publics}", xTable.createPublics(_columns)]

        ]);

        let xTRes = new Promise((resolve, reject) => {
            resolve(xTable.getFile());

        }).then((res) => {
            xTable.doReplace(res);
            console.log("PAP" + res);
        }).catch((error) => {

            console.log("Erorr " + error);
        });
    };


    public cycle(): void {
        let g = new Promise((resolve, reject) => {
            // Resolve getcolumns
            // Resolve replacement
            // Resolve write file
            resolve(this._db.getRows());
        }).then((res: string[]) => {
            // this._columns = res;
            this.doReplacements(res);
        });


    }

}
