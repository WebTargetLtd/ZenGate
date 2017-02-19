/**
 * -----------------------------------------------------------------------------
 * Class        : dbBase.ts
 * Description  : Any generic database functionality can be stuffed in here
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 19 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

import { dbConn } from './dbConn';

export class dbBase {

  private cf = require("../../dbconfig.json");

  getDBParams(_key?: string): dbConn {
      if (_key === undefined) {
          // Get default from the config file, and use it as a key
          _key = this.cf.default;
      }
      return this.cf[_key];
  }

}
