export class Replace {

    public _file:any;

    constructor(private _data:[[string, string]]) {
        console.log("Replace constructor");


        let _file = "";


    }

    public doReplace(_index: number, _searchreplacearray: [string, string, string]): boolean {


        return false;
    }

}


// Similarly TypeScript has no trouble going through a string character by character using for...of:

var hello = "is it me you're looking for?";
for (var char of hello) {
    console.log(char); // is it me you're looking for?
}
