"use strict";
class Cycle {
    constructor(_confService) {
        this._confService = _confService;
    }
    cycle() {
        let g = new Promise((resolve, reject) => {
            resolve(this._confService.getTable());
        }).then((res) => {
            console.log("The RES is " + res);
        });
    }
}
exports.Cycle = Cycle;
//# sourceMappingURL=cycle.js.map