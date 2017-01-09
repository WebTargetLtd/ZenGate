export abstract class dbconfig {

  protected _connString:string;
  protected _tablequery:string;

  constructor(private server:string,
              private port:number,
    private username:string,
    private password:string,
    private database:string){
  }
  getConnectionString(): string {
    return this._connString;
  }


}
