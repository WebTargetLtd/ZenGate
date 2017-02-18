export class dbBase {

  private cf = require("../../dbconfig.json");

  getDBParams(_key?: string): Object {
      if (_key === undefined) {
          // Get default from the config file, and use it as a key
          _key = this.cf.default;
      }
      return this.cf[_key];
  }

}
