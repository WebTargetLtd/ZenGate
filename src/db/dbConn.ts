/**
 * -----------------------------------------------------------------------------
 * Class        : @class dbConn
 * Description  : Replicates the connection parameters that livein dbconfig.json
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 19 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

export class dbConn {
    type: string
    server: string;
    port: string;
    username: string;
    password: string;
    dbname: string;
}
