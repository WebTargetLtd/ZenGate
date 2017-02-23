/**
 * -----------------------------------------------------------------------------
 * Class        : Idb.ts
 * Description  : Interface that each db type should implement.
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 19 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */
import { configService } from '../configService';
export interface Idb {
  getConnectString():string;
  getQuery(_tableName:string):string;
  getRows(_callback:any, _message:string):string[];
  configure(_cs:configService):void;
  testConnection():boolean;
}
