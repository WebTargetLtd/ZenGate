

To compile
  webpack --progress --colors --watch

And to see the results:
cd dist

 node bundle.js
node bundle.js -n Sys  -c steeldb -t ap_settings -a Settings

pg-native error? From https://www.npmjs.com/package/pg-native

apt-get install libpq-dev
npm i pg-native --save



Re: the service. I could have factories the creation of it, or passed it around.
Need a module config really, like ZF2 where we can yank a class out.

- ----------------------------------------------------------
- Add a switch for table alias (i.e. from t_User to User)
-
- The db interface refer to as "adapter"
- Create a promise sequence for each file that has replacements
- Replace($adapter?:Idb, switchstrings:string[], filename:string ).then
- Replace($adapter?:Idb,  switchstrings:string[], filename:string). then
If (adapter) then
  get columns and add to switchstrings.
end if

Sub promise
  getcolumns().then
  flattenarray().then
  writefile()
etc
