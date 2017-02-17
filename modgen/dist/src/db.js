"use strict";
class db {
    constructor() {
        this.pg = require('pg');
        this.client = new this.pg.Client();
        console.log("constructor for pg");
    }
    connect() {
    }
    getClient() {
        return this.client;
    }
}
exports.db = db;
//# sourceMappingURL=db.js.map