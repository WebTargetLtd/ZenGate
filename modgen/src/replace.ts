export class Replace {

    public _file: any;

    constructor(_filename:string, private _data: [[string, string]]) {

        try {

            let fs = require('fs');
            console.log("Replace constructor");

            fs.readFile(_filename, "utf-8", (err: string, data: string) => {
                if (err) throw err;
                let output: string = data;
                for (var _item of _data) {
                    console.log(_item[0] + " - " + _item[1]);
                    output = output.split(_item[0]).join(_item[1]);
                }
                console.log("Smarty" + output);
            });

        }
        catch (err) {
            console.log(err);
        }

    }

    public doReplace(_index: number, _searchreplacearray: [string, string, string]): boolean {
        return false;
    }

}


// Similarly TypeScript has no trouble going through a string character by character using for...of:
