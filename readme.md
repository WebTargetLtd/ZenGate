# ZenGate

#### What is it?
It's a node-CLI utility written in TypeScript for generating TableGateway classes and definitions from an existing database table.

### Why is it?
  Whilst writing Zend Framework 2+ applications, we've found the same drudgery over and over again when creating database classes. They're basically the same with different field names.

  Neil wrote it in JavaScript to run on Node - oh how we laughed at the callback hell. Neil re-wrote it in TypeScript and tidied it up a bit. Taking out profanities mainly.

### Isn't it just a glorified templating mechanism?
Yes, but it has the following useful features:

- A definitions generator. Include this in your project and let your IDE help you complete your columns names. Typo's banished!
- Switches between MySQL and PostGreSQL
- Also generates a chunk of PHP to stick in your Module.php->getServiceConfig array to your nice new definition is ready to use from the service manager.


### What do I need?
You'll need nodejs; we developed in v6.0 LTS on Ubuntu 16.04 https://nodejs.org/en/download/ It comes with `npm` - the package manager.


### How do I use it?
- Add your databases to `settings/dbconfig.json` - We tend to develop on Vagrant machines for consistency so we put the definitions in there.

Here's an example:

```JavaScript
{
    "riskmanagement": {
        "type": "pg",
        "server": "192.168.77.2",
        "port": "5432",
        "username": "rmuser",
        "password": "verycomplexpassword",
        "dbname": "RMManage"
    },
    "steeldb": {
        "type": "mysql",
        "server": "192.168.77.3",
        "port": "3306",
        "username": "root",
        "password": "anotherjollycomplexpassword",
        "dbname": "SteelStock"
    },
    "default": "riskmanagement",
    "author": "Neil.Smith@WebTarget.co.uk",
    "fileroot" : "../settings/PHPTemplates/",
    "outputfolder" : "../output/"
}

```
Notice that each database definition block has a name `riskmanagement` & `steeldb`. The `default` field picks one to use if it's not specified on the command line.

#### I just want to run it.
As you have node installed, `cd dist` and type `node ZenGate.js --help` to see the options.

Most of the options are for overriding the settings in `settings/dbconfig.json`. If your settings are configured correctly, then the minimum you'll need is the table name.

Your command for the Albums table would be

 - `nodejs ZenGate.js -t Albums`

Using the example config, the table `Albums` would have it's entities created in the `/output/Albums` folder.

##### My table has a _horrible_ name, Help!
For those of use who prefix our database entities with things like "t\_" for tables and "vw\_" for views can rejoice. Use the `-a` (for alias) flag. Insetad of your entites being created as `deft_User.php` and `t_userTable.php`, we can have prettier names:

`node ZenGate.js -t t_albums -a Albums`

##### My namepace isn't `Application`, Help!

`node ZenGate.js -t t_albums -a Albums -n Vinyls`

##### My name isn't Neil, Help!
`node ZenGate.js -t t_albums -a Albums -n Vinyls -u Homer.J.Simpson@BigCorp.com`



#### I am amazing. I want to fiddle and ~~burn~~ build.

Install TypeScript

- `npm install -g typescript`

Install the node_modules that you'll need.

- `npm install`

On the command line:

- `cd src`
- `webpack --progress --colors --watch`

Webpack will watch the folder for changes and overwrite the `./dist/ZenGate.js` file.

## But what about....
It is a rough and ready implementation - there are no tests. In our example that we use internally at WebTarget.co.uk a couple of the classes inherit from some base functionality.
