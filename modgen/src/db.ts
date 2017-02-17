

export class db {

  private pg = require ('pg');
  private client:any;
 // = undefined;

  constructor(){

    this.client = new this.pg.Client();
    console.log("constructor for pg");
    // this.ff = new this.pg();
    //this.ff = new this.pg();

    // console.log(this.getClient());


  }

  connect(){

  }
  getClient():Object
  {
    return this.client;
  }
}
