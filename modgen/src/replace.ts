// https://code-maven.com/reading-a-file-with-nodejs
// http://stackoverflow.com/questions/39584241/es6-string-interpolation-from-file-content

export class Replace {

    public _file: any;
    private _fs = require('fs.promised');

    constructor(private _filename: string, private _data: [[string, string]]) {
        try {
        }
        catch (err) {
            console.log(err);
        }
    }

    public getFile(): string {
        var contents = this._fs.readFileSync(this._filename, 'utf8');
        console.log("Some things :: " + contents);
        return contents;
        /*
        return new Promise((resolve, reject) => {
            resolve(this._fs.readFile(this._filename, "utf-8", (err: string, data: string) => { }));
        }).then((output) => {
            return output;
        }).catch((err) => {
            console.log("Catch Error on replace::getFile() : " + err);
        });
        */
    }
    public doReplace(_filecontents: string): string {
        console.log(_filecontents);
        let output: string;
        for (var _item of _filecontents) {
            // console.log(_item[0] + " - " + _item[1]);
            output = output.split(_item[0]).join(_item[1]);
        }

        return output;

    }
    public doReplace2(): Promise<string> {
        let output: string;
        console.log(this._data);
        return new Promise((resolve, reject) => {
            resolve(this._fs.readFile(this._filename, "utf-8", (err: string, data: string) => {
                output = data;
                console.log("MEh");
                for (var _item of this._data) {
                    console.log(_item[0] + " - " + _item[1]);
                    output = output.split(_item[0]).join(_item[1]);
                }
            }));
        }).then((output) => {

            return output;
        }).catch((err) => {
            console.log("Catch Error on replace::doReplace() : " + err);
        });
    }
    public createPublics(_fields: string[]) {
        let _varList: string = "";
        for (var field of _fields) {
            _varList += "public $" + field + ';\n';
        }
        return _varList;
    }
    public createExchangeArray(_fields: string[]) {

    }
}
