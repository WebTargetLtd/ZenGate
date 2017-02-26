import { configService } from './configService';


export class Cycle {

    public constructor(private _confService:configService) {

    }

    public cycle(): void {

        // Get all the strings[] and compress them into an array to chuck in

        let g = new Promise((resolve, reject) => {

            // Resolve getcolumns
            // Resolve replacement
            // Resolve write file
            resolve(this._confService.getTable());
        }).then((res) => {
            console.log("The RES is " + res);
        });


    }

}
