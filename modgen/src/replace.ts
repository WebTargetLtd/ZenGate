/**
 * -----------------------------------------------------------------------------
 * Name         : @class Replace
 * Description  : The Replace module does the substituting.
 * Notes        : 
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 28 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?           Notes
 * _____________________________________________________________________________
 */
export class Replace {

    public _file: string;
    private _fs = require('fs');
    private _template = require('es6-template-strings');

    /**
     * -----------------------------------------------------------------------------
     * Method       : @constructor
     * Description  : 
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    constructor(private _filename: string, private _outputfilename: string, private _data: Object) {
        try {
        }
        catch (err) {
            console.log(err);
        }
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method createFile
     * Description  : @description Create the output file
     * Notes        : Uses template strings and paths from the configService
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public createFile(): boolean {
        try {
            let compile = require('es6-template-strings/compile'),
                resolveToString = require('es6-template-strings/resolve-to-string');
            this._file = this._fs.readFileSync(this._filename, 'utf8');
            let _compiled = compile(this._file);
            let _contents = (resolveToString(_compiled, this._data));
            this._fs.writeFileSync(this._outputfilename, _contents);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method getFile
     * Description  : @description Syncronously loads a file from the disk
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public getFile(): string {
        var contents = this._fs.readFileSync(this._filename, 'utf8');
        console.log("Some things :: " + contents);
        return contents;
    }

}
