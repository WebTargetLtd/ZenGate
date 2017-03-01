/**
 * -----------------------------------------------------------------------------
 * Class        : @class Idb.ts
 * Description  : @description Interface that each db type should implement.
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
  getColumns(): string[];
  testConnection(): boolean;
  parseResults(_results: string[]): string[];
}
