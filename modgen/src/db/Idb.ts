
export interface Idb {
  getConnectString():string;
  getQuery(_tableName:string):string;
  getRows():string[];
  configure():void;
}
