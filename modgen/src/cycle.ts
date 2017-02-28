import { configService } from './configService';
import { db } from './db';
import { Replace } from './replace';

/**
 * -----------------------------------------------------------------------------
 * Name         : Cycle
 * Description  : The Cycle module is the engine
 * Notes        : .
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 28 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?           Notes
 * _____________________________________________________________________________
 */
export class Cycle {

    private _db: db;
    private _columns: string[];
    private _replace: Replace;

    /**
     * -----------------------------------------------------------------------------
     * Method       : @constructor
     * Description  : @description Sets up kicks off the replace services
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public constructor(private _confService: configService) {
        try {
            this._db = new db(_confService);
            this.setupOutput();
            this.run();
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method process
     * Description  : @description Called from the run() callback after retrieving
     *                  database columns, this wrapper function executes all of the
     *                  replacement funcions in this class
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public process(_columns: string[]): void {

        console.log(`doTable status :  ${this.doTable()}`);
        console.log(`doEntity status :  ${this.doEntity(_columns)}`);
        console.log(`doDefs status :  ${this.doDefs(_columns)}`);
        console.log(`doFactory status :  ${this.doFactory()}`);
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method run
     * Description  : @description A Promise that gets DB columns for our table.
     * Notes        : 
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    public run(): void {
        let g = new Promise((resolve, reject) => {
            resolve(this._db.getColumns());
        }).then((res: string[]) => {
            this.process(res);
        });

    }


    /**
     * -----------------------------------------------------------------------------
     * Method       : @method setupOutput
     * Description  : @description Create the output folders ready to receive definitions
     * Notes        : Uses template strings and paths from the configService     
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    private setupOutput() {
        try {
            let _mkdirp = require('mkdirp');
            let _folder = `${this._confService.getOutputfolder()}${this._confService.getAlias()}/Definitions`;
            _mkdirp.sync(_folder);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method doTable
     * Description  : @description Calls replace function for 'XTable.php'
     * Notes        :      
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    private doTable(): boolean {
        let _oFile = `${this._confService.getOutputfolder()}${this._confService.getAlias()}/${this._confService.generateFilename('XTable.php')}`;
        return new Replace(this._confService.getFileroot() + 'XTable.php', _oFile,
            {
                table: this._confService.getAlias(),
                namespace: this._confService.getNamespace(),
                created: this._confService.getDateCreated(),
                author: this._confService.getAuthor()
            }
        ).createFile();

    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method doEntity
     * Description  : @description Calls replace function for 'X.php'
     * Notes        :      
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */
    private doEntity(_columns: string[]): boolean {
        let _oFile = `${this._confService.getOutputfolder()}${this._confService.getAlias()}/${this._confService.generateFilename('X.php')}`;
        return new Replace(this._confService.getFileroot() + 'X.php', _oFile,
            {
                table: this._confService.getAlias(),
                namespace: this._confService.getNamespace(),
                created: this._confService.getDateCreated(),
                author: this._confService.getAuthor(),
                publics: this._confService.createPublics(_columns),
                exchangearray: this._confService.createExchangeArray(_columns)
            }
        ).createFile();
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method doDefs
     * Description  : @description Calls replace function for 'defX.php'
     * Notes        :      
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */

    private doDefs(_columns: string[]): boolean {
        let _oFile = `${this._confService.getOutputfolder()}${this._confService.getAlias()}/Definitions/${this._confService.generateFilename('defX.php')}`;
        return new Replace(this._confService.getFileroot() + 'defX.php',
            _oFile,
            {
                table: this._confService.getAlias(),
                namespace: this._confService.getNamespace(),
                created: this._confService.getDateCreated(),
                author: this._confService.getAuthor(),
                consts: this._confService.createConsts(_columns)
            }
        ).createFile();
    }

    /**
     * -----------------------------------------------------------------------------
     * Method       : @method doFactory
     * Description  : @description Calls replace function for 'factory.php'
     * Notes        :      
     * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
     * Created Date : 28 Feb 2017
     * -----------------------------------------------------------------------------
     * Date?        Whom?           Notes
     * _____________________________________________________________________________
     */

    private doFactory(): boolean {
        let _oFile = `${this._confService.getOutputfolder()}${this._confService.getAlias()}/${this._confService.generateFilename('factoryX.php')}`;
        return new Replace(this._confService.getFileroot() + 'factory.php',
            _oFile,
            {
                table: this._confService.getAlias(),
                namespace: this._confService.getNamespace(),
                tablename: this._confService.getTable()
            }
        ).createFile();
    }
}
