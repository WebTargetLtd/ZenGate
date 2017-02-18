import { Idb } from './Idb';

export class connMysql implements Idb {
  getConnectString():string{
    return "";
  };
  getQuery():string{
      return "";
  }
    getRows():string[]{
      return [""];
    }
    configure():void{
      
    }
}
