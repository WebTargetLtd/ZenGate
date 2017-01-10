import {defpostgres} from './instances/definitions/defpostgres';
import {defmysql} from './instances/definitions/defmysql';

export interface Idbsettings {

    readonly storagekey:string;
    getConnectionString():string;

    /**
    @function getTableQuery
    @returns string
    */
    getTableQuery(string):string;
    getSettings():defpostgres|defmysql;

}
