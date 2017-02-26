/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 67);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var textParsers = __webpack_require__(44);
var binaryParsers = __webpack_require__(43);
var arrayParser = __webpack_require__(11);

exports.getTypeParser = getTypeParser;
exports.setTypeParser = setTypeParser;
exports.arrayParser = arrayParser;

var typeParsers = {
  text: {},
  binary: {}
};

//the empty parse function
function noParse (val) {
  return String(val);
};

//returns a function used to convert a specific type (specified by
//oid) into a result javascript type
//note: the oid can be obtained via the following sql query:
//SELECT oid FROM pg_type WHERE typname = 'TYPE_NAME_HERE';
function getTypeParser (oid, format) {
  format = format || 'text';
  if (!typeParsers[format]) {
    return noParse;
  }
  return typeParsers[format][oid] || noParse;
};

function setTypeParser (oid, format, parseFn) {
  if(typeof format == 'function') {
    parseFn = format;
    format = 'text';
  }
  typeParsers[format][oid] = parseFn;
};

textParsers.init(function(oid, converter) {
  typeParsers.text[oid] = converter;
});

binaryParsers.init(function(oid, converter) {
  typeParsers.binary[oid] = converter;
});


/***/ }),
/* 4 */,
/* 5 */
/***/ (function(module, exports) {

module.exports = require("assert");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("stream");

/***/ }),
/* 8 */,
/* 9 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 9;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

function ArrayParser(source, converter) {
  this.source = source;
  this.converter = converter;
  this.pos = 0;
  this.entries = [];
  this.recorded = [];
  this.dimension = 0;
  if (!this.converter) {
    this.converter = function(entry) {
      return entry;
    };
  }
}

ArrayParser.prototype.eof = function() {
  return this.pos >= this.source.length;
};

ArrayParser.prototype.nextChar = function() {
  var c;
  if ((c = this.source[this.pos++]) === "\\") {
    return {
      char: this.source[this.pos++],
      escaped: true
    };
  } else {
    return {
      char: c,
      escaped: false
    };
  }
};

ArrayParser.prototype.record = function(c) {
  return this.recorded.push(c);
};

ArrayParser.prototype.newEntry = function(includeEmpty) {
  var entry;
  if (this.recorded.length > 0 || includeEmpty) {
    entry = this.recorded.join("");
    if (entry === "NULL" && !includeEmpty) {
      entry = null;
    }
    if (entry !== null) {
      entry = this.converter(entry);
    }
    this.entries.push(entry);
    this.recorded = [];
  }
};

ArrayParser.prototype.parse = function(nested) {
  var c, p, quote;
  if (nested === null) {
    nested = false;
  }
  quote = false;
  while (!this.eof()) {
    c = this.nextChar();
    if (c.char === "{" && !quote) {
      this.dimension++;
      if (this.dimension > 1) {
        p = new ArrayParser(this.source.substr(this.pos - 1), this.converter);
        this.entries.push(p.parse(true));
        this.pos += p.pos - 2;
      }
    } else if (c.char === "}" && !quote) {
      this.dimension--;
      if (this.dimension === 0) {
        this.newEntry();
        if (nested) {
          return this.entries;
        }
      }
    } else if (c.char === '"' && !c.escaped) {
      if (quote) {
        this.newEntry(true);
      }
      quote = !quote;
    } else if (c.char === ',' && !quote) {
      this.newEntry();
    } else {
      this.record(c.char);
    }
  }
  if (this.dimension !== 0) {
    throw "array dimension not balanced";
  }
  return this.entries;
};

module.exports = {
  create: function(source, converter){
    return new ArrayParser(source, converter);
  }
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var array = __webpack_require__(18);

module.exports = {
  create: function (source, transform) {
    return {
      parse: function() {
        return array.parse(source, transform);
      }
    };
  }
};


/***/ }),
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.parse = function (source, transform) {
  return new ArrayParser(source, transform).parse()
}

function ArrayParser (source, transform) {
  this.source = source
  this.transform = transform || identity
  this.position = 0
  this.entries = []
  this.recorded = []
  this.dimension = 0
}

ArrayParser.prototype.isEof = function () {
  return this.position >= this.source.length
}

ArrayParser.prototype.nextCharacter = function () {
  var character = this.source[this.position++]
  if (character === '\\') {
    return {
      value: this.source[this.position++],
      escaped: true
    }
  }
  return {
    value: character,
    escaped: false
  }
}

ArrayParser.prototype.record = function (character) {
  this.recorded.push(character)
}

ArrayParser.prototype.newEntry = function (includeEmpty) {
  var entry
  if (this.recorded.length > 0 || includeEmpty) {
    entry = this.recorded.join('')
    if (entry === 'NULL' && !includeEmpty) {
      entry = null
    }
    if (entry !== null) entry = this.transform(entry)
    this.entries.push(entry)
    this.recorded = []
  }
}

ArrayParser.prototype.parse = function (nested) {
  var character, parser, quote
  while (!this.isEof()) {
    character = this.nextCharacter()
    if (character.value === '{' && !quote) {
      this.dimension++
      if (this.dimension > 1) {
        parser = new ArrayParser(this.source.substr(this.position - 1), this.transform)
        this.entries.push(parser.parse(true))
        this.position += parser.position - 2
      }
    } else if (character.value === '}' && !quote) {
      this.dimension--
      if (!this.dimension) {
        this.newEntry()
        if (nested) return this.entries
      }
    } else if (character.value === '"' && !character.escaped) {
      if (quote) this.newEntry(true)
      quote = !quote
    } else if (character.value === ',' && !quote) {
      this.newEntry()
    } else {
      this.record(character.value)
    }
  }
  if (this.dimension !== 0) {
    throw new Error('array dimension not balanced')
  }
  return this.entries
}

function identity (value) {
  return value
}


/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * -----------------------------------------------------------------------------
 * Class        : dbBase.ts
 * Description  : Any generic database functionality can be stuffed in here
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.Smith@WebTarget.co.uk>
 * Created Date : 19 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

class configService {
    /*
      Build our config
    */
    constructor(_clArgs) {
        this.cf = __webpack_require__(23);
        try {
            this._ns = _clArgs["namespace"];
            this._table = _clArgs["tablename"];
        }
        catch (err) {
            console.log("Error creating configService :: " + err);
        }
    }
    getNamespace() {
        return this._ns;
    }
    getTable() {
        return this._table;
    }
    getDBParams(_key) {
        if (_key === undefined) {
            // Get default from the config file, and use it as a key
            _key = this.cf.default;
        }
        return this.cf[_key];
    }
    setRows(_rows) {
        this._rows = _rows;
    }
}
exports.configService = configService;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const db_1 = __webpack_require__(25);
class Setup {
    constructor(_cs) {
        this._cs = _cs;
        let _db = new db_1.db(_cs);
        // _db.retrieve(this.doReplacements);
        // console.log("Namespace is " + _args["namespace"]);
        // this.doReplacements();
    }
}
exports.Setup = Setup;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var EventEmitter = __webpack_require__(1).EventEmitter;
var spawn = __webpack_require__(61).spawn;
var readlink = __webpack_require__(31).readlinkSync;
var path = __webpack_require__(2);
var dirname = path.dirname;
var basename = path.basename;
var fs = __webpack_require__(6);

/**
 * Expose the root command.
 */

exports = module.exports = new Command();

/**
 * Expose `Command`.
 */

exports.Command = Command;

/**
 * Expose `Option`.
 */

exports.Option = Option;

/**
 * Initialize a new `Option` with the given `flags` and `description`.
 *
 * @param {String} flags
 * @param {String} description
 * @api public
 */

function Option(flags, description) {
  this.flags = flags;
  this.required = ~flags.indexOf('<');
  this.optional = ~flags.indexOf('[');
  this.bool = !~flags.indexOf('-no-');
  flags = flags.split(/[ ,|]+/);
  if (flags.length > 1 && !/^[[<]/.test(flags[1])) this.short = flags.shift();
  this.long = flags.shift();
  this.description = description || '';
}

/**
 * Return option name.
 *
 * @return {String}
 * @api private
 */

Option.prototype.name = function() {
  return this.long
    .replace('--', '')
    .replace('no-', '');
};

/**
 * Check if `arg` matches the short or long flag.
 *
 * @param {String} arg
 * @return {Boolean}
 * @api private
 */

Option.prototype.is = function(arg) {
  return arg == this.short || arg == this.long;
};

/**
 * Initialize a new `Command`.
 *
 * @param {String} name
 * @api public
 */

function Command(name) {
  this.commands = [];
  this.options = [];
  this._execs = {};
  this._allowUnknownOption = false;
  this._args = [];
  this._name = name || '';
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Command.prototype.__proto__ = EventEmitter.prototype;

/**
 * Add command `name`.
 *
 * The `.action()` callback is invoked when the
 * command `name` is specified via __ARGV__,
 * and the remaining arguments are applied to the
 * function for access.
 *
 * When the `name` is "*" an un-matched command
 * will be passed as the first arg, followed by
 * the rest of __ARGV__ remaining.
 *
 * Examples:
 *
 *      program
 *        .version('0.0.1')
 *        .option('-C, --chdir <path>', 'change the working directory')
 *        .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
 *        .option('-T, --no-tests', 'ignore test hook')
 *
 *      program
 *        .command('setup')
 *        .description('run remote setup commands')
 *        .action(function() {
 *          console.log('setup');
 *        });
 *
 *      program
 *        .command('exec <cmd>')
 *        .description('run the given remote command')
 *        .action(function(cmd) {
 *          console.log('exec "%s"', cmd);
 *        });
 *
 *      program
 *        .command('teardown <dir> [otherDirs...]')
 *        .description('run teardown commands')
 *        .action(function(dir, otherDirs) {
 *          console.log('dir "%s"', dir);
 *          if (otherDirs) {
 *            otherDirs.forEach(function (oDir) {
 *              console.log('dir "%s"', oDir);
 *            });
 *          }
 *        });
 *
 *      program
 *        .command('*')
 *        .description('deploy the given env')
 *        .action(function(env) {
 *          console.log('deploying "%s"', env);
 *        });
 *
 *      program.parse(process.argv);
  *
 * @param {String} name
 * @param {String} [desc] for git-style sub-commands
 * @return {Command} the new command
 * @api public
 */

Command.prototype.command = function(name, desc, opts) {
  opts = opts || {};
  var args = name.split(/ +/);
  var cmd = new Command(args.shift());

  if (desc) {
    cmd.description(desc);
    this.executables = true;
    this._execs[cmd._name] = true;
    if (opts.isDefault) this.defaultExecutable = cmd._name;
  }

  cmd._noHelp = !!opts.noHelp;
  this.commands.push(cmd);
  cmd.parseExpectedArgs(args);
  cmd.parent = this;

  if (desc) return this;
  return cmd;
};

/**
 * Define argument syntax for the top-level command.
 *
 * @api public
 */

Command.prototype.arguments = function (desc) {
  return this.parseExpectedArgs(desc.split(/ +/));
};

/**
 * Add an implicit `help [cmd]` subcommand
 * which invokes `--help` for the given command.
 *
 * @api private
 */

Command.prototype.addImplicitHelpCommand = function() {
  this.command('help [cmd]', 'display help for [cmd]');
};

/**
 * Parse expected `args`.
 *
 * For example `["[type]"]` becomes `[{ required: false, name: 'type' }]`.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parseExpectedArgs = function(args) {
  if (!args.length) return;
  var self = this;
  args.forEach(function(arg) {
    var argDetails = {
      required: false,
      name: '',
      variadic: false
    };

    switch (arg[0]) {
      case '<':
        argDetails.required = true;
        argDetails.name = arg.slice(1, -1);
        break;
      case '[':
        argDetails.name = arg.slice(1, -1);
        break;
    }

    if (argDetails.name.length > 3 && argDetails.name.slice(-3) === '...') {
      argDetails.variadic = true;
      argDetails.name = argDetails.name.slice(0, -3);
    }
    if (argDetails.name) {
      self._args.push(argDetails);
    }
  });
  return this;
};

/**
 * Register callback `fn` for the command.
 *
 * Examples:
 *
 *      program
 *        .command('help')
 *        .description('display verbose help')
 *        .action(function() {
 *           // output help here
 *        });
 *
 * @param {Function} fn
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.action = function(fn) {
  var self = this;
  var listener = function(args, unknown) {
    // Parse any so-far unknown options
    args = args || [];
    unknown = unknown || [];

    var parsed = self.parseOptions(unknown);

    // Output help if necessary
    outputHelpIfNecessary(self, parsed.unknown);

    // If there are still any unknown options, then we simply
    // die, unless someone asked for help, in which case we give it
    // to them, and then we die.
    if (parsed.unknown.length > 0) {
      self.unknownOption(parsed.unknown[0]);
    }

    // Leftover arguments need to be pushed back. Fixes issue #56
    if (parsed.args.length) args = parsed.args.concat(args);

    self._args.forEach(function(arg, i) {
      if (arg.required && null == args[i]) {
        self.missingArgument(arg.name);
      } else if (arg.variadic) {
        if (i !== self._args.length - 1) {
          self.variadicArgNotLast(arg.name);
        }

        args[i] = args.splice(i);
      }
    });

    // Always append ourselves to the end of the arguments,
    // to make sure we match the number of arguments the user
    // expects
    if (self._args.length) {
      args[self._args.length] = self;
    } else {
      args.push(self);
    }

    fn.apply(self, args);
  };
  var parent = this.parent || this;
  var name = parent === this ? '*' : this._name;
  parent.on(name, listener);
  if (this._alias) parent.on(this._alias, listener);
  return this;
};

/**
 * Define option with `flags`, `description` and optional
 * coercion `fn`.
 *
 * The `flags` string should contain both the short and long flags,
 * separated by comma, a pipe or space. The following are all valid
 * all will output this way when `--help` is used.
 *
 *    "-p, --pepper"
 *    "-p|--pepper"
 *    "-p --pepper"
 *
 * Examples:
 *
 *     // simple boolean defaulting to false
 *     program.option('-p, --pepper', 'add pepper');
 *
 *     --pepper
 *     program.pepper
 *     // => Boolean
 *
 *     // simple boolean defaulting to true
 *     program.option('-C, --no-cheese', 'remove cheese');
 *
 *     program.cheese
 *     // => true
 *
 *     --no-cheese
 *     program.cheese
 *     // => false
 *
 *     // required argument
 *     program.option('-C, --chdir <path>', 'change the working directory');
 *
 *     --chdir /tmp
 *     program.chdir
 *     // => "/tmp"
 *
 *     // optional argument
 *     program.option('-c, --cheese [type]', 'add cheese [marble]');
 *
 * @param {String} flags
 * @param {String} description
 * @param {Function|Mixed} fn or default
 * @param {Mixed} defaultValue
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.option = function(flags, description, fn, defaultValue) {
  var self = this
    , option = new Option(flags, description)
    , oname = option.name()
    , name = camelcase(oname);

  // default as 3rd arg
  if (typeof fn != 'function') {
    if (fn instanceof RegExp) {
      var regex = fn;
      fn = function(val, def) {
        var m = regex.exec(val);
        return m ? m[0] : def;
      }
    }
    else {
      defaultValue = fn;
      fn = null;
    }
  }

  // preassign default value only for --no-*, [optional], or <required>
  if (false == option.bool || option.optional || option.required) {
    // when --no-* we make sure default is true
    if (false == option.bool) defaultValue = true;
    // preassign only if we have a default
    if (undefined !== defaultValue) self[name] = defaultValue;
  }

  // register the option
  this.options.push(option);

  // when it's passed assign the value
  // and conditionally invoke the callback
  this.on(oname, function(val) {
    // coercion
    if (null !== val && fn) val = fn(val, undefined === self[name]
      ? defaultValue
      : self[name]);

    // unassigned or bool
    if ('boolean' == typeof self[name] || 'undefined' == typeof self[name]) {
      // if no value, bool true, and we have a default, then use it!
      if (null == val) {
        self[name] = option.bool
          ? defaultValue || true
          : false;
      } else {
        self[name] = val;
      }
    } else if (null !== val) {
      // reassign
      self[name] = val;
    }
  });

  return this;
};

/**
 * Allow unknown options on the command line.
 *
 * @param {Boolean} arg if `true` or omitted, no error will be thrown
 * for unknown options.
 * @api public
 */
Command.prototype.allowUnknownOption = function(arg) {
    this._allowUnknownOption = arguments.length === 0 || arg;
    return this;
};

/**
 * Parse `argv`, settings options and invoking commands when defined.
 *
 * @param {Array} argv
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.parse = function(argv) {
  // implicit help
  if (this.executables) this.addImplicitHelpCommand();

  // store raw args
  this.rawArgs = argv;

  // guess name
  this._name = this._name || basename(argv[1], '.js');

  // github-style sub-commands with no sub-command
  if (this.executables && argv.length < 3 && !this.defaultExecutable) {
    // this user needs help
    argv.push('--help');
  }

  // process argv
  var parsed = this.parseOptions(this.normalize(argv.slice(2)));
  var args = this.args = parsed.args;

  var result = this.parseArgs(this.args, parsed.unknown);

  // executable sub-commands
  var name = result.args[0];
  if (this._execs[name] && typeof this._execs[name] != "function") {
    return this.executeSubCommand(argv, args, parsed.unknown);
  } else if (this.defaultExecutable) {
    // use the default subcommand
    args.unshift(name = this.defaultExecutable);
    return this.executeSubCommand(argv, args, parsed.unknown);
  }

  return result;
};

/**
 * Execute a sub-command executable.
 *
 * @param {Array} argv
 * @param {Array} args
 * @param {Array} unknown
 * @api private
 */

Command.prototype.executeSubCommand = function(argv, args, unknown) {
  args = args.concat(unknown);

  if (!args.length) this.help();
  if ('help' == args[0] && 1 == args.length) this.help();

  // <cmd> --help
  if ('help' == args[0]) {
    args[0] = args[1];
    args[1] = '--help';
  }

  // executable
  var f = argv[1];
  // name of the subcommand, link `pm-install`
  var bin = basename(f, '.js') + '-' + args[0];


  // In case of globally installed, get the base dir where executable
  //  subcommand file should be located at
  var baseDir
    , link = readlink(f);

  // when symbolink is relative path
  if (link !== f && link.charAt(0) !== '/') {
    link = path.join(dirname(f), link)
  }
  baseDir = dirname(link);

  // prefer local `./<bin>` to bin in the $PATH
  var localBin = path.join(baseDir, bin);

  // whether bin file is a js script with explicit `.js` extension
  var isExplicitJS = false;
  if (exists(localBin + '.js')) {
    bin = localBin + '.js';
    isExplicitJS = true;
  } else if (exists(localBin)) {
    bin = localBin;
  }

  args = args.slice(1);

  var proc;
  if (process.platform !== 'win32') {
    if (isExplicitJS) {
      args.unshift(localBin);
      // add executable arguments to spawn
      args = (process.execArgv || []).concat(args);

      proc = spawn('node', args, { stdio: 'inherit', customFds: [0, 1, 2] });
    } else {
      proc = spawn(bin, args, { stdio: 'inherit', customFds: [0, 1, 2] });
    }
  } else {
    args.unshift(localBin);
    proc = spawn(process.execPath, args, { stdio: 'inherit'});
  }

  proc.on('close', process.exit.bind(process));
  proc.on('error', function(err) {
    if (err.code == "ENOENT") {
      console.error('\n  %s(1) does not exist, try --help\n', bin);
    } else if (err.code == "EACCES") {
      console.error('\n  %s(1) not executable. try chmod or run with root\n', bin);
    }
    process.exit(1);
  });

  // Store the reference to the child process
  this.runningCommand = proc;
};

/**
 * Normalize `args`, splitting joined short flags. For example
 * the arg "-abc" is equivalent to "-a -b -c".
 * This also normalizes equal sign and splits "--abc=def" into "--abc def".
 *
 * @param {Array} args
 * @return {Array}
 * @api private
 */

Command.prototype.normalize = function(args) {
  var ret = []
    , arg
    , lastOpt
    , index;

  for (var i = 0, len = args.length; i < len; ++i) {
    arg = args[i];
    if (i > 0) {
      lastOpt = this.optionFor(args[i-1]);
    }

    if (arg === '--') {
      // Honor option terminator
      ret = ret.concat(args.slice(i));
      break;
    } else if (lastOpt && lastOpt.required) {
      ret.push(arg);
    } else if (arg.length > 1 && '-' == arg[0] && '-' != arg[1]) {
      arg.slice(1).split('').forEach(function(c) {
        ret.push('-' + c);
      });
    } else if (/^--/.test(arg) && ~(index = arg.indexOf('='))) {
      ret.push(arg.slice(0, index), arg.slice(index + 1));
    } else {
      ret.push(arg);
    }
  }

  return ret;
};

/**
 * Parse command `args`.
 *
 * When listener(s) are available those
 * callbacks are invoked, otherwise the "*"
 * event is emitted and those actions are invoked.
 *
 * @param {Array} args
 * @return {Command} for chaining
 * @api private
 */

Command.prototype.parseArgs = function(args, unknown) {
  var name;

  if (args.length) {
    name = args[0];
    if (this.listeners(name).length) {
      this.emit(args.shift(), args, unknown);
    } else {
      this.emit('*', args);
    }
  } else {
    outputHelpIfNecessary(this, unknown);

    // If there were no args and we have unknown options,
    // then they are extraneous and we need to error.
    if (unknown.length > 0) {
      this.unknownOption(unknown[0]);
    }
  }

  return this;
};

/**
 * Return an option matching `arg` if any.
 *
 * @param {String} arg
 * @return {Option}
 * @api private
 */

Command.prototype.optionFor = function(arg) {
  for (var i = 0, len = this.options.length; i < len; ++i) {
    if (this.options[i].is(arg)) {
      return this.options[i];
    }
  }
};

/**
 * Parse options from `argv` returning `argv`
 * void of these options.
 *
 * @param {Array} argv
 * @return {Array}
 * @api public
 */

Command.prototype.parseOptions = function(argv) {
  var args = []
    , len = argv.length
    , literal
    , option
    , arg;

  var unknownOptions = [];

  // parse options
  for (var i = 0; i < len; ++i) {
    arg = argv[i];

    // literal args after --
    if ('--' == arg) {
      literal = true;
      continue;
    }

    if (literal) {
      args.push(arg);
      continue;
    }

    // find matching Option
    option = this.optionFor(arg);

    // option is defined
    if (option) {
      // requires arg
      if (option.required) {
        arg = argv[++i];
        if (null == arg) return this.optionMissingArgument(option);
        this.emit(option.name(), arg);
      // optional arg
      } else if (option.optional) {
        arg = argv[i+1];
        if (null == arg || ('-' == arg[0] && '-' != arg)) {
          arg = null;
        } else {
          ++i;
        }
        this.emit(option.name(), arg);
      // bool
      } else {
        this.emit(option.name());
      }
      continue;
    }

    // looks like an option
    if (arg.length > 1 && '-' == arg[0]) {
      unknownOptions.push(arg);

      // If the next argument looks like it might be
      // an argument for this option, we pass it on.
      // If it isn't, then it'll simply be ignored
      if (argv[i+1] && '-' != argv[i+1][0]) {
        unknownOptions.push(argv[++i]);
      }
      continue;
    }

    // arg
    args.push(arg);
  }

  return { args: args, unknown: unknownOptions };
};

/**
 * Return an object containing options as key-value pairs
 *
 * @return {Object}
 * @api public
 */
Command.prototype.opts = function() {
  var result = {}
    , len = this.options.length;

  for (var i = 0 ; i < len; i++) {
    var key = camelcase(this.options[i].name());
    result[key] = key === 'version' ? this._version : this[key];
  }
  return result;
};

/**
 * Argument `name` is missing.
 *
 * @param {String} name
 * @api private
 */

Command.prototype.missingArgument = function(name) {
  console.error();
  console.error("  error: missing required argument `%s'", name);
  console.error();
  process.exit(1);
};

/**
 * `Option` is missing an argument, but received `flag` or nothing.
 *
 * @param {String} option
 * @param {String} flag
 * @api private
 */

Command.prototype.optionMissingArgument = function(option, flag) {
  console.error();
  if (flag) {
    console.error("  error: option `%s' argument missing, got `%s'", option.flags, flag);
  } else {
    console.error("  error: option `%s' argument missing", option.flags);
  }
  console.error();
  process.exit(1);
};

/**
 * Unknown option `flag`.
 *
 * @param {String} flag
 * @api private
 */

Command.prototype.unknownOption = function(flag) {
  if (this._allowUnknownOption) return;
  console.error();
  console.error("  error: unknown option `%s'", flag);
  console.error();
  process.exit(1);
};

/**
 * Variadic argument with `name` is not the last argument as required.
 *
 * @param {String} name
 * @api private
 */

Command.prototype.variadicArgNotLast = function(name) {
  console.error();
  console.error("  error: variadic arguments must be last `%s'", name);
  console.error();
  process.exit(1);
};

/**
 * Set the program version to `str`.
 *
 * This method auto-registers the "-V, --version" flag
 * which will print the version number when passed.
 *
 * @param {String} str
 * @param {String} flags
 * @return {Command} for chaining
 * @api public
 */

Command.prototype.version = function(str, flags) {
  if (0 == arguments.length) return this._version;
  this._version = str;
  flags = flags || '-V, --version';
  this.option(flags, 'output the version number');
  this.on('version', function() {
    process.stdout.write(str + '\n');
    process.exit(0);
  });
  return this;
};

/**
 * Set the description to `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.description = function(str) {
  if (0 === arguments.length) return this._description;
  this._description = str;
  return this;
};

/**
 * Set an alias for the command
 *
 * @param {String} alias
 * @return {String|Command}
 * @api public
 */

Command.prototype.alias = function(alias) {
  if (0 == arguments.length) return this._alias;
  this._alias = alias;
  return this;
};

/**
 * Set / get the command usage `str`.
 *
 * @param {String} str
 * @return {String|Command}
 * @api public
 */

Command.prototype.usage = function(str) {
  var args = this._args.map(function(arg) {
    return humanReadableArgName(arg);
  });

  var usage = '[options]'
    + (this.commands.length ? ' [command]' : '')
    + (this._args.length ? ' ' + args.join(' ') : '');

  if (0 == arguments.length) return this._usage || usage;
  this._usage = str;

  return this;
};

/**
 * Get the name of the command
 *
 * @param {String} name
 * @return {String|Command}
 * @api public
 */

Command.prototype.name = function() {
  return this._name;
};

/**
 * Return the largest option length.
 *
 * @return {Number}
 * @api private
 */

Command.prototype.largestOptionLength = function() {
  return this.options.reduce(function(max, option) {
    return Math.max(max, option.flags.length);
  }, 0);
};

/**
 * Return help for options.
 *
 * @return {String}
 * @api private
 */

Command.prototype.optionHelp = function() {
  var width = this.largestOptionLength();

  // Prepend the help information
  return [pad('-h, --help', width) + '  ' + 'output usage information']
      .concat(this.options.map(function(option) {
        return pad(option.flags, width) + '  ' + option.description;
      }))
      .join('\n');
};

/**
 * Return command help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.commandHelp = function() {
  if (!this.commands.length) return '';

  var commands = this.commands.filter(function(cmd) {
    return !cmd._noHelp;
  }).map(function(cmd) {
    var args = cmd._args.map(function(arg) {
      return humanReadableArgName(arg);
    }).join(' ');

    return [
      cmd._name
        + (cmd._alias ? '|' + cmd._alias : '')
        + (cmd.options.length ? ' [options]' : '')
        + ' ' + args
      , cmd.description()
    ];
  });

  var width = commands.reduce(function(max, command) {
    return Math.max(max, command[0].length);
  }, 0);

  return [
    ''
    , '  Commands:'
    , ''
    , commands.map(function(cmd) {
      var desc = cmd[1] ? '  ' + cmd[1] : '';
      return pad(cmd[0], width) + desc;
    }).join('\n').replace(/^/gm, '    ')
    , ''
  ].join('\n');
};

/**
 * Return program help documentation.
 *
 * @return {String}
 * @api private
 */

Command.prototype.helpInformation = function() {
  var desc = [];
  if (this._description) {
    desc = [
      '  ' + this._description
      , ''
    ];
  }

  var cmdName = this._name;
  if (this._alias) {
    cmdName = cmdName + '|' + this._alias;
  }
  var usage = [
    ''
    ,'  Usage: ' + cmdName + ' ' + this.usage()
    , ''
  ];

  var cmds = [];
  var commandHelp = this.commandHelp();
  if (commandHelp) cmds = [commandHelp];

  var options = [
    '  Options:'
    , ''
    , '' + this.optionHelp().replace(/^/gm, '    ')
    , ''
    , ''
  ];

  return usage
    .concat(cmds)
    .concat(desc)
    .concat(options)
    .join('\n');
};

/**
 * Output help information for this command
 *
 * @api public
 */

Command.prototype.outputHelp = function(cb) {
  if (!cb) {
    cb = function(passthru) {
      return passthru;
    }
  }
  process.stdout.write(cb(this.helpInformation()));
  this.emit('--help');
};

/**
 * Output help information and exit.
 *
 * @api public
 */

Command.prototype.help = function(cb) {
  this.outputHelp(cb);
  process.exit();
};

/**
 * Camel-case the given `flag`
 *
 * @param {String} flag
 * @return {String}
 * @api private
 */

function camelcase(flag) {
  return flag.split('-').reduce(function(str, word) {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

/**
 * Output help information if necessary
 *
 * @param {Command} command to output help for
 * @param {Array} array of options to search for -h or --help
 * @api private
 */

function outputHelpIfNecessary(cmd, options) {
  options = options || [];
  for (var i = 0; i < options.length; i++) {
    if (options[i] == '--help' || options[i] == '-h') {
      cmd.outputHelp();
      process.exit(0);
    }
  }
}

/**
 * Takes an argument an returns its human readable equivalent for help usage.
 *
 * @param {Object} arg
 * @return {String}
 * @api private
 */

function humanReadableArgName(arg) {
  var nameOutput = arg.name + (arg.variadic === true ? '...' : '');

  return arg.required
    ? '<' + nameOutput + '>'
    : '[' + nameOutput + ']'
}

// for versions before node v0.8 when there weren't `fs.existsSync`
function exists(file) {
  try {
    if (fs.statSync(file).isFile()) {
      return true;
    }
  } catch (e) {
    return false;
  }
}



/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = {
	"rimacondb": {
		"type": "pg",
		"server": "192.168.77.2",
		"port": "5432",
		"username": "postgres",
		"password": "postgres",
		"dbname": "RiMaConDB"
	},
	"steeldb": {
		"type": "pg",
		"server": "steel.webtarget.co.uk",
		"port": "5778",
		"username": "postgres",
		"password": "cleverpassword",
		"dbname": "MildenSteels"
	},
	"default": "rimacondb"
};

/***/ }),
/* 24 */
/***/ (function(module, exports) {

exports = module.exports = ap;
function ap (args, fn) {
    return function () {
        var rest = [].slice.call(arguments)
            , first = args.slice()
        first.push.apply(first, rest)
        return fn.apply(this, first);
    };
}

exports.pa = pa;
function pa (args, fn) {
    return function () {
        var rest = [].slice.call(arguments)
        rest.push.apply(rest, args)
        return fn.apply(this, rest);
    };
}

exports.apa = apa;
function apa (left, right, fn) {
    return function () {
        return fn.apply(this,
            left.concat.apply(left, arguments).concat(right)
        );
    };
}

exports.partial = partial;
function partial (fn) {
    var args = [].slice.call(arguments, 1);
    return ap(args, fn);
}

exports.partialRight = partialRight;
function partialRight (fn) {
    var args = [].slice.call(arguments, 1);
    return pa(args, fn);
}

exports.curry = curry;
function curry (fn) {
    return partial(partial, fn);
}

exports.curryRight = function curryRight (fn) {
    return partial(partialRight, fn);
}


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * -----------------------------------------------------------------------------
 * Class        : db.ts
 * Description  :
 * Parameters   :
 * Usage        :
 * Notes        :
 * Created      : @author Neil Smith <Neil.SMith@Computors.com>
 * Created Date : 17 Feb 2017
 * -----------------------------------------------------------------------------
 * Date?        Whom?       Notes
 * _____________________________________________________________________________
 */

const connPgSQL_1 = __webpack_require__(103);
class db {
    constructor(_configService) {
        this._configService = _configService;
        // this._configService = new configService();
        switch (this._configService.getDBParams()["type"]) {
            case 'pg':
                this._dbInstance = new connPgSQL_1.connPgSQL(_configService); // require('connPostgres');
                break;
            case 'mysql':
                this._dbInstance = __webpack_require__(26);
                break;
            default:
        }
        // console.log(JSON.stringify(this._dbInstance.getConnectString()));
        this.getRows();
    }
    getRows() {
        let g = new Promise((resolve, reject) => {
            // Resolve getcolumns
            // Resolve replacement
            // Resolve write file
            resolve(this._dbInstance.getRows());
        }).then((res) => {
            console.log("The RES is " + res);
            return res;
            // console.log("The RES is " + res);
        });
        return [""];
        // this._dbInstance.getRows(this.writeColumns, "Blimpy McBlimp" );
    }
    writeColumns(_rows, _message) {
        console.log("A message " + _message);
        for (var item of _rows["rows"]) {
            // this._columns.push(item);
            console.log("My Item " + JSON.stringify(item.column_name));
        }
        // let rp = new Replace('myfile', );
    }
    dbInstance() {
        return this._dbInstance;
    }
}
exports.db = db;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class connMysql {
    constructor(_cs) {
        this._cs = _cs;
        this.configure();
    }
    configure() {
        this._pConn = this._cs.getDBParams();
    }
    getConnectString() {
        return "";
    }
    ;
    getQuery() {
        return "";
    }
    getRows() {
        return [""];
    }
    testConnection() {
        return false;
    }
    ;
}
exports.connMysql = connMysql;


/***/ }),
/* 27 */,
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__filename) {
/**
 * Module dependencies.
 */

var fs = __webpack_require__(6)
  , path = __webpack_require__(2)
  , join = path.join
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }
  opts.__proto__ = defaults

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? /*require.resolve*/(!(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND';; throw e; }())) : !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND';; throw e; }())
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 29 */
/***/ (function(module, exports) {

//binary data writer tuned for creating
//postgres message packets as effeciently as possible by reusing the
//same buffer to avoid memcpy and limit memory allocations
var Writer = module.exports = function(size) {
  this.size = size || 1024;
  this.buffer = Buffer(this.size + 5);
  this.offset = 5;
  this.headerPosition = 0;
};

//resizes internal buffer if not enough size left
Writer.prototype._ensure = function(size) {
  var remaining = this.buffer.length - this.offset;
  if(remaining < size) {
    var oldBuffer = this.buffer;
    // exponential growth factor of around ~ 1.5
    // https://stackoverflow.com/questions/2269063/buffer-growth-strategy
    var newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
    this.buffer = new Buffer(newSize);
    oldBuffer.copy(this.buffer);
  }
};

Writer.prototype.addInt32 = function(num) {
  this._ensure(4);
  this.buffer[this.offset++] = (num >>> 24 & 0xFF);
  this.buffer[this.offset++] = (num >>> 16 & 0xFF);
  this.buffer[this.offset++] = (num >>>  8 & 0xFF);
  this.buffer[this.offset++] = (num >>>  0 & 0xFF);
  return this;
};

Writer.prototype.addInt16 = function(num) {
  this._ensure(2);
  this.buffer[this.offset++] = (num >>>  8 & 0xFF);
  this.buffer[this.offset++] = (num >>>  0 & 0xFF);
  return this;
};

//for versions of node requiring 'length' as 3rd argument to buffer.write
var writeString = function(buffer, string, offset, len) {
  buffer.write(string, offset, len);
};

//overwrite function for older versions of node
if(Buffer.prototype.write.length === 3) {
  writeString = function(buffer, string, offset, len) {
    buffer.write(string, offset);
  };
}

Writer.prototype.addCString = function(string) {
  //just write a 0 for empty or null strings
  if(!string) {
    this._ensure(1);
  } else {
    var len = Buffer.byteLength(string);
    this._ensure(len + 1); //+1 for null terminator
    writeString(this.buffer, string, this.offset, len);
    this.offset += len;
  }

  this.buffer[this.offset++] = 0; // null terminator
  return this;
};

Writer.prototype.addChar = function(c) {
  this._ensure(1);
  writeString(this.buffer, c, this.offset, 1);
  this.offset++;
  return this;
};

Writer.prototype.addString = function(string) {
  string = string || "";
  var len = Buffer.byteLength(string);
  this._ensure(len);
  this.buffer.write(string, this.offset);
  this.offset += len;
  return this;
};

Writer.prototype.getByteLength = function() {
  return this.offset - 5;
};

Writer.prototype.add = function(otherBuffer) {
  this._ensure(otherBuffer.length);
  otherBuffer.copy(this.buffer, this.offset);
  this.offset += otherBuffer.length;
  return this;
};

Writer.prototype.clear = function() {
  this.offset = 5;
  this.headerPosition = 0;
  this.lastEnd = 0;
};

//appends a header block to all the written data since the last
//subsequent header or to the beginning if there is only one data block
Writer.prototype.addHeader = function(code, last) {
  var origOffset = this.offset;
  this.offset = this.headerPosition;
  this.buffer[this.offset++] = code;
  //length is everything in this packet minus the code
  this.addInt32(origOffset - (this.headerPosition+1));
  //set next header position
  this.headerPosition = origOffset;
  //make space for next header
  this.offset = origOffset;
  if(!last) {
    this._ensure(5);
    this.offset += 5;
  }
};

Writer.prototype.join = function(code) {
  if(code) {
    this.addHeader(code, true);
  }
  return this.buffer.slice(code ? 0 : 5, this.offset);
};

Writer.prototype.flush = function(code) {
  var result = this.join(code);
  this.clear();
  return result;
};


/***/ }),
/* 30 */
/***/ (function(module, exports) {

/**
 * @class
 * @private
 */
function PriorityQueue (size) {
  if (!(this instanceof PriorityQueue)) {
    return new PriorityQueue()
  }

  this._size = size
  this._slots = null
  this._total = null

  // initialize arrays to hold queue elements
  size = Math.max(+size | 0, 1)
  this._slots = []
  for (var i = 0; i < size; i += 1) {
    this._slots.push([])
  }
}

PriorityQueue.prototype.size = function size () {
  if (this._total === null) {
    this._total = 0
    for (var i = 0; i < this._size; i += 1) {
      this._total += this._slots[i].length
    }
  }
  return this._total
}

PriorityQueue.prototype.enqueue = function enqueue (obj, priority) {
  var priorityOrig

  // Convert to integer with a default value of 0.
  priority = priority && +priority | 0 || 0

  // Clear cache for total.
  this._total = null
  if (priority) {
    priorityOrig = priority
    if (priority < 0 || priority >= this._size) {
      priority = (this._size - 1)
      // put obj at the end of the line
      console.error('invalid priority: ' + priorityOrig + ' must be between 0 and ' + priority)
    }
  }

  this._slots[priority].push(obj)
}

PriorityQueue.prototype.dequeue = function dequeue (callback) {
  var obj = null
  // Clear cache for total.
  this._total = null
  for (var i = 0, sl = this._slots.length; i < sl; i += 1) {
    if (this._slots[i].length) {
      obj = this._slots[i].shift()
      break
    }
  }
  return obj
}

function doWhileAsync (conditionFn, iterateFn, callbackFn) {
  var next = function () {
    if (conditionFn()) {
      iterateFn(next)
    } else {
      callbackFn()
    }
  }
  next()
}

/**
 * Generate an Object pool with a specified `factory`.
 *
 * @class
 * @param {Object} factory
 *   Factory to be used for generating and destorying the items.
 * @param {String} factory.name
 *   Name of the factory. Serves only logging purposes.
 * @param {Function} factory.create
 *   Should create the item to be acquired,
 *   and call it's first callback argument with the generated item as it's argument.
 * @param {Function} factory.destroy
 *   Should gently close any resources that the item is using.
 *   Called before the items is destroyed.
 * @param {Function} factory.validate
 *   Should return true if connection is still valid and false
 *   If it should be removed from pool. Called before item is
 *   acquired from pool.
 * @param {Function} factory.validateAsync
 *   Asynchronous validate function. Receives a callback function
 *   as its second argument, that should be called with a single
 *   boolean argument being true if the item is still valid and false
 *   if it should be removed from pool. Called before item is
 *   acquired from pool. Only one of validate/validateAsync may be specified
 * @param {Number} factory.max
 *   Maximum number of items that can exist at the same time.  Default: 1.
 *   Any further acquire requests will be pushed to the waiting list.
 * @param {Number} factory.min
 *   Minimum number of items in pool (including in-use). Default: 0.
 *   When the pool is created, or a resource destroyed, this minimum will
 *   be checked. If the pool resource count is below the minimum, a new
 *   resource will be created and added to the pool.
 * @param {Number} factory.idleTimeoutMillis
 *   Delay in milliseconds after the idle items in the pool will be destroyed.
 *   And idle item is that is not acquired yet. Waiting items doesn't count here.
 * @param {Number} factory.reapIntervalMillis
 *   Cleanup is scheduled in every `factory.reapIntervalMillis` milliseconds.
 * @param {Boolean|Function} factory.log
 *   Whether the pool should log activity. If function is specified,
 *   that will be used instead. The function expects the arguments msg, loglevel
 * @param {Number} factory.priorityRange
 *   The range from 1 to be treated as a valid priority
 * @param {RefreshIdle} factory.refreshIdle
 *   Should idle resources be destroyed and recreated every idleTimeoutMillis? Default: true.
 * @param {Bool} [factory.returnToHead=false]
 *   Returns released object to head of available objects list
 */
function Pool (factory) {
  if (!(this instanceof Pool)) {
    return new Pool(factory)
  }

  if (factory.validate && factory.validateAsync) {
    throw new Error('Only one of validate or validateAsync may be specified')
  }

  // defaults
  factory.idleTimeoutMillis = factory.idleTimeoutMillis || 30000
  factory.returnToHead = factory.returnToHead || false
  factory.refreshIdle = ('refreshIdle' in factory) ? factory.refreshIdle : true
  factory.reapInterval = factory.reapIntervalMillis || 1000
  factory.priorityRange = factory.priorityRange || 1
  factory.validate = factory.validate || function () { return true }

  factory.max = parseInt(factory.max, 10)
  factory.min = parseInt(factory.min, 10)

  factory.max = Math.max(isNaN(factory.max) ? 1 : factory.max, 1)
  factory.min = Math.min(isNaN(factory.min) ? 0 : factory.min, factory.max - 1)

  this._factory = factory
  this._inUseObjects = []
  this._draining = false
  this._waitingClients = new PriorityQueue(factory.priorityRange)
  this._availableObjects = []
  this._count = 0
  this._removeIdleTimer = null
  this._removeIdleScheduled = false

  // create initial resources (if factory.min > 0)
  this._ensureMinimum()
}

/**
 * logs to console or user defined log function
 * @private
 * @param {string} str
 * @param {string} level
 */
Pool.prototype._log = function log (str, level) {
  if (typeof this._factory.log === 'function') {
    this._factory.log(str, level)
  } else if (this._factory.log) {
    console.log(level.toUpperCase() + ' pool ' + this._factory.name + ' - ' + str)
  }
}

/**
 * Request the client to be destroyed. The factory's destroy handler
 * will also be called.
 *
 * This should be called within an acquire() block as an alternative to release().
 *
 * @param {Object} obj
 *   The acquired item to be destoyed.
 */
Pool.prototype.destroy = function destroy (obj) {
  this._count -= 1
  if (this._count < 0) this._count = 0
  this._availableObjects = this._availableObjects.filter(function (objWithTimeout) {
    return (objWithTimeout.obj !== obj)
  })

  this._inUseObjects = this._inUseObjects.filter(function (objInUse) {
    return (objInUse !== obj)
  })

  this._factory.destroy(obj)

  this._ensureMinimum()
}

/**
 * Checks and removes the available (idle) clients that have timed out.
 * @private
 */
Pool.prototype._removeIdle = function removeIdle () {
  var toRemove = []
  var now = new Date().getTime()
  var i
  var al
  var tr
  var timeout

  this._removeIdleScheduled = false

  // Go through the available (idle) items,
  // check if they have timed out
  for (i = 0, al = this._availableObjects.length; i < al && (this._factory.refreshIdle && (this._count - this._factory.min > toRemove.length)); i += 1) {
    timeout = this._availableObjects[i].timeout
    if (now >= timeout) {
      // Client timed out, so destroy it.
      this._log('removeIdle() destroying obj - now:' + now + ' timeout:' + timeout, 'verbose')
      toRemove.push(this._availableObjects[i].obj)
    }
  }

  for (i = 0, tr = toRemove.length; i < tr; i += 1) {
    this.destroy(toRemove[i])
  }

  // Replace the available items with the ones to keep.
  al = this._availableObjects.length

  if (al > 0) {
    this._log('this._availableObjects.length=' + al, 'verbose')
    this._scheduleRemoveIdle()
  } else {
    this._log('removeIdle() all objects removed', 'verbose')
  }
}

/**
 * Schedule removal of idle items in the pool.
 *
 * More schedules cannot run concurrently.
 */
Pool.prototype._scheduleRemoveIdle = function scheduleRemoveIdle () {
  var self = this
  if (!this._removeIdleScheduled) {
    this._removeIdleScheduled = true
    this._removeIdleTimer = setTimeout(function () {
      self._removeIdle()
    }, this._factory.reapInterval)
  }
}

/**
 * Try to get a new client to work, and clean up pool unused (idle) items.
 *
 *  - If there are available clients waiting, shift the first one out (LIFO),
 *    and call its callback.
 *  - If there are no waiting clients, try to create one if it won't exceed
 *    the maximum number of clients.
 *  - If creating a new client would exceed the maximum, add the client to
 *    the wait list.
 * @private
 */
Pool.prototype._dispense = function dispense () {
  var self = this
  var objWithTimeout = null
  var err = null
  var clientCb = null
  var waitingCount = this._waitingClients.size()

  this._log('dispense() clients=' + waitingCount + ' available=' + this._availableObjects.length, 'info')
  if (waitingCount > 0) {
    if (this._factory.validateAsync) {
      doWhileAsync(function () {
        return self._availableObjects.length > 0
      }, function (next) {
        self._log('dispense() - reusing obj', 'verbose')
        objWithTimeout = self._availableObjects[0]

        self._factory.validateAsync(objWithTimeout.obj, function (valid) {
          if (!valid) {
            self.destroy(objWithTimeout.obj)
            next()
          } else {
            self._availableObjects.shift()
            self._inUseObjects.push(objWithTimeout.obj)
            clientCb = self._waitingClients.dequeue()
            clientCb(err, objWithTimeout.obj)
          }
        })
      }, function () {
        if (self._count < self._factory.max) {
          self._createResource()
        }
      })

      return
    }

    while (this._availableObjects.length > 0) {
      this._log('dispense() - reusing obj', 'verbose')
      objWithTimeout = this._availableObjects[0]
      if (!this._factory.validate(objWithTimeout.obj)) {
        this.destroy(objWithTimeout.obj)
        continue
      }
      this._availableObjects.shift()
      this._inUseObjects.push(objWithTimeout.obj)
      clientCb = this._waitingClients.dequeue()
      return clientCb(err, objWithTimeout.obj)
    }
    if (this._count < this._factory.max) {
      this._createResource()
    }
  }
}

/**
 * @private
 */
Pool.prototype._createResource = function _createResource () {
  this._count += 1
  this._log('createResource() - creating obj - count=' + this._count + ' min=' + this._factory.min + ' max=' + this._factory.max, 'verbose')
  var self = this
  this._factory.create(function () {
    var err, obj
    var clientCb = self._waitingClients.dequeue()
    if (arguments.length > 1) {
      err = arguments[0]
      obj = arguments[1]
    } else {
      err = (arguments[0] instanceof Error) ? arguments[0] : null
      obj = (arguments[0] instanceof Error) ? null : arguments[0]
    }
    if (err) {
      self._count -= 1
      if (self._count < 0) self._count = 0
      if (clientCb) {
        clientCb(err, obj)
      }
      process.nextTick(function () {
        self._dispense()
      })
    } else {
      self._inUseObjects.push(obj)
      if (clientCb) {
        clientCb(err, obj)
      } else {
        self.release(obj)
      }
    }
  })
}

/**
 * @private
 */
Pool.prototype._ensureMinimum = function _ensureMinimum () {
  var i, diff
  if (!this._draining && (this._count < this._factory.min)) {
    diff = this._factory.min - this._count
    for (i = 0; i < diff; i++) {
      this._createResource()
    }
  }
}

/**
 * Request a new client. The callback will be called,
 * when a new client will be availabe, passing the client to it.
 *
 * @param {Function} callback
 *   Callback function to be called after the acquire is successful.
 *   The function will receive the acquired item as the first parameter.
 *
 * @param {Number} priority
 *   Optional.  Integer between 0 and (priorityRange - 1).  Specifies the priority
 *   of the caller if there are no available resources.  Lower numbers mean higher
 *   priority.
 *
 * @returns {boolean} `true` if the pool is not fully utilized, `false` otherwise.
 */
Pool.prototype.acquire = function acquire (callback, priority) {
  if (this._draining) {
    throw new Error('pool is draining and cannot accept work')
  }
  this._waitingClients.enqueue(callback, priority)
  this._dispense()
  return (this._count < this._factory.max)
}

/**
 * @deprecated
 */
Pool.prototype.borrow = function borrow (callback, priority) {
  this._log('borrow() is deprecated. use acquire() instead', 'warn')
  this.acquire(callback, priority)
}

/**
 * Return the client to the pool, in case it is no longer required.
 *
 * @param {Object} obj
 *   The acquired object to be put back to the pool.
 */
Pool.prototype.release = function release (obj) {
  // check to see if this object has already been released (i.e., is back in the pool of this._availableObjects)
  if (this._availableObjects.some(function (objWithTimeout) { return (objWithTimeout.obj === obj) })) {
    this._log('release called twice for the same resource: ' + (new Error().stack), 'error')
    return
  }

  // check to see if this object exists in the `in use` list and remove it
  var index = this._inUseObjects.indexOf(obj)
  if (index < 0) {
    this._log('attempt to release an invalid resource: ' + (new Error().stack), 'error')
    return
  }

  // this._log("return to pool")
  this._inUseObjects.splice(index, 1)
  var objWithTimeout = { obj: obj, timeout: (new Date().getTime() + this._factory.idleTimeoutMillis) }
  if (this._factory.returnToHead) {
    this._availableObjects.splice(0, 0, objWithTimeout)
  } else {
    this._availableObjects.push(objWithTimeout)
  }
  this._log('timeout: ' + objWithTimeout.timeout, 'verbose')
  this._dispense()
  this._scheduleRemoveIdle()
}

/**
 * @deprecated
 */
Pool.prototype.returnToPool = function returnToPool (obj) {
  this._log('returnToPool() is deprecated. use release() instead', 'warn')
  this.release(obj)
}

/**
 * Disallow any new requests and let the request backlog dissapate.
 *
 * @param {Function} callback
 *   Optional. Callback invoked when all work is done and all clients have been
 *   released.
 */
Pool.prototype.drain = function drain (callback) {
  this._log('draining', 'info')

  // disable the ability to put more work on the queue.
  this._draining = true

  var self = this
  var check = function () {
    if (self._waitingClients.size() > 0) {
      // wait until all client requests have been satisfied.
      setTimeout(check, 100)
    } else if (self._availableObjects.length !== self._count) {
      // wait until all objects have been released.
      setTimeout(check, 100)
    } else if (callback) {
      callback()
    }
  }
  check()
}

/**
 * Forcibly destroys all clients regardless of timeout.  Intended to be
 * invoked as part of a drain.  Does not prevent the creation of new
 * clients as a result of subsequent calls to acquire.
 *
 * Note that if factory.min > 0, the pool will destroy all idle resources
 * in the pool, but replace them with newly created resources up to the
 * specified factory.min value.  If this is not desired, set factory.min
 * to zero before calling destroyAllNow()
 *
 * @param {Function} callback
 *   Optional. Callback invoked after all existing clients are destroyed.
 */
Pool.prototype.destroyAllNow = function destroyAllNow (callback) {
  this._log('force destroying all objects', 'info')
  var willDie = this._availableObjects
  this._availableObjects = []
  var obj = willDie.shift()
  while (obj !== null && obj !== undefined) {
    this.destroy(obj.obj)
    obj = willDie.shift()
  }
  this._removeIdleScheduled = false
  clearTimeout(this._removeIdleTimer)
  if (callback) {
    callback()
  }
}

/**
 * Decorates a function to use a acquired client from the object pool when called.
 *
 * @param {Function} decorated
 *   The decorated function, accepting a client as the first argument and
 *   (optionally) a callback as the final argument.
 *
 * @param {Number} priority
 *   Optional.  Integer between 0 and (priorityRange - 1).  Specifies the priority
 *   of the caller if there are no available resources.  Lower numbers mean higher
 *   priority.
 */
Pool.prototype.pooled = function pooled (decorated, priority) {
  var self = this
  return function () {
    var callerArgs = arguments
    var callerCallback = callerArgs[callerArgs.length - 1]
    var callerHasCallback = typeof callerCallback === 'function'
    self.acquire(function (err, client) {
      if (err) {
        if (callerHasCallback) {
          callerCallback(err)
        }
        return
      }

      var args = [client].concat(Array.prototype.slice.call(callerArgs, 0, callerHasCallback ? -1 : undefined))
      args.push(function () {
        self.release(client)
        if (callerHasCallback) {
          callerCallback.apply(null, arguments)
        }
      })

      decorated.apply(null, args)
    }, priority)
  }
}

Pool.prototype.getPoolSize = function getPoolSize () {
  return this._count
}

Pool.prototype.getName = function getName () {
  return this._factory.name
}

Pool.prototype.availableObjectsCount = function availableObjectsCount () {
  return this._availableObjects.length
}

Pool.prototype.inUseObjectsCount = function inUseObjectsCount () {
  return this._inUseObjects.length
}

Pool.prototype.waitingClientsCount = function waitingClientsCount () {
  return this._waitingClients.size()
}

Pool.prototype.getMaxPoolSize = function getMaxPoolSize () {
  return this._factory.max
}

Pool.prototype.getMinPoolSize = function getMinPoolSize () {
  return this._factory.min
}

exports.Pool = Pool


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var fs = __webpack_require__(6)
  , lstat = fs.lstatSync;

exports.readlinkSync = function (p) {
  if (lstat(p).isSymbolicLink()) {
    return fs.readlinkSync(p);
  } else {
    return p;
  }
};




/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, __dirname) {var PQ = module.exports = __webpack_require__(28)('addon.node').PQ;

//print out the include dir
//if you want to include this in a binding.gyp file
if(!module.parent) {
  var path = __webpack_require__(2);
  console.log(path.normalize(__dirname + '/src'));
}

var EventEmitter = __webpack_require__(1).EventEmitter;
var assert = __webpack_require__(5);

for(var key in EventEmitter.prototype) {
  PQ.prototype[key] = EventEmitter.prototype[key];
}

//SYNC connects to the server
//throws an exception in the event of a connection error
PQ.prototype.connectSync = function(paramString) {
  this.connected = true;
  if(!paramString) {
    paramString = '';
  }
  var connected = this.$connectSync(paramString);
  if(!connected) {
    var err = new Error(this.errorMessage());
    this.finish();
    throw err;
  }
};

//connects async using a background thread
//calls the callback with an error if there was one
PQ.prototype.connect = function(paramString, cb) {
  this.connected = true;
  if(typeof paramString == 'function') {
    cb = paramString;
    paramString = '';
  }
  if(!paramString) {
    paramString = '';
  }
  assert(cb, 'Must provide a connection callback');
  if(process.domain) {
    cb = process.domain.bind(cb);
  }
  this.$connect(paramString, cb);
};

PQ.prototype.errorMessage = function() {
  return this.$getLastErrorMessage();
};

//returns an int for the fd of the socket
PQ.prototype.socket = function() {
  return this.$socket();
};

// return server version number e.g. 90300
PQ.prototype.serverVersion = function () {
  return this.$serverVersion();
};

//finishes the connection & closes it
PQ.prototype.finish = function() {
  this.connected = false;
  this.$finish();
};

////SYNC executes a plain text query
//immediately stores the results within the PQ object for consumption with
//ntuples, getvalue, etc...
//returns false if there was an error
//consume additional error details via PQ#errorMessage & friends
PQ.prototype.exec = function(commandText) {
  if(!commandText) {
    commandText = '';
  }
  this.$exec(commandText);
};

//SYNC executes a query with parameters
//immediately stores the results within the PQ object for consumption with
//ntuples, getvalue, etc...
//returns false if there was an error
//consume additional error details via PQ#errorMessage & friends
PQ.prototype.execParams = function(commandText, parameters) {
  if(!commandText) {
    commandText = '';
  }
  if(!parameters) {
    parameters = [];
  }
  this.$execParams(commandText, parameters);
};

//SYNC prepares a named query and stores the result
//immediately stores the results within the PQ object for consumption with
//ntuples, getvalue, etc...
//returns false if there was an error
//consume additional error details via PQ#errorMessage & friends
PQ.prototype.prepare = function(statementName, commandText, nParams) {
  assert.equal(arguments.length, 3, 'Must supply 3 arguments');
  if(!statementName) {
    statementName = '';
  }
  if(!commandText) {
    commandText = '';
  }
  nParams = Number(nParams) || 0;
  this.$prepare(statementName, commandText, nParams);
};

//SYNC executes a named, prepared query and stores the result
//immediately stores the results within the PQ object for consumption with
//ntuples, getvalue, etc...
//returns false if there was an error
//consume additional error details via PQ#errorMessage & friends
PQ.prototype.execPrepared = function(statementName, parameters) {
  if(!statementName) {
    statementName = '';
  }
  if(!parameters) {
    parameters = [];
  }
  this.$execPrepared(statementName, parameters);
};

//send a command to begin executing a query in async mode
//returns true if sent, or false if there was a send failure
PQ.prototype.sendQuery = function(commandText) {
  if(!commandText) {
    commandText = '';
  }
  return this.$sendQuery(commandText);
};

//send a command to begin executing a query with parameters in async mode
//returns true if sent, or false if there was a send failure
PQ.prototype.sendQueryParams = function(commandText, parameters) {
  if(!commandText) {
    commandText = '';
  }
  if(!parameters) {
    parameters = [];
  }
  return this.$sendQueryParams(commandText, parameters);
};

//send a command to prepare a named query in async mode
//returns true if sent, or false if there was a send failure
PQ.prototype.sendPrepare = function(statementName, commandText, nParams) {
  assert.equal(arguments.length, 3, 'Must supply 3 arguments');
  if(!statementName) {
    statementName = '';
  }
  if(!commandText) {
    commandText = '';
  }
  nParams = Number(nParams) || 0;
  return this.$sendPrepare(statementName, commandText, nParams);
};

//send a command to execute a named query in async mode
//returns true if sent, or false if there was a send failure
PQ.prototype.sendQueryPrepared = function(statementName, parameters) {
  if(!statementName) {
    statementName = '';
  }
  if(!parameters) {
    parameters = [];
  }
  return this.$sendQueryPrepared(statementName, parameters);
};

//'pops' a result out of the buffered
//response data read during async command execution
//and stores it on the c/c++ object so you can consume
//the data from it.  returns true if there was a pending result
//or false if there was no pending result. if there was no pending result
//the last found result is not overwritten so you can call getResult as many
//times as you want, and you'll always have the last available result for consumption
PQ.prototype.getResult = function() {
  return this.$getResult();
};

//returns a text of the enum associated with the result
//usually just PGRES_COMMAND_OK or PGRES_FATAL_ERROR
PQ.prototype.resultStatus = function() {
  return this.$resultStatus();
};

PQ.prototype.resultErrorMessage = function() {
  return this.$resultErrorMessage();
};

PQ.prototype.resultErrorFields = function() {
  return this.$resultErrorFields();
};

//free the memory associated with a result
//this is somewhat handled for you within the c/c++ code
//by never allowing the code to 'leak' a result. still,
//if you absolutely want to free it yourself, you can use this.
PQ.prototype.clear = function() {
  this.$clear();
};

//returns the number of tuples (rows) in the result set
PQ.prototype.ntuples = function() {
  return this.$ntuples();
};

//returns the number of fields (columns) in the result set
PQ.prototype.nfields = function() {
  return this.$nfields();
};

//returns the name of the field (column) at the given offset
PQ.prototype.fname = function(offset) {
  return this.$fname(offset);
};

//returns the Oid of the type for the given field
PQ.prototype.ftype = function(offset) {
  return this.$ftype(offset);
};

//returns a text value at the given row/col
//if the value is null this still returns empty string
//so you need to use PQ#getisnull to determine
PQ.prototype.getvalue = function(row, col) {
  return this.$getvalue(row, col);
};

//returns true/false if the value is null
PQ.prototype.getisnull = function(row, col) {
  return this.$getisnull(row, col);
};

//returns the status of the command
PQ.prototype.cmdStatus = function() {
  return this.$cmdStatus();
};

//returns the tuples in the command
PQ.prototype.cmdTuples = function() {
  return this.$cmdTuples();
};

//starts the 'read ready' libuv socket listener.
//Once the socket becomes readable, the PQ instance starts
//emitting 'readable' events.  Similar to how node's readable-stream
//works except to clear the SELECT() notification you need to call
//PQ#consumeInput instead of letting node pull the data off the socket
//http://www.postgresql.org/docs/9.1/static/libpq-async.html
PQ.prototype.startReader = function() {
  assert(this.connected, 'Must be connected to start reader');
  this.$startRead();
};

//suspends the libuv socket 'read ready' listener
PQ.prototype.stopReader = function() {
  this.$stopRead();
};

PQ.prototype.writable = function(cb) {
  assert(this.connected, 'Must be connected to start writer');
  this.$startWrite();
  return this.once('writable', cb);
};

//returns boolean - false indicates an error condition
//e.g. a failure to consume input
PQ.prototype.consumeInput = function() {
  return this.$consumeInput();
};

//returns true if PQ#getResult would cause
//the process to block waiting on results
//false indicates PQ#getResult can be called
//with an assurance of not blocking
PQ.prototype.isBusy = function() {
  return this.$isBusy();
};

//toggles the socket blocking on outgoing writes
PQ.prototype.setNonBlocking = function(truthy) {
  return this.$setNonBlocking(truthy ? 1 : 0);
};

//returns true if the connection is non-blocking on writes, otherwise false
//note: connection is always non-blocking on reads if using the send* methods
PQ.prototype.isNonBlocking = function() {
  return this.$isNonBlocking();
};

//returns 1 if socket is not write-ready
//returns 0 if all data flushed to socket
//returns -1 if there is an error
PQ.prototype.flush = function() {
  return this.$flush();
};

//escapes a literal and returns the escaped string
//I'm not 100% sure this doesn't do any I/O...need to check that
PQ.prototype.escapeLiteral = function(input) {
  if(!input) return input;
  return this.$escapeLiteral(input);
};

PQ.prototype.escapeIdentifier = function(input) {
  if(!input) return input;
  return this.$escapeIdentifier(input);
};

//Checks for any notifications which may have arrivied
//and returns them as a javascript object: {relname: 'string', extra: 'string', be_pid: int}
//if there are no pending notifications this returns undefined
PQ.prototype.notifies = function() {
  return this.$notifies();
};

//Sends a buffer of binary data to the server
//returns 1 if the command was sent successfully
//returns 0 if the command would block (use PQ#writable here if so)
//returns -1 if there was an error
PQ.prototype.putCopyData = function(buffer) {
  assert(buffer instanceof Buffer);
  return this.$putCopyData(buffer);
};

//Sends a command to 'finish' the copy
//if an error message is passed, it will be sent to the
//backend and signal a request to cancel the copy in
//returns 1 if sent succesfully
//returns 0 if the command would block
//returns -1 if there was an error
PQ.prototype.putCopyEnd = function(errorMessage) {
  if(errorMessage) {
    return this.$putCopyEnd(errorMessage);
  }
  return this.$putCopyEnd();
};

//Gets a buffer of data from a copy out command
//if async is passed as true it will not block waiting
//for the result, otherwise this will BLOCK for a result.
//returns a buffer if successful
//returns 0 if copy is still in process (async only)
//returns -1 if the copy is done
//returns -2 if there was an error
PQ.prototype.getCopyData = function(async) {
  return this.$getCopyData(!!async);
};

PQ.prototype.cancel = function() {
  return this.$cancel();
};

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(59)(module), "/"))

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var assert = __webpack_require__(5)

var Reader = module.exports = function(options) {
  //TODO - remove for version 1.0
  if(typeof options == 'number') {
    options = { headerSize: options }
  }
  options = options || {}
  this.offset = 0
  this.lastChunk = false
  this.chunk = null
  this.headerSize = options.headerSize || 0
  this.lengthPadding = options.lengthPadding || 0
  this.header = null
  assert(this.headerSize < 2, 'pre-length header of more than 1 byte length not currently supported')
}

Reader.prototype.addChunk = function(chunk) {
  this.offset = 0
  this.chunk = chunk
  if(this.lastChunk) {
    this.chunk = Buffer.concat([this.lastChunk, this.chunk])
    this.lastChunk = false
  }
}

Reader.prototype._save = function() {
  //save any unread chunks for next read
  if(this.offset < this.chunk.length) {
    this.lastChunk = this.chunk.slice(this.offset)
  }
  return false
}

Reader.prototype.read = function() {
  if(this.chunk.length < (this.headerSize + 4 + this.offset)) {
    return this._save()
  }

  if(this.headerSize) {
    this.header = this.chunk[this.offset]
  }

  //read length of next item
  var length = this.chunk.readUInt32BE(this.offset + this.headerSize) + this.lengthPadding

  //next item spans more chunks than we have
  var remaining = this.chunk.length - (this.offset + 4 + this.headerSize)
  if(length > remaining) {
    return this._save()
  }

  this.offset += (this.headerSize + 4)
  var result = this.chunk.slice(this.offset, this.offset + length)
  this.offset += length
  return result
}


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var url = __webpack_require__(19);

//Parse method copied from https://github.com/brianc/node-postgres
//Copyright (c) 2010-2014 Brian Carlson (brian.m.carlson@gmail.com)
//MIT License

//parses a connection string
function parse(str) {
  var config;
  //unix socket
  if(str.charAt(0) === '/') {
    config = str.split(' ');
    return { host: config[0], database: config[1] };
  }
  // url parse expects spaces encoded as %20
  if(/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
    str = encodeURI(str).replace(/\%25(\d\d)/g, "%$1");
  }
  var result = url.parse(str, true);
  config = {};

  if (result.query.application_name) {
    config.application_name = result.query.application_name;
  }
  if (result.query.fallback_application_name) {
    config.fallback_application_name = result.query.fallback_application_name;
  }

  config.port = result.port;
  if(result.protocol == 'socket:') {
    config.host = decodeURI(result.pathname);
    config.database = result.query.db;
    config.client_encoding = result.query.encoding;
    return config;
  }
  config.host = result.hostname;

  // result.pathname is not always guaranteed to have a '/' prefix (e.g. relative urls)
  // only strip the slash if it is present.
  var pathname = result.pathname;
  if (pathname && pathname.charAt(0) === '/') {
    pathname = result.pathname.slice(1) || null;
  }
  config.database = pathname && decodeURI(pathname);

  var auth = (result.auth || ':').split(':');
  config.user = auth[0];
  config.password = auth.splice(1).join(':');

  var ssl = result.query.ssl;
  if (ssl === 'true' || ssl === '1') {
    config.ssl = true;
  }

  return config;
}

module.exports = {
  parse: parse
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var Libpq = __webpack_require__(32);
var EventEmitter = __webpack_require__(1).EventEmitter;
var util = __webpack_require__(0);
var assert = __webpack_require__(5);
var types = __webpack_require__(37);

var Client = module.exports = function(config) {
  if(!(this instanceof Client)) {
    return new Client(config);
  }

  config = config || {};

  EventEmitter.call(this);
  this.pq = new Libpq();
  this._reading = false;
  this._read = this._read.bind(this);

  //allow custom type converstion to be passed in
  this._types = config.types || types;

  //allow config to specify returning results
  //as an array of values instead of a hash
  this.arrayMode = config.arrayMode || false;
  var self = this;

  //lazy start the reader if notifications are listened for
  //this way if you only run sync queries you wont block
  //the event loop artificially
  this.on('newListener', function(event) {
    if(event != 'notification') return;
    self._startReading();
  });
};

util.inherits(Client, EventEmitter);

Client.prototype.connect = function(params, cb) {
  this.pq.connect(params, cb);
};

Client.prototype.connectSync = function(params) {
  this.pq.connectSync(params);
};

Client.prototype._parseResults = function(pq, rows) {
  var rowCount = pq.ntuples();
  var colCount = pq.nfields();
  for(var i = 0; i < rowCount; i++) {
    var row = this.arrayMode ? [] : {};
    rows.push(row);
    for(var j = 0; j < colCount; j++) {
      var rawValue = pq.getvalue(i, j);
      var value = rawValue;
      if(rawValue == '') {
        if(pq.getisnull(i, j)) {
          value = null;
        }
      } else {
        value = this._types.getTypeParser(pq.ftype(j))(rawValue);
      }
      if(this.arrayMode) {
        row.push(value);
      } else {
        row[pq.fname(j)] = value;
      }
    }
  }
  return rows;
}

Client.prototype.end = function(cb) {
  this._stopReading();
  this.pq.finish();
  if(cb) setImmediate(cb);
};

Client.prototype._readError = function(message) {
  this._stopReading();
  var err = new Error(message || this.pq.errorMessage());
  this.emit('error', err);
};

Client.prototype._stopReading = function() {
  if(!this._reading) return;
  this._reading = false;
  this.pq.stopReader();
  this.pq.removeListener('readable', this._read);
};

//called when libpq is readable
Client.prototype._read = function() {
  var pq = this.pq;
  //read waiting data from the socket
  //e.g. clear the pending 'select'
  if(!pq.consumeInput()) {
    //if consumeInput returns false
    //than a read error has been encountered
    return this._readError();
  }

  //check if there is still outstanding data
  //if so, wait for it all to come in
  if(pq.isBusy()) {
    return;
  }

  //load our result object
  var rows = []
  while(pq.getResult()) {
    if(pq.resultStatus() == 'PGRES_TUPLES_OK') {
      this._parseResults(this.pq, rows);
    }
    if(pq.resultStatus() == 'PGRES_COPY_OUT')  break;
  }


  var status = pq.resultStatus();
  switch(status) {
    case 'PGRES_FATAL_ERROR':
      return this._readError();
    case 'PGRES_COMMAND_OK':
    case 'PGRES_TUPLES_OK':
    case 'PGRES_COPY_OUT':
    case 'PGRES_EMPTY_QUERY': {
      this.emit('result', rows);
      break;
    }
    default:
      return this._readError('unrecognized command status: ' + status);
  }

  var notice;
  while(notice = this.pq.notifies()) {
    this.emit('notification', notice);
  }
};

//ensures the client is reading and
//everything is set up for async io
Client.prototype._startReading = function() {
  if(this._reading) return;
  this._reading = true;
  this.pq.on('readable', this._read);
  this.pq.startReader();
};

var throwIfError = function(pq) {
  var err = pq.resultErrorMessage() || pq.errorMessage();
  if(err) {
    throw new Error(err);
  }
}

Client.prototype._awaitResult = function(cb) {
  var self = this;
  var onError = function(e) {
    self.removeListener('error', onError);
    self.removeListener('result', onResult);
    cb(e);
  };

  var onResult = function(rows) {
    self.removeListener('error', onError);
    self.removeListener('result', onResult);
    cb(null, rows);
  };
  this.once('error', onError);
  this.once('result', onResult);
  this._startReading();
};

//wait for the writable socket to drain
Client.prototype.waitForDrain = function(pq, cb) {
  var res = pq.flush();
  //res of 0 is success
  if(res === 0) return cb();

  //res of -1 is failure
  if(res === -1) return cb(pq.errorMessage());

  //otherwise outgoing message didn't flush to socket
  //wait for it to flush and try again
  var self = this
  //you cannot read & write on a socket at the same time
  return pq.writable(function() {
    self.waitForDrain(pq, cb)
  });
};

//send an async query to libpq and wait for it to
//finish writing query text to the socket
Client.prototype.dispatchQuery = function(pq, fn, cb) {
  this._stopReading();
  var success = pq.setNonBlocking(true);
  if(!success) return cb(new Error('Unable to set non-blocking to true'));
  var sent = fn();
  if(!sent) return cb(new Error(pq.errorMessage() || 'Something went wrong dispatching the query'));
  this.waitForDrain(pq, cb);
};

Client.prototype.query = function(text, values, cb) {
  var queryFn;

  if(typeof values == 'function') {
    cb = values;
    queryFn = function() { return self.pq.sendQuery(text); };
  } else {
    queryFn = function() { return self.pq.sendQueryParams(text, values); };
  }

  var self = this

  self.dispatchQuery(self.pq, queryFn, function(err) {
    if(err) return cb(err);

    self._awaitResult(cb)
  });
};

Client.prototype.prepare = function(statementName, text, nParams, cb) {
  var self = this;
  var fn = function() {
    return self.pq.sendPrepare(statementName, text, nParams);
  }

  self.dispatchQuery(self.pq, fn, function(err) {
    if(err) return cb(err);
    self._awaitResult(cb);
  });
};

Client.prototype.execute = function(statementName, parameters, cb) {
  var self = this;

  var fn = function() {
    return self.pq.sendQueryPrepared(statementName, parameters);
  };

  self.dispatchQuery(self.pq, fn, function(err, rows) {
    if(err) return cb(err);
    self._awaitResult(cb)
  });
};

var CopyStream = __webpack_require__(36);
Client.prototype.getCopyStream = function() {
  this.pq.setNonBlocking(true);
  this._stopReading();
  return new CopyStream(this.pq);
};

//cancel a currently executing query
Client.prototype.cancel = function(cb) {
  assert(cb, 'Callback is required');
  //result is either true or a string containing an error
  var result = this.pq.cancel();
  return setImmediate(function() {
    cb(result === true ? undefined : new Error(result));
  });
};

Client.prototype.querySync = function(text, values) {
  var queryFn;
  var pq = this.pq;
  pq[values ? 'execParams' : 'exec'].call(pq, text, values);
  throwIfError(this.pq);
  return this._parseResults(pq, []);
};

Client.prototype.prepareSync = function(statementName, text, nParams) {
  this.pq.prepare(statementName, text, nParams);
  throwIfError(this.pq);
};

Client.prototype.executeSync = function(statementName, parameters) {
  this.pq.execPrepared(statementName, parameters);
  throwIfError(this.pq);
  return this._parseResults(this.pq, []);
};

Client.prototype.escapeLiteral = function(value) {
  return this.pq.escapeLiteral(value);
};

Client.prototype.escapeIdentifier = function(value) {
  return this.pq.escapeIdentifier(value);
};

//export the version number so we can check it in node-postgres
module.exports.version = __webpack_require__(40).version


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var Duplex = __webpack_require__(7).Duplex;
var Writable = __webpack_require__(7).Writable;
var util = __webpack_require__(0);

var CopyStream = module.exports = function(pq, options) {
  Duplex.call(this, options);
  this.pq = pq;
  this._reading = false;
};

util.inherits(CopyStream, Duplex);

//writer methods
CopyStream.prototype._write = function(chunk, encoding, cb) {
  var result = this.pq.putCopyData(chunk);

  //sent successfully
  if(result === 1) return cb();

  //error
  if(result === -1) return cb(new Error(this.pq.errorMessage()));

  //command would block. wait for writable and call again.
  var self = this;
  this.pq.writable(function() {
    self._write(chunk, encoding, cb);
  });
};

CopyStream.prototype.end = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  var self = this;

  var callback = args.pop();

  if(args.length) {
    this.write(args[0]);
  }
  var result = this.pq.putCopyEnd();

  //sent successfully
  if(result === 1) {
    //consume our results and then call 'end' on the
    //"parent" writable class so we can emit 'finish' and
    //all that jazz
    return consumeResults(this.pq, function(err, res) {
      Writable.prototype.end.call(self);

      //handle possible passing of callback to end method
      if(callback) {
        callback();
      }
    });
  }

  //error
  if(result === -1) {
    var err = new Error(this.pq.errorMessage());
    return this.emit('error', err);
  }

  //command would block. wait for writable and call end again
  //don't pass any buffers to end on the second call because
  //we already sent them to possible this.write the first time
  //we called end
  return this.pq.writable(function() {
    return self.end.apply(self, callback);
  });
};

//reader methods
CopyStream.prototype._consumeBuffer = function(cb) {
  var result = this.pq.getCopyData(true);
  if(result instanceof Buffer) {
    return setImmediate(function() {
      cb(null, result);
    })
  }
  if(result === -1) {
    //end of stream
    return cb(null, null);
  }
  if(result === 0) {
    var self = this;
    this.pq.once('readable', function() {
      self.pq.stopReader();
      self.pq.consumeInput();
      self._consumeBuffer(cb);
    });
    return this.pq.startReader();
  }
  cb(new Error('Unrecognized read status: ' + result))
};

CopyStream.prototype._read = function(size) {
  if(this._reading) return;
  this._reading = true;
  //console.log('read begin');
  var self = this
  this._consumeBuffer(function(err, buffer) {
    self._reading = false;
    if(err) {
      return self.emit('error', err)
    }
    if(buffer === false) {
      //nothing to read for now, return
      return;
    }
    self.push(buffer);
  });
};

var consumeResults = function(pq, cb) {

  var cleanup = function() {
    pq.removeListener('readable', onReadable);
    pq.stopReader();
  }

  var readError = function(message) {
    cleanup();
    return cb(new Error(message || pq.errorMessage()));
  };


  var onReadable = function() {

    //read waiting data from the socket
    //e.g. clear the pending 'select'
    if(!pq.consumeInput()) {
      return readError();
    }

    //check if there is still outstanding data
    //if so, wait for it all to come in
    if(pq.isBusy()) {
      return;
    }

    //load our result object
    pq.getResult();

    //"read until results return null"
    //or in our case ensure we only have one result
    if(pq.getResult() && pq.resultStatus() != 'PGRES_COPY_OUT') {
      return readError('Only one result at a time is accepted');
    }

    if(pq.resultStatus() == 'PGRES_FATAL_ERROR') {
      return readError();
    }

    cleanup();
    return cb(null);
  };
  pq.on('readable', onReadable);
  pq.startReader();
};


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var textParsers = __webpack_require__(39);
var binaryParsers = __webpack_require__(38);
var arrayParser = __webpack_require__(10);

var typeParsers = {
  text: {},
  binary: {}
};

//the empty parse function
var noParse = function(val) {
  return String(val);
};

//returns a function used to convert a specific type (specified by
//oid) into a result javascript type
//note: the oid can be obtained via the following sql query:
//SELECT oid FROM pg_type WHERE typname = 'TYPE_NAME_HERE';
var getTypeParser = function(oid, format) {
  format = format || 'text';
  if (!typeParsers[format]) {
    return noParse;
  }
  return typeParsers[format][oid] || noParse;
};

var setTypeParser = function(oid, format, parseFn) {
  if(typeof format == 'function') {
    parseFn = format;
    format = 'text';
  }
  typeParsers[format][oid] = parseFn;
};

textParsers.init(function(oid, converter) {
  typeParsers.text[oid] = converter;
});

binaryParsers.init(function(oid, converter) {
  typeParsers.binary[oid] = converter;
});

module.exports = {
  getTypeParser: getTypeParser,
  setTypeParser: setTypeParser,
  arrayParser: arrayParser
};


/***/ }),
/* 38 */
/***/ (function(module, exports) {

var parseBits = function(data, bits, offset, invert, callback) {
  offset = offset || 0;
  invert = invert || false;
  callback = callback || function(lastValue, newValue, bits) { return (lastValue * Math.pow(2, bits)) + newValue; };
  var offsetBytes = offset >> 3;

  var inv = function(value) {
    if (invert) {
      return ~value & 0xff;
    }

    return value;
  };

  // read first (maybe partial) byte
  var mask = 0xff;
  var firstBits = 8 - (offset % 8);
  if (bits < firstBits) {
    mask = (0xff << (8 - bits)) & 0xff;
    firstBits = bits;
  }

  if (offset) {
    mask = mask >> (offset % 8);
  }

  var result = 0;
  if ((offset % 8) + bits >= 8) {
    result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
  }

  // read bytes
  var bytes = (bits + offset) >> 3;
  for (var i = offsetBytes + 1; i < bytes; i++) {
    result = callback(result, inv(data[i]), 8);
  }

  // bits to read, that are not a complete byte
  var lastBits = (bits + offset) % 8;
  if (lastBits > 0) {
    result = callback(result, inv(data[bytes]) >> (8 - lastBits), lastBits);
  }

  return result;
};

var parseFloatFromBits = function(data, precisionBits, exponentBits) {
  var bias = Math.pow(2, exponentBits - 1) - 1;
  var sign = parseBits(data, 1);
  var exponent = parseBits(data, exponentBits, 1);

  if (exponent === 0) {
    return 0;
  }

  // parse mantissa
  var precisionBitsCounter = 1;
  var parsePrecisionBits = function(lastValue, newValue, bits) {
    if (lastValue === 0) {
      lastValue = 1;
    }

    for (var i = 1; i <= bits; i++) {
      precisionBitsCounter /= 2;
      if ((newValue & (0x1 << (bits - i))) > 0) {
        lastValue += precisionBitsCounter;
      }
    }

    return lastValue;
  };

  var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);

  // special cases
  if (exponent == (Math.pow(2, exponentBits + 1) - 1)) {
    if (mantissa === 0) {
      return (sign === 0) ? Infinity : -Infinity;
    }

    return NaN;
  }

  // normale number
  return ((sign === 0) ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
};

var parseInt16 = function(value) {
  if (parseBits(value, 1) == 1) {
    return -1 * (parseBits(value, 15, 1, true) + 1);
  }

  return parseBits(value, 15, 1);
};

var parseInt32 = function(value) {
  if (parseBits(value, 1) == 1) {
    return -1 * (parseBits(value, 31, 1, true) + 1);
  }

  return parseBits(value, 31, 1);
};

var parseFloat32 = function(value) {
  return parseFloatFromBits(value, 23, 8);
};

var parseFloat64 = function(value) {
  return parseFloatFromBits(value, 52, 11);
};

var parseNumeric = function(value) {
  var sign = parseBits(value, 16, 32);
  if (sign == 0xc000) {
    return NaN;
  }

  var weight = Math.pow(10000, parseBits(value, 16, 16));
  var result = 0;

  var digits = [];
  var ndigits = parseBits(value, 16);
  for (var i = 0; i < ndigits; i++) {
    result += parseBits(value, 16, 64 + (16 * i)) * weight;
    weight /= 10000;
  }

  var scale = Math.pow(10, parseBits(value, 16, 48));
  return ((sign === 0) ? 1 : -1) * Math.round(result * scale) / scale;
};

var parseDate = function(isUTC, value) {
  var sign = parseBits(value, 1);
  var rawValue = parseBits(value, 63, 1);

  // discard usecs and shift from 2000 to 1970
  var result = new Date((((sign === 0) ? 1 : -1) * rawValue / 1000) + 946684800000);

  if (!isUTC) {
    result.setTime(result.getTime() + result.getTimezoneOffset() * 60000);
  }

  // add microseconds to the date
  result.usec = rawValue % 1000;
  result.getMicroSeconds = function() {
    return this.usec;
  };
  result.setMicroSeconds = function(value) {
    this.usec = value;
  };
  result.getUTCMicroSeconds = function() {
    return this.usec;
  };

  return result;
};

var parseArray = function(value) {
  var dim = parseBits(value, 32);

  var flags = parseBits(value, 32, 32);
  var elementType = parseBits(value, 32, 64);

  var offset = 96;
  var dims = [];
  for (var i = 0; i < dim; i++) {
    // parse dimension
    dims[i] = parseBits(value, 32, offset);
    offset += 32;

    // ignore lower bounds
    offset += 32;
  }

  var parseElement = function(elementType) {
    // parse content length
    var length = parseBits(value, 32, offset);
    offset += 32;

    // parse null values
    if (length == 0xffffffff) {
      return null;
    }

    var result;
    if ((elementType == 0x17) || (elementType == 0x14)) {
      // int/bigint
      result = parseBits(value, length * 8, offset);
      offset += length * 8;
      return result;
    }
    else if (elementType == 0x19) {
      // string
      result = value.toString(this.encoding, offset >> 3, (offset += (length << 3)) >> 3);
      return result;
    }
    else {
      console.log("ERROR: ElementType not implemented: " + elementType);
    }
  };

  var parse = function(dimension, elementType) {
    var array = [];
    var i;

    if (dimension.length > 1) {
      var count = dimension.shift();
      for (i = 0; i < count; i++) {
        array[i] = parse(dimension, elementType);
      }
      dimension.unshift(count);
    }
    else {
      for (i = 0; i < dimension[0]; i++) {
        array[i] = parseElement(elementType);
      }
    }

    return array;
  };

  return parse(dims, elementType);
};

var parseText = function(value) {
  return value.toString('utf8');
};

var parseBool = function(value) {
  if(value === null) return null;
  return (parseBits(value, 8) > 0);
};

var init = function(register) {
  register(21, parseInt16);
  register(23, parseInt32);
  register(26, parseInt32);
  register(1700, parseNumeric);
  register(700, parseFloat32);
  register(701, parseFloat64);
  register(16, parseBool);
  register(1114, parseDate.bind(null, false));
  register(1184, parseDate.bind(null, true));
  register(1000, parseArray);
  register(1007, parseArray);
  register(1016, parseArray);
  register(1008, parseArray);
  register(1009, parseArray);
  register(25, parseText);
};

module.exports = {
  init: init
};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var arrayParser = __webpack_require__(10);

//parses PostgreSQL server formatted date strings into javascript date objects
var parseDate = function(isoDate) {
  //TODO this could do w/ a refactor
  var dateMatcher = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/;

  var match = dateMatcher.exec(isoDate);
  //could not parse date
  if(!match) {
    dateMatcher = /^(\d{1,})-(\d{2})-(\d{2})$/;
    match = dateMatcher.test(isoDate);
    if(!match) {
      return null;
    } else {
      //it is a date in YYYY-MM-DD format
      //add time portion to force js to parse as local time
      return new Date(isoDate + ' 00:00:00');
    }
  }
  var isBC = /BC$/.test(isoDate);
  var _year = parseInt(match[1], 10);
  var isFirstCentury = (_year > 0) && (_year < 100);
  var year = (isBC ? "-" : "") + match[1];

  var month = parseInt(match[2],10)-1;
  var day = match[3];
  var hour = parseInt(match[4],10);
  var min = parseInt(match[5],10);
  var seconds = parseInt(match[6], 10);

  var miliString = match[7];
  var mili = 0;
  if(miliString) {
    mili = 1000 * parseFloat(miliString);
  }

  //match timezones like the following:
  //Z (UTC)
  //-05
  //+06:30
  var tZone = /([Z|+\-])(\d{2})?:?(\d{2})?:?(\d{2})?/.exec(isoDate.split(' ')[1]);
  //minutes to adjust for timezone
  var tzAdjust = 0;
  var tzSign = 1;
  var date;
  if(tZone) {
    var type = tZone[1];
    switch(type) {
    case 'Z':
      break;
    case '-':
      tzSign = -1;
    case '+':
      tzAdjust = tzSign * (
        (parseInt(tZone[2], 10) * 3600) +
        (parseInt(tZone[3] || 0, 10) * 60) +
        (parseInt(tZone[4] || 0, 10))
      );
      break;
    default:
      throw new Error("Unidentifed tZone part " + type);
    }

    var utcOffset = Date.UTC(year, month, day, hour, min, seconds, mili);

    date = new Date(utcOffset - (tzAdjust * 1000));
  }
  //no timezone information
  else {
    date = new Date(year, month, day, hour, min, seconds, mili);
  }

  if (isFirstCentury) {
    date.setUTCFullYear(year);
  }

  return date;
};

var parseBool = function(val) {
  if(val === null) return val;
  return val === 't';
};

var parseBoolArray = function(val) {
  if(!val) { return null; }
  var p = arrayParser.create(val, function(entry){
    if(entry !== null) {
      entry = parseBool(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseIntegerArray = function(val) {
  if(!val) { return null; }
  var p = arrayParser.create(val, function(entry){
    if(entry !== null) {
      entry = parseInt(entry, 10);
    }
    return entry;
  });

  return p.parse();
};

var parseBigIntegerArray = function(val) {
  if(!val) { return null; }
  var p = arrayParser.create(val, function(entry){
    if(entry !== null) {
      entry = parseBigInteger(entry).trim();
    }
    return entry;
  });

  return p.parse();
};

var parseFloatArray = function(val) {
  if(!val) { return null; }
  var p = arrayParser.create(val, function(entry) {
    if(entry !== null) {
      entry = parseFloat(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseStringArray = function(val) {
  if(!val) { return null; }

  var p = arrayParser.create(val);
  return p.parse();
};

var parseDateArray = function(val) {
  if (!val) { return null; }

  var p = arrayParser.create(val, function(entry) {
    if (entry !== null) {
      entry = parseDate(entry);
    }
    return entry;
  });

  return p.parse();
};

var NUM = '([+-]?\\d+)';
var YEAR = NUM + '\\s+years?';
var MON = NUM + '\\s+mons?';
var DAY = NUM + '\\s+days?';
var TIME = '([+-])?(\\d\\d):(\\d\\d):(\\d\\d)';
var INTERVAL = [YEAR,MON,DAY,TIME].map(function(p){
  return "("+p+")?";
}).join('\\s*');

var parseInterval = function(val) {
  if (!val) { return {}; }
  var m = new RegExp(INTERVAL).exec(val);
  var i = {};
  if (m[2]) { i.years = parseInt(m[2], 10); }
  if (m[4]) { i.months = parseInt(m[4], 10); }
  if (m[6]) { i.days = parseInt(m[6], 10); }
  if (m[9]) { i.hours = parseInt(m[9], 10); }
  if (m[10]) { i.minutes = parseInt(m[10], 10); }
  if (m[11]) { i.seconds = parseInt(m[11], 10); }
  if (m[8] == '-'){
    if (i.hours) { i.hours *= -1; }
    if (i.minutes) { i.minutes *= -1; }
    if (i.seconds) { i.seconds *= -1; }
  }
  for (var field in i){
    if (i[field] === 0) {
      delete i[field];
    }
  }
  return i;
};

var parseByteA = function(val) {
  if(/^\\x/.test(val)){
    // new 'hex' style response (pg >9.0)
    return new Buffer(val.substr(2), 'hex');
  }else{
    var out = "";
    var i = 0;
    while(i < val.length){
      if(val[i] != "\\"){
        out += val[i];
        ++i;
      }else{
        if(val.substr(i+1,3).match(/[0-7]{3}/)){
          out += String.fromCharCode(parseInt(val.substr(i+1,3),8));
          i += 4;
        }else{
          backslashes = 1;
          while(i+backslashes < val.length && val[i+backslashes] == "\\")
            backslashes++;
          for(k=0; k<Math.floor(backslashes/2); ++k)
            out += "\\";
          i += Math.floor(backslashes / 2) * 2;
        }
      }
    }
    return new Buffer(out,"binary");
  }
};

var maxLen = Number.MAX_VALUE.toString().length;

var parseInteger = function(val) {
  return parseInt(val, 10);
};

var parseBigInteger = function(val) {
  var valStr = String(val);
  if (/^\d+$/.test(valStr)) { return valStr; }
  return val;
};

var parseJsonArray = function(val) {
  var arr = parseStringArray(val);

  if (!arr) {
    return arr;
  }

  return arr.map(function(el) { return JSON.parse(el); });
};

var init = function(register) {
  register(20, parseBigInteger); // int8
  register(21, parseInteger); // int2
  register(23, parseInteger); // int4
  register(26, parseInteger); // oid
  register(700, parseFloat); // float4/real
  register(701, parseFloat); // float8/double
  register(16, parseBool);
  register(1082, parseDate); // date
  register(1114, parseDate); // timestamp without timezone
  register(1184, parseDate); // timestamp
  register(1000, parseBoolArray);
  register(1005, parseIntegerArray); // _int2
  register(1007, parseIntegerArray); // _int4
  register(1016, parseBigIntegerArray); // _int8
  register(1021, parseFloatArray); // _float4
  register(1022, parseFloatArray); // _float8
  register(1231, parseFloatArray); // _numeric
  register(1014, parseStringArray); //char
  register(1015, parseStringArray); //varchar
  register(1008, parseStringArray);
  register(1009, parseStringArray);
  register(1115, parseDateArray); // timestamp without time zone[]
  register(1182, parseDateArray); // _date
  register(1185, parseDateArray); // timestamp with time zone[]
  register(1186, parseInterval);
  register(17, parseByteA);
  register(114, JSON.parse.bind(JSON));
  register(3802, JSON.parse.bind(JSON));
  register(199, parseJsonArray); // json[]
  register(2951, parseStringArray); // uuid[]
};

module.exports = {
  init: init
};


/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = {
	"_args": [
		[
			{
				"raw": "pg-native@^1.10.0",
				"scope": null,
				"escapedName": "pg-native",
				"name": "pg-native",
				"rawSpec": "^1.10.0",
				"spec": ">=1.10.0 <2.0.0",
				"type": "range"
			},
			"/home/neil/DevGit/zf2dbmodelgen/modgen"
		]
	],
	"_from": "pg-native@>=1.10.0 <2.0.0",
	"_id": "pg-native@1.10.0",
	"_inCache": true,
	"_location": "/pg-native",
	"_nodeVersion": "5.1.0",
	"_npmUser": {
		"name": "brianc",
		"email": "brian.m.carlson@gmail.com"
	},
	"_npmVersion": "3.3.12",
	"_phantomChildren": {
		"core-util-is": "1.0.2",
		"inherits": "2.0.3",
		"string_decoder": "0.10.31"
	},
	"_requested": {
		"raw": "pg-native@^1.10.0",
		"scope": null,
		"escapedName": "pg-native",
		"name": "pg-native",
		"rawSpec": "^1.10.0",
		"spec": ">=1.10.0 <2.0.0",
		"type": "range"
	},
	"_requiredBy": [
		"#USER",
		"/"
	],
	"_resolved": "https://registry.npmjs.org/pg-native/-/pg-native-1.10.0.tgz",
	"_shasum": "abe299214afa2be51db5f5104e14770c738230fd",
	"_shrinkwrap": null,
	"_spec": "pg-native@^1.10.0",
	"_where": "/home/neil/DevGit/zf2dbmodelgen/modgen",
	"author": {
		"name": "Brian M. Carlson"
	},
	"bugs": {
		"url": "https://github.com/brianc/node-pg-native/issues"
	},
	"dependencies": {
		"libpq": "^1.7.0",
		"pg-types": "1.6.0",
		"readable-stream": "1.0.31"
	},
	"description": "A slightly nicer interface to Postgres over node-libpq",
	"devDependencies": {
		"async": "^0.9.0",
		"concat-stream": "^1.4.6",
		"generic-pool": "^2.1.1",
		"lodash": "^2.4.1",
		"mocha": "^1.21.4",
		"okay": "^0.3.0",
		"pg": "*",
		"semver": "^4.1.0"
	},
	"directories": {},
	"dist": {
		"shasum": "abe299214afa2be51db5f5104e14770c738230fd",
		"tarball": "https://registry.npmjs.org/pg-native/-/pg-native-1.10.0.tgz"
	},
	"gitHead": "8c60a074739aa2ed26e6d83e8dbd965ba0f2c953",
	"homepage": "https://github.com/brianc/node-pg-native",
	"keywords": [
		"postgres",
		"pg",
		"libpq"
	],
	"license": "MIT",
	"main": "index.js",
	"maintainers": [
		{
			"name": "brianc",
			"email": "brian.m.carlson@gmail.com"
		}
	],
	"name": "pg-native",
	"optionalDependencies": {},
	"readme": "ERROR: No README data found!",
	"repository": {
		"type": "git",
		"url": "git://github.com/brianc/node-pg-native.git"
	},
	"scripts": {
		"test": "mocha"
	},
	"version": "1.10.0"
};

/***/ }),
/* 41 */,
/* 42 */,
/* 43 */
/***/ (function(module, exports) {

var parseBits = function(data, bits, offset, invert, callback) {
  offset = offset || 0;
  invert = invert || false;
  callback = callback || function(lastValue, newValue, bits) { return (lastValue * Math.pow(2, bits)) + newValue; };
  var offsetBytes = offset >> 3;

  var inv = function(value) {
    if (invert) {
      return ~value & 0xff;
    }

    return value;
  };

  // read first (maybe partial) byte
  var mask = 0xff;
  var firstBits = 8 - (offset % 8);
  if (bits < firstBits) {
    mask = (0xff << (8 - bits)) & 0xff;
    firstBits = bits;
  }

  if (offset) {
    mask = mask >> (offset % 8);
  }

  var result = 0;
  if ((offset % 8) + bits >= 8) {
    result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
  }

  // read bytes
  var bytes = (bits + offset) >> 3;
  for (var i = offsetBytes + 1; i < bytes; i++) {
    result = callback(result, inv(data[i]), 8);
  }

  // bits to read, that are not a complete byte
  var lastBits = (bits + offset) % 8;
  if (lastBits > 0) {
    result = callback(result, inv(data[bytes]) >> (8 - lastBits), lastBits);
  }

  return result;
};

var parseFloatFromBits = function(data, precisionBits, exponentBits) {
  var bias = Math.pow(2, exponentBits - 1) - 1;
  var sign = parseBits(data, 1);
  var exponent = parseBits(data, exponentBits, 1);

  if (exponent === 0) {
    return 0;
  }

  // parse mantissa
  var precisionBitsCounter = 1;
  var parsePrecisionBits = function(lastValue, newValue, bits) {
    if (lastValue === 0) {
      lastValue = 1;
    }

    for (var i = 1; i <= bits; i++) {
      precisionBitsCounter /= 2;
      if ((newValue & (0x1 << (bits - i))) > 0) {
        lastValue += precisionBitsCounter;
      }
    }

    return lastValue;
  };

  var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);

  // special cases
  if (exponent == (Math.pow(2, exponentBits + 1) - 1)) {
    if (mantissa === 0) {
      return (sign === 0) ? Infinity : -Infinity;
    }

    return NaN;
  }

  // normale number
  return ((sign === 0) ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
};

var parseInt16 = function(value) {
  if (parseBits(value, 1) == 1) {
    return -1 * (parseBits(value, 15, 1, true) + 1);
  }

  return parseBits(value, 15, 1);
};

var parseInt32 = function(value) {
  if (parseBits(value, 1) == 1) {
    return -1 * (parseBits(value, 31, 1, true) + 1);
  }

  return parseBits(value, 31, 1);
};

var parseFloat32 = function(value) {
  return parseFloatFromBits(value, 23, 8);
};

var parseFloat64 = function(value) {
  return parseFloatFromBits(value, 52, 11);
};

var parseNumeric = function(value) {
  var sign = parseBits(value, 16, 32);
  if (sign == 0xc000) {
    return NaN;
  }

  var weight = Math.pow(10000, parseBits(value, 16, 16));
  var result = 0;

  var digits = [];
  var ndigits = parseBits(value, 16);
  for (var i = 0; i < ndigits; i++) {
    result += parseBits(value, 16, 64 + (16 * i)) * weight;
    weight /= 10000;
  }

  var scale = Math.pow(10, parseBits(value, 16, 48));
  return ((sign === 0) ? 1 : -1) * Math.round(result * scale) / scale;
};

var parseDate = function(isUTC, value) {
  var sign = parseBits(value, 1);
  var rawValue = parseBits(value, 63, 1);

  // discard usecs and shift from 2000 to 1970
  var result = new Date((((sign === 0) ? 1 : -1) * rawValue / 1000) + 946684800000);

  if (!isUTC) {
    result.setTime(result.getTime() + result.getTimezoneOffset() * 60000);
  }

  // add microseconds to the date
  result.usec = rawValue % 1000;
  result.getMicroSeconds = function() {
    return this.usec;
  };
  result.setMicroSeconds = function(value) {
    this.usec = value;
  };
  result.getUTCMicroSeconds = function() {
    return this.usec;
  };

  return result;
};

var parseArray = function(value) {
  var dim = parseBits(value, 32);

  var flags = parseBits(value, 32, 32);
  var elementType = parseBits(value, 32, 64);

  var offset = 96;
  var dims = [];
  for (var i = 0; i < dim; i++) {
    // parse dimension
    dims[i] = parseBits(value, 32, offset);
    offset += 32;

    // ignore lower bounds
    offset += 32;
  }

  var parseElement = function(elementType) {
    // parse content length
    var length = parseBits(value, 32, offset);
    offset += 32;

    // parse null values
    if (length == 0xffffffff) {
      return null;
    }

    var result;
    if ((elementType == 0x17) || (elementType == 0x14)) {
      // int/bigint
      result = parseBits(value, length * 8, offset);
      offset += length * 8;
      return result;
    }
    else if (elementType == 0x19) {
      // string
      result = value.toString(this.encoding, offset >> 3, (offset += (length << 3)) >> 3);
      return result;
    }
    else {
      console.log("ERROR: ElementType not implemented: " + elementType);
    }
  };

  var parse = function(dimension, elementType) {
    var array = [];
    var i;

    if (dimension.length > 1) {
      var count = dimension.shift();
      for (i = 0; i < count; i++) {
        array[i] = parse(dimension, elementType);
      }
      dimension.unshift(count);
    }
    else {
      for (i = 0; i < dimension[0]; i++) {
        array[i] = parseElement(elementType);
      }
    }

    return array;
  };

  return parse(dims, elementType);
};

var parseText = function(value) {
  return value.toString('utf8');
};

var parseBool = function(value) {
  if(value === null) return null;
  return (parseBits(value, 8) > 0);
};

var init = function(register) {
  register(21, parseInt16);
  register(23, parseInt32);
  register(26, parseInt32);
  register(1700, parseNumeric);
  register(700, parseFloat32);
  register(701, parseFloat64);
  register(16, parseBool);
  register(1114, parseDate.bind(null, false));
  register(1184, parseDate.bind(null, true));
  register(1000, parseArray);
  register(1007, parseArray);
  register(1016, parseArray);
  register(1008, parseArray);
  register(1009, parseArray);
  register(25, parseText);
};

module.exports = {
  init: init
};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

var array = __webpack_require__(18)
var ap = __webpack_require__(24)
var arrayParser = __webpack_require__(11);
var parseDate = __webpack_require__(54);
var parseInterval = __webpack_require__(55);
var parseByteA = __webpack_require__(53);

function allowNull (fn) {
  return function nullAllowed (value) {
    if (value === null) return value
    return fn(value)
  }
}

function parseBool (value) {
  if (value === null) return value
  return value === 't';
}

function parseBoolArray (value) {
  if (!value) return null
  return array.parse(value, parseBool)
}

function parseIntegerArray (value) {
  if (!value) return null
  return array.parse(value, allowNull(ap.partialRight(parseInt, 10)))
}

function parseBigIntegerArray (value) {
  if (!value) return null
  return array.parse(value, allowNull(function (entry) {
    return parseBigInteger(entry).trim()
  }))
}

var parseFloatArray = function(value) {
  if(!value) { return null; }
  var p = arrayParser.create(value, function(entry) {
    if(entry !== null) {
      entry = parseFloat(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseStringArray = function(value) {
  if(!value) { return null; }

  var p = arrayParser.create(value);
  return p.parse();
};

var parseDateArray = function(value) {
  if (!value) { return null; }

  var p = arrayParser.create(value, function(entry) {
    if (entry !== null) {
      entry = parseDate(entry);
    }
    return entry;
  });

  return p.parse();
};

var parseByteAArray = function(value) {
  var arr = parseStringArray(value);
  if (!arr) return arr;

  return arr.map(function(element) {
    return parseByteA(element);
  });
};

var parseInteger = function(value) {
  return parseInt(value, 10);
};

var parseBigInteger = function(value) {
  var valStr = String(value);
  if (/^\d+$/.test(valStr)) { return valStr; }
  return value;
};

var parseJsonArray = function(value) {
  var arr = parseStringArray(value);

  if (!arr) {
    return arr;
  }

  return arr.map(function(el) { return JSON.parse(el); });
};

var parsePoint = function(value) {
  if (value[0] !== '(') { return null; }

  value = value.substring( 1, value.length - 1 ).split(',');

  return {
    x: parseFloat(value[0])
  , y: parseFloat(value[1])
  };
};

var parseCircle = function(value) {
  if (value[0] !== '<' && value[1] !== '(') { return null; }

  var point = '(';
  var radius = '';
  var pointParsed = false;
  for (var i = 2; i < value.length - 1; i++){
    if (!pointParsed) {
      point += value[i];
    }

    if (value[i] === ')') {
      pointParsed = true;
      continue;
    } else if (!pointParsed) {
      continue;
    }

    if (value[i] === ','){
      continue;
    }

    radius += value[i];
  }
  var result = parsePoint(point);
  result.radius = parseFloat(radius);

  return result;
};

var init = function(register) {
  register(20, parseBigInteger); // int8
  register(21, parseInteger); // int2
  register(23, parseInteger); // int4
  register(26, parseInteger); // oid
  register(700, parseFloat); // float4/real
  register(701, parseFloat); // float8/double
  register(16, parseBool);
  register(1082, parseDate); // date
  register(1114, parseDate); // timestamp without timezone
  register(1184, parseDate); // timestamp
  register(600, parsePoint); // point
  register(718, parseCircle); // circle
  register(1000, parseBoolArray);
  register(1001, parseByteAArray);
  register(1005, parseIntegerArray); // _int2
  register(1007, parseIntegerArray); // _int4
  register(1028, parseIntegerArray); // oid[]
  register(1016, parseBigIntegerArray); // _int8
  register(1021, parseFloatArray); // _float4
  register(1022, parseFloatArray); // _float8
  register(1231, parseFloatArray); // _numeric
  register(1014, parseStringArray); //char
  register(1015, parseStringArray); //varchar
  register(1008, parseStringArray);
  register(1009, parseStringArray);
  register(1115, parseDateArray); // timestamp without time zone[]
  register(1182, parseDateArray); // _date
  register(1185, parseDateArray); // timestamp with time zone[]
  register(1186, parseInterval);
  register(17, parseByteA);
  register(114, JSON.parse.bind(JSON)); // json
  register(3802, JSON.parse.bind(JSON)); // jsonb
  register(199, parseJsonArray); // json[]
  register(3807, parseJsonArray); // jsonb[]
  register(2951, parseStringArray); // uuid[]
  register(791, parseStringArray); // money[]
  register(1183, parseStringArray); // time[]
};

module.exports = {
  init: init
};


/***/ }),
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function parseBytea (input) {
  if (/^\\x/.test(input)) {
    // new 'hex' style response (pg >9.0)
    return new Buffer(input.substr(2), 'hex')
  }
  var output = ''
  var i = 0
  while (i < input.length) {
    if (input[i] !== '\\') {
      output += input[i]
      ++i
    } else {
      if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
        output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8))
        i += 4
      } else {
        var backslashes = 1
        while (i + backslashes < input.length && input[i + backslashes] === '\\') {
          backslashes++
        }
        for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
          output += '\\'
        }
        i += Math.floor(backslashes / 2) * 2
      }
    }
  }
  return new Buffer(output, 'binary')
}


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?/
var DATE = /^(\d{1,})-(\d{2})-(\d{2})$/
var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/
var BC = /BC$/
var INFINITY = /^-?infinity$/

module.exports = function parseDate (isoDate) {
  if (INFINITY.test(isoDate)) {
    // Capitalize to Infinity before passing to Number
    return Number(isoDate.replace('i', 'I'))
  }
  var matches = DATE_TIME.exec(isoDate)

  if (!matches) {
    // Force YYYY-MM-DD dates to be parsed as local time
    return DATE.test(isoDate) ?
      getDate(isoDate) :
      null
  }

  var isBC = BC.test(isoDate)
  var year = parseInt(matches[1], 10)
  var isFirstCentury = year > 0 && year < 100
  year = (isBC ? '-' : '') + year

  var month = parseInt(matches[2], 10) - 1
  var day = matches[3]
  var hour = parseInt(matches[4], 10)
  var minute = parseInt(matches[5], 10)
  var second = parseInt(matches[6], 10)

  var ms = matches[7]
  ms = ms ? 1000 * parseFloat(ms) : 0

  var date
  var offset = timeZoneOffset(isoDate)
  if (offset != null) {
    var utc = Date.UTC(year, month, day, hour, minute, second, ms)
    date = new Date(utc - offset)
  } else {
    date = new Date(year, month, day, hour, minute, second, ms)
  }

  if (isFirstCentury) {
    date.setUTCFullYear(year)
  }

  return date
}

function getDate (isoDate) {
  var matches = DATE.exec(isoDate)
  var year = parseInt(matches[1], 10)
  var month = parseInt(matches[2], 10) - 1
  var day = matches[3]
  // YYYY-MM-DD will be parsed as local time
  var date = new Date(year, month, day)
  date.setFullYear(year)
  return date
}

// match timezones:
// Z (UTC)
// -05
// +06:30
function timeZoneOffset (isoDate) {
  var zone = TIME_ZONE.exec(isoDate.split(' ')[1])
  if (!zone) return
  var type = zone[1]

  if (type === 'Z') {
    return 0
  }
  var sign = type === '-' ? -1 : 1
  var offset = parseInt(zone[2], 10) * 3600 +
    parseInt(zone[3] || 0, 10) * 60 +
    parseInt(zone[4] || 0, 10)

  return offset * sign * 1000
}


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var extend = __webpack_require__(60)

module.exports = PostgresInterval

function PostgresInterval (raw) {
  if (!(this instanceof PostgresInterval)) {
    return new PostgresInterval(raw)
  }
  extend(this, parse(raw))
}
var properties = ['seconds', 'minutes', 'hours', 'days', 'months', 'years']
PostgresInterval.prototype.toPostgres = function () {
  var filtered = properties.filter(this.hasOwnProperty, this)
  if (filtered.length === 0) return '0'
  return filtered
    .map(function (property) {
      return this[property] + ' ' + property
    }, this)
    .join(' ')
}

var NUMBER = '([+-]?\\d+)'
var YEAR = NUMBER + '\\s+years?'
var MONTH = NUMBER + '\\s+mons?'
var DAY = NUMBER + '\\s+days?'
var TIME = '([+-])?([\\d]*):(\\d\\d):(\\d\\d):?(\\d\\d\\d)?'
var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function (regexString) {
  return '(' + regexString + ')?'
})
.join('\\s*'))

// Positions of values in regex match
var positions = {
  years: 2,
  months: 4,
  days: 6,
  hours: 9,
  minutes: 10,
  seconds: 11,
  milliseconds: 12
}
// We can use negative time
var negatives = ['hours', 'minutes', 'seconds']

function parse (interval) {
  if (!interval) return {}
  var matches = INTERVAL.exec(interval)
  var isNegative = matches[8] === '-'
  return Object.keys(positions)
    .reduce(function (parsed, property) {
      var position = positions[property]
      var value = matches[position]
      // no empty string
      if (!value) return parsed
      value = parseInt(value, 10)
      // no zeros
      if (!value) return parsed
      if (isNegative && ~negatives.indexOf(property)) {
        value *= -1
      }
      parsed[property] = value
      return parsed
    }, {})
}


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;// export the class if we are in a Node-like system.
if (typeof module === 'object' && module.exports === exports)
  exports = module.exports = SemVer;

// The debug function is excluded entirely from the minified version.
/* nomin */ var debug;
/* nomin */ if (typeof process === 'object' &&
    /* nomin */ process.env &&
    /* nomin */ process.env.NODE_DEBUG &&
    /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
  /* nomin */ debug = function() {
    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
    /* nomin */ args.unshift('SEMVER');
    /* nomin */ console.log.apply(console, args);
    /* nomin */ };
/* nomin */ else
  /* nomin */ debug = function() {};

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';


// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i])
    re[i] = new RegExp(src[i]);
}

exports.parse = parse;
function parse(version, loose) {
  if (version.length > MAX_LENGTH)
    return null;

  var r = loose ? re[LOOSE] : re[FULL];
  if (!r.test(version))
    return null;

  try {
    return new SemVer(version, loose);
  } catch (er) {
    return null;
  }
}

exports.valid = valid;
function valid(version, loose) {
  var v = parse(version, loose);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, loose) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, loose) {
  if (version instanceof SemVer) {
    if (version.loose === loose)
      return version;
    else
      version = version.version;
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (version.length > MAX_LENGTH)
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')

  if (!(this instanceof SemVer))
    return new SemVer(version, loose);

  debug('SemVer', version, loose);
  this.loose = loose;
  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

  if (!m)
    throw new TypeError('Invalid Version: ' + version);

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
    throw new TypeError('Invalid major version')

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
    throw new TypeError('Invalid minor version')

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
    throw new TypeError('Invalid patch version')

  // numberify any prerelease numeric ids
  if (!m[4])
    this.prerelease = [];
  else
    this.prerelease = m[4].split('.').map(function(id) {
      return (/^[0-9]+$/.test(id)) ? +id : id;
    });

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function() {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length)
    this.version += '-' + this.prerelease.join('.');
  return this.version;
};

SemVer.prototype.inspect = function() {
  return '<SemVer "' + this + '">';
};

SemVer.prototype.toString = function() {
  return this.version;
};

SemVer.prototype.compare = function(other) {
  debug('SemVer.compare', this.version, this.loose, other);
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  if (!(other instanceof SemVer))
    other = new SemVer(other, this.loose);

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length)
    return -1;
  else if (!this.prerelease.length && other.prerelease.length)
    return 1;
  else if (!this.prerelease.length && !other.prerelease.length)
    return 0;

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined)
      return 0;
    else if (b === undefined)
      return 1;
    else if (a === undefined)
      return -1;
    else if (a === b)
      continue;
    else
      return compareIdentifiers(a, b);
  } while (++i);
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function(release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break;
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break;
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0)
        this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
        this.major++;
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0)
        this.minor++;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0)
        this.patch++;
      this.prerelease = [];
      break;
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0)
        this.prerelease = [0];
      else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) // didn't increment anything
          this.prerelease.push(0);
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1]))
            this.prerelease = [identifier, 0];
        } else
          this.prerelease = [identifier, 0];
      }
      break;

    default:
      throw new Error('invalid increment argument: ' + release);
  }
  this.format();
  return this;
};

exports.inc = inc;
function inc(version, release, loose, identifier) {
  if (typeof(loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
}

exports.diff = diff;
function diff(version1, version2) {
  if (eq(version1, version2)) {
    return null;
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    if (v1.prerelease.length || v2.prerelease.length) {
      for (var key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return 'pre'+key;
          }
        }
      }
      return 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return key;
        }
      }
    }
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return (anum && !bnum) ? -1 :
         (bnum && !anum) ? 1 :
         a < b ? -1 :
         a > b ? 1 :
         0;
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers(a, b) {
  return compareIdentifiers(b, a);
}

exports.major = major;
function major(a, loose) {
  return new SemVer(a, loose).major;
}

exports.minor = minor;
function minor(a, loose) {
  return new SemVer(a, loose).minor;
}

exports.patch = patch;
function patch(a, loose) {
  return new SemVer(a, loose).patch;
}

exports.compare = compare;
function compare(a, b, loose) {
  return new SemVer(a, loose).compare(b);
}

exports.compareLoose = compareLoose;
function compareLoose(a, b) {
  return compare(a, b, true);
}

exports.rcompare = rcompare;
function rcompare(a, b, loose) {
  return compare(b, a, loose);
}

exports.sort = sort;
function sort(list, loose) {
  return list.sort(function(a, b) {
    return exports.compare(a, b, loose);
  });
}

exports.rsort = rsort;
function rsort(list, loose) {
  return list.sort(function(a, b) {
    return exports.rcompare(a, b, loose);
  });
}

exports.gt = gt;
function gt(a, b, loose) {
  return compare(a, b, loose) > 0;
}

exports.lt = lt;
function lt(a, b, loose) {
  return compare(a, b, loose) < 0;
}

exports.eq = eq;
function eq(a, b, loose) {
  return compare(a, b, loose) === 0;
}

exports.neq = neq;
function neq(a, b, loose) {
  return compare(a, b, loose) !== 0;
}

exports.gte = gte;
function gte(a, b, loose) {
  return compare(a, b, loose) >= 0;
}

exports.lte = lte;
function lte(a, b, loose) {
  return compare(a, b, loose) <= 0;
}

exports.cmp = cmp;
function cmp(a, op, b, loose) {
  var ret;
  switch (op) {
    case '===':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a === b;
      break;
    case '!==':
      if (typeof a === 'object') a = a.version;
      if (typeof b === 'object') b = b.version;
      ret = a !== b;
      break;
    case '': case '=': case '==': ret = eq(a, b, loose); break;
    case '!=': ret = neq(a, b, loose); break;
    case '>': ret = gt(a, b, loose); break;
    case '>=': ret = gte(a, b, loose); break;
    case '<': ret = lt(a, b, loose); break;
    case '<=': ret = lte(a, b, loose); break;
    default: throw new TypeError('Invalid operator: ' + op);
  }
  return ret;
}

exports.Comparator = Comparator;
function Comparator(comp, loose) {
  if (comp instanceof Comparator) {
    if (comp.loose === loose)
      return comp;
    else
      comp = comp.value;
  }

  if (!(this instanceof Comparator))
    return new Comparator(comp, loose);

  debug('comparator', comp, loose);
  this.loose = loose;
  this.parse(comp);

  if (this.semver === ANY)
    this.value = '';
  else
    this.value = this.operator + this.semver.version;

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m)
    throw new TypeError('Invalid comparator: ' + comp);

  this.operator = m[1];
  if (this.operator === '=')
    this.operator = '';

  // if it literally is just '>' or '' then allow anything.
  if (!m[2])
    this.semver = ANY;
  else
    this.semver = new SemVer(m[2], this.loose);
};

Comparator.prototype.inspect = function() {
  return '<SemVer Comparator "' + this + '">';
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  debug('Comparator.test', version, this.loose);

  if (this.semver === ANY)
    return true;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  return cmp(version, this.operator, this.semver, this.loose);
};


exports.Range = Range;
function Range(range, loose) {
  if ((range instanceof Range) && range.loose === loose)
    return range;

  if (!(this instanceof Range))
    return new Range(range, loose);

  this.loose = loose;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
    return this.parseRange(range.trim());
  }, this).filter(function(c) {
    // throw out any that are not relevant for whatever reason
    return c.length;
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range);
  }

  this.format();
}

Range.prototype.inspect = function() {
  return '<SemVer Range "' + this.range + '">';
};

Range.prototype.format = function() {
  this.range = this.set.map(function(comps) {
    return comps.join(' ').trim();
  }).join('||').trim();
  return this.range;
};

Range.prototype.toString = function() {
  return this.range;
};

Range.prototype.parseRange = function(range) {
  var loose = this.loose;
  range = range.trim();
  debug('range', range, loose);
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function(comp) {
    return parseComparator(comp, loose);
  }).join(' ').split(/\s+/);
  if (this.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, loose);
  });

  return set;
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, loose) {
  return new Range(range, loose).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, loose) {
  debug('comp', comp);
  comp = replaceCarets(comp, loose);
  debug('caret', comp);
  comp = replaceTildes(comp, loose);
  debug('tildes', comp);
  comp = replaceXRanges(comp, loose);
  debug('xrange', comp);
  comp = replaceStars(comp, loose);
  debug('stars', comp);
  return comp;
}

function isX(id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, loose);
  }).join(' ');
}

function replaceTilde(comp, loose) {
  var r = loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p))
      // ~1.2 == >=1.2.0- <1.3.0-
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    else if (pr) {
      debug('replaceTilde pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      ret = '>=' + M + '.' + m + '.' + p + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0';

    debug('tilde return', ret);
    return ret;
  });
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, loose);
  }).join(' ');
}

function replaceCaret(comp, loose) {
  debug('caret', comp, loose);
  var r = loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      ret = '';
    else if (isX(m))
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    else if (isX(p)) {
      if (M === '0')
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      else
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (pr.charAt(0) !== '-')
        pr = '-' + pr;
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p + pr +
              ' <' + (+M + 1) + '.0.0';
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0')
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1);
        else
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0';
      } else
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0';
    }

    debug('caret return', ret);
    return ret;
  });
}

function replaceXRanges(comp, loose) {
  debug('replaceXRanges', comp, loose);
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, loose);
  }).join(' ');
}

function replaceXRange(comp, loose) {
  comp = comp.trim();
  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX)
      gtlt = '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // replace X with 0
      if (xm)
        m = 0;
      if (xp)
        p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else if (xp) {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm)
          M = +M + 1
        else
          m = +m + 1
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret;
  });
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp, loose) {
  debug('replaceStars', comp, loose);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '');
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace($0,
                       from, fM, fm, fp, fpr, fb,
                       to, tM, tm, tp, tpr, tb) {

  if (isX(fM))
    from = '';
  else if (isX(fm))
    from = '>=' + fM + '.0.0';
  else if (isX(fp))
    from = '>=' + fM + '.' + fm + '.0';
  else
    from = '>=' + from;

  if (isX(tM))
    to = '';
  else if (isX(tm))
    to = '<' + (+tM + 1) + '.0.0';
  else if (isX(tp))
    to = '<' + tM + '.' + (+tm + 1) + '.0';
  else if (tpr)
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  else
    to = '<=' + to;

  return (from + ' ' + to).trim();
}


// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function(version) {
  if (!version)
    return false;

  if (typeof version === 'string')
    version = new SemVer(version, this.loose);

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version))
      return true;
  }
  return false;
};

function testSet(set, version) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      return false;
  }

  if (version.prerelease.length) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (var i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY)
        return true;

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch)
          return true;
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false;
  }

  return true;
}

exports.satisfies = satisfies;
function satisfies(version, range, loose) {
  try {
    range = new Range(range, loose);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, loose) {
  return versions.filter(function(version) {
    return satisfies(version, range, loose);
  }).sort(function(a, b) {
    return rcompare(a, b, loose);
  })[0] || null;
}

exports.validRange = validRange;
function validRange(range, loose) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, loose).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, loose) {
  return outside(version, range, '<', loose);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, loose) {
  return outside(version, range, '>', loose);
}

exports.outside = outside;
function outside(version, range, hilo, loose) {
  version = new SemVer(version, loose);
  range = new Range(range, loose);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break;
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, loose)) {
    return false;
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function(comparator) {
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, loose)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, loose)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
}

// Use the define() function if we're in AMD land
if (true)
  !(__WEBPACK_AMD_DEFINE_FACTORY__ = (exports),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

//filter will reemit the data if cb(err,pass) pass is truthy

// reduce is more tricky
// maybe we want to group the reductions or emit progress updates occasionally
// the most basic reduce just emits one 'data' event after it has recieved 'end'


var through = __webpack_require__(58)
var Decoder = __webpack_require__(65).StringDecoder

module.exports = split

//TODO pass in a function to map across the lines.

function split (matcher, mapper, options) {
  var decoder = new Decoder()
  var soFar = ''
  var maxLength = options && options.maxLength;
  var trailing = options && options.trailing === false ? false : true
  if('function' === typeof matcher)
    mapper = matcher, matcher = null
  if (!matcher)
    matcher = /\r?\n/

  function emit(stream, piece) {
    if(mapper) {
      try {
        piece = mapper(piece)
      }
      catch (err) {
        return stream.emit('error', err)
      }
      if('undefined' !== typeof piece)
        stream.queue(piece)
    }
    else
      stream.queue(piece)
  }

  function next (stream, buffer) {
    var pieces = ((soFar != null ? soFar : '') + buffer).split(matcher)
    soFar = pieces.pop()

    if (maxLength && soFar.length > maxLength)
      stream.emit('error', new Error('maximum buffer reached'))

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i]
      emit(stream, piece)
    }
  }

  return through(function (b) {
    next(this, decoder.write(b))
  },
  function () {
    if(decoder.end)
      next(this, decoder.end())
    if(trailing && soFar != null)
      emit(this, soFar)
    this.queue(null)
  })
}


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var Stream = __webpack_require__(7)

// through
//
// a stream that does nothing but re-emit the input.
// useful for aggregating a series of changing but not ending streams into one stream)

exports = module.exports = through
through.through = through

//create a readable writable stream.

function through (write, end, opts) {
  write = write || function (data) { this.queue(data) }
  end = end || function () { this.queue(null) }

  var ended = false, destroyed = false, buffer = [], _ended = false
  var stream = new Stream()
  stream.readable = stream.writable = true
  stream.paused = false

//  stream.autoPause   = !(opts && opts.autoPause   === false)
  stream.autoDestroy = !(opts && opts.autoDestroy === false)

  stream.write = function (data) {
    write.call(this, data)
    return !stream.paused
  }

  function drain() {
    while(buffer.length && !stream.paused) {
      var data = buffer.shift()
      if(null === data)
        return stream.emit('end')
      else
        stream.emit('data', data)
    }
  }

  stream.queue = stream.push = function (data) {
//    console.error(ended)
    if(_ended) return stream
    if(data === null) _ended = true
    buffer.push(data)
    drain()
    return stream
  }

  //this will be registered as the first 'end' listener
  //must call destroy next tick, to make sure we're after any
  //stream piped from here.
  //this is only a problem if end is not emitted synchronously.
  //a nicer way to do this is to make sure this is the last listener for 'end'

  stream.on('end', function () {
    stream.readable = false
    if(!stream.writable && stream.autoDestroy)
      process.nextTick(function () {
        stream.destroy()
      })
  })

  function _end () {
    stream.writable = false
    end.call(stream)
    if(!stream.readable && stream.autoDestroy)
      stream.destroy()
  }

  stream.end = function (data) {
    if(ended) return
    ended = true
    if(arguments.length) stream.write(data)
    _end() // will emit or queue
    return stream
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = true
    ended = true
    buffer.length = 0
    stream.writable = stream.readable = false
    stream.emit('close')
    return stream
  }

  stream.pause = function () {
    if(stream.paused) return
    stream.paused = true
    return stream
  }

  stream.resume = function () {
    if(stream.paused) {
      stream.paused = false
      stream.emit('resume')
    }
    drain()
    //may have become paused again,
    //as drain emits 'data'.
    if(!stream.paused)
      stream.emit('drain')
    return stream
  }
  return stream
}



/***/ }),
/* 59 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 60 */
/***/ (function(module, exports) {

module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}


/***/ }),
/* 61 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 62 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),
/* 63 */
/***/ (function(module, exports) {

module.exports = require("dns");

/***/ }),
/* 64 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 65 */
/***/ (function(module, exports) {

module.exports = require("string_decoder");

/***/ }),
/* 66 */
/***/ (function(module, exports) {

module.exports = require("tls");

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const setup_1 = __webpack_require__(21);
const configService_1 = __webpack_require__(20);
const cycle_1 = __webpack_require__(69);
var program = __webpack_require__(22);
program
    .option('-c, --connection <Connection>', 'The connection specified in the dbconfig.json file.')
    .option('-t, --tablename <Table Name>', 'Name of the table or view to model')
    .option('-n, --namespace <Namespace>', 'The namespace for your table\'s class')
    .option('-a, --alias <Alias>', 'Alias a table; i.e. t_user for User')
    .parse(process.argv);
program.datecreated = new Date().toLocaleString();
// console.log("TableName :: " + _tablename);
// console.log(program);
let cs = new configService_1.configService(program);
let c = new cycle_1.Cycle(cs);
c.cycle();
let x = new setup_1.Setup(cs);


/***/ }),
/* 68 */,
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class Cycle {
    constructor(_confService) {
        this._confService = _confService;
    }
    cycle() {
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
exports.Cycle = Cycle;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $path = __webpack_require__(2);

////////////////////////////////////////////
// Simpler check for null/undefined;
function isNull(value) {
    return value === null || value === undefined;
}

////////////////////////////////////////////////////////
// Verifies parameter for being a non-empty text string;
function isText(txt) {
    return txt && typeof txt === 'string' && /\S/.test(txt);
}

//////////////////////////////////////
// Verifies value for being an object,
// based on type and property names.
function isObject(value, properties) {
    if (value && typeof value === 'object') {
        for (var i = 0; i < properties.length; i++) {
            if (!(properties[i] in value)) {
                return false;
            }
        }
        return true;
    }
    return false;
}

///////////////////////////////////////////////////////////
// Approximates the environment as being for development.
//
// Proper configuration is having NODE_ENV = 'development', but this
// method only checks for 'dev' being present, and regardless of the case.
function isDev() {
    var env = global.process.env.NODE_ENV || '';
    return env.toLowerCase().indexOf('dev') !== -1;
}

///////////////////////////////////////////////////
// Locks all properties in an object to read-only,
// or freezes the entire object for any changes.
function lock(obj, freeze, options) {
    if (options && options.noLocking) {
        return;
    }
    if (freeze) {
        Object.freeze(obj); // freeze the entire object, permanently;
    } else {
        var desc = {
            writable: false,
            configurable: false,
            enumerable: true
        };
        for (var p in obj) {
            Object.defineProperty(obj, p, desc);
        }
    }
}

/////////////////////////////////////////////
// Adds properties from source to the target,
// making them read-only and enumerable.
function addReadProperties(target, source) {
    for (var p in source) {
        addReadProp(target, p, source[p]);
    }
}

///////////////////////////////////////////////////////
// Adds a read-only, non-deletable enumerable property.
function addReadProp(obj, name, value, hidden) {
    Object.defineProperty(obj, name, {
        value: value,
        configurable: false,
        enumerable: !hidden,
        writable: false
    });
}

//////////////////////////////////////////////////////////////
// Converts a connection string or object into its safe copy:
// if password is present, it is masked with symbol '#'.
function getSafeConnection(cn) {
    if (typeof cn === 'object') {
        var copy = JSON.parse(JSON.stringify(cn));
        if (typeof copy.password === 'string') {
            copy.password = copy.password.replace(/./g, '#');
        }
        return copy;
    }
    // or else it is a connection string;
    return cn.replace(/:(?![\/])([^@]+)/, function (_, m) {
        return ':' + new Array(m.length + 1).join('#');
    });
}

///////////////////////////////////////////
// Returns a space gap for console output;
function messageGap(level) {
    return Array(1 + level * 4).join(' ');
}

/////////////////////////////////////////
// Provides platform-neutral inheritance;
function inherits(child, parent) {
    child.prototype.__proto__ = parent.prototype;
}

///////////////////////////////////////////////////////////////////////////
// Checks if the path is absolute;
//
// We exclude this from the coverage, because the code is platform-specific,
// and while most of its code is for Windows, Travis CI is a linux platform.
//
// istanbul ignore next
function isPathAbsolute(path) {
    // Based on: https://github.com/sindresorhus/path-is-absolute
    if (process.platform === 'win32') {
        var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
        var result = splitDeviceRe.exec(path);
        var device = result[1] || '';
        var isUnc = !!device && device.charAt(1) !== ':';
        return !!result[2] || isUnc;
    }
    return path.charAt(0) === '/';
}

function getLocalStack(startIdx) {
    // from the call stack, we take only lines starting with the client's
    // source code, and only those that contain a full path inside brackets,
    // indicating a reference to the client's source code:
    return new Error().stack.split('\n').slice(startIdx).filter(function (line) {
        return line.match(/\(.*(\\+|\/+).*\)/); // contains \ or / inside ()
    }).join('\n');
}

//////////////////////////////
// Internal error container;
function InternalError(error) {
    this.error = error;
}

var exp = {
    InternalError: InternalError,
    getLocalStack: getLocalStack,
    isPathAbsolute: isPathAbsolute,
    lock: lock,
    isText: isText,
    isNull: isNull,
    isDev: isDev,
    isObject: isObject,
    addReadProp: addReadProp,
    addReadProperties: addReadProperties,
    getSafeConnection: getSafeConnection,
    messageGap: messageGap,
    inherits: inherits
};

var mainFile = process.argv[1];

// istanbul ignore next
exp.startDir = mainFile ? $path.dirname(mainFile) : process.cwd();

Object.freeze(exp);

module.exports = exp;


/***/ }),
/* 71 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $pgUtils = __webpack_require__(85);
var $arr = __webpack_require__(73);

// Format Modification Flags;
var fmFlags = {
    raw: 1, // Raw-Text variable
    name: 2, // SQL Name/Identifier
    json: 4, // JSON modifier
    csv: 8, // CSV modifier
    value: 16 // escaped, but without ''
};

// Format Modification Map;
var fmMap = {
    '^': fmFlags.raw,
    ':raw': fmFlags.raw,
    '~': fmFlags.name,
    ':name': fmFlags.name,
    ':json': fmFlags.json,
    ':csv': fmFlags.csv,
    ':value': fmFlags.value,
    '#': fmFlags.value
};

////////////////////////////////////////////////////
// Converts a single value into its Postgres format.
function formatValue(value, fm, obj) {

    if (typeof value === 'function') {
        return formatValue(resolveFunc(value, obj), fm, obj);
    }

    if (value && typeof value === 'object') {
        var ctf = value['formatDBType']; // custom type formatting;
        if (typeof ctf === 'function') {
            fm |= value._rawDBType ? fmFlags.raw : 0;
            return formatValue(resolveFunc(ctf, value), fm, obj);
        }
    }

    var isRaw = !!(fm & fmFlags.raw);
    fm &= ~fmFlags.raw;

    switch (fm) {
        case fmFlags.name:
            return $as.name(value);
        case fmFlags.json:
            return $as.json(value, isRaw);
        case fmFlags.csv:
            return $as.csv(value);
        case fmFlags.value:
            return $as.value(value);
        default:
            break;
    }

    if (isNull(value)) {
        throwIfRaw(isRaw);
        return 'null';
    }

    switch (typeof value) {
        case 'string':
            return $as.text(value, isRaw);
        case 'boolean':
            return $as.bool(value);
        case 'number':
            return $as.number(value);
        default:
            if (value instanceof Date) {
                return $as.date(value, isRaw);
            }
            if (value instanceof Array) {
                return $as.array(value);
            }
            if (value instanceof Buffer) {
                return $as.buffer(value, isRaw);
            }
            return $as.json(value, isRaw);
    }
}

//////////////////////////////////////////////////////////////////////////
// Converts array of values into PostgreSQL Array Constructor: array[...],
// as per PostgreSQL documentation: http://www.postgresql.org/docs/9.4/static/arrays.html
// Arrays of any depth/dimension are supported.
function formatArray(array) {
    function loop(a) {
        return '[' + $arr.map(a, function (v) {
                return v instanceof Array ? loop(v) : formatValue(v);
            }).join() + ']';
    }

    return 'array' + loop(array);
}

///////////////////////////////////////////////////////////////
// Formats array of javascript-type parameters as a csv string,
// so it can be passed into a PostgreSQL function.
// Both single value and array or values are supported.
function formatCSV(values) {
    if (values instanceof Array) {
        return $arr.map(values, function (v) {
            return formatValue(v);
        }).join();
    }
    return values === undefined ? '' : formatValue(values);
}

///////////////////////////////
// Query formatting helpers;
var formatAs = {

    object: function (query, obj, raw, options) {
        options = options && typeof options === 'object' ? options : {};
        var pattern = /\$(?:({)|(\()|(<)|(\[)|(\/))\s*[a-zA-Z0-9\$_]+(\^|~|#|:raw|:name|:json|:csv|:value)?\s*(?:(?=\2)(?=\3)(?=\4)(?=\5)}|(?=\1)(?=\3)(?=\4)(?=\5)\)|(?=\1)(?=\2)(?=\4)(?=\5)>|(?=\1)(?=\2)(?=\3)(?=\5)]|(?=\1)(?=\2)(?=\3)(?=\4)\/)/g;
        return query.replace(pattern, function (name) {
            var v = formatAs.stripName(name.replace(/^\$[{(<[/]|[\s})>\]/]/g, ''), raw);
            if (v.name in obj) {
                return formatValue(obj[v.name], v.fm, obj);
            }
            if (v.name === 'this') {
                return formatValue(obj, v.fm);
            }
            if ('default' in options) {
                var d = options.default, value = typeof d === 'function' ? d.call(obj, v.name, obj) : d;
                return formatValue(value, v.fm, obj);
            }
            if (options.partial) {
                return name;
            }
            // property must exist as the object's own or inherited;
            throw new Error('Property \'' + v.name + '\' doesn\'t exist.');
        });
    },

    array: function (query, array, raw, options) {
        options = options && typeof options === 'object' ? options : {};
        return query.replace(/\$([1-9][0-9]{0,3}(?![0-9])(\^|~|#|:raw|:name|:json|:csv|:value)?)/g, function (name) {
            var v = formatAs.stripName(name.substr(1), raw);
            var idx = v.name - 1;
            if (idx < array.length) {
                return formatValue(array[idx], v.fm);
            }
            if ('default' in options) {
                var d = options.default, value = typeof d === 'function' ? d.call(array, idx, array) : d;
                return formatValue(value, v.fm);
            }
            if (options.partial) {
                return name;
            }
            throw new RangeError('Variable $' + v.name + ' out of range. Parameters array length: ' + array.length);
        });
    },

    value: function (query, value, raw) {
        return query.replace(/\$1(?![0-9])(\^|~|#|:raw|:name|:json|:csv|:value)?/g, function (name) {
            var v = formatAs.stripName(name, raw);
            return formatValue(value, v.fm);
        });
    },

    stripName: function (name, raw) {
        var mod = name.match(/\^|~|#|:raw|:name|:json|:csv|:value/);
        if (mod) {
            return {
                name: name.substr(0, mod.index),
                fm: fmMap[mod[0]] | (raw ? fmFlags.raw : 0)
            };
        } else {
            return {
                name: name,
                fm: raw ? fmFlags.raw : null
            };
        }
    }
};

////////////////////////////////////////////
// Simpler check for null/undefined;
function isNull(value) {
    return value === undefined || value === null;
}

/////////////////////////////////////////
// Wraps a text string in single quotes;
function TEXT(text) {
    return "'" + text + "'";
}

////////////////////////////////////////////////
// Replaces each single-quote symbol ' with two,
// for compliance with PostgreSQL strings.
function safeText(text) {
    return text.replace(/'/g, '\'\'');
}

/////////////////////////////////////////////
// Throws an exception, if flag 'raw' is set.
function throwIfRaw(raw) {
    if (raw) {
        throw new TypeError('Values null/undefined cannot be used as raw text.');
    }
}

////////////////////////////////////////////
// Recursively resolves parameter-function,
// with the optional calling context.
function resolveFunc(value, obj) {
    while (typeof value === 'function') {
        value = obj ? value.call(obj) : value();
    }
    return value;
}

///////////////////////////////////////////////////////////////////////////////////
// 'pg-promise' query formatting solution;
//
// It implements two types of formatting, depending on the 'values' passed:
//
// 1. format "$1, $2, etc", when 'values' is of type string, boolean, number, date,
//    function or null (or an array of the same types, plus undefined values);
// 2. format $*propName*, when 'values' is an object (not null and not Date),
//    and where * is any of the supported open-close pairs: {}, (), [], <>, //
//
// NOTES:
// 1. Raw-text values can be injected using syntax: $1^,$2^,... or $*propName^*
// 2. If 'values' is an object that supports function formatDBType, either its
//    own or inherited, the actual value and the formatting syntax are determined
//    by the result returned from that function.
//
// When formatting fails, the function throws an error.
function $formatQuery(query, values, raw, options) {
    if (typeof query !== 'string') {
        throw new TypeError('Parameter \'query\' must be a text string.');
    }
    if (values && typeof values === 'object') {
        var ctf = values['formatDBType']; // custom type formatting;
        if (typeof ctf === 'function') {
            return $formatQuery(query, resolveFunc(ctf, values), raw || values._rawDBType, options);
        }
        if (values instanceof Array) {
            // $1, $2,... formatting to be applied;
            return formatAs.array(query, values, raw, options);
        }
        if (!(values instanceof Date || values instanceof Buffer)) {
            // $*propName* formatting to be applied;
            return formatAs.object(query, values, raw, options);
        }
    }
    // $1 formatting to be applied, if values != undefined;
    return values === undefined ? query : formatAs.value(query, values, raw);
}

//////////////////////////////////////////////////////
// Formats a standard PostgreSQL function call query;
function $formatFunction(funcName, values, capSQL) {
    var sql = capSQL ? 'SELECT * FROM ' : 'select * from ';
    return sql + funcName + '(' + formatCSV(values) + ')';
}

/**
 * @namespace formatting
 * @description
 * Namespace for all query-formatting functions, available from `pgp.as`, before and after initializing the library.
 *
 * @property {function} name
 * {@link formatting.name name} - formats an SQL name.
 *
 * @property {function} text
 * {@link formatting.text text} - formats a text string.
 *
 * @property {function} number
 * {@link formatting.number number} - formats a number.
 *
 * @property {function} buffer
 * {@link formatting.buffer buffer} - formats a `Buffer` object.
 *
 * @property {function} value
 * {@link formatting.value value} - formats text as an open value.
 *
 * @property {function} json
 * {@link formatting.json json} - formats any value as JSON.
 *
 * @property {function} func
 * {@link formatting.func func} - formats the value returned from a function.
 *
 * @property {function} format
 * {@link formatting.format format} - formats a query according to parameters.
 *
 */
var $as = {

    /**
     * @method formatting.text
     * @description
     * Converts a value into PostgreSQL text presentation, escaped as required.
     *
     * Escaping the result means:
     *  1. Every single-quote (apostrophe) is replaced with two
     *  2. The resulting text is wrapped in apostrophes
     *
     * @param {value|function} value
     * Value to be converted, or a function that returns the value.
     *
     * If the `value` resolves as `null` or `undefined`, while `raw`=`true`,
     * it will throw {@link external:TypeError TypeError} = `Values null/undefined cannot be used as raw text.`
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the resulting text.
     *
     * @returns {string}
     *
     * - `null` string, if the `value` resolves as `null` or `undefined`
     * - escaped result of `value.toString()`, if the `value` isn't a string
     * - escaped string version, if `value` is a string.
     *
     *  The result is not escaped, if `raw` was passed in as `true`.
     */
    text: function (value, raw) {
        value = resolveFunc(value);
        if (isNull(value)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (typeof value !== 'string') {
            value = value.toString();
        }
        return raw ? value : TEXT(safeText(value));
    },

    /**
     * @method formatting.name
     * @description
     * Properly escapes an sql name or identifier, fixing double-quote symbols and wrapping the result in double quotes.
     *
     * Implements a safe way to format SQL Names that neutralizes SQL Injection.
     *
     * @param {string|function|array|object} name
     * SQL name or identifier, or a function that returns it.
     *
     * The name must be at least 1 character long.
     *
     * If `name` doesn't resolve into a non-empty string, it throws {@link external:TypeError TypeError} = `Invalid sql name: ...`
     *
     * If the `name` contains only a single `*` (trailing spaces are ignored), then `name` is returned exactly as is (unescaped).
     *
     * **Added in v.5.2.1:**
     *
     * - If `name` is an Array, it is formatted as a comma-separated list of SQL names
     * - If `name` is a non-Array object, its keys are formatted as a comma-separated list of SQL names
     *
     * Passing in an empty array/object will throw {@link external:Error Error} = `Cannot retrieve sql names from an empty array/object.`
     *
     * @returns {string}
     * The SQL Name/Identifier properly escaped for compliance with the PostgreSQL standard for SQL names and identifiers.
     *
     * @example
     *
     * // example of using v5.2.1 feature:
     * // automatically list object properties as sql names:
     * format('INSERT INTO table(${this~}) VALUES(${one}, ${two})', {
     *     one: 1,
     *     two: 2
     * });
     * //=> INSERT INTO table("one","two") VALUES(1, 2)
     *
     */
    name: function (name) {
        name = resolveFunc(name);
        if (name) {
            if (typeof name === 'string') {
                return /^\s*\*(\s*)$/.test(name) ? name : formatName(name);
            } else {
                if (typeof name === 'object') {
                    var keys = Array.isArray(name) ? name : Object.keys(name);
                    if (!keys.length) {
                        throw new Error('Cannot retrieve sql names from an empty array/object.');
                    }
                    return $arr.map(keys, function (value) {
                        if (!value || typeof value !== 'string') {
                            throw new Error('Invalid sql name: ' + JSON.stringify(value));
                        }
                        return formatName(value);
                    }).join();
                }
            }
        }

        throw new TypeError('Invalid sql name: ' + JSON.stringify(name));

        function formatName(name) {
            return '"' + name.replace(/"/g, '""') + '"';
        }
    },

    /**
     * @method formatting.value
     * @description
     * Represents an open value, one to be formatted according to its type, properly escaped,
     * but without surrounding quotes for text types.
     *
     * @param {value|function} value
     * Value to be converted, or a function that returns the value.
     *
     * If `value` resolves as `null` or `undefined`, it will throw {@link external:TypeError TypeError} = `Open values cannot be null or undefined.`
     *
     * @returns {string}
     * Formatted and properly escaped string, but without surrounding quotes for text types.
     */
    value: function (value) {
        value = resolveFunc(value);
        if (isNull(value)) {
            throw new TypeError('Open values cannot be null or undefined.');
        }
        return safeText(formatValue(value, fmFlags.raw));
    },

    /**
     * @method formatting.buffer
     * @description
     * Converts an object of type `Buffer` into a hex string compatible with PostgreSQL type `bytea`.
     *
     * @param {Buffer|function} obj
     * Object to be converted, or a function that returns one.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to wrap the resulting string in quotes.
     *
     * The generated hex string doesn't need to be escaped.
     *
     * @returns {string}
     */
    buffer: function (obj, raw) {
        obj = resolveFunc(obj);
        if (isNull(obj)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (obj instanceof Buffer) {
            var s = '\\x' + obj.toString('hex');
            return raw ? s : TEXT(s);
        }
        throw new TypeError(TEXT(obj) + ' is not a Buffer object.');
    },

    /**
     * @method formatting.bool
     * @description
     * Converts a truthy value into PostgreSQL boolean presentation.
     *
     * @param {boolean|function} value
     * Value to be converted, or a function that returns the value.
     *
     * @returns {string}
     */
    bool: function (value) {
        value = resolveFunc(value);
        if (isNull(value)) {
            return 'null';
        }
        return value ? 'true' : 'false';
    },

    /**
     * @method formatting.date
     * @description
     * Converts a `Date`-type value into PostgreSQL date/time presentation,
     * wrapped in quotes (unless flag `raw` is set).
     *
     * @param {date|function} d
     * Date object to be converted, or a function that returns one.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the value.
     *
     * @returns {string}
     */
    date: function (d, raw) {
        d = resolveFunc(d);
        if (isNull(d)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (d instanceof Date) {
            var s = $pgUtils.prepareValue(d);
            return raw ? s : TEXT(s);
        }
        throw new TypeError(TEXT(d) + ' is not a Date object.');
    },

    /**
     * @method formatting.number
     * @description
     * Converts a numeric value into its PostgreSQL number presentation,
     * with support for `NaN`, `+Infinity` and `-Infinity`.
     *
     * @param {number|function} num
     * Number to be converted, or a function that returns one.
     *
     * @returns {string}
     */
    number: function (num) {
        num = resolveFunc(num);
        if (isNull(num)) {
            return 'null';
        }
        if (typeof num !== 'number') {
            throw new TypeError(TEXT(num) + ' is not a number.');
        }
        if (isFinite(num)) {
            return num.toString();
        }
        // Converting NaN/+Infinity/-Infinity according to Postgres documentation:
        // http://www.postgresql.org/docs/9.4/static/datatype-numeric.html#DATATYPE-FLOAT
        //
        // NOTE: strings for 'NaN'/'+Infinity'/'-Infinity' are not case-sensitive.
        if (num === Number.POSITIVE_INFINITY) {
            return TEXT('+Infinity');
        }
        if (num === Number.NEGATIVE_INFINITY) {
            return TEXT('-Infinity');
        }
        return TEXT('NaN');
    },

    /**
     * @method formatting.array
     * @description
     * Converts an array of values into its PostgreSQL presentation as an Array-Type
     * constructor string: `array[]`.
     *
     * @param {array|function} arr
     * Array to be converted, or a function that returns one.
     *
     * @returns {string}
     */
    array: function (arr) {
        arr = resolveFunc(arr);
        if (isNull(arr)) {
            return 'null';
        }
        if (arr instanceof Array) {
            return formatArray(arr);
        }
        throw new TypeError(TEXT(arr) + ' is not an Array object.');
    },

    /**
     * @method formatting.csv
     * @description
     * Converts a single value or an array of values into a CSV string, with all values formatted
     * according to their type.
     *
     * @param {array|value|function} values
     * Value(s) to be converted, or a function that returns it.
     *
     * @returns {string}
     */
    csv: function (values) {
        return formatCSV(resolveFunc(values));
    },

    /**
     * @method formatting.json
     * @description
     * Converts any value into JSON (using `JSON.stringify`), and returns it as
     * a valid string, with single-quote symbols fixed, unless flag `raw` is set.
     *
     * @param {object|function} obj
     * Object/Value to be converted, or a function that returns it.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the result.
     *
     * @returns {string}
     */
    json: function (obj, raw) {
        obj = resolveFunc(obj);
        if (isNull(obj)) {
            throwIfRaw(raw);
            return 'null';
        }
        var s = JSON.stringify(obj);
        return raw ? s : TEXT(safeText(s));
    },

    /**
     * @method formatting.func
     * @description
     * Calls the function to get the actual value, and then formats the result
     * according to its type + `raw` flag.
     *
     * @param {function} func
     * Function to be called, with support for nesting.
     *
     * @param {boolean} [raw=false]
     * Indicates when not to escape the result.
     *
     * @param {object} [obj]
     * `this` context to be passed into the function on all nested levels.
     *
     * @returns {string}
     */
    func: function (func, raw, obj) {
        if (isNull(func)) {
            throwIfRaw(raw);
            return 'null';
        }
        if (typeof func !== 'function') {
            throw new TypeError(TEXT(func) + ' is not a function.');
        }
        var fm = raw ? fmFlags.raw : null;
        if (isNull(obj)) {
            return formatValue(resolveFunc(func), fm);
        }
        if (typeof obj === 'object') {
            return formatValue(resolveFunc(func, obj), fm, obj);
        }
        throw new TypeError(TEXT(obj) + ' is not an object.');
    },

    /**
     * @method formatting.format
     * @description
     * Replaces variables in a string according to the type of `values`:
     *
     * - Replaces `$1` occurrences when `values` is of type `string`, `boolean`, `number`, `Date`, `Buffer` or when it is `null`.
     * - Replaces variables `$1`, `$2`, ...`$9999` when `values` is an array of parameters. When a variable is out of range,
     *   it throws {@link external:RangeError RangeError} = `Variable $n out of range. Parameters array length: x`, unless
     *   option `partial` is used.
     * - Replaces `$*propName*`, where `*` is any of `{}`, `()`, `[]`, `<>`, `//`, when `values` is an object that's not a
     * `Date`, `Buffer`, {@link QueryFile} or `null`. Special property name `this` refers to the formatting object itself,
     *   to be injected as a JSON string. When referencing a property that doesn't exist in the formatting object, it throws
     *   {@link external:Error Error} = `Property 'PropName' doesn't exist`, unless option `partial` is used.
     *
     * By default, each variable is automatically formatted according to its type, unless it is a special variable:
     * - Raw-text variables end with `:raw` or symbol `^`, and prevent escaping the text. Such variables are not
     *   allowed to be `null` or `undefined`, or the method will throw {@link external:TypeError TypeError} = `Values null/undefined cannot be used as raw text.`
     *   - `$1:raw`, `$2:raw`,..., and `$*propName:raw*` (see `*` above)
     *   - `$1^`, `$2^`,..., and `$*propName^*` (see `*` above)
     * - Open-value variables end with `:value` or symbol `#`, to be escaped, but not wrapped in quotes. Such variables are
     *   not allowed to be `null` or `undefined`, or the method will throw {@link external:TypeError TypeError} = `Open values cannot be null or undefined.`
     *   - `$1:value`, `$2:value`,..., and `$*propName:value*` (see `*` above)
     *   - `$1#`, `$2#`,..., and `$*propName#*` (see `*` above)
     * - SQL name variables end with `:name` or symbol `~` (tilde), and provide proper escaping for SQL names/identifiers:
     *   - `$1:name`, `$2:name`,..., and `$*propName:name*` (see `*` above)
     *   - `$1~`, `$2~`,..., and `$*propName~*` (see `*` above)
     * - JSON override ends with `:json` to format the value of any type as a JSON string
     * - CSV override ends with `:csv` to format an array as a properly escaped comma-separated list of values.
     *
     * @param {string|value|Object} query
     * A query string or a value/object that implements $[Custom Type Formatting], to be formatted according to `values`.
     *
     * **NOTE:** Support for $[Custom Type Formatting] was added in v5.2.7.
     *
     * @param {array|object|value} [values]
     * Formatting parameter(s) / variable value(s).
     *
     * @param {object} [options]
     * Formatting Options.
     *
     * @param {boolean} [options.partial=false]
     * Indicates that we intend to do only a partial replacement, i.e. throw no error when encountering a variable or
     * property name that's missing within the formatting parameters.
     *
     * This option has no meaning when option `default` is present.
     *
     * @param {} [options.default]
     * **Added in v.5.0.5**
     *
     * Sets a default value for every variable that's missing, consequently preventing errors when encountering a variable
     * or property name that's missing within the formatting parameters.
     *
     * It can also be set to a function, to be called with two parameters that depend on the type of formatting being used,
     * and to return the actual default value:
     *
     * - Named Parameters formatting:
     *   - `name` - name of the property missing in the formatting object
     *   - `obj` - the formatting object, and is the same as `this` context
     *
     * - Regular variable formatting:
     *   - `index` - element's index that's outside of the formatting array's range
     *   - `arr` - the formatting array, and is the same as `this` context
     *
     * @returns {string}
     * Formatted query string.
     *
     * The function will throw an error, if any occurs during formatting.
     */
    format: function (query, values, options) {
        if (query && typeof query.formatDBType === 'function') {
            query = query.formatDBType();
        }
        return $formatQuery(query, values, false, options);
    }
};

Object.freeze($as);

module.exports = {
    formatQuery: $formatQuery,
    formatFunction: $formatFunction,
    as: $as
};

/**
 * @external Error
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 */

/**
 * @external TypeError
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
 */

/**
 * @external RangeError
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError
 */



/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Number of times it is faster than the standard 'map', by Node.js versions:
// 0.10.44: ~2.8
// 0.11.16: ~3.8
// 0.12.13: ~3.8
// 4.4.4: ~1.38
// 5.11.0: ~1.44
// 6.1.0: ~8.25
function map(arr, cb, obj) {
    var res = new Array(arr.length);
    if (obj) {
        for (var i = 0; i < arr.length; i++) {
            res[i] = cb.call(obj, arr[i], i, arr);
        }
    } else {
        for (var i = 0; i < arr.length; i++) {
            res[i] = cb(arr[i], i, arr);
        }
    }
    return res;
}

// Number of times it is faster than the standard 'filter', by Node.js versions:
// 0.10.44: ~2.42
// 0.11.16: ~2.83
// 0.12.13: ~2.78
// 4.4.4: ~1.12
// 5.11.0: ~1.14
// 6.1.0: ~7.54
function filter(arr, cb, obj) {
    var res = [];
    if (obj) {
        for (var i = 0; i < arr.length; i++) {
            if (cb.call(obj, arr[i], i, arr)) {
                res.push(arr[i]);
            }
        }
    } else {
        for (var i = 0; i < arr.length; i++) {
            if (cb(arr[i], i, arr)) {
                res.push(arr[i]);
            }
        }
    }
    return res;
}

// Number of times it is faster than the standard 'forEach', by Node.js versions:
// 0.10.44: ~3.11
// 0.11.16: ~4.6
// 0.12.13: ~4.4
// 4.4.4: ~1.55
// 5.11.0: ~1.54
// 6.1.0: ~1.21
function forEach(arr, cb, obj) {
    if (obj) {
        for (var i = 0; i < arr.length; i++) {
            cb.call(obj, arr[i], i, arr);
        }
    } else {
        for (var i = 0; i < arr.length; i++) {
            cb(arr[i], i, arr);
        }
    }
}

//////////////////////////
// Custom Methods
//////////////////////////

// Counts elements based on a condition;
function countIf(arr, cb, obj) {
    var count = 0;
    if (obj) {
        for (var i = 0; i < arr.length; i++) {
            count += cb.call(obj, arr[i], i, arr) ? 1 : 0;
        }
    } else {
        for (var i = 0; i < arr.length; i++) {
            count += cb(arr[i], i, arr) ? 1 : 0;
        }
    }
    return count;
}

module.exports = {
    map: map,
    filter: filter,
    forEach: forEach,
    countIf: countIf
};

Object.freeze(module.exports);


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    con: __webpack_require__(78).local,
    main: __webpack_require__(89),
    utils: __webpack_require__(70)
};

/////////////////////////////////
// Client notification helpers;
var $events = {

    /**
     * @event connect
     * @description
     * Global notification of acquiring a new database connection from the connection pool,
     * i.e. a virtual connection.
     *
     * However, for direct calls to method {@link Database.connect} with parameter `{direct: true}`,
     * this event represents a physical connection.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {external:Client} client
     * $[pg.Client] object that represents the connection.
     *
     * @param {} dc
     * Database Context that was used when creating the database object (see {@link Database}).
     *
     * @param {boolean} isFresh
     * It indicates when it is a fresh physical connection:
     * - `true` - the physical connection just has been allocated
     * - `false` - the connection has been used previously
     *
     * **NOTE:**
     *
     * This parameter is always `true` for direct connections (created by calling {@link Database.connect}
     * with parameter `{direct: true}`).
     *
     * @example
     *
     * var options = {
     *
     *     // pg-promise initialization options...
     *
     *     connect: function (client, dc, isFresh) {
     *         var cp = client.connectionParameters;
     *         console.log("Connected to database:", cp.database);
     *     }
     *
     * };
     */
    connect: function (ctx, client, isFresh) {
        if (typeof ctx.options.connect === 'function') {
            try {
                ctx.options.connect(client, ctx.dc, isFresh);
            } catch (e) {
                // have to silence errors here;
                // cannot allow unhandled errors while connecting to the database,
                // as it will break the connection logic;
                $events.unexpected('connect', e);
            }
        }
    },

    /**
     * @event disconnect
     * @description
     * Global notification of releasing a database connection back to the connection pool,
     * i.e. releasing the virtual connection.
     *
     * However, when releasing a direct connection (created by calling {@link Database.connect} with parameter
     * `{direct: true}`), this event represents a physical disconnection.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {external:Client} client - $[pg.Client] object that represents connection with the database.
     *
     * @param {} dc - Database Context that was used when creating the database object (see {@link Database}).
     *
     * @example
     *
     * var options = {
     *
     *     // pg-promise initialization options...
     *
     *     disconnect: function(client, dc) {
     *        var cp = client.connectionParameters;
     *        console.log("Disconnecting from database:", cp.database);
     *     }
     *
     * };
     */
    disconnect: function (ctx, client) {
        if (typeof ctx.options.disconnect === 'function') {
            try {
                ctx.options.disconnect(client, ctx.dc);
            } catch (e) {
                // have to silence errors here;
                // cannot allow unhandled errors while disconnecting from the database,
                // as it will break the disconnection logic;
                $events.unexpected('disconnect', e);
            }
        }
    },

    /**
     * @event query
     * @description
     *
     * Global notification of a query that's about to execute.
     *
     * Notification happens just before the query execution. And if the handler throws an error, the query execution
     * will be rejected with that error.
     *
     * @param {object} e - Event Context Object.
     *
     * This is a shared-type object that's passed in with the following events: {@link event:query query},
     * {@link event:receive receive}, {@link event:error error}, {@link event:task task} and {@link event:transact transact}.
     *
     * @param {String|Object} e.cn
     *
     * Set only for event {@link event:error error}, and only when the error is connection-related.
     *
     * It is a safe copy of the connection string/object that was used when initializing `db` - the database instance.
     *
     * If the original connection contains a password, the safe copy contains it masked with symbol `#`, so the connection
     * can be logged safely, without exposing the password.
     *
     * @param {} e.dc
     * Database Context that was used when creating the database object (see {@link Database}). It is set for all events.
     *
     * @param {String|Object} e.query
     *
     * Query string/object that was passed into the query method. This property is only set during events {@link event:query query}
     * and {@link event:receive receive}.
     *
     * @param {external:Client} e.client
     *
     * $[pg.Client] object that represents the connection. It is set for all events, except for event {@link event:error error}
     * when it is connection-related.
     *
     * @param {} e.params - Formatting parameters for the query.
     *
     * It is set only for events {@link event:query query}, {@link event:receive receive} and {@link event:error error}, and only
     * when it is needed for logging. This library takes an extra step in figuring out when formatting parameters are of any value
     * to the event logging:
     * - when an error occurs related to the query formatting, event {@link event:error error} is sent with the property set.
     * - when initialization parameter `pgFormat` is used, and all query formatting is done within the $[PG] library, events
     * {@link event:query query} and {@link event:receive receive} will have this property set also, since this library no longer
     * handles the query formatting.
     *
     * When this parameter is not set, it means one of the two things:
     * - there were no parameters passed into the query method;
     * - property `query` of this object already contains all the formatting values in it, so logging only the query is sufficient.
     *
     * @param {object} e.ctx
     * _Task/Transaction Context_ object. See {@link Task.ctx} for details.
     *
     * This property is always set for events {@link event:task task} and {@link event:transact transact}, while for events
     * {@link event:query query}, {@link event:receive receive} and {@link event:error error} it is only set when the event occurred
     * while executing a task or transaction.
     *
     */
    query: function (options, context) {
        if (typeof options.query === 'function') {
            try {
                options.query(context);
            } catch (e) {
                // throwing an error during event 'query'
                // will result in a reject for the request.
                return e instanceof Error ? e : new $npm.utils.InternalError(e);
            }
        }
    },

    /**
     * @event receive
     * @description
     * Global notification of any data received from the database, coming from a regular query or from a stream.
     *
     * The event is fired before the data reaches the client, and only when receiving 1 or more records.
     *
     * This event notification serves two purposes:
     *  - Providing selective data logging for debugging;
     *  - Pre-processing data before it reaches the client.
     *
     * **NOTES:**
     * - If you alter the size of `data` directly or through the `result` object, it may affect `QueryResultMask`
     *   validation for regular queries, which is executed right after this notification.
     * - When adding data pre-processing, you should consider possible performance penalty this may bring.
     * - If the event handler throws an error, the original request will be rejected with that error.
     *
     * @param {array} data
     * A non-empty array of received data objects/rows.
     *
     * If any of those objects are modified during notification, the client will receive the modified data.
     *
     * @param {object} result
     * - original $[Result] object, if the data comes from a regular query, in which case `data = result.rows`.
     * - `undefined` when the data comes from a stream.
     *
     * @param {object} e
     * Event Context Object.
     *
     * This type of object is used by several events. See event {@link event:query query} for its complete documentation.
     *
     * @example
     *
     * // Example below shows the fastest way to camelize column names:
     *
     * var options = {
     *     receive: function (data, result, e) {
     *         camelizeColumns(data);
     *     }
     * };
     *
     * function camelizeColumns(data) {
     *     var template = data[0];
     *     for (var prop in template) {
     *         var camel = pgp.utils.camelize(prop);
     *         if (!(camel in template)) {
     *             for (var i = 0; i < data.length; i++) {
     *                 var d = data[i];
     *                 d[camel] = d[prop];
     *                 delete d[prop];
     *             }
     *         }
     *     }
     * }
     */
    receive: function (options, data, result, context) {
        if (typeof options.receive === 'function') {
            try {
                options.receive(data, result, context);
            } catch (e) {
                // throwing an error during event 'receive'
                // will result in a reject for the request.
                return e instanceof Error ? e : new $npm.utils.InternalError(e);
            }
        }
    },

    /**
     * @event task
     * @description
     * Global notification of a task start / finish events.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {object} e - Event Context Object.
     *
     * This type of object is used by several events. See event {@link event:query query}
     * for its complete documentation.
     *
     * @example
     *
     * var options = {
     *     task: function (e) {
     *         if (e.ctx.finish) {
     *             // this is a task->finish event;
     *             console.log("Finish Time:", e.ctx.finish);
     *             if (e.ctx.success) {
     *                 // e.ctx.result = resolved data;
     *             } else {
     *                 // e.ctx.result = error/rejection reason;
     *             }
     *         } else {
     *             // this is a task->start event;
     *             console.log("Start Time:", e.ctx.start);
     *         }
     *     }
     * };
     *
     */
    task: function (options, context) {
        if (typeof options.task === 'function') {
            try {
                options.task(context);
            } catch (e) {
                // silencing the error, to avoid breaking the task;
                $events.unexpected('task', e);
            }
        }
    },

    /**
     * @event transact
     * @description
     * Global notification of a transaction start / finish events.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {object} e - Event Context Object.
     *
     * This type of object is used by several events. See event {@link event:query query}
     * for its complete documentation.
     *
     * @example
     *
     * var options = {
     *     transact: function (e) {
     *         if (e.ctx.finish) {
     *             // this is a transaction->finish event;
     *             console.log("Finish Time:", e.ctx.finish);
     *             if (e.ctx.success) {
     *                 // e.ctx.result = resolved data;
     *             } else {
     *                 // e.ctx.result = error/rejection reason;
     *             }
     *         } else {
     *             // this is a transaction->start event;
     *             console.log("Start Time:", e.ctx.start);
     *         }
     *     }
     * };
     *
     */
    transact: function (options, context) {
        if (typeof options.transact === 'function') {
            try {
                options.transact(context);
            } catch (e) {
                // silencing the error, to avoid breaking the transaction;
                $events.unexpected('transact', e);
            }
        }
    },

    /**
     * @event error
     * @description
     * Global notification of every error encountered by this library.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {} err
     * The error encountered, of the same value and type as it was reported.
     *
     * @param {object} e
     * Event Context Object.
     *
     * This type of object is used by several events. See event {@link event:query query}
     * for its complete documentation.
     *
     * @example
     * var options = {
     *
     *     // pg-promise initialization options...
     *
     *     error: function (err, e) {
     *
     *         // e.dc = Database Context
     *
     *         if (e.cn) {
     *             // this is a connection-related error
     *             // cn = safe connection details passed into the library:
     *             //      if password is present, it is masked by #
     *         }
     *
     *         if (e.query) {
     *             // query string is available
     *             if (e.params) {
     *                 // query parameters are available
     *             }
     *         }
     *
     *         if (e.ctx) {
     *             // occurred inside a task or transaction
     *         }
     *       }
     *
     * };
     *
     */
    error: function (options, err, context) {
        if (typeof options.error === 'function') {
            try {
                options.error(err, context);
            } catch (e) {
                // have to silence errors here;
                // throwing unhandled errors while handling an error
                // notification is simply not acceptable.
                $events.unexpected('error', e);
            }
        }
    },

    /**
     * @event extend
     * @description
     * Extends database protocol with custom methods and properties.
     *
     * Override this event to extend the existing access layer with your own functions and
     * properties best suited for your application.
     *
     * The extension thus becomes available across all access layers:
     *
     * - Within the root/default database protocol;
     * - Inside transactions, including nested ones;
     * - Inside tasks, including nested ones.
     *
     * All pre-defined methods and properties are read-only, so you will get an error,
     * if you try overriding them.
     *
     * The library will suppress any error thrown by the handler and write it into the console.
     *
     * @param {object} obj - Protocol object to be extended.
     *
     * @param {} dc - Database Context that was used when creating the database object.
     *
     * @example
     *
     * // In the example below we extend the protocol with function `addImage`
     * // that will insert one binary image and resolve with the new record id.
     *
     * var options = {
     *     extend: function (obj, dc) {
     *         // obj = this;
     *         // dc = database context;
     *         obj.addImage = function (data) {
     *             return obj.one("insert into images(data) values($1) returning id", '\\x' + data);
     *         }
     *     }
     * };
     *
     * @example
     *
     * // It is best to extend the protocol by adding whole entity repositories to it
     * // as shown in the following example.
     *
     * // Users repository;
     * function repUsers(obj, dc) {
     *     // NOTE: You can change the implementation based on `dc`;
     *     return {
     *         add: function (name, active) {
     *             return obj.none("insert into users values($1, $2)", [name, active]);
     *         },
     *         delete: function (id) {
     *             return obj.none("delete from users where id = $1", id);
     *         }
     *     }
     * }
     *
     * // Overriding 'extend' event;
     * var options = {
     *     extend: function (obj, dc) {
     *         // obj = this;
     *         // dc = database context;
     *         this.users = repUsers(this, dc);
     *         // You can set different repositories based on `dc`
     *     }
     * };
     *
     * // Usage example:
     * db.users.add("John", true)
     *     .then(function () {
     *         // user added successfully;
     *     })
     *     .catch(function (error) {
     *         // failed to add the user;
     *     });
     *
     */
    extend: function (options, obj, dc) {
        if (typeof options.extend === 'function') {
            try {
                options.extend.call(obj, obj, dc);
            } catch (e) {
                // have to silence errors here;
                // the result of throwing unhandled errors while
                // extending the protocol would be unpredictable.
                $events.unexpected('extend', e);
            }
        }
    },

    /**
     * @event unexpected
     * @param {string} event - unhandled event name.
     * @param {String|Error} e - unhandled error.
     * @private
     */
    unexpected: function (event, e) {
        // If you should ever get here, your app is definitely broken, and you need to fix
        // your event handler to prevent unhandled errors during event notifications.
        //
        // Console output is suppressed when running tests, to avoid polluting test output
        // with error messages that are intentional and of no value to the test.

        /* istanbul ignore if */
        if (!$npm.main.suppressErrors) {
            var stack = e instanceof Error ? e.stack : new Error().stack;
            $npm.con.error("Unexpected error in '%s' event handler.\n%s\n", event, stack);
        }
    }
};

module.exports = $events;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70),
    formatting: __webpack_require__(72),
    TableName: __webpack_require__(81),
    Column: __webpack_require__(88)
};

var $arr = __webpack_require__(73);

/**
 * @class helpers.ColumnSet
 * @description
 *
 * Performance-optimized, read-only structure with query-formatting columns.
 *
 * For performance-oriented applications this type should be created globally, to be reused by all methods.
 *
 * @param {object|helpers.Column|array} columns
 * Columns information object, depending on the type:
 *
 * - When it is a simple object, its properties are enumerated to represent both column names and property names
 *   within the source objects. See also option `inherit` that's applicable in this case.
 *
 * - When it is a single {@link helpers.Column Column} object, property {@link helpers.ColumnSet#columns columns} is initialized with
 *   just a single column. It is not a unique situation when only a single column is required for an update operation.
 *
 * - When it is an array, each element is assumed to represent details for a column. If the element is already of type {@link helpers.Column Column},
 *   it is used directly; otherwise the element is passed into {@link helpers.Column Column} constructor for initialization.
 *   On any duplicate column name (case-sensitive) it will throw {@link external:Error Error} = `Duplicate column name "name".`
 *
 * - When it is none of the above, it will throw {@link external:TypeError TypeError} = `Invalid parameter 'columns' specified.`
 *
 * @param {object} [options]
 *
 * @param {helpers.TableName|string|{table,schema}} [options.table]
 * Table details.
 *
 * When it is a non-null value, and not a {@link helpers.TableName TableName} object, a new {@link helpers.TableName TableName} is constructed from the value.
 *
 * It can be used as the default for methods {@link helpers.insert insert} and {@link helpers.update update} when their parameter
 * `table` is omitted, and for logging purposes.
 *
 * @param {boolean} [options.inherit = false]
 * Use inherited properties in addition to the object's own properties.
 *
 * By default, only the object's own properties are enumerated for column names.
 *
 * @returns {helpers.ColumnSet}
 *
 * @see
 *
 * {@link helpers.ColumnSet#columns columns},
 * {@link helpers.ColumnSet#names names},
 * {@link helpers.ColumnSet#table table},
 * {@link helpers.ColumnSet#variables variables} |
 * {@link helpers.ColumnSet.extend extend},
 * {@link helpers.ColumnSet.merge merge},
 * {@link helpers.ColumnSet.prepare prepare}
 *
 * @example
 *
 * // A complex insert/update object scenario for table 'purchases' in schema 'fiscal'.
 * // For a good performance, you should declare such objects once and then reuse them.
 * //
 * // Column Requirements:
 * //
 * // 1. Property 'id' is only to be used for a WHERE condition in updates
 * // 2. Property 'list' needs to be formatted as a csv
 * // 3. Property 'code' is to be used as raw text, and to be defaulted to 0 when the
 * //    property is missing in the source object
 * // 4. Property 'log' is a JSON object with 'log-entry' for the column name
 * // 5. Property 'data' requires SQL type casting '::int[]'
 * // 6. Property 'amount' needs to be set to 100, if it is 0
 * // 7. Property 'total' must be skipped during updates, if 'amount' was 0, plus its
 * //    column name is 'total-val'
 *
 * var cs = new pgp.helpers.ColumnSet([
 *     '?id', // ColumnConfig equivalent: {name: 'id', cnd: true}
 *     'list:csv', // ColumnConfig equivalent: {name: 'list', mod: ':csv'}
 *     {
 *         name: 'code',
 *         mod: '^', // format as raw text
 *         def: 0 // default to 0 when the property doesn't exist
 *     },
 *     {
 *         name: 'log-entry',
 *         prop: 'log',
 *         mod: ':json' // format as JSON
 *     },
 *     {
 *         name: 'data',
 *         cast: 'int[]' // use SQL type casting '::int[]'
 *     },
 *     {
 *         name: 'amount',
 *         init: function (col) {
 *             // set to 100, if the value is 0:
 *             return col.value === 0 ? 100 : col.value;
 *         }
 *     },
 *     {
 *         name: 'total-val',
 *         prop: 'total',
 *         skip: function (col) {
 *             // skip from updates, if 'amount' is 0:
 *             return this.amount === 0; // = col.source.amount
 *         }
 *     }
 * ], {table: {table: 'purchases', schema: 'fiscal'}});
 *
 * // Alternatively, you could take the table declaration out:
 * // var table = new pgp.helpers.TableName('purchases', 'fiscal');
 *
 * console.log(cs); // console output for the object:
 * //=>
 * // ColumnSet {
 * //    table: "fiscal"."purchases"
 * //    columns: [
 * //        Column {
 * //            name: "id"
 * //            cnd: true
 * //        }
 * //        Column {
 * //            name: "list"
 * //            mod: ":csv"
 * //        }
 * //        Column {
 * //            name: "code"
 * //            mod: "^"
 * //            def: 0
 * //        }
 * //        Column {
 * //            name: "log-entry"
 * //            prop: "log"
 * //            mod: ":json"
 * //        }
 * //        Column {
 * //            name: "data"
 * //            cast: "int[]"
 * //        }
 * //        Column {
 * //            name: "amount"
 * //            init: [Function]
 * //        }
 * //        Column {
 * //            name: "total-val"
 * //            prop: "total"
 * //            skip: [Function]
 * //        }
 * //    ]
 * // }
 */
function ColumnSet(columns, options) {

    if (!(this instanceof ColumnSet)) {
        return new ColumnSet(columns, options);
    }

    if (!columns || typeof columns !== 'object') {
        throw new TypeError("Invalid parameter 'columns' specified.");
    }

    var inherit, names, variables, updates, cndCount = 0, isSimple = true;

    if (!$npm.utils.isNull(options)) {
        if (typeof options !== 'object') {
            throw new TypeError("Invalid parameter 'options' specified.");
        }
        if (!$npm.utils.isNull(options.table)) {
            if (options.table instanceof $npm.TableName) {
                this.table = options.table;
            } else {
                this.table = new $npm.TableName(options.table);
            }
        }
        inherit = options.inherit;
    }

    /**
     * @name helpers.ColumnSet#table
     * @type {helpers.TableName}
     * @readonly
     * @description
     * Destination table. It can be specified for two purposes:
     *
     * - **primary:** to be used as the default table when it is omitted during a call into methods {@link helpers.insert insert} and {@link helpers.update update}
     * - **secondary:** to be automatically written into the console (for logging purposes).
     */


    /**
     * @name helpers.ColumnSet#columns
     * @type helpers.Column[]
     * @readonly
     * @description
     * Array of {@link helpers.Column Column} objects.
     */
    if (Array.isArray(columns)) {
        var colNames = {};
        this.columns = $arr.map(columns, function (c) {
            var col = (c instanceof $npm.Column) ? c : new $npm.Column(c);
            if (col.name in colNames) {
                throw new Error('Duplicate column name "' + col.name + '".');
            }
            colNames[col.name] = true;
            return col;
        });
    } else {
        if (columns instanceof $npm.Column) {
            this.columns = [columns];
        } else {
            this.columns = [];
            for (var name in columns) {
                if (inherit || columns.hasOwnProperty(name)) {
                    this.columns.push(new $npm.Column(name));
                }
            }
        }
    }

    Object.freeze(this.columns);

    for (var i = 0; i < this.columns.length; i++) {
        var c = this.columns[i];
        if (c.cnd) {
            cndCount++;
        }
        // ColumnSet is simple when the source objects require no preparation,
        // and should be used directly:
        if (c.prop || c.init || 'def' in c) {
            isSimple = false;
        }
    }

    /**
     * @name helpers.ColumnSet#names
     * @type String
     * @readonly
     * @description
     * **Added in v5.5.5**
     *
     * Returns a string - comma-separated list of all column names, properly escaped.
     *
     * This method is primarily for internal use.
     *
     * @example
     * var cs = new ColumnSet(['id^', {name: 'cells', cast: 'int[]'}, 'doc:json']);
     * console.log(cs.names);
     * //=> "id","cells","doc"
     */
    Object.defineProperty(this, 'names', {
        get: function () {
            if (!names) {
                names = $arr.map(this.columns, function (c) {
                    return c.escapedName;
                }).join();
            }
            return names;
        }
    });

    /**
     * @name helpers.ColumnSet#variables
     * @type String
     * @readonly
     * @description
     * **Added in v5.5.5**
     *
     * Returns a string - formatting template for all column values.
     *
     * This method is primarily for internal use.
     *
     * @example
     * var cs = new ColumnSet(['id^', {name: 'cells', cast: 'int[]'}, 'doc:json']);
     * console.log(cs.variables);
     * //=> ${id^},${cells}::int[],${doc:json}
     */
    Object.defineProperty(this, 'variables', {
        get: function () {
            if (!variables) {
                variables = $arr.map(this.columns, function (c) {
                    return c.variable + c.castText;
                }).join();
            }
            return variables;
        }
    });

    /**
     * @method helpers.ColumnSet.assign
     * @private
     * @description
     * Returns a formatting template of SET assignments for a single object.
     *
     * This method is for internal use only.
     *
     * @param {object} source
     * Source object that contains values for columns.
     *
     * @returns {string}
     * Comma-separated list of variable-to-column assignments.
     */
    this.assign = function (source) {
        if (updates) {
            return updates;
        }
        var dynamic;
        var list = $arr.filter(this.columns, function (c) {
            if (c.cnd) {
                return false;
            }
            if (c.skip) {
                dynamic = true;
                var a = colDesc(c, source);
                if (c.skip.call(source, a)) {
                    return false;
                }
            }
            return true;
        });

        list = $arr.map(list, function (c) {
            return c.escapedName + '=' + c.variable + c.castText;
        }).join();

        if (!dynamic) {
            updates = list;
        }
        return list;
    };

    /**
     * @method helpers.ColumnSet.extend
     * @description
     * Creates a new {@link helpers.ColumnSet ColumnSet}, by joining the two sets of columns.
     *
     * If the two sets contain a column with the same `name` (case-sensitive), an error is thrown.
     *
     * @param {helpers.Column|helpers.ColumnSet|array} columns
     * Columns to be appended, of the same type as parameter `columns` during {@link helpers.ColumnSet ColumnSet} construction, except:
     * - it can also be of type {@link helpers.ColumnSet ColumnSet}
     * - it cannot be a simple object (properties enumeration is not supported here)
     *
     * @returns {helpers.ColumnSet}
     * New {@link helpers.ColumnSet ColumnSet} object with the extended/concatenated list of columns.
     *
     * @see
     * {@link helpers.Column Column},
     * {@link helpers.ColumnSet.merge merge}
     *
     * @example
     *
     * var pgp = require('pg-promise')();
     *
     * var cs = new pgp.helpers.ColumnSet(['one', 'two'], {table: 'my-table'});
     * console.log(cs);
     * //=>
     * // ColumnSet {
     * //    table: "my-table"
     * //    columns: [
     * //        Column {
     * //            name: "one"
     * //        }
     * //        Column {
     * //            name: "two"
     * //        }
     * //    ]
     * // }
     * var csExtended = cs.extend(['three']);
     * console.log(csExtended);
     * //=>
     * // ColumnSet {
     * //    table: "my-table"
     * //    columns: [
     * //        Column {
     * //            name: "one"
     * //        }
     * //        Column {
     * //            name: "two"
     * //        }
     * //        Column {
     * //            name: "three"
     * //        }
     * //    ]
     * // }
     */
    this.extend = function (columns) {
        var cs = columns;
        if (!(cs instanceof ColumnSet)) {
            cs = new ColumnSet(columns);
        }
        // Any duplicate column will throw Error = 'Duplicate column name "name".',
        return new ColumnSet(this.columns.concat(cs.columns), {table: this.table});
    };

    /**
     * @method helpers.ColumnSet.merge
     * @description
     * Creates a new {@link helpers.ColumnSet ColumnSet}, by joining the two sets of columns.
     *
     * Items in `columns` with the same `name` (case-sensitive) override the original columns.
     *
     * @param {helpers.Column|helpers.ColumnSet|array} columns
     * Columns to be appended, of the same type as parameter `columns` during {@link helpers.ColumnSet ColumnSet} construction, except:
     * - it can also be of type {@link helpers.ColumnSet ColumnSet}
     * - it cannot be a simple object (properties enumeration is not supported here)
     *
     * @see
     * {@link helpers.Column Column},
     * {@link helpers.ColumnSet.extend extend}
     *
     * @returns {helpers.ColumnSet}
     * New {@link helpers.ColumnSet ColumnSet} object with the merged list of columns.
     *
     * @example
     *
     * var pgp = require('pg-promise')();
     *
     * var cs = new pgp.helpers.ColumnSet(['?one', 'two:json'], {table: 'my-table'});
     * console.log(cs);
     * //=>
     * // ColumnSet {
     * //    table: "my-table"
     * //    columns: [
     * //        Column {
     * //            name: "one"
     * //            cnd: true
     * //        }
     * //        Column {
     * //            name: "two"
     * //            mod: ":json"
     * //        }
     * //    ]
     * // }
     * var csMerged = cs.merge(['two', 'three^']);
     * console.log(csMerged);
     * //=>
     * // ColumnSet {
     * //    table: "my-table"
     * //    columns: [
     * //        Column {
     * //            name: "one"
     * //            cnd: true
     * //        }
     * //        Column {
     * //            name: "two"
     * //        }
     * //        Column {
     * //            name: "three"
     * //            mod: "^"
     * //        }
     * //    ]
     * // }
     *
     */
    this.merge = function (columns) {
        var cs = columns;
        if (!(cs instanceof ColumnSet)) {
            cs = new ColumnSet(columns);
        }
        var colNames = {}, cols = [];
        $arr.forEach(this.columns, function (c, idx) {
            cols.push(c);
            colNames[c.name] = idx;
        });
        $arr.forEach(cs.columns, function (c) {
            if (c.name in colNames) {
                cols[colNames[c.name]] = c;
            } else {
                cols.push(c);
            }
        });
        return new ColumnSet(cols, {table: this.table});
    };

    /**
     * @method helpers.ColumnSet.prepare
     * @description
     * **Added in v5.5.6**
     *
     * Prepares a source object to be formatted, by cloning it and applying the rules
     * as set by the columns configuration.
     *
     * This method is primarily for internal use, and as such it does not validate
     * its input parameters.
     *
     * @param {object} source
     * The source object to be prepared, if required.
     *
     * It must be a non-`null` object, which the method does not validate, as it is
     * intended primarily for internal use by the library.
     *
     * @returns {object}
     * When the object needs to be prepared, the method returns a clone of the source object,
     * with all properties and values set according to the columns configuration.
     *
     * When the object does not need to be prepared, the original object is returned.
     */
    this.prepare = function (source) {
        if (isSimple) {
            return source; // a simple ColumnSet requires no object preparation;
        }
        var target = {};
        $arr.forEach(this.columns, function (c) {
            var a = colDesc(c, source);
            if (c.init) {
                target[a.name] = c.init.call(source, a);
            } else {
                if (a.exists || 'def' in c) {
                    target[a.name] = a.value;
                }
            }
        });
        return target;
    };

    Object.freeze(this);

    function colDesc(column, source) {
        var a = {
            source: source,
            name: column.prop || column.name
        };
        a.exists = a.name in source;
        if (a.exists) {
            a.value = source[a.name];
        } else {
            a.value = 'def' in column ? column.def : undefined;
        }
        return a;
    }
}

/**
 * @method helpers.ColumnSet.toString
 * @description
 * Creates a well-formatted multi-line string that represents the object.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
ColumnSet.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        lines = [
            'ColumnSet {'
        ];
    if (this.table) {
        lines.push(gap1 + 'table: ' + this.table);
    }
    if (this.columns.length) {
        lines.push(gap1 + 'columns: [');
        $arr.forEach(this.columns, function (c) {
            lines.push(c.toString(2));
        });
        lines.push(gap1 + ']');
    } else {
        lines.push(gap1 + 'columns: []');
    }
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

ColumnSet.prototype.inspect = function () {
    return this.toString();
};

module.exports = ColumnSet;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    fs: __webpack_require__(6),
    os: __webpack_require__(71),
    path: __webpack_require__(2),
    minify: __webpack_require__(83),
    utils: __webpack_require__(70),
    format: __webpack_require__(72).as.format,
    QueryFileError: __webpack_require__(80)
};

/**
 * @constructor QueryFile
 * @description
 *
 * Represents an external SQL file. The type is available from the library's root: `pgp.QueryFile`.
 *
 * Reads a file with SQL and prepares it for execution, also parses and minifies it, if required.
 * The SQL can be of any complexity, with both single and multi-line comments.
 *
 * The type can be used in place of the `query` parameter, with any query method directly, plus as `text` in {@link PreparedStatement}
 * and {@link ParameterizedQuery}.
 *
 * It never throws any error, leaving it for query methods to reject with {@link errors.QueryFileError QueryFileError}.
 *
 * For any given SQL file you should only create a single instance of this class throughout the application.
 *
 * @param {string} file
 * Path to the SQL file with the query, either absolute or relative to the application's entry point file.
 *
 * If there is any problem reading the file, it will be reported when executing the query.
 *
 * @param {QueryFile.Options} [options]
 * Set of configuration options, as documented by {@link QueryFile.Options}.
 *
 * @returns {QueryFile}
 *
 * @see
 * {@link errors.QueryFileError QueryFileError},
 * {@link utils}
 *
 * @example
 * // File sql.js
 *
 * // Proper way to organize an sql provider:
 * //
 * // - have all sql files for Users in ./sql/users
 * // - have all sql files for Products in ./sql/products
 * // - have your sql provider module as ./sql/index.js
 *
 * var QueryFile = require('pg-promise').QueryFile;
 * var path = require('path');
 *
 * // Helper for linking to external query files:
 * function sql(file) {
 *     var fullPath = path.join(__dirname, file); // generating full path;
 *     return new QueryFile(fullPath, {minify: true});
 * }
 *
 * module.exports = {
 *     // external queries for Users:
 *     users: {
 *         add: sql('users/create.sql'),
 *         search: sql('users/search.sql'),
 *         report: sql('users/report.sql'),
 *     },
 *     // external queries for Products:
 *     products: {
 *         add: sql('products/add.sql'),
 *         quote: sql('products/quote.sql'),
 *         search: sql('products/search.sql'),
 *     }
 * };
 *
 * @example
 * // Testing our SQL provider
 *
 * var db = require('./db'); // our database module;
 * var sql = require('./sql').users; // our sql for users;
 *
 * module.exports = {
 *     addUser: function (name, age) {
 *         return db.none(sql.add, [name, age]);
 *     },
 *     findUser: function (name) {
 *         return db.any(sql.search, name);
 *     }
 * };
 *
 */
function QueryFile(file, options) {

    if (!(this instanceof QueryFile)) {
        return new QueryFile(file, options);
    }

    var sql, error, ready, modTime, after, filePath = file, opt = {
        debug: $npm.utils.isDev(),
        minify: false,
        compress: false
    };

    if (options && typeof options === 'object') {
        if (options.debug !== undefined) {
            opt.debug = !!options.debug;
        }
        if (options.minify !== undefined) {
            after = options.minify === 'after';
            opt.minify = after ? 'after' : !!options.minify;
        }
        if (options.compress !== undefined) {
            opt.compress = !!options.compress;
        }
        if (opt.compress && options.minify === undefined) {
            opt.minify = true;
        }
        if (options.params !== undefined) {
            opt.params = options.params;
        }
    }

    Object.freeze(opt);

    if ($npm.utils.isText(filePath) && !$npm.utils.isPathAbsolute(filePath)) {
        filePath = $npm.path.join($npm.utils.startDir, filePath);
    }

    // Custom Type Formatting support:
    this.formatDBType = function () {
        this.prepare(true);
        return this.query;
    };

    /**
     * @method QueryFile.prepare
     * @summary Prepares the query for execution.
     * @description
     * If the the query hasn't been prepared yet, it will read the file and process the contents according
     * to the parameters passed into the constructor.
     *
     * This method is primarily for internal use by the library.
     *
     * @param {boolean} [throwErrors=false]
     * Throw any error encountered.
     *
     */
    this.prepare = function (throwErrors) {
        var lastMod;
        if (opt.debug && ready) {
            try {
                lastMod = $npm.fs.statSync(filePath).mtime.getTime();
                if (lastMod === modTime) {
                    // istanbul ignore next;
                    // coverage for this works differently under Windows and Linux
                    return;
                }
                ready = false;
            } catch (e) {
                sql = undefined;
                ready = false;
                error = e;
                if (throwErrors) {
                    throw error;
                }
                return;
            }
        }
        if (ready) {
            return;
        }
        try {
            sql = $npm.fs.readFileSync(filePath, 'utf8');
            modTime = lastMod || $npm.fs.statSync(filePath).mtime.getTime();
            if (opt.minify && !after) {
                sql = $npm.minify(sql, {compress: opt.compress});
            }
            if (opt.params !== undefined) {
                sql = $npm.format(sql, opt.params, {partial: true});
            }
            if (opt.minify && after) {
                sql = $npm.minify(sql, {compress: opt.compress});
            }
            ready = true;
            error = undefined;
        } catch (e) {
            sql = undefined;
            error = new $npm.QueryFileError(e, this);
            if (throwErrors) {
                throw error;
            }
        }
    };

    /**
     * @name QueryFile#query
     * @type {string}
     * @default undefined
     * @readonly
     * @summary Prepared query string.
     * @description
     * When property {@link QueryFile#error error} is set, the query is `undefined`.
     *
     * This property is primarily for internal use by the library.
     */
    Object.defineProperty(this, 'query', {
        get: function () {
            return sql;
        }
    });

    /**
     * @name QueryFile#error
     * @type {errors.QueryFileError}
     * @default undefined
     * @readonly
     * @description
     * When in an error state, it is set to a {@link errors.QueryFileError QueryFileError} object. Otherwise, it is `undefined`.
     *
     * This property is primarily for internal use by the library.
     */
    Object.defineProperty(this, 'error', {
        get: function () {
            return error;
        }
    });

    /**
     * @name QueryFile#file
     * @type {string}
     * @readonly
     * @description
     * File name that was passed into the constructor.
     *
     * This property is primarily for internal use by the library.
     */
    Object.defineProperty(this, 'file', {
        get: function () {
            return file;
        }
    });

    /**
     * @name QueryFile#options
     * @type {QueryFile.Options}
     * @readonly
     * @description
     * Set of options, as configured during the object's construction.
     *
     * This property is primarily for internal use by the library.
     */
    Object.defineProperty(this, 'options', {
        get: function () {
            return opt;
        }
    });

    this.prepare();
}

/**
 * @method QueryFile.toString
 * @description
 * Creates a well-formatted multi-line string that represents the object's current state.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
QueryFile.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap = $npm.utils.messageGap(level + 1);
    var lines = [
        'QueryFile {'
    ];
    this.prepare();
    lines.push(gap + 'file: "' + this.file + '"');
    lines.push(gap + 'options: ' + JSON.stringify(this.options));
    if (this.error) {
        lines.push(gap + 'error: ' + this.error.toString(level + 1));
    } else {
        lines.push(gap + 'query: "' + this.query + '"');
    }
    lines.push($npm.utils.messageGap(level) + '}');
    return lines.join($npm.os.EOL);
};

QueryFile.prototype.inspect = function () {
    return this.toString();
};

module.exports = QueryFile;

/**
 * @typedef QueryFile.Options
 * @description
 * A set of configuration options as passed into the {@link QueryFile} constructor.
 *
 * @property {boolean} debug
 * When in debug mode, the query file is checked for its last modification time on every query request,
 * so if it changes, the file is read afresh.
 *
 * The default for this property is `true` when `NODE_ENV` = `development`,
 * or `false` otherwise.
 *
 * @property {boolean|string} minify=false
 * Parses and minifies the SQL using $[pg-minify]:
 * - `false` - do not use $[pg-minify]
 * - `true` - use $[pg-minify] to parse and minify SQL
 * - `'after'` - use $[pg-minify] after applying static formatting parameters
 *   (option `params`), as opposed to before it (default)
 *
 * If option `compress` is set, then the default for `minify` is `true`.
 *
 * Failure to parse SQL will result in $[SQLParsingError].
 *
 * @property {boolean} compress=false
 * Sets option `compress` as supported by $[pg-minify], to uglify the SQL:
 * - `false` - no compression to be applied, keep minimum spaces for easier read
 * - `true` - remove all unnecessary spaces from SQL
 *
 * This option has no meaning, if `minify` is explicitly set to `false`. However, if `minify` is not
 * specified and `compress` is specified as `true`, then `minify` defaults to `true`.
 *
 * @property {array|object|value} params
 *
 * Static formatting parameters to be applied to the SQL, using the same method {@link formatting.format as.format},
 * but with option `partial` = `true`.
 *
 * Most of the time query formatting is fully dynamic, and applied just before executing the query.
 * In some cases though you may need to pre-format SQL with static values. Examples of it can be a
 * schema name, or a configurable table name.
 *
 * This option makes two-step SQL formatting easy: you can pre-format the SQL initially, and then
 * apply the second-step dynamic formatting when executing the query.
 */


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var defaults = module.exports = {
  // database host. defaults to localhost
  host: 'localhost',

  //database user's name
  user: process.platform === 'win32' ? process.env.USERNAME : process.env.USER,

  //name of database to connect
  database: process.platform === 'win32' ? process.env.USERNAME : process.env.USER,

  //database user's password
  password: null,

  // a Postgres connection string to be used instead of setting individual connection items
  // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
  // in the defaults object.
  connectionString : undefined,

  //database port
  port: 5432,

  //number of rows to return at a time from a prepared statement's
  //portal. 0 will return all rows at once
  rows: 0,

  // binary result mode
  binary: false,

  //Connection pool options - see https://github.com/coopernurse/node-pool
  //number of connections to use in connection pool
  //0 will disable connection pooling
  poolSize: 10,

  //max milliseconds a client can go unused before it is removed
  //from the pool and destroyed
  poolIdleTimeout: 30000,

  //frequency to check for idle clients within the client pool
  reapIntervalMillis: 1000,

  //if true the most recently released resources will be the first to be allocated
  returnToHead: false,

  //pool log function / boolean
  poolLog: false,

  client_encoding: "",

  ssl: false,

  application_name: undefined,
  fallback_application_name: undefined,

  parseInputDatesAsUTC: false
};

//parse int8 so you can get your count values as actual numbers
module.exports.__defineSetter__("parseInt8", function(val) {
  __webpack_require__(3).setTypeParser(20, 'text', val ? parseInt : function(val) { return val; });
});


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Writer = __webpack_require__(104);

function getLocal() {
    return new Writer();
}

var glb = new Writer();

function getGlobal() {
    console.log = function () {
        glb.log.apply(glb, arguments);
    };
    console.error = function () {
        glb.error.apply(glb, arguments);
    };
    console.warn = function () {
        glb.warn.apply(glb, arguments);
    };
    console.info = function () {
        glb.info.apply(glb, arguments);
    };
    console.success = function () {
        glb.success.apply(glb, arguments);
    };

    return glb;
}

var exp = module.exports = new Writer(true);

Object.defineProperty(exp, 'local', {
    get: getLocal,
    enumerable: true
});

Object.defineProperty(exp, 'global', {
    get: getGlobal,
    enumerable: true
});

Object.freeze(exp);


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    qResult: __webpack_require__(112),
    qFile: __webpack_require__(80),
    prepared: __webpack_require__(111),
    paramQuery: __webpack_require__(110)
};

/**
 * @namespace errors
 * @description
 * Error types namespace, available as `pgp.errors`, before and after initializing the library.
 *
 * @property {function} PreparedStatementError
 * {@link errors.PreparedStatementError PreparedStatementError} class constructor.
 *
 * Represents all errors that can be reported by class {@link PreparedStatement}.
 *
 * @property {function} ParameterizedQueryError
 * {@link errors.ParameterizedQueryError ParameterizedQueryError} class constructor.
 *
 * Represents all errors that can be reported by class {@link ParameterizedQuery}.
 *
 * @property {function} QueryFileError
 * {@link errors.QueryFileError QueryFileError} class constructor.
 *
 * Represents all errors that can be reported by class {@link QueryFile}.
 *
 * @property {function} QueryResultError
 * {@link errors.QueryResultError QueryResultError} class constructor.
 *
 * Represents all result-specific errors from query methods.
 *
 * @property {errors.queryResultErrorCode} queryResultErrorCode
 * Error codes `enum` used by class {@link errors.QueryResultError QueryResultError}.
 *
 */

module.exports = {
    QueryResultError: $npm.qResult.QueryResultError,
    queryResultErrorCode: $npm.qResult.queryResultErrorCode,
    PreparedStatementError: $npm.prepared,
    ParameterizedQueryError: $npm.paramQuery,
    QueryFileError: $npm.qFile
};

Object.freeze(module.exports);


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70),
    minify: __webpack_require__(83)
};

/**
 * @interface errors.QueryFileError
 * @augments external:Error
 * @description
 * {@link errors.QueryFileError QueryFileError} interface, available from the {@link errors} namespace.
 *
 * This type represents all errors related to {@link QueryFile}.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `QueryFileError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {string} file
 * File path/name that was passed into the {@link QueryFile} constructor.
 *
 * @property {object} options
 * Set of options that was used by the {@link QueryFile} object.
 *
 * @property {SQLParsingError} error
 * Internal $[SQLParsingError] object.
 *
 * It is set only when the error was thrown by $[pg-minify] while parsing the SQL file.
 *
 * @see QueryFile
 *
 */
function QueryFileError(error, qf) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'QueryFileError';
    this.stack = temp.stack;
    if (error instanceof $npm.minify.SQLParsingError) {
        this.error = error;
        this.message = "Failed to parse the SQL.";
    } else {
        this.message = error.message;
    }
    this.file = qf.file;
    this.options = qf.options;
}

QueryFileError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: QueryFileError,
        writable: true,
        configurable: true
    }
});

/**
 * @method errors.QueryFileError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
QueryFileError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        lines = [
            'QueryFileError {',
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'options: ' + JSON.stringify(this.options),
            gap1 + 'file: "' + this.file + '"'
        ];
    if (this.error) {
        lines.push(gap1 + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

QueryFileError.prototype.inspect = function () {
    return this.toString();
};

module.exports = QueryFileError;



/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    utils: __webpack_require__(70),
    formatting: __webpack_require__(72)
};

/**
 * @class helpers.TableName
 * @description
 *
 * **Alternative Syntax:** `TableName({table, [schema]})` &#8658; {@link helpers.TableName}
 *
 * Prepares and escapes a full table name that can be injected into queries directly.
 *
 * This is a read-only type that can be used wherever parameter `table` is supported.
 *
 * It supports $[Custom Type Formatting], which means you can use the type directly as a formatting
 * parameter, without specifying any escaping.
 *
 * @param {String|Object} table
 * Table name details, depending on the type:
 *
 * - table name, if `table` is a string
 * - object `{table, [schema]}`
 *
 * @param {string} [schema]
 * Database schema name.
 *
 * When `table` is passed in as `{table, [schema]}`, this parameter is ignored.
 *
 * @property {string} name
 * Formatted/escaped full table name, based on properties `schema` + `table`.
 *
 * @property {string} table
 * Table name.
 *
 * @property {string} schema
 * Database schema name.
 *
 * It is `undefined` when no schema was specified (or if it was an empty string).
 *
 * @returns {helpers.TableName}
 *
 * @example
 *
 * var table = new pgp.helpers.TableName('my-table', 'my-schema');
 * console.log(table);
 * //=> "my-schema"."my-table"
 *
 * // Formatting the type directly:
 * pgp.as.format("SELECT * FROM $1", table);
 * //=> SELECT * FROM "my-schema"."my-table"
 *
 */
function TableName(table, schema) {

    if (!(this instanceof TableName)) {
        return new TableName(table, schema);
    }

    if (table && typeof table === 'object' && 'table' in table) {
        schema = table.schema;
        table = table.table;
    }

    if (!$npm.utils.isText(table)) {
        throw new TypeError("Table name must be a non-empty text string.");
    }

    if (!$npm.utils.isNull(schema)) {
        if (typeof schema !== 'string') {
            throw new TypeError("Invalid schema name.");
        }
        if (schema.length > 0) {
            this.schema = schema;
        }
    }

    this.table = table;
    this.name = $npm.formatting.as.name(table);

    if (this.schema) {
        this.name = $npm.formatting.as.name(schema) + '.' + this.name;
    }

    this._rawDBType = true;

    Object.freeze(this);
}

TableName.prototype.formatDBType = function () {
    return this.name;
};

/**
 * @method helpers.TableName.toString
 * @description
 * Creates a well-formatted string that represents the object.
 *
 * It is called automatically when writing the object into the console.
 *
 * @returns {string}
 */
TableName.prototype.toString = function () {
    return this.name;
};

TableName.prototype.inspect = function () {
    return this.toString();
};

module.exports = TableName;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stream = __webpack_require__(7);
var util = __webpack_require__(0);

/////////////////////////////////////
// Checks if the value is a promise;
function isPromise(value) {
    return value && typeof value.then === 'function';
}

////////////////////////////////////////////
// Checks object for being a readable stream;

function isReadableStream(obj) {
    return obj instanceof stream.Stream &&
        typeof obj._read === 'function' &&
        typeof obj._readableState === 'object';
}

////////////////////////////////////////////////////////////
// Sets an object property as read-only and non-enumerable.
function extend(obj, name, value) {
    Object.defineProperty(obj, name, {
        value: value,
        configurable: false,
        enumerable: false,
        writable: false
    });
}

///////////////////////////////////////////
// Returns a space gap for console output;
function messageGap(level) {
    return Array(1 + level * 4).join(' ');
}

function formatError(error, level) {
    var names = ['BatchError', 'PageError', 'SequenceError'];
    var msg = util.inspect(error);
    if (error instanceof Error) {
        if (names.indexOf(error.name) === -1) {
            var gap = messageGap(level);
            msg = msg.split('\n').map(function (line, index) {
                return (index ? gap : '') + line;
            }).join('\n');
        } else {
            msg = error.toString(level);
        }
    }
    return msg;
}

module.exports = {
    formatError: formatError,
    isPromise: isPromise,
    isReadableStream: isReadableStream,
    messageGap: messageGap,
    extend: extend
};


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var parser = __webpack_require__(105);
var error = __webpack_require__(86);

parser.minify.SQLParsingError = error.SQLParsingError;
parser.minify.parsingErrorCode = error.parsingErrorCode;

module.exports = parser.minify;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @enum {number}
 * @alias queryResult
 * @readonly
 * @description
 * _Query Result Mask._
 *
 * Binary mask that represents the result expected from queries.
 * It is used in the generic {@link Database.query query} method,
 * as well as method {@link Database.func func}.
 *
 * The mask is always the last optional parameter, which defaults to `queryResult.any`.
 *
 * Any combination of flags is supported, except for `one + many`.
 *
 * The type is available from the library's root: `pgp.queryResult`.
 *
 * @see {@link Database.query}, {@link Database.func}
 */
var queryResult = {
    /** Single row is expected. */
    one: 1,
    /** One or more rows expected. */
    many: 2,
    /** Expecting no rows. */
    none: 4,
    /** `many|none` - any result is expected. */
    any: 6
};

Object.freeze(queryResult);

module.exports = queryResult;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

var defaults = __webpack_require__(77);

// convert a JS array to a postgres array literal
// uses comma separator so won't work for types like box that use
// a different array separator.
function arrayString(val) {
  var result = '{';
  for (var i = 0 ; i < val.length; i++) {
    if(i > 0) {
      result = result + ',';
    }
    if(val[i] === null || typeof val[i] === 'undefined') {
      result = result + 'NULL';
    }
    else if(Array.isArray(val[i])) {
      result = result + arrayString(val[i]);
    }
    else
    {
      result = result + JSON.stringify(prepareValue(val[i]));
    }
  }
  result = result + '}';
  return result;
}

//converts values from javascript types
//to their 'raw' counterparts for use as a postgres parameter
//note: you can override this function to provide your own conversion mechanism
//for complex types, etc...
var prepareValue = function(val, seen) {
  if (val instanceof Buffer) {
    return val;
  }
  if(val instanceof Date) {
    if(defaults.parseInputDatesAsUTC) {
      return dateToStringUTC(val);
    } else {
      return dateToString(val);
    }
  }
  if(Array.isArray(val)) {
    return arrayString(val);
  }
  if(val === null || typeof val === 'undefined') {
    return null;
  }
  if(typeof val === 'object') {
    return prepareObject(val, seen);
  }
  if (typeof val === 'undefined') {
    throw new Error('SQL queries with undefined where clause option');
  }
  return val.toString();
};

function prepareObject(val, seen) {
  if(val.toPostgres && typeof val.toPostgres === 'function') {
    seen = seen || [];
    if (seen.indexOf(val) !== -1) {
      throw new Error('circular reference detected while preparing "' + val + '" for query');
    }
    seen.push(val);

    return prepareValue(val.toPostgres(prepareValue), seen);
  }
  return JSON.stringify(val);
}

function pad(number, digits) {
  number = ""  +number;
  while(number.length < digits)
    number = "0" + number;
  return number;
}

function dateToString(date) {

  var offset = -date.getTimezoneOffset();
  var ret = pad(date.getFullYear(), 4) + '-' +
    pad(date.getMonth() + 1, 2) + '-' +
    pad(date.getDate(), 2) + 'T' +
    pad(date.getHours(), 2) + ':' +
    pad(date.getMinutes(), 2) + ':' +
    pad(date.getSeconds(), 2) + '.' +
    pad(date.getMilliseconds(), 3);

  if(offset < 0) {
    ret += "-";
    offset *= -1;
  }
  else
    ret += "+";

  return ret + pad(Math.floor(offset/60), 2) + ":" + pad(offset%60, 2);
}

function dateToStringUTC(date) {
  
  var ret = pad(date.getUTCFullYear(), 4) + '-' +
      pad(date.getUTCMonth() + 1, 2) + '-' +
      pad(date.getUTCDate(), 2) + 'T' +
      pad(date.getUTCHours(), 2) + ':' +
      pad(date.getUTCMinutes(), 2) + ':' +
      pad(date.getUTCSeconds(), 2) + '.' +
      pad(date.getUTCMilliseconds(), 3);
  
  return ret + "+00:00";
}

function normalizeQueryConfig (config, values, callback) {
  //can take in strings or config objects
  config = (typeof(config) == 'string') ? { text: config } : config;
  if(values) {
    if(typeof values === 'function') {
      config.callback = values;
    } else {
      config.values = values;
    }
  }
  if(callback) {
    config.callback = callback;
  }
  return config;
}

module.exports = {
  prepareValue: function prepareValueWrapper (value) {
    //this ensures that extra arguments do not get passed into prepareValue
    //by accident, eg: from calling values.map(utils.prepareValue)
    return prepareValue(value);
  },
  normalizeQueryConfig: normalizeQueryConfig
};


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var EOL = __webpack_require__(71).EOL;

var parsingErrorCode = {
    unclosedMLC: 0, // Unclosed multi-line comment.
    unclosedText: 1, // Unclosed text block.
    unclosedQI: 2, // Unclosed quoted identifier.
    multiLineQI: 3 // Multi-line quoted identifiers are not supported.
};

Object.freeze(parsingErrorCode);

var errorMessages = [
    {name: "unclosedMLC", message: "Unclosed multi-line comment."},
    {name: "unclosedText", message: "Unclosed text block."},
    {name: "unclosedQI", message: "Unclosed quoted identifier."},
    {name: "multiLineQI", message: "Multi-line quoted identifiers are not supported."}
];

function SQLParsingError(code, position) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'SQLParsingError';
    this.stack = temp.stack;
    this.code = code; // one of parsingErrorCode values;
    this.error = errorMessages[code].message;
    this.position = position; // Error position in the text: {line, column}
    this.message = "Error parsing SQL at {line:" + position.line + ",col:" + position.column + "}: " + this.error;
}

SQLParsingError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: SQLParsingError,
        writable: true,
        configurable: true
    }
});

SQLParsingError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap = messageGap(level + 1);
    var lines = [
        'SQLParsingError {',
        gap + 'code: parsingErrorCode.' + errorMessages[this.code].name,
        gap + 'error: "' + this.error + '"',
        gap + 'position: {line: ' + this.position.line + ", col: " + this.position.column + '}',
        messageGap(level) + '}'
    ];
    return lines.join(EOL);
};

function messageGap(level) {
    return Array(1 + level * 4).join(' ');
}

SQLParsingError.prototype.inspect = function () {
    return this.toString();
};

module.exports = {
    SQLParsingError: SQLParsingError,
    parsingErrorCode: parsingErrorCode
};


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @constructor PromiseAdapter
 * @summary Adapter for the primary promise operations.
 * @description
 * Provides compatibility with promise libraries that cannot be recognized automatically,
 * via functions that implement the primary operations with promises:
 *
 *  - construct a new promise with a callback function
 *  - resolve a promise with some result data
 *  - reject a promise with a reason
 *
 * The type is available from the library's root: `pgp.PromiseAdapter`.
 *
 * @param {function} create
 * A function that takes a callback parameter and returns a new promise object.
 * The callback parameter is expected to be `function(resolve, reject)`.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to create a promise.`
 *
 * @param {function} resolve
 * A function that takes an optional data parameter and resolves a promise with it.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to resolve a promise.`
 *
 * @param {function} reject
 * A function that takes an optional error parameter and rejects a promise with it.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to reject a promise.`
 *
 * @returns {PromiseAdapter}
 */
function PromiseAdapter(create, resolve, reject) {

    if (!(this instanceof PromiseAdapter)) {
        return new PromiseAdapter(create, resolve, reject);
    }

    this.create = create;
    this.resolve = resolve;
    this.reject = reject;

    if (typeof create !== 'function') {
        throw new TypeError('Adapter requires a function to create a promise.');
    }

    if (typeof resolve !== 'function') {
        throw new TypeError('Adapter requires a function to resolve a promise.');
    }

    if (typeof reject !== 'function') {
        throw new TypeError('Adapter requires a function to reject a promise.');
    }
}

module.exports = PromiseAdapter;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70),
    formatting: __webpack_require__(72)
};

/**
 *
 * @class helpers.Column
 * @description
 *
 * It is a read-only structure that contains details for a single column, to be primarily used by {@link helpers.ColumnSet ColumnSet}.
 *
 * The class parses and validates all the details, and prepares them for high-performance query generation.
 *
 * @param {String|helpers.ColumnConfig} col
 * Column details, depending on the type.
 *
 * When it is a string, it is expected to contain a name for both the column and the source property, assuming that the two are the same.
 * The name must adhere to JavaScript syntax for variable names. The name can be appended with any format modifier as supported by
 * {@link formatting.format as.format} (`^`, `~`, `#`, `:csv`, `:json`, `:name`, `:raw`, `:value`), which is then removed from the name and put
 * into property `mod`. If the name starts with `?`, it is removed, while setting flag `cnd` = `true`.
 *
 * If the string doesn't adhere to the above requirements, the method will throw {@link external:TypeError TypeError} = `Invalid column syntax`.
 *
 * When `col` is a simple {@link helpers.ColumnConfig ColumnConfig}-like object, it is used as an input configurator to set all the properties
 * of the class.
 *
 * @property {string} name
 * Destination column name + source property name (if `prop` is skipped). The name must adhere to JavaScript syntax for variables,
 * unless `prop` is specified, in which case `name` represents only the column name, and therefore can be any string.
 *
 * @property {string} [prop]
 * Source property name, if different from the column's name. It must adhere to JavaScript syntax for variables.
 *
 * It is ignored when it is the same as `name`.
 *
 * @property {string} [mod]
 * Formatting modifier, as supported by method {@link formatting.format as.format}: `^`, `~`, `#`, `:csv`, `:json`, `:name`, `:raw`, `:value`.
 *
 * @property {string} [cast]
 * Server-side type casting, without `::` in front.
 *
 * @property {boolean} [cnd]
 * Conditional column flag.
 *
 * Used by methods {@link helpers.update update} and {@link helpers.sets sets}, ignored by methods {@link helpers.insert insert} and
 * {@link helpers.values values}. It indicates that the column is reserved for a `WHERE` condition, not to be set or updated.
 *
 * It can be set from a string initialization, by adding `?` in front of the name.
 *
 * @property {} [def]
 * Default value for the property, to be used only when the source object doesn't have the property.
 * It is ignored when property `init` is set.
 *
 * @property {helpers.initCB} [init]
 * Override callback for the value.
 *
 * @property {helpers.skipCB} [skip]
 * An override for skipping columns dynamically.
 *
 * Used by methods {@link helpers.update update} (for a single object) and {@link helpers.sets sets}, ignored by methods
 * {@link helpers.insert insert} and {@link helpers.values values}.
 *
 * It is also ignored when conditional flag `cnd` is set.
 *
 * @returns {helpers.Column}
 *
 * @see {@link helpers.ColumnConfig ColumnConfig}
 *
 * @example
 *
 * var pgp = require('pg-promise')({
 *     capSQL: true // if you want all generated SQL capitalized
 * });
 *
 * var Column = pgp.helpers.Column;
 *
 * // creating a column from just a name:
 * var col1 = new Column('colName');
 * console.log(col1);
 * //=>
 * // Column {
 * //    name: "colName"
 * // }
 *
 * // creating a column from a name + modifier:
 * var col2 = new Column('colName:csv');
 * console.log(col2);
 * //=>
 * // Column {
 * //    name: "colName"
 * //    mod: ":csv"
 * // }
 *
 * // creating a column from a configurator:
 * var col3 = new Column({
 *     name: 'colName', // required
 *     prop: 'propName', // optional
 *     mod: '^', // optional
 *     def: 123 // optional
 * });
 * console.log(col3);
 * //=>
 * // Column {
 * //    name: "colName"
 * //    prop: "propName"
 * //    mod: "^"
 * //    def: 123
 * // }
 *
 */
function Column(col) {

    if (!(this instanceof Column)) {
        return new Column(col);
    }

    if (typeof col === 'string') {
        var info = parseColumn(col);
        this.name = info.name;
        if ('mod' in info) {
            this.mod = info.mod;
        }
        if ('cnd' in info) {
            this.cnd = info.cnd;
        }
    } else {
        if (col && typeof col === 'object' && 'name' in col) {
            if (!$npm.utils.isText(col.name)) {
                throw new TypeError("Invalid 'name' value: " + JSON.stringify(col.name) + ". A non-empty string was expected.");
            }
            if ($npm.utils.isNull(col.prop) && !isValidVariable(col.name)) {
                throw new TypeError("Invalid 'name' syntax: " + JSON.stringify(col.name) + ". A valid variable name was expected.");
            }
            this.name = col.name; // column name + property name (if 'prop' isn't specified)

            if (!$npm.utils.isNull(col.prop)) {
                if (!$npm.utils.isText(col.prop)) {
                    throw new TypeError("Invalid 'prop' value: " + JSON.stringify(col.prop) + ". A non-empty string was expected.");
                }
                if (!isValidVariable(col.prop)) {
                    throw new TypeError("Invalid 'prop' syntax: " + JSON.stringify(col.prop) + ". A valid variable name was expected.");
                }
                if (col.prop !== col.name) {
                    // optional property name, if different from the column's name;
                    this.prop = col.prop;
                }
            }
            if (!$npm.utils.isNull(col.mod)) {
                if (typeof col.mod !== 'string' || !isValidMod(col.mod)) {
                    throw new TypeError("Invalid 'mod' value: " + JSON.stringify(col.mod) + ".");
                }
                this.mod = col.mod; // optional format modifier;
            }
            if (!$npm.utils.isNull(col.cast)) {
                this.cast = parseCast(col.cast); // optional SQL type casting
            }
            if ('cnd' in col) {
                this.cnd = !!col.cnd;
            }
            if ('def' in col) {
                this.def = col.def; // optional default
            }
            if (typeof col.init === 'function') {
                this.init = col.init; // optional value override (overrides 'def' also)
            }
            if (typeof col.skip === 'function') {
                this.skip = col.skip;
            }
        } else {
            throw new TypeError("Invalid column details.");
        }
    }

    var variable = '${' + (this.prop || this.name) + (this.mod || '') + '}',
        castText = this.cast ? ('::' + this.cast) : '',
        escapedName = $npm.formatting.as.name(this.name);

    Object.defineProperty(this, 'variable', {
        enumerable: false,
        value: variable
    });

    Object.defineProperty(this, 'castText', {
        enumerable: false,
        value: castText
    });

    Object.defineProperty(this, 'escapedName', {
        enumerable: false,
        value: escapedName
    });

    Object.freeze(this);
}

function parseCast(name) {
    if (typeof name === 'string') {
        var s = name.replace(/^[:\s]*|\s*$/g, '');
        if (s) {
            return s;
        }
    }
    throw new TypeError("Invalid 'cast' value: " + JSON.stringify(name) + ".");
}

function parseColumn(name) {
    var m = name.match(/\??[a-zA-Z0-9\$_]+(\^|~|#|:raw|:name|:json|:csv|:value)?/);
    if (m && m[0] === name) {
        var res = {};
        if (name[0] === '?') {
            res.cnd = true;
            name = name.substr(1);
        }
        var mod = name.match(/\^|~|#|:raw|:name|:json|:csv|:value/);
        if (mod) {
            res.name = name.substr(0, mod.index);
            res.mod = mod[0];
        } else {
            res.name = name;
        }
        return res;
    }
    throw new TypeError("Invalid column syntax: " + JSON.stringify(name) + ".");
}

function isValidMod(mod) {
    var values = ['^', '~', '#', ':raw', ':name', ':json', ':csv', ':value'];
    return values.indexOf(mod) !== -1;
}

function isValidVariable(name) {
    var m = name.match(/^[0-9]+|[a-zA-Z0-9\$_]+/);
    return !!m && m[0] === name;
}

/**
 * @method helpers.Column.toString
 * @description
 * Creates a well-formatted multi-line string that represents the object.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
Column.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        lines = [
            gap0 + 'Column {',
            gap1 + 'name: ' + JSON.stringify(this.name)
        ];
    if ('prop' in this) {
        lines.push(gap1 + 'prop: ' + JSON.stringify(this.prop));
    }
    if ('mod' in this) {
        lines.push(gap1 + 'mod: ' + JSON.stringify(this.mod));
    }
    if ('cast' in this) {
        lines.push(gap1 + 'cast: ' + JSON.stringify(this.cast));
    }
    if ('cnd' in this) {
        lines.push(gap1 + 'cnd: ' + JSON.stringify(this.cnd));
    }
    if ('def' in this) {
        lines.push(gap1 + 'def: ' + JSON.stringify(this.def));
    }
    if ('init' in this) {
        lines.push(gap1 + 'init: [Function]');
    }
    if ('skip' in this) {
        lines.push(gap1 + 'skip: [Function]');
    }
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

Column.prototype.inspect = function () {
    return this.toString();
};

/**
 * @typedef helpers.ColumnConfig
 * @description
 * A simple structure with column details, to be passed into the {@link helpers.Column Column} constructor for initialization.
 *
 * @property {string} name
 * Destination column name + source property name (if `prop` is skipped). The name must adhere to JavaScript syntax for variables,
 * unless `prop` is specified, in which case `name` represents only the column name, and therefore can be any string.
 *
 * @property {string} [prop]
 * Source property name, if different from the column's name. It must adhere to JavaScript syntax for variables.
 *
 * It is ignored when it is the same as `name`.
 *
 * @property {string} [mod]
 * Formatting modifier, as supported by method {@link formatting.format as.format}: `^`, `~`, `#`, `:csv`, `:json`, `:name`, `:raw`, `:value`.
 *
 * @property {string} [cast]
 * Server-side type casting. Leading `::` is allowed, but not needed (automatically removed when specified).
 *
 * @property {boolean} [cnd]
 * Conditional column flag.
 *
 * Used by methods {@link helpers.update update} and {@link helpers.sets sets}, ignored by methods {@link helpers.insert insert} and
 * {@link helpers.values values}. It indicates that the column is reserved for a `WHERE` condition, not to be set or updated.
 *
 * It can be set from a string initialization, by adding `?` in front of the name.
 *
 * @property {} [def]
 * Default value for the property, to be used only when the source object doesn't have the property.
 * It is ignored when property `init` is set.
 *
 * @property {helpers.initCB} [init]
 * Override callback for the value.
 *
 * @property {helpers.skipCB} [skip]
 * An override for skipping columns dynamically.
 *
 * Used by methods {@link helpers.update update} (for a single object) and {@link helpers.sets sets}, ignored by methods
 * {@link helpers.insert insert} and {@link helpers.values values}.
 *
 * It is also ignored when conditional flag `cnd` is set.
 *
 */

/**
 * @callback helpers.initCB
 * @description
 * A callback function type used by parameter `init` within {@link helpers.ColumnConfig ColumnConfig}.
 *
 * It works as an override for the corresponding property value in the `source` object.
 *
 * The function is called with `this` set to the `source` object.
 *
 * @param {} col
 * Column-to-property descriptor.
 *
 * @param {object} col.source
 * The source object, equals to `this` that's passed into the function.
 *
 * @param {string} col.name
 * Name of the property within the `source` object.
 *
 * @param {} col.value
 *
 * Property value, set to one of the following:
 *
 * - Value of the property within the `source` object (`value` = `source[name]`), if the property exists
 * - If the property doesn't exist and `def` is set in the column, then `value` is set to the value of `def`
 * - If the property doesn't exist and `def` is not set in the column, then `value` is set to `undefined`
 *
 * @param {boolean} col.exists
 * Indicates whether the property exists in the `source` object (`exists = name in source`).
 *
 * @returns {}
 * The new value to be used for the corresponding column.
 */

/**
 * @callback helpers.skipCB
 * @description
 * A callback function type used by parameter `skip` within {@link helpers.ColumnConfig ColumnConfig}.
 *
 * It is to dynamically determine when the property with specified `name` in the `source` object is to be skipped.
 *
 * The function is called with `this` set to the `source` object.
 *
 * @param {} col
 * Column-to-property descriptor.
 *
 * @param {object} col.source
 * The source object, equals to `this` that's passed into the function.
 *
 * @param {string} col.name
 * Name of the property within the `source` object.
 *
 * @param {} col.value
 *
 * Property value, set to one of the following:
 *
 * - Value of the property within the `source` object (`value` = `source[name]`), if the property exists
 * - If the property doesn't exist and `def` is set in the column, then `value` is set to the value of `def`
 * - If the property doesn't exist and `def` is not set in the column, then `value` is set to `undefined`
 *
 * @param {boolean} col.exists
 * Indicates whether the property exists in the `source` object (`exists = name in source`).
 *
 * @returns {boolean}
 * A truthy value that indicates whether the column is to be skipped.
 *
 */

module.exports = Column;


/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nodeHighVer = +process.versions.node.split('.')[0];

// istanbul ignore if
if (nodeHighVer < 4) {

    // Starting from pg-promise v5.6.0, the library no longer supports legacy
    // Node.js versions 0.10 and 0.12, requiring Node.js 4.x as the minimum.

    throw new Error('Minimum Node.js version required by pg-promise is 4.x');
}

module.exports = __webpack_require__(119);


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    utils: __webpack_require__(70),
    special: __webpack_require__(91),
    QueryFile: __webpack_require__(76),
    formatting: __webpack_require__(72),
    result: __webpack_require__(84),
    errors: __webpack_require__(79),
    events: __webpack_require__(74),
    stream: __webpack_require__(121),
    types: __webpack_require__(93)
};

var QueryResultError = $npm.errors.QueryResultError,
    InternalError = $npm.utils.InternalError,
    ExternalQuery = $npm.types.ExternalQuery,
    PreparedStatement = $npm.types.PreparedStatement,
    ParameterizedQuery = $npm.types.ParameterizedQuery,
    SpecialQuery = $npm.special.SpecialQuery,
    qrec = $npm.errors.queryResultErrorCode;

var badMask = $npm.result.one | $npm.result.many; // the combination isn't supported;

//////////////////////////////
// Generic query method;
function $query(ctx, query, values, qrm, config) {

    var isResult, $p = config.promise;

    if (qrm instanceof SpecialQuery) {
        if (qrm.isStream) {
            return $npm.stream.call(this, ctx, query, values, config);
        }
        isResult = qrm.isResult;
    }

    var error, isFunc,
        opt = ctx.options,
        pgFormatting = opt.pgFormatting,
        capSQL = opt.capSQL,
        params = pgFormatting ? values : undefined;

    if (!query) {
        error = new TypeError("Empty or undefined query.");
    }

    if (!error && typeof query === 'object') {
        if (query instanceof $npm.QueryFile) {
            query.prepare();
            if (query.error) {
                error = query.error;
                query = query.file;
            } else {
                query = query.query;
            }
        } else {
            if ('funcName' in query) {
                isFunc = true;
                query = query.funcName; // query is a function name;
            } else {
                if (query instanceof ExternalQuery) {
                    pgFormatting = true;
                } else {
                    if ('name' in query) {
                        query = new PreparedStatement(query);
                        pgFormatting = true;
                    } else {
                        if ('text' in query) {
                            query = new ParameterizedQuery(query);
                            pgFormatting = true;
                        }
                    }
                }
                if (query instanceof ExternalQuery && !$npm.utils.isNull(values)) {
                    query.values = values;
                }
            }
        }
    }

    if (!error) {
        if (!pgFormatting && !$npm.utils.isText(query)) {
            error = new TypeError(isFunc ? "Invalid function name." : "Invalid query format.");
        }
        if (query instanceof ExternalQuery) {
            var qp = query.parse();
            if (qp instanceof Error) {
                error = qp;
            } else {
                query = qp;
            }
        }
    }

    if (!error && !isResult) {
        if ($npm.utils.isNull(qrm)) {
            qrm = $npm.result.any; // default query result;
        } else {
            if (qrm !== parseInt(qrm) || (qrm & badMask) === badMask || qrm < 1 || qrm > 6) {
                error = new TypeError("Invalid Query Result Mask specified.");
            }
        }
    }

    if (!error && (!pgFormatting || isFunc)) {
        try {
            // use 'pg-promise' implementation of values formatting;
            if (isFunc) {
                query = $npm.formatting.formatFunction(query, values, capSQL);
            } else {
                query = $npm.formatting.formatQuery(query, values);
            }
        } catch (e) {
            if (isFunc) {
                var prefix = capSQL ? 'SELECT * FROM' : 'select * from';
                query = prefix + ' ' + query + '(...)';
            }
            error = e instanceof Error ? e : new $npm.utils.InternalError(e);
            params = values;
        }
    }

    return $p(function (resolve, reject) {

        if (notifyReject()) {
            return;
        }
        error = $npm.events.query(opt, getContext());
        if (notifyReject()) {
            return;
        }
        var start = Date.now();
        try {
            ctx.db.client.query(query, params, function (err, result) {
                var data;
                if (!err) {
                    $npm.utils.addReadProp(result, 'duration', Date.now() - start);
                    $npm.utils.addReadProp(result.rows, 'duration', result.duration, true);
                    if (result.rows.length) {
                        err = $npm.events.receive(opt, result.rows, result, getContext());
                        err = err || error;
                    }
                }
                if (err) {
                    error = err;
                } else {
                    if (isResult) {
                        data = result; // raw object requested (Result type);
                    } else {
                        data = result.rows;
                        var len = data.length;
                        if (len) {
                            if (len > 1 && qrm & $npm.result.one) {
                                // one row was expected, but returned multiple;
                                error = new QueryResultError(qrec.multiple, result, query, params);
                            } else {
                                if (!(qrm & ($npm.result.one | $npm.result.many))) {
                                    // no data should have been returned;
                                    error = new QueryResultError(qrec.notEmpty, result, query, params);
                                } else {
                                    if (!(qrm & $npm.result.many)) {
                                        data = data[0];
                                    }
                                }
                            }
                        } else {
                            // no data returned;
                            if (qrm & $npm.result.none) {
                                if (qrm & $npm.result.one) {
                                    data = null;
                                } else {
                                    data = qrm & $npm.result.many ? data : null;
                                }
                            } else {
                                error = new QueryResultError(qrec.noData, result, query, params);
                            }
                        }
                    }
                }
                if (!notifyReject()) {
                    resolve(data);
                }
            });
        } catch (e) {
            // this can only happen as a result of an internal failure within node-postgres,
            // like during a sudden loss of communications, which is impossible to reproduce
            // automatically, so removing it from the test coverage:
            // istanbul ignore next
            error = e;
        }

        function getContext() {
            var client;
            if (ctx.db) {
                client = ctx.db.client;
            } else {
                error = new Error("Loose request outside an expired connection.");
            }
            return {
                client: client,
                dc: ctx.dc,
                query: query,
                params: params,
                ctx: ctx.ctx
            };
        }

        notifyReject();

        function notifyReject() {
            var context = getContext();
            if (error) {
                if (error instanceof InternalError) {
                    error = error.error;
                }
                $npm.events.error(opt, error, context);
                reject(error);
                return true;
            }
        }
    });
}

module.exports = function (config) {
    return function (ctx, query, values, qrm) {
        return $query.call(this, ctx, query, values, qrm, config);
    };
};


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/////////////////////////////
// Special Query type;
function SpecialQuery(type) {
    this.isStream = type === 'stream';
    this.isResult = type === 'result';
}

var cache = {
    resultQuery: new SpecialQuery('result'),
    streamQuery: new SpecialQuery('stream')
};

module.exports = {
    SpecialQuery: SpecialQuery,
    cache: cache
};


/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @enum {number}
 * @alias txMode.isolationLevel
 * @readonly
 * @summary Transaction Isolation Level.
 * @description
 * The type is available from the {@link txMode} namespace.
 *
 * @see $[Transaction Isolation]
 */
var isolationLevel = {
    /** Isolation level not specified. */
    none: 0,

    /** ISOLATION LEVEL SERIALIZABLE */
    serializable: 1,

    /** ISOLATION LEVEL REPEATABLE READ */
    repeatableRead: 2,

    /** ISOLATION LEVEL READ COMMITTED */
    readCommitted: 3

    // From the official documentation: http://www.postgresql.org/docs/9.5/static/sql-set-transaction.html
    // The SQL standard defines one additional level, READ UNCOMMITTED. In PostgreSQL READ UNCOMMITTED is treated as READ COMMITTED.
    // => skipping `READ UNCOMMITTED`.
};

Object.freeze(isolationLevel);

/**
 * @class txMode.TransactionMode
 * @description
 * **Alternative Syntax:** `TransactionMode({tiLevel, readOnly, deferrable})` &#8658; {@link TransactionMode}
 *
 * Constructs a complete transaction-opening command, based on the parameters:
 *  - isolation level
 *  - access mode
 *  - deferrable mode
 *
 * The type is available from the {@link txMode} namespace.
 *
 * @param {isolationLevel|Object} [tiLevel]
 * Transaction Isolation Level, or an object with parameters, if the alternative
 * syntax is used.
 *
 * @param {boolean} [readOnly]
 * Sets transaction access mode based on the read-only flag:
 *  - `undefined` - access mode not specified (default)
 *  - `true` - access mode is set to `READ ONLY`
 *  - `false` - access mode is set to `READ WRITE`
 *
 * @param {boolean} [deferrable]
 * Sets transaction deferrable mode based on the boolean value:
 *  - `undefined` - deferrable mode not specified (default)
 *  - `true` - mode is set to `DEFERRABLE`
 *  - `false` - mode is set to `NOT DEFERRABLE`
 *
 * It is used only when `tiLevel`=`isolationLevel.serializable`
 * and `readOnly`=`true`, or else it is ignored.
 *
 * @returns {txMode.TransactionMode}
 *
 * @see $[BEGIN], {@link txMode.isolationLevel}
 *
 * @example
 *
 * var TransactionMode = pgp.txMode.TransactionMode;
 * var isolationLevel = pgp.txMode.isolationLevel;
 *
 * // Create a reusable transaction mode (serializable + read-only + deferrable):
 * var tmSRD = new TransactionMode({
 *     tiLevel: isolationLevel.serializable,
 *     readOnly: true,
 *     deferrable: true
 * });
 *
 * function myTransaction() {
 *     return this.query("SELECT * FROM table");
 * }
 *
 * myTransaction.txMode = tmSRD; // assign transaction mode;
 *
 * db.tx(myTransaction)
 *     .then(function() {
 *         // success;
 *     });
 *
 * // Instead of the default BEGIN, such transaction will initiate with:
 *
 * // BEGIN ISOLATION LEVEL SERIALIZABLE READ ONLY DEFERRABLE
 *
 */
function TransactionMode(tiLevel, readOnly, deferrable) {

    if (!(this instanceof TransactionMode)) {
        return new TransactionMode(tiLevel, readOnly, deferrable);
    }

    if (tiLevel && typeof tiLevel === 'object') {
        readOnly = tiLevel.readOnly;
        deferrable = tiLevel.deferrable;
        tiLevel = tiLevel.tiLevel;
    }

    var level, accessMode, deferrableMode, capBegin, begin = 'begin';

    tiLevel = (tiLevel > 0) ? parseInt(tiLevel) : 0;

    if (tiLevel > 0 && tiLevel < 4) {
        var values = ['serializable', 'repeatable read', 'read committed'];
        level = 'isolation level ' + values[tiLevel - 1];
    }

    if (readOnly) {
        accessMode = 'read only';
    } else {
        if (readOnly !== undefined) {
            accessMode = 'read write';
        }
    }

    // From the official documentation: http://www.postgresql.org/docs/9.5/static/sql-set-transaction.html
    // The DEFERRABLE transaction property has no effect unless the transaction is also SERIALIZABLE and READ ONLY
    if (tiLevel === isolationLevel.serializable && readOnly) {
        if (deferrable) {
            deferrableMode = 'deferrable';
        } else {
            if (deferrable !== undefined) {
                deferrableMode = 'not deferrable';
            }
        }
    }

    if (level) {
        begin += ' ' + level;
    }

    if (accessMode) {
        begin += ' ' + accessMode;
    }

    if (deferrableMode) {
        begin += ' ' + deferrableMode;
    }

    capBegin = begin.toUpperCase();

    this.begin = function (cap) {
        return cap ? capBegin : begin;
    };
}

/**
 * @namespace txMode
 * @description
 * Transaction Mode namespace, available as `pgp.txMode`, before and after initializing the library.
 *
 * Extends the default `BEGIN` with Transaction Mode parameters:
 *  - isolation level
 *  - access mode
 *  - deferrable mode
 *
 * @property {function} TransactionMode
 * {@link txMode.TransactionMode TransactionMode} class constructor.
 *
 * @property {txMode.isolationLevel} isolationLevel
 * Transaction Isolation Level enumerator
 *
 * @see $[BEGIN]
 */
module.exports = {
    isolationLevel: isolationLevel,
    TransactionMode: TransactionMode
};

Object.freeze(module.exports);


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    utils: __webpack_require__(70),
    PS: __webpack_require__(124),
    PQ: __webpack_require__(123)
};

// istanbul ignore next;
function ExternalQuery() {
}

ExternalQuery.prototype.inspect = function () {
    return this.toString();
};

$npm.utils.inherits($npm.PS, ExternalQuery);
$npm.utils.inherits($npm.PQ, ExternalQuery);

module.exports = {
    ExternalQuery: ExternalQuery,
    PreparedStatement: $npm.PS,
    ParameterizedQuery: $npm.PQ
};


/***/ }),
/* 94 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 94;


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

var url = __webpack_require__(19);
var dns = __webpack_require__(63);

var defaults = __webpack_require__(77);

var val = function(key, config, envVar) {
  if (envVar === undefined) {
    envVar = process.env[ 'PG' + key.toUpperCase() ];
  } else if (envVar === false) {
    // do nothing ... use false
  } else {
    envVar = process.env[ envVar ];
  }

  return config[key] ||
    envVar ||
    defaults[key];
};

//parses a connection string
var parse = __webpack_require__(34).parse;

var useSsl = function() {
  switch(process.env.PGSSLMODE) {
  case "disable":
    return false;
  case "prefer":
  case "require":
  case "verify-ca":
  case "verify-full":
    return true;
  }
  return defaults.ssl;
};

var ConnectionParameters = function(config) {
  //if a string is passed, it is a raw connection string so we parse it into a config
  config = typeof config == 'string' ? parse(config) : (config || {});
  //if the config has a connectionString defined, parse IT into the config we use
  //this will override other default values with what is stored in connectionString
  if(config.connectionString) {
    config = parse(config.connectionString);
  }
  this.user = val('user', config);
  this.database = val('database', config);
  this.port = parseInt(val('port', config), 10);
  this.host = val('host', config);
  this.password = val('password', config);
  this.binary = val('binary', config);
  this.ssl = config.ssl || useSsl();
  this.client_encoding = val("client_encoding", config);
  //a domain socket begins with '/'
  this.isDomainSocket = (!(this.host||'').indexOf('/'));

  this.application_name = val('application_name', config, 'PGAPPNAME');
  this.fallback_application_name = val('fallback_application_name', config, false);
};

var add = function(params, config, paramName) {
  var value = config[paramName];
  if(value) {
    params.push(paramName+"='"+value+"'");
  }
};

ConnectionParameters.prototype.getLibpqConnectionString = function(cb) {
  var params = [];
  add(params, this, 'user');
  add(params, this, 'password');
  add(params, this, 'port');
  add(params, this, 'application_name');
  add(params, this, 'fallback_application_name');

  if(this.database) {
    params.push("dbname='" + this.database + "'");
  }
  if(this.host) {
    params.push("host=" + this.host);
  }
  if(this.isDomainSocket) {
    return cb(null, params.join(' '));
  }
  if(this.client_encoding) {
    params.push("client_encoding='" + this.client_encoding + "'");
  }
  dns.lookup(this.host, function(err, address) {
    if(err) return cb(err, null);
    params.push("hostaddr=" + address);
    return cb(null, params.join(' '));
  });
};

module.exports = ConnectionParameters;


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

var net = __webpack_require__(64);
var EventEmitter = __webpack_require__(1).EventEmitter;
var util = __webpack_require__(0);

var Writer = __webpack_require__(29);
var Reader = __webpack_require__(33);

var TEXT_MODE = 0;
var BINARY_MODE = 1;
var Connection = function(config) {
  EventEmitter.call(this);
  config = config || {};
  this.stream = config.stream || new net.Stream();
  this.lastBuffer = false;
  this.lastOffset = 0;
  this.buffer = null;
  this.offset = null;
  this.encoding = 'utf8';
  this.parsedStatements = {};
  this.writer = new Writer();
  this.ssl = config.ssl || false;
  this._ending = false;
  this._mode = TEXT_MODE;
  this._emitMessage = false;
  this._reader = new Reader({
    headerSize: 1,
    lengthPadding: -4
  });
  var self = this;
  this.on('newListener', function(eventName) {
    if(eventName == 'message') {
      self._emitMessage = true;
    }
  });
};

util.inherits(Connection, EventEmitter);

Connection.prototype.connect = function(port, host) {

  if(this.stream.readyState === 'closed') {
    this.stream.connect(port, host);
  } else if(this.stream.readyState == 'open') {
    this.emit('connect');
  }

  var self = this;

  this.stream.on('connect', function() {
    self.emit('connect');
  });

  this.stream.on('error', function(error) {
    //don't raise ECONNRESET errors - they can & should be ignored
    //during disconnect
    if(self._ending && error.code == 'ECONNRESET') {
      return;
    }
    self.emit('error', error);
  });

  this.stream.on('close', function() {
    // NOTE: node-0.10 emits both 'end' and 'close'
    //       for streams closed by the peer, while
    //       node-0.8 only emits 'close'
    self.emit('end');
  });

  if(!this.ssl) {
    return this.attachListeners(this.stream);
  }

  this.stream.once('data', function(buffer) {
    var responseCode = buffer.toString('utf8');
    if(responseCode != 'S') {
      return self.emit('error', new Error('The server does not support SSL connections'));
    }
    var tls = __webpack_require__(66);
    self.stream = tls.connect({
      socket: self.stream,
      servername: host,
      rejectUnauthorized: self.ssl.rejectUnauthorized,
      ca: self.ssl.ca,
      pfx: self.ssl.pfx,
      key: self.ssl.key,
      passphrase: self.ssl.passphrase,
      cert: self.ssl.cert,
      NPNProtocols: self.ssl.NPNProtocols
    });
    self.attachListeners(self.stream);
    self.emit('sslconnect');

    self.stream.on('error', function(error){
      self.emit('error', error);
    });
  });
};

Connection.prototype.attachListeners = function(stream) {
  var self = this;
  stream.on('data', function(buff) {
    self._reader.addChunk(buff);
    var packet = self._reader.read();
    while(packet) {
      var msg = self.parseMessage(packet);
      if(self._emitMessage) {
        self.emit('message', msg);
      }
      self.emit(msg.name, msg);
      packet = self._reader.read();
    }
  });
};

Connection.prototype.requestSsl = function() {
  this.checkSslResponse = true;

  var bodyBuffer = this.writer
    .addInt16(0x04D2)
    .addInt16(0x162F).flush();

  var length = bodyBuffer.length + 4;

  var buffer = new Writer()
    .addInt32(length)
    .add(bodyBuffer)
    .join();
  this.stream.write(buffer);
};

Connection.prototype.startup = function(config) {
  var writer = this.writer
    .addInt16(3)
    .addInt16(0)
  ;

  Object.keys(config).forEach(function(key){
    var val = config[key];
    writer.addCString(key).addCString(val);
  });

  writer.addCString('client_encoding').addCString("'utf-8'");

  var bodyBuffer = writer.addCString('').flush();
  //this message is sent without a code

  var length = bodyBuffer.length + 4;

  var buffer = new Writer()
    .addInt32(length)
    .add(bodyBuffer)
    .join();
  this.stream.write(buffer);
};

Connection.prototype.cancel = function(processID, secretKey) {
  var bodyBuffer = this.writer
    .addInt16(1234)
    .addInt16(5678)
    .addInt32(processID)
    .addInt32(secretKey)
    .flush();

  var length = bodyBuffer.length + 4;

  var buffer = new Writer()
    .addInt32(length)
    .add(bodyBuffer)
    .join();
  this.stream.write(buffer);
};

Connection.prototype.password = function(password) {
  //0x70 = 'p'
  this._send(0x70, this.writer.addCString(password));
};

Connection.prototype._send = function(code, more) {
  if(!this.stream.writable) { return false; }
  if(more === true) {
    this.writer.addHeader(code);
  } else {
    return this.stream.write(this.writer.flush(code));
  }
};

Connection.prototype.query = function(text) {
  //0x51 = Q
  this.stream.write(this.writer.addCString(text).flush(0x51));
};

//send parse message
//"more" === true to buffer the message until flush() is called
Connection.prototype.parse = function(query, more) {
  //expect something like this:
  // { name: 'queryName',
  //   text: 'select * from blah',
  //   types: ['int8', 'bool'] }

  //normalize missing query names to allow for null
  query.name = query.name || '';
  if (query.name.length > 63) {
    console.error('Warning! Postgres only supports 63 characters for query names.');
    console.error('You supplied', query.name, '(', query.name.length, ')');
    console.error('This can cause conflicts and silent errors executing queries');
  }
  //normalize null type array
  query.types = query.types || [];
  var len = query.types.length;
  var buffer = this.writer
    .addCString(query.name) //name of query
    .addCString(query.text) //actual query text
    .addInt16(len);
  for(var i = 0; i < len; i++) {
    buffer.addInt32(query.types[i]);
  }

  var code = 0x50;
  this._send(code, more);
};

//send bind message
//"more" === true to buffer the message until flush() is called
Connection.prototype.bind = function(config, more) {
  //normalize config
  config = config || {};
  config.portal = config.portal || '';
  config.statement = config.statement || '';
  config.binary = config.binary || false;
  var values = config.values || [];
  var len = values.length;
  var useBinary = false;
  for (var j = 0; j < len; j++)
    useBinary |= values[j] instanceof Buffer;
  var buffer = this.writer
    .addCString(config.portal)
    .addCString(config.statement);
  if (!useBinary)
    buffer.addInt16(0);
  else {
    buffer.addInt16(len);
    for (j = 0; j < len; j++)
      buffer.addInt16(values[j] instanceof Buffer);
  }
  buffer.addInt16(len);
  for(var i = 0; i < len; i++) {
    var val = values[i];
    if(val === null || typeof val === "undefined") {
      buffer.addInt32(-1);
    } else if (val instanceof Buffer) {
      buffer.addInt32(val.length);
      buffer.add(val);
    } else {
      buffer.addInt32(Buffer.byteLength(val));
      buffer.addString(val);
    }
  }

  if(config.binary) {
    buffer.addInt16(1); // format codes to use binary
    buffer.addInt16(1);
  }
  else {
    buffer.addInt16(0); // format codes to use text
  }
  //0x42 = 'B'
  this._send(0x42, more);
};

//send execute message
//"more" === true to buffer the message until flush() is called
Connection.prototype.execute = function(config, more) {
  config = config || {};
  config.portal = config.portal || '';
  config.rows = config.rows || '';
  this.writer
    .addCString(config.portal)
    .addInt32(config.rows);

  //0x45 = 'E'
  this._send(0x45, more);
};

var emptyBuffer = Buffer(0);

Connection.prototype.flush = function() {
  //0x48 = 'H'
  this.writer.add(emptyBuffer);
  this._send(0x48);
};

Connection.prototype.sync = function() {
  //clear out any pending data in the writer
  this.writer.flush(0);

  this.writer.add(emptyBuffer);
  this._ending = true;
  this._send(0x53);
};

Connection.prototype.end = function() {
  //0x58 = 'X'
  this.writer.add(emptyBuffer);
  this._ending = true;
  this._send(0x58);
};

Connection.prototype.close = function(msg, more) {
  this.writer.addCString(msg.type + (msg.name || ''));
  this._send(0x43, more);
};

Connection.prototype.describe = function(msg, more) {
  this.writer.addCString(msg.type + (msg.name || ''));
  this._send(0x44, more);
};

Connection.prototype.sendCopyFromChunk = function (chunk) {
  this.stream.write(this.writer.add(chunk).flush(0x64));
};

Connection.prototype.endCopyFrom = function () {
  this.stream.write(this.writer.add(emptyBuffer).flush(0x63));
};

Connection.prototype.sendCopyFail = function (msg) {
  //this.stream.write(this.writer.add(emptyBuffer).flush(0x66));
  this.writer.addCString(msg);
  this._send(0x66);
};

var Message = function(name, length) {
  this.name = name;
  this.length = length;
};

Connection.prototype.parseMessage =  function(buffer) {

  this.offset = 0;
  var length = buffer.length + 4;
  switch(this._reader.header)
  {

  case 0x52: //R
    return this.parseR(buffer, length);

  case 0x53: //S
    return this.parseS(buffer, length);

  case 0x4b: //K
    return this.parseK(buffer, length);

  case 0x43: //C
    return this.parseC(buffer, length);

  case 0x5a: //Z
    return this.parseZ(buffer, length);

  case 0x54: //T
    return this.parseT(buffer, length);

  case 0x44: //D
    return this.parseD(buffer, length);

  case 0x45: //E
    return this.parseE(buffer, length);

  case 0x4e: //N
    return this.parseN(buffer, length);

  case 0x31: //1
    return new Message('parseComplete', length);

  case 0x32: //2
    return new Message('bindComplete', length);

  case 0x33: //3
    return new Message('closeComplete', length);

  case 0x41: //A
    return this.parseA(buffer, length);

  case 0x6e: //n
    return new Message('noData', length);

  case 0x49: //I
    return new Message('emptyQuery', length);

  case 0x73: //s
    return new Message('portalSuspended', length);

  case 0x47: //G
    return this.parseG(buffer, length);

  case 0x48: //H
    return this.parseH(buffer, length);

  case 0x63: //c
    return new Message('copyDone', length);

  case 0x64: //d
    return this.parsed(buffer, length);
  }
};

Connection.prototype.parseR = function(buffer, length) {
  var code = 0;
  var msg = new Message('authenticationOk', length);
  if(msg.length === 8) {
    code = this.parseInt32(buffer);
    if(code === 3) {
      msg.name = 'authenticationCleartextPassword';
    }
    return msg;
  }
  if(msg.length === 12) {
    code = this.parseInt32(buffer);
    if(code === 5) { //md5 required
      msg.name = 'authenticationMD5Password';
      msg.salt = new Buffer(4);
      buffer.copy(msg.salt, 0, this.offset, this.offset + 4);
      this.offset += 4;
      return msg;
    }
  }
  throw new Error("Unknown authenticationOk message type" + util.inspect(msg));
};

Connection.prototype.parseS = function(buffer, length) {
  var msg = new Message('parameterStatus', length);
  msg.parameterName = this.parseCString(buffer);
  msg.parameterValue = this.parseCString(buffer);
  return msg;
};

Connection.prototype.parseK = function(buffer, length) {
  var msg = new Message('backendKeyData', length);
  msg.processID = this.parseInt32(buffer);
  msg.secretKey = this.parseInt32(buffer);
  return msg;
};

Connection.prototype.parseC = function(buffer, length) {
  var msg = new Message('commandComplete', length);
  msg.text = this.parseCString(buffer);
  return msg;
};

Connection.prototype.parseZ = function(buffer, length) {
  var msg = new Message('readyForQuery', length);
  msg.name = 'readyForQuery';
  msg.status = this.readString(buffer, 1);
  return msg;
};

var ROW_DESCRIPTION = 'rowDescription';
Connection.prototype.parseT = function(buffer, length) {
  var msg = new Message(ROW_DESCRIPTION, length);
  msg.fieldCount = this.parseInt16(buffer);
  var fields = [];
  for(var i = 0; i < msg.fieldCount; i++){
    fields.push(this.parseField(buffer));
  }
  msg.fields = fields;
  return msg;
};

var Field = function() {
  this.name = null;
  this.tableID = null;
  this.columnID = null;
  this.dataTypeID = null;
  this.dataTypeSize = null;
  this.dataTypeModifier = null;
  this.format = null;
};

var FORMAT_TEXT = 'text';
var FORMAT_BINARY = 'binary';
Connection.prototype.parseField = function(buffer) {
  var field = new Field();
  field.name = this.parseCString(buffer);
  field.tableID = this.parseInt32(buffer);
  field.columnID = this.parseInt16(buffer);
  field.dataTypeID = this.parseInt32(buffer);
  field.dataTypeSize = this.parseInt16(buffer);
  field.dataTypeModifier = this.parseInt32(buffer);
  if(this.parseInt16(buffer) === TEXT_MODE) {
    this._mode = TEXT_MODE;
    field.format = FORMAT_TEXT;
  } else {
    this._mode = BINARY_MODE;
    field.format = FORMAT_BINARY;
  }
  return field;
};

var DATA_ROW = 'dataRow';
var DataRowMessage = function(length, fieldCount) {
  this.name = DATA_ROW;
  this.length = length;
  this.fieldCount = fieldCount;
  this.fields = [];
};


//extremely hot-path code
Connection.prototype.parseD = function(buffer, length) {
  var fieldCount = this.parseInt16(buffer);
  var msg = new DataRowMessage(length, fieldCount);
  for(var i = 0; i < fieldCount; i++) {
    msg.fields.push(this._readValue(buffer));
  }
  return msg;
};

//extremely hot-path code
Connection.prototype._readValue = function(buffer) {
  var length = this.parseInt32(buffer);
  if(length === -1) return null;
  if(this._mode === TEXT_MODE) {
    return this.readString(buffer, length);
  }
  return this.readBytes(buffer, length);
};

//parses error
Connection.prototype.parseE = function(buffer, length) {
  var fields = {};
  var msg, item;
  var input = new Message('error', length);
  var fieldType = this.readString(buffer, 1);
  while(fieldType != '\0') {
    fields[fieldType] = this.parseCString(buffer);
    fieldType = this.readString(buffer, 1);
  }
  if(input.name === 'error') {
    // the msg is an Error instance
    msg = new Error(fields.M);
    for (item in input) {
      // copy input properties to the error
      if(input.hasOwnProperty(item)) {
        msg[item] = input[item];
      }
    }
  } else {
    // the msg is an object literal
    msg = input;
    msg.message = fields.M;
  }
  msg.severity = fields.S;
  msg.code = fields.C;
  msg.detail = fields.D;
  msg.hint = fields.H;
  msg.position = fields.P;
  msg.internalPosition = fields.p;
  msg.internalQuery = fields.q;
  msg.where = fields.W;
  msg.schema = fields.s;
  msg.table = fields.t;
  msg.column = fields.c;
  msg.dataType = fields.d;
  msg.constraint = fields.n;
  msg.file = fields.F;
  msg.line = fields.L;
  msg.routine = fields.R;
  return msg;
};

//same thing, different name
Connection.prototype.parseN = function(buffer, length) {
  var msg = this.parseE(buffer, length);
  msg.name = 'notice';
  return msg;
};

Connection.prototype.parseA = function(buffer, length) {
  var msg = new Message('notification', length);
  msg.processId = this.parseInt32(buffer);
  msg.channel = this.parseCString(buffer);
  msg.payload = this.parseCString(buffer);
  return msg;
};

Connection.prototype.parseG = function (buffer, length) {
  var msg = new Message('copyInResponse', length);
  return this.parseGH(buffer, msg);
};

Connection.prototype.parseH = function(buffer, length) {
  var msg = new Message('copyOutResponse', length);
  return this.parseGH(buffer, msg);
};

Connection.prototype.parseGH = function (buffer, msg) {
  var isBinary = buffer[this.offset] !== 0;
  this.offset++;
  msg.binary = isBinary;
  var columnCount = this.parseInt16(buffer);
  msg.columnTypes = [];
  for(var i = 0; i<columnCount; i++) {
    msg.columnTypes.push(this.parseInt16(buffer));
  }
  return msg;
};

Connection.prototype.parsed = function (buffer, length) {
  var msg = new Message('copyData', length);
  msg.chunk = this.readBytes(buffer, msg.length - 4);
  return msg;
};

Connection.prototype.parseInt32 = function(buffer) {
  var value = buffer.readInt32BE(this.offset, true);
  this.offset += 4;
  return value;
};

Connection.prototype.parseInt16 = function(buffer) {
  var value = buffer.readInt16BE(this.offset, true);
  this.offset += 2;
  return value;
};

Connection.prototype.readString = function(buffer, length) {
  return buffer.toString(this.encoding, this.offset, (this.offset += length));
};

Connection.prototype.readBytes = function(buffer, length) {
  return buffer.slice(this.offset, this.offset += length);
};

Connection.prototype.parseCString = function(buffer) {
  var start = this.offset;
  while(buffer[this.offset++] !== 0) { }
  return buffer.toString(this.encoding, start, this.offset - 1);
};
//end parsing methods
module.exports = Connection;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var Native = __webpack_require__(35);
var TypeOverrides = __webpack_require__(98);
var semver = __webpack_require__(56);
var pkg = __webpack_require__(133);
var assert = __webpack_require__(5);
var EventEmitter = __webpack_require__(1).EventEmitter;
var util = __webpack_require__(0);
var ConnectionParameters = __webpack_require__(95);

var msg = 'Version >= ' + pkg.minNativeVersion + ' of pg-native required.';
assert(semver.gte(Native.version, pkg.minNativeVersion), msg);

var NativeQuery = __webpack_require__(128);

var Client = module.exports = function(config) {
  EventEmitter.call(this);
  config = config || {};

  this._types = new TypeOverrides(config.types);

  this.native = new Native({
    types: this._types
  });

  this._queryQueue = [];
  this._connected = false;

  //keep these on the object for legacy reasons
  //for the time being. TODO: deprecate all this jazz
  var cp = this.connectionParameters = new ConnectionParameters(config);
  this.user = cp.user;
  this.password = cp.password;
  this.database = cp.database;
  this.host = cp.host;
  this.port = cp.port;

  //a hash to hold named queries
  this.namedQueries = {};
};

util.inherits(Client, EventEmitter);

//connect to the backend
//pass an optional callback to be called once connected
//or with an error if there was a connection error
//if no callback is passed and there is a connection error
//the client will emit an error event.
Client.prototype.connect = function(cb) {
  var self = this;

  var onError = function(err) {
    if(cb) return cb(err);
    return self.emit('error', err);
  };

  this.connectionParameters.getLibpqConnectionString(function(err, conString) {
    if(err) return onError(err);
    self.native.connect(conString, function(err) {
      if(err) return onError(err);

      //set internal states to connected
      self._connected = true;

      //handle connection errors from the native layer
      self.native.on('error', function(err) {
        //error will be handled by active query
        if(self._activeQuery && self._activeQuery.state != 'end') {
          return;
        }
        self.emit('error', err);
      });

      self.native.on('notification', function(msg) {
        self.emit('notification', {
          channel: msg.relname,
          payload: msg.extra
        });
      });

      //signal we are connected now
      self.emit('connect');
      self._pulseQueryQueue(true);

      //possibly call the optional callback
      if(cb) cb();
    });
  });
};

//send a query to the server
//this method is highly overloaded to take
//1) string query, optional array of parameters, optional function callback
//2) object query with {
//    string query
//    optional array values,
//    optional function callback instead of as a separate parameter
//    optional string name to name & cache the query plan
//    optional string rowMode = 'array' for an array of results
//  }
Client.prototype.query = function(config, values, callback) {
  var query = new NativeQuery(this.native);

  //support query('text', ...) style calls
  if(typeof config == 'string') {
    query.text = config;
  }

  //support passing everything in via a config object
  if(typeof config == 'object') {
    query.text = config.text;
    query.values = config.values;
    query.name = config.name;
    query.callback = config.callback;
    query._arrayMode = config.rowMode == 'array';
  }

  //support query({...}, function() {}) style calls
  //& support query(..., ['values'], ...) style calls
  if(typeof values == 'function') {
    query.callback = values;
  }
  else if(util.isArray(values)) {
    query.values = values;
  }
  if(typeof callback == 'function') {
    query.callback = callback;
  }

  this._queryQueue.push(query);
  this._pulseQueryQueue();
  return query;
};

//disconnect from the backend server
Client.prototype.end = function(cb) {
  var self = this;
  if(!this._connected) {
    this.once('connect', this.end.bind(this, cb));
  }
  this.native.end(function() {
    //send an error to the active query
    if(self._hasActiveQuery()) {
      var msg = 'Connection terminated';
      self._queryQueue.length = 0;
      self._activeQuery.handleError(new Error(msg));
    }
    self.emit('end');
    if(cb) cb();
  });
};

Client.prototype._hasActiveQuery = function() {
  return this._activeQuery && this._activeQuery.state != 'error' && this._activeQuery.state != 'end';
};

Client.prototype._pulseQueryQueue = function(initialConnection) {
  if(!this._connected) {
    return;
  }
  if(this._hasActiveQuery()) {
    return;
  }
  var query = this._queryQueue.shift();
  if(!query) {
    if(!initialConnection) {
      this.emit('drain');
    }
    return;
  }
  this._activeQuery = query;
  query.submit(this);
  var self = this;
  query.once('_done', function() {
    self._pulseQueryQueue();
  });
};

//attempt to cancel an in-progress query
Client.prototype.cancel = function(query) {
  if(this._activeQuery == query) {
    this.native.cancel(function() {});
  } else if (this._queryQueue.indexOf(query) != -1) {
    this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
  }
};

Client.prototype.setTypeParser = function(oid, format, parseFn) {
  return this._types.setTypeParser(oid, format, parseFn);
};

Client.prototype.getTypeParser = function(oid, format) {
  return this._types.getTypeParser(oid, format);
};


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var types = __webpack_require__(3);

function TypeOverrides(userTypes) {
  this._types = userTypes || types;
  this.text = {};
  this.binary = {};
}

TypeOverrides.prototype.getOverrides = function(format) {
  switch(format) {
    case 'text': return this.text;
    case 'binary': return this.binary;
    default: return {};
  }
};

TypeOverrides.prototype.setTypeParser = function(oid, format, parseFn) {
  if(typeof format == 'function') {
    parseFn = format;
    format = 'text';
  }
  this.getOverrides(format)[oid] = parseFn;
};

TypeOverrides.prototype.getTypeParser = function(oid, format) {
  format = format || 'text';
  return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
};

module.exports = TypeOverrides;


/***/ }),
/* 99 */
/***/ (function(module, exports) {

module.exports = {
	"_args": [
		[
			{
				"raw": "pg-promise",
				"scope": null,
				"escapedName": "pg-promise",
				"name": "pg-promise",
				"rawSpec": "",
				"spec": "latest",
				"type": "tag"
			},
			"/home/neil/DevGit/zf2dbmodelgen/modgen"
		]
	],
	"_from": "pg-promise@latest",
	"_id": "pg-promise@5.6.0",
	"_inCache": true,
	"_location": "/pg-promise",
	"_nodeVersion": "4.7.1",
	"_npmOperationalInternal": {
		"host": "packages-18-east.internal.npmjs.com",
		"tmp": "tmp/pg-promise-5.6.0.tgz_1488031568113_0.2753716658335179"
	},
	"_npmUser": {
		"name": "vitaly.tomilov",
		"email": "vitaly.tomilov@gmail.com"
	},
	"_npmVersion": "2.15.11",
	"_phantomChildren": {
		"buffer-writer": "1.0.1",
		"generic-pool": "2.4.2",
		"packet-reader": "0.2.0",
		"pg-connection-string": "0.1.3",
		"pg-types": "1.11.0",
		"semver": "4.3.2",
		"split": "1.0.0"
	},
	"_requested": {
		"raw": "pg-promise",
		"scope": null,
		"escapedName": "pg-promise",
		"name": "pg-promise",
		"rawSpec": "",
		"spec": "latest",
		"type": "tag"
	},
	"_requiredBy": [
		"#USER",
		"/"
	],
	"_resolved": "https://registry.npmjs.org/pg-promise/-/pg-promise-5.6.0.tgz",
	"_shasum": "ff5a482cb6764a508ad0a8b7c81dae1adfee4d1d",
	"_shrinkwrap": null,
	"_spec": "pg-promise",
	"_where": "/home/neil/DevGit/zf2dbmodelgen/modgen",
	"author": {
		"name": "Vitaly Tomilov",
		"email": "vitaly.tomilov@gmail.com"
	},
	"bugs": {
		"url": "https://github.com/vitaly-t/pg-promise/issues",
		"email": "vitaly.tomilov@gmail.com"
	},
	"dependencies": {
		"manakin": "0.4",
		"pg": "5.1",
		"pg-minify": "0.4",
		"spex": "1.2"
	},
	"description": "Promises interface for PostgreSQL",
	"devDependencies": {
		"@types/node": "6.x",
		"JSONStream": "1.x",
		"bluebird": "3.x",
		"coveralls": "2.x",
		"istanbul": "0.4",
		"jasmine-node": "1.x",
		"jsdoc": "3.x",
		"pg-query-stream": "1.x",
		"typescript": "2.x"
	},
	"directories": {},
	"dist": {
		"shasum": "ff5a482cb6764a508ad0a8b7c81dae1adfee4d1d",
		"tarball": "https://registry.npmjs.org/pg-promise/-/pg-promise-5.6.0.tgz"
	},
	"engines": {
		"node": ">=4.0",
		"npm": ">=2.15"
	},
	"files": [
		"lib",
		"typescript"
	],
	"gitHead": "e1e81fa19a7fba36f56d0cdf2bb101487842017e",
	"homepage": "https://github.com/vitaly-t/pg-promise",
	"keywords": [
		"pg",
		"promise",
		"postgres"
	],
	"license": "MIT",
	"main": "lib/index.js",
	"maintainers": [
		{
			"name": "vitaly.tomilov",
			"email": "vitaly.tomilov@gmail.com"
		}
	],
	"name": "pg-promise",
	"optionalDependencies": {},
	"readme": "ERROR: No README data found!",
	"repository": {
		"type": "git",
		"url": "git+https://github.com/vitaly-t/pg-promise.git"
	},
	"scripts": {
		"coverage": "istanbul cover ./node_modules/jasmine-node/bin/jasmine-node test",
		"doc": "jsdoc -c ./jsdoc/jsDoc.json ./jsdoc/README.md",
		"test": "jasmine-node test",
		"test-native": "jasmine-node test --config PG_NATIVE true",
		"travis": "istanbul cover ./node_modules/jasmine-node/bin/jasmine-node test --captureExceptions && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage"
	},
	"typings": "typescript/pg-promise.d.ts",
	"version": "5.6.0"
};

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    u: __webpack_require__(0),
    os: __webpack_require__(71),
    utils: __webpack_require__(82)
};

/**
 * @interface errors.BatchError
 * @augments external:Error
 * @description
 * This type represents all errors rejected by method {@link batch}, except for {@link external:TypeError TypeError}
 * when the method receives invalid input parameters.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `BatchError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * It represents the message of the first error encountered in the batch, and is a safe
 * version of using `first.message`.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {array} data
 * Array of objects `{success, result, [origin]}`:
 * - `success` = true/false, indicates whether the corresponding value in the input array was resolved.
 * - `result` = resolved data, if `success`=`true`, or else the rejection reason.
 * - `origin` - set only when failed as a result of an unsuccessful call into the notification callback
 *    (parameter `cb` of method {@link batch})
 *
 * The array has the same size as the input one that was passed into method {@link batch}, providing direct mapping.
 *
 * @property {} stat
 * Resolution Statistics.
 *
 * @property {number} stat.total
 * Total number of elements in the batch.
 *
 * @property {number} stat.succeeded
 * Number of resolved values in the batch.
 *
 * @property {number} stat.failed
 * Number of rejected values in the batch.
 *
 * @property {number} stat.duration
 * Time in milliseconds it took to settle all values.
 *
 * @property {} first
 * The very first error within the batch, with support for nested batch results, it is also the same error
 * as $[promise.all] would provide.
 *
 * @see {@link batch}
 *
 */
function BatchError(result, errors, duration) {

    this.data = result;

    /**
     * @method errors.BatchError.getErrors
     * @description
     * Returns the complete list of errors only.
     *
     * It supports nested batch results, presented as a sub-array.
     *
     * @returns {array}
     */
    this.getErrors = function () {
        var err = new Array(errors.length);
        for (var i = 0; i < errors.length; i++) {
            err[i] = result[errors[i]].result;
            if (err[i] instanceof BatchError) {
                err[i] = err[i].getErrors();
            }
        }
        $npm.utils.extend(err, '$isErrorList', true);
        return err;
    };

    var e = this.getErrors(),
        first = e[0];

    while (first && first.$isErrorList) {
        first = first[0];
    }

    // we do not show it within the inspect, because when the error
    // happens for a nested result, the output becomes a mess.
    this.first = first;

    if (first instanceof Error) {
        this.message = first.message;
    } else {
        if (typeof first !== 'string') {
            first = $npm.u.inspect(first);
        }
        this.message = first;
    }

    this.stat = {
        total: result.length,
        succeeded: result.length - e.length,
        failed: e.length,
        duration: duration
    };

    Error.captureStackTrace(this, BatchError);

}

$npm.u.inherits(BatchError, Error);
BatchError.prototype.name = 'BatchError';

/**
 * @method errors.BatchError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * The output is an abbreviated version of the error, because the complete error
 * is often too much for displaying or even logging, as a batch can be of any size.
 * Therefore, only errors are rendered from the `data` property, alongside their indexes,
 * and only up to the first 5, to avoid polluting the screen or the log file.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
BatchError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        gap2 = $npm.utils.messageGap(level + 2),
        lines = [
            'BatchError {',
            gap1 + 'stat: { total: ' + this.stat.total + ', succeeded: ' + this.stat.succeeded +
            ', failed: ' + this.stat.failed + ', duration: ' + this.stat.duration + ' }',
            gap1 + 'errors: ['
        ];

    // In order to avoid polluting the error log or the console, 
    // we limit the log output to the top 5 errors:
    var counter = 0, maxErrors = 5;
    this.data.forEach(function (d, index) {
        if (!d.success && counter < maxErrors) {
            lines.push(gap2 + index + ': ' + $npm.utils.formatError(d.result, level + 2));
            counter++;
        }
    });
    lines.push(gap1 + ']');
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

BatchError.prototype.inspect = function () {
    return this.toString();
};

module.exports = BatchError;


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    u: __webpack_require__(0),
    os: __webpack_require__(71),
    utils: __webpack_require__(82)
};

var errorReasons = {
    0: "Page with index %d rejected.",
    1: "Source %s returned a rejection at index %d.",
    2: "Source %s threw an error at index %d.",
    3: "Destination %s returned a rejection at index %d.",
    4: "Destination %s threw an error at index %d.",
    5: "Source %s returned a non-array value at index %d."
};

/**
 * @interface errors.PageError
 * @augments external:Error
 * @description
 * This type represents all errors rejected by method {@link page}, except for {@link external:TypeError TypeError}
 * when the method receives invalid input parameters.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `PageError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {} error
 * The error that was thrown, or the rejection reason.
 *
 * @property {number} index
 * Index of the element in the sequence for which the error/rejection occurred.
 *
 * @property {number} duration
 * Duration (in milliseconds) of processing until the error/rejection occurred.
 *
 * @property {string} reason
 * Textual explanation of why the method failed.
 *
 * @property {} source
 * Resolved `data` parameter that was passed into the `source` function.
 *
 * It is only set when the error/rejection occurred inside the `source` function.
 *
 * @property {} dest
 * Resolved `data` parameter that was passed into the `dest` function.
 *
 * It is only set when the error/rejection occurred inside the `dest` function.
 *
 * @see
 * {@link page},
 * {@link batch}
 *
 */
function PageError(e, code, cbName, duration) {

    this.index = e.index;
    this.duration = duration;
    this.error = e.error;

    if ('source' in e) {
        this.source = e.source;
    }

    if ('dest' in e) {
        this.dest = e.dest;
    }

    if (this.error instanceof Error) {
        this.message = this.error.message;
    } else {
        this.message = this.error;
        if (typeof this.message !== 'string') {
            this.message = $npm.u.inspect(this.message);
        }
    }

    if (code) {
        cbName = cbName ? ("'" + cbName + "'") : '<anonymous>';
        this.reason = $npm.u.format(errorReasons[code], cbName, e.index);
    } else {
        this.reason = $npm.u.format(errorReasons[code], e.index);
    }

    Error.captureStackTrace(this, PageError);

}

$npm.u.inherits(PageError, Error);
PageError.prototype.name = 'PageError';

/**
 * @method errors.PageError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
PageError.prototype.toString = function (level) {

    level = level > 0 ? parseInt(level) : 0;

    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        lines = [
            'PageError {',
            gap1 + 'message: ' + JSON.stringify(this.message),
            gap1 + 'reason: ' + this.reason,
            gap1 + 'index: ' + this.index,
            gap1 + 'duration: ' + this.duration
        ];

    lines.push(gap1 + 'error: ' + $npm.utils.formatError(this.error, level + 1));
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

PageError.prototype.inspect = function () {
    return this.toString();
};

module.exports = PageError;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    u: __webpack_require__(0),
    os: __webpack_require__(71),
    utils: __webpack_require__(82)
};

var errorReasons = {
    0: "Source %s returned a rejection at index %d.",
    1: "Source %s threw an error at index %d.",
    2: "Destination %s returned a rejection at index %d.",
    3: "Destination %s threw an error at index %d."
};

/**
 * @interface errors.SequenceError
 * @augments external:Error
 * @description
 * This type represents all errors rejected by method {@link sequence}, except for {@link external:TypeError TypeError}
 * when the method receives invalid input parameters.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `SequenceError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {} error
 * The error that was thrown or the rejection reason.
 *
 * @property {number} index
 * Index of the element in the sequence for which the error/rejection occurred.
 *
 * @property {number} duration
 * Duration (in milliseconds) of processing until the error/rejection occurred.
 *
 * @property {string} reason
 * Textual explanation of why the method failed.
 *
 * @property {} source
 * Resolved `data` parameter that was passed into the `source` function.
 *
 * It is only set when the error/rejection occurred inside the `source` function.
 *
 * @property {} dest
 * Resolved `data` parameter that was passed into the `dest` function.
 *
 * It is only set when the error/rejection occurred inside the `dest` function.
 *
 * @see {@link sequence}
 *
 */
function SequenceError(e, code, cbName, duration) {

    this.index = e.index;
    this.duration = duration;
    this.error = e.error;

    if (this.error instanceof Error) {
        this.message = this.error.message;
    } else {
        this.message = this.error;
        if (typeof this.message !== 'string') {
            this.message = $npm.u.inspect(this.message);
        }
    }

    if ('source' in e) {
        this.source = e.source;
    } else {
        this.dest = e.dest;
    }

    cbName = cbName ? ("'" + cbName + "'") : '<anonymous>';
    this.reason = $npm.u.format(errorReasons[code], cbName, e.index);

    Error.captureStackTrace(this, SequenceError);
}

$npm.u.inherits(SequenceError, Error);
SequenceError.prototype.name = 'SequenceError';

/**
 * @method errors.SequenceError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
SequenceError.prototype.toString = function (level) {

    level = level > 0 ? parseInt(level) : 0;

    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        lines = [
            'SequenceError {',
            gap1 + 'message: ' + JSON.stringify(this.message),
            gap1 + 'reason: ' + this.reason,
            gap1 + 'index: ' + this.index,
            gap1 + 'duration: ' + this.duration
        ];

    lines.push(gap1 + 'error: ' + $npm.utils.formatError(this.error, level + 1));
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

SequenceError.prototype.inspect = function () {
    return this.toString();
};

module.exports = SequenceError;


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

class connPgSQL {
    // private _client: pg-prom
    constructor(_cs) {
        this._cs = _cs;
        this._pgp = __webpack_require__(89);
        try {
            this.configure();
        }
        catch (err) {
            console.log("Error in constructor of PgSQL : " + err);
        }
    }
    configure() {
        this._pConn = this._convertParams(); // ._cs.getDBParams();
        console.log(this._convertParams());
        console.log("PGP : " + this._pgp(this._convertParams()).connect());
        // this._client = new this._pg.Client(this.getConnectString());
        // console.log(this._client);
    }
    // Read http://stackoverflow.com/questions/34382796/where-should-i-initialize-pg-promise/34427278#34427278
    getConnectString() {
        try {
            return `postgres://${this._pConn.user}:${this._pConn.password}@${this._pConn.server}/${this._pConn.dbname}`;
        }
        catch (err) {
            console.log("Error in db.ts getConnectString :: " + err);
        }
    }
    getRows() {
        return [""];
    }
    _convertParams() {
        let _conn = {
            user: "",
            database: "",
            port: "",
            host: "",
            password: ""
        };
        try {
            _conn.user = this._cs.getDBParams().username;
            _conn.database = this._cs.getDBParams().dbname;
            _conn.port = this._cs.getDBParams().port;
            _conn.host = this._cs.getDBParams().server;
            _conn.password = this._cs.getDBParams().password;
        }
        catch (err) {
            console.log("Error in _convertParams :: " + err);
        }
        return _conn;
    }
}
exports.connPgSQL = connPgSQL;


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var util = __webpack_require__(0);

var $def = {

    // process.stdout:
    log: console.log,
    info: console.info,

    // process.stderr:
    error: console.error,
    warn: console.warn
};

function colorize(value, color, isMsg) {
    value = isMsg && typeof value === 'string' ? value : util.inspect(value);
    return "\x1b[" + color + 'm' + value + "\x1b[0m";
}

function format(stream, values, color) {
    if (stream.isTTY) {
        if (values.length && typeof values[0] === 'string') {
            return [colorize(util.format.apply(null, values), color, true)];
        }
        return Object.keys(values).map(function (key) {
            return colorize(values[key], color);
        });
    }
    return values;
}

/**
 * @class Writer
 * @param noLock
 */
function Writer(noLock) {

    var self = this;

    /**
     * @method Writer.log
     * @description
     * Formats and sends console.log into stdout.
     */
    this.log = function () {
        $def.log.apply(null, format(process.stdout, arguments, getColor(self.log, 39, 97)));
    };

    /**
     * @method Writer.error
     * @description
     * Formats and sends console.error into stderr.
     */
    this.error = function () {
        $def.error.apply(null, format(process.stderr, arguments, getColor(self.error, 31, 91)));
    };

    /**
     * @method Writer.warn
     * @description
     * Formats and sends console.log into stderr.
     */
    this.warn = function () {
        $def.warn.apply(null, format(process.stderr, arguments, getColor(self.warn, 33, 93)));
    };

    /**
     * @method Writer.info
     * @description
     * Formats and sends console.log into stdout.
     */
    this.info = function () {
        $def.info.apply(null, format(process.stdout, arguments, getColor(self.info, 36, 96)));
    };

    /**
     * @method Writer.log
     * @description
     * Formats and sends console.log into stdout.
     */
    this.success = function () {
        $def.log.apply(null, format(process.stdout, arguments, getColor(self.success, 32, 92)));
    };

    /**
     * @method Writer.write
     * @description
     * Formats and sends custom-color values either into stdout or stderr.
     *
     * @param {} values - output parameters
     *
     * @param {number} color - output color: 0 <= color <= 256
     *
     * @param {boolean}[isError=false] - sends console.error into stderr;
     * By default, the method sends console.log into stdout.
     *
     */
    this.write = function (values, color, isError) {
        var method = $def.log, stream = process.stdout;
        if (isError) {
            method = $def.error;
            stream = process.stderr;
        }
        if (color !== +color || color < 0 || color > 256) {
            method.apply(null, values);
        } else {
            method.apply(null, format(stream, values, color));
        }
    };

    addProperties('log');
    addProperties('error');
    addProperties('warn');
    addProperties('info');
    addProperties('success');

    /**
     * @method Writer.setBright
     * @description
     * Set brightness for all methods at once.
     *
     * @param {boolean} [bright=true]
     * Indicates whether the color is to be set to be bright.
     *
     */
    this.setBright = function (bright) {
        // set to bright colors, if the flag is truthy or undefined;
        // set to dim colors, if flag is falsy
        bright = bright === undefined ? true : !!bright;

        self.log.bright = bright;
        self.error.bright = bright;
        self.warn.bright = bright;
        self.success.bright = bright;
        self.info.bright = bright;
    };

    if (!noLock) {
        Object.freeze(this);
    }

    function addProperties(name, color) {

        // brightness for the predefined color:
        Object.defineProperty(self[name], 'bright', {
            value: false,
            writable: true
        });

        // override for the predefined color:
        Object.defineProperty(self[name], 'color', {
            writable: true
        });

        Object.seal(self[name]);
    }

}

function getColor(prop, normal, bright) {
    var c = prop.color;
    return (c === +c && c >= 0 && c <= 256) ? c : (prop.bright ? bright : normal);
}

module.exports = Writer;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var os = __webpack_require__(71);
var errorLib = __webpack_require__(86);

var PEC = errorLib.parsingErrorCode;

// symbols that need no spaces around them:
var compressors = '.,;:()[]=<>+-*/|!?@#';

///////////////////////////////////////////
// Parses and minifies a PostgreSQL script.
function minify(sql, options) {

    if (typeof sql !== 'string') {
        throw new TypeError("Input SQL must be a text string.");
    }

    if (options !== undefined && typeof options !== 'object') {
        throw new TypeError("Parameter 'options' must be an object.");
    }

    if (!sql.length) {
        return '';
    }

    var idx = 0, // current index
        result = '', // resulting sql
        len = sql.length, // sql length
        EOL = getEOL(sql), // end-of-line
        space = false, // add a space on the next step
        compress = options && options.compress; // option 'compress'

    do {
        var s = sql[idx], // current symbol;
            s1 = idx < len - 1 ? sql[idx + 1] : ''; // next symbol;

        if (isGap(s)) {
            while (++idx < len && isGap(sql[idx]));
            if (idx < len) {
                space = true;
            }
            idx--;
            continue;
        }

        if (s === '-' && s1 === '-') {
            var lb = sql.indexOf(EOL, idx + 2);
            if (lb < 0) {
                break;
            }
            idx = lb - 1;
            skipGaps();
            continue;
        }

        if (s === '/' && s1 === '*') {
            var end = sql.indexOf('*/', idx + 2);
            if (end < 0) {
                throwError(PEC.unclosedMLC);
            }
            idx = end + 1;
            skipGaps();
            continue;
        }

        if (s === '"') {
            var closeIdx = sql.indexOf('"', idx + 1);
            if (closeIdx < 0) {
                throwError(PEC.unclosedQI);
            }
            var text = sql.substr(idx, closeIdx - idx + 1);
            if (text.indexOf(EOL) > 0) {
                throwError(PEC.multiLineQI);
            }
            if (compress) {
                space = false;
            }
            addSpace();
            result += text;
            idx = closeIdx;
            skipGaps();
            continue;
        }

        if (s === '\'') {
            var closeIdx = idx;
            do {
                closeIdx = sql.indexOf('\'', closeIdx + 1);
                if (closeIdx > 0) {
                    var step = closeIdx;
                    while (++step < len && sql[step] === '\'');
                    if ((step - closeIdx) % 2) {
                        closeIdx = step - 1;
                        break;
                    }
                    closeIdx = step === len ? -1 : step;
                }
            } while (closeIdx > 0);
            if (closeIdx < 0) {
                throwError(PEC.unclosedText);
            }
            if (compress) {
                space = false;
            }
            addSpace();
            var text = sql.substr(idx, closeIdx - idx + 1);
            var hasLB = text.indexOf(EOL) > 0;
            if (hasLB) {
                text = text.split(EOL).map(function (m) {
                    return m.replace(/^\s+|\s+$/g, '');
                }).join('\\n');
            }
            var hasTabs = text.indexOf('\t') > 0;
            if (hasLB || hasTabs) {
                var prev = idx ? sql[idx - 1] : '';
                if (prev !== 'E' && prev !== 'e') {
                    var r = result ? result[result.length - 1] : '';
                    if (r && r !== ' ' && compressors.indexOf(r) < 0) {
                        result += ' ';
                    }
                    result += 'E';
                }
                if (hasTabs) {
                    text = text.replace(/\t/g, '\\t');
                }
            }
            result += text;
            idx = closeIdx;
            skipGaps();
            continue;
        }

        if (compress && compressors.indexOf(s) >= 0) {
            space = false;
            skipGaps();
        }

        addSpace();
        result += s;

    } while (++idx < len);

    return result;

    function skipGaps() {
        if (compress) {
            while (idx < len - 1 && isGap(sql[idx + 1])) {
                idx++;
            }
        }
    }

    function addSpace() {
        if (space) {
            if (result.length) {
                result += ' ';
            }
            space = false;
        }
    }

    function throwError(code) {
        var position = getIndexPos(sql, idx, EOL);
        throw new errorLib.SQLParsingError(code, position);
    }
}

//////////////////////////////////////
// Returns the End-Of-Line from text.
function getEOL(text) {
    var idx = 0, unix = 0, windows = 0;
    while (idx < text.length) {
        idx = text.indexOf('\n', idx);
        if (idx == -1) {
            break;
        }
        if (idx > 0 && text[idx - 1] === '\r') {
            windows++;
        } else {
            unix++;
        }
        idx++;
    }
    if (unix === windows) {
        return os.EOL;
    }
    return unix > windows ? '\n' : '\r\n';
}

///////////////////////////////////////////////////////
// Returns {line, column} of an index within the text.
function getIndexPos(text, index, eol) {
    var lineIdx = 0, colIdx = index, pos = 0;
    do {
        pos = text.indexOf(eol, pos);
        if (pos == -1 || index < pos + eol.length) {
            break;
        }
        lineIdx++;
        pos += eol.length;
        colIdx = index - pos;
    } while (pos < index);
    return {
        line: lineIdx + 1,
        column: colIdx + 1
    };
}

////////////////////////////////////
// Identifies a gap / empty symbol.
function isGap(s) {
    return s === ' ' || s === '\t' || s === '\r' || s === '\n';
}

module.exports = {
    minify: minify,

    // these are exported only for testing:
    getEOL: getEOL,
    getIndexPos: getIndexPos
};


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * ES6 generators
 * @module async
 * @author Vitaly Tomilov
 * @private
 */
module.exports = function (config) {

    /////////////////////////////////
    // Generator-to-Promise adapter;
    //
    // Based on: https://www.promisejs.org/generators/#both
    return function (generator) {
        var $p = config.promise;
        return function () {
            var g = generator.apply(this, arguments);

            function handle(result) {
                if (result.done) {
                    return $p.resolve(result.value);
                }
                return $p.resolve(result.value)
                    .then(function (res) {
                        return handle(g.next(res));
                    }, function (err) {
                        return handle(g.throw(err));
                    });
            }

            return handle(g.next());
        }
    };

};


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @constructor ConnectionContext
 * @private
 * @summary Connection context object.
 * @param {object} cn
 * @param {} dc
 * @param {object} options
 * @param {object} db
 * @param {number} txLevel
 */
function ConnectionContext(cn, dc, options, db, txLevel) {

    this.cn = cn; // connection details;
    this.dc = dc; // database context;
    this.options = options; // library options;
    this.db = db; // database session;
    this.txLevel = txLevel; // transaction level;

    this.connect = function (db) {
        this.db = db;
    };

    this.disconnect = function () {
        if (this.db) {
            this.db.done();
            this.db = null;
        }
    };

    this.clone = function () {
        return new ConnectionContext(this.cn, this.dc, this.options, this.db, this.txLevel);
    };
}

/**
 * Connection Context
 * @module context
 * @author Vitaly Tomilov
 * @private
 */
module.exports = ConnectionContext;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    con: __webpack_require__(78).local,
    utils: __webpack_require__(70),
    events: __webpack_require__(74)
};

function poolConnect(ctx, config) {
    return config.promise(function (resolve, reject) {
        config.pgp.pg.connect(ctx.cn, function (err, client, done) {
            if (err) {
                $npm.events.error(ctx.options, err, {
                    cn: $npm.utils.getSafeConnection(ctx.cn),
                    dc: ctx.dc
                });
                reject(err);
            } else {
                var isFresh = !client.$used;
                if (isFresh) {
                    $npm.utils.addReadProp(client, '$used', true, true);
                }
                setCtx(client, ctx);
                var end = lockClientEnd(client);
                resolve({
                    isFresh: isFresh,
                    client: client,
                    done: function () {
                        client.end = end;
                        done();
                        $npm.events.disconnect(ctx, client);
                    }
                });
                $npm.events.connect(ctx, client, isFresh);
            }
        });
    });
}

function directConnect(ctx, config) {
    return config.promise(function (resolve, reject) {
        var client = new config.pgp.pg.Client(ctx.cn);
        client.connect(function (err) {
            if (err) {
                $npm.events.error(ctx.options, err, {
                    cn: $npm.utils.getSafeConnection(ctx.cn),
                    dc: ctx.dc
                });
                reject(err);
            } else {
                setCtx(client, ctx);
                var end = lockClientEnd(client);
                resolve({
                    isFresh: true,
                    client: client,
                    done: function () {
                        client.end = end;
                        client.end();
                        $npm.events.disconnect(ctx, client);
                    }
                });
                $npm.events.connect(ctx, client, true);
            }
        });
    });
}

function lockClientEnd(client) {
    var end = client.end;
    client.end = function () {
        // This call can happen only in the following two cases:
        // 1. the client made the call directly, against the library's documentation (invalid code)
        // 2. connection with the server broke while under heavy communications, and the connection
        //    pool is trying to terminate all clients forcefully.
        $npm.con.error("Abnormal client.end() call, due to invalid code or failed server connection.\n%s\n",
            $npm.utils.getLocalStack(3));
        end.call(client);
    };
    return end;
}

function setCtx(client, ctx) {
    Object.defineProperty(client, '$ctx', {
        value: ctx,
        writable: true
    });
}

module.exports = function (config) {
    return {
        pool: function (ctx) {
            return poolConnect(ctx, config);
        },
        direct: function (ctx) {
            return directConnect(ctx, config);
        }
    };
};


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    con: __webpack_require__(78).local,
    result: __webpack_require__(84),
    special: __webpack_require__(91),
    context: __webpack_require__(107),
    events: __webpack_require__(74),
    utils: __webpack_require__(70),
    connect: __webpack_require__(108),
    query: __webpack_require__(90),
    task: __webpack_require__(122)
};

var $arr = __webpack_require__(73);

/**
 * @class Database
 * @description
 *
 * Represents the database protocol, extensible via event {@link event:extend extend}.
 * This type is not available directly, it can only be created via the library's base call.
 *
 * **IMPORTANT:**
 *
 * For any given connection, you should only create a single {@link Database} object in a separate module,
 * to be shared in your application (see the code example below). If instead you keep creating the {@link Database}
 * object dynamically, your application will suffer from loss in performance, and will be getting a warning in a
 * development environment (when `NODE_ENV` = `development`):
 *
 * `WARNING: Creating a duplicate database object for the same connection.`
 *
 * If you ever see this warning, rectify your {@link Database} object initialization, so there is only one object
 * per connection details. See the example provided below.
 *
 * See also: property `noWarnings` in {@link module:pg-promise Initialization Options}.
 *
 * @param {String|Object} cn
 * Database connection details, which can be:
 *
 * - a configuration object
 * - a connection string
 *
 * For details see {@link https://github.com/vitaly-t/pg-promise/wiki/Connection-Syntax Connection Syntax}.
 *
 * @param {} [dc]
 * Database Context.
 *
 * Any object or value to be propagated through the protocol, to allow implementations
 * and event handling that depend on the database context.
 *
 * This is mainly to facilitate the use of multiple databases which may need separate protocol
 * extensions, or different implementations within a single task / transaction callback,
 * depending on the database context.
 *
 * @returns {Database}
 *
 * @see
 *
 * {@link Database.query query},
 * {@link Database.none none},
 * {@link Database.one one},
 * {@link Database.oneOrNone oneOrNone},
 * {@link Database.many many},
 * {@link Database.manyOrNone manyOrNone},
 * {@link Database.any any},
 * {@link Database.func func},
 * {@link Database.proc proc},
 * {@link Database.result result},
 * {@link Database.map map},
 * {@link Database.each each},
 * {@link Database.stream stream},
 * {@link Database.task task},
 * {@link Database.tx tx},
 * {@link Database.connect connect},
 * {@link Database.$config $config},
 * {@link event:extend extend}
 *
 * @example
 * // Proper way to initialize and share the Database object
 *
 * // Loading and initializing the library:
 * var pgp = require('pg-promise')({
 *     // Initialization Options
 * });
 *
 * // Preparing the connection details:
 * var cn = "postgres://username:password@host:port/database";
 *
 * // Creating a new database instance from the connection details:
 * var db = pgp(cn);
 *
 * // Exporting the database object for shared use:
 * module.exports = db;
 */
function Database(cn, dc, config) {

    checkForDuplicates(cn, config);
    setErrorHandler(config);

    var $p = config.promise;

    /**
     * @method Database.connect
     *
     * @description
     * Acquires a new or existing connection, based on the current connection parameters.
     *
     * This method creates a shared connection for executing a chain of queries against it.
     * The connection must be released in the end of the chain by calling method `done()` on the connection object.
     *
     * This is an older, low-level approach to chaining queries on the same connection.
     * A newer and safer approach is via methods {@link Database.task task} and {@link Database.tx tx} (for transactions),
     * which allocate and release the shared connection automatically.
     *
     * **NOTE:** Even though this method exposes a {@link external:Client Client} object via property `client`,
     * you cannot call `client.end()` directly, or it will print an error into the console:
     * `Abnormal client.end() call, due to invalid code or failed server connection.`
     * You should only call method `done()` to release the connection.
     *
     * @param {object} [options]
     * @param {boolean} [options.direct=false]
     * Creates the connection directly, through the {@link external:Client Client}, bypassing the connection pool.
     *
     * By default, all connections are acquired from the connection pool. If you set this option, the library will instead
     * create a new {@link external:Client Client} object directly (separately from the pool), and then call its `connect` method.
     *
     * **WARNING:**
     *
     * Do not use this option for regular query execution, because it exclusively occupies one physical connection,
     * and therefore cannot scale. This option is only suitable for global connection usage, such as database event listeners.
     *
     * @returns {external:Promise}
     * A promise object that represents the connection result:
     *  - resolves with the complete {@link Database} protocol, extended with:
     *    - property `client` of type {@link external:Client Client} that represents the open connection
     *    - method `done()` that must be called in the end, in order to release the connection
     *  - rejects with a connection-related error when it fails to connect.
     *
     * @see
     * {@link Database.task},
     * {@link Database.tx}
     *
     * @example
     *
     * var sco; // shared connection object;
     *
     * db.connect()
     *     .then(function (obj) {
     *         // obj.client = new connected Client object;
     *
     *         sco = obj; // save the connection object;
     *
     *         // execute all the queries you need:
     *         return sco.any('SELECT * FROM Users');
     *     })
     *     .then(function (data) {
     *         // success
     *     })
     *     .catch(function (error) {
     *         // error
     *     })
     *     .finally(function () {
     *         // release the connection, if it was successful:
     *         if (sco) {
     *             sco.done();
     *         }
     *     });
     *
     */
    this.connect = function (options) {
        var ctx = createContext();
        var self = {
            // Generic query method;
            query: function (query, values, qrm) {
                if (!ctx.db) {
                    throw new Error("Cannot execute a query on a disconnected client.");
                }
                return config.$npm.query.call(this, ctx, query, values, qrm);
            },
            // Connection release method;
            done: function () {
                if (!ctx.db) {
                    throw new Error("Cannot invoke done() on a disconnected client.");
                }
                ctx.disconnect();
            }
        };
        var method = (options && options.direct) ? 'direct' : 'pool';
        return config.$npm.connect[method](ctx)
            .then(function (db) {
                ctx.connect(db);
                self.client = db.client;
                extend(ctx, self);
                return self;
            });
    };

    /**
     * @method Database.query
     *
     * @description
     * Executes a generic query request that expects the return data according to parameter `qrm`.
     *
     * @param {String|Object} query
     * Query to be executed, which can any of the following types:
     * - A non-empty query string
     * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
     * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
     * - {@link QueryFile} object
     *
     * @param {array|value} [values]
     * Query formatting parameters.
     *
     * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
     * - a single value - to replace all `$1` occurrences
     * - an array of values - to replace all `$1`, `$2`, ... variables
     * - an object - to apply $[Named Parameters] formatting
     *
     * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
     * and `values` is not `null` or `undefined`, it is automatically set within such object,
     * as an override for its internal `values`.
     *
     * @param {queryResult} [qrm=queryResult.any]
     * {@link queryResult Query Result Mask}
     *
     * @returns {external:Promise}
     * A promise object that represents the query result.
     *
     * When the query result is an array, it is extended with hidden property `duration` -
     * number of milliseconds it took the client to execute the query.
     */
    this.query = function (query, values, qrm) {
        var self = this, ctx = createContext();
        return config.$npm.connect.pool(ctx)
            .then(function (db) {
                ctx.connect(db);
                return config.$npm.query.call(self, ctx, query, values, qrm);
            })
            .then(function (data) {
                ctx.disconnect();
                return data;
            })
            .catch(function (error) {
                ctx.disconnect();
                return $p.reject(error);
            });
    };

    /**
     * @member {object} Database.$config
     * @readonly
     * @description
     * This is a hidden property, to help integrating type {@link Database} directly with third-party libraries.
     *
     * Properties available in the object:
     * - `pgp` - instance of the entire library after initialization
     * - `options` - the library's {@link module:pg-promise Initialization Options} object
     * - `promiseLib` - instance of the promise library that's used
     * - `promise` - generic promise interface that uses `promiseLib` via 3 basic methods:
     *   - `promise((resolve, reject)=>{})` - to create a new promise
     *   - `promise.resolve(value)` - to resolve with a value
     *   - `promise.reject(value)` - to reject with a value
     * - `version` - this library's version
     * - `$npm` _(hidden property)_ - internal module cache
     *
     * @example
     *
     * // Using the promise protocol as configured by pg-promise:
     *
     * var $p = db.$config.promise;
     *
     * var resolvedPromise = $p.resolve('some data');
     * var rejectedPromise = $p.reject('some reason');
     *
     * var newPromise = $p(function(resolve, reject) {
     *     // call either resolve(data) or reject(reason) here
     * });
     */
    $npm.utils.addReadProp(this, '$config', config, true);

    extend(createContext(), this); // extending root protocol;

    function createContext() {
        return new $npm.context(cn, dc, config.options);
    }

    function transform(value, cb, thisArg) {
        if (typeof cb === 'function') {
            value = value.then(function (data) {
                return cb.call(thisArg, data);
            });
        }
        return value;
    }

    ////////////////////////////////////////////////////
    // Injects additional methods into an access object,
    // extending the protocol's base method 'query'.
    function extend(ctx, obj) {

        /**
         * @method Database.none
         * @description
         * Executes a query that expects no data to be returned.
         * If the query returns any kind of data, the method rejects.
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When no records are returned, it resolves with `null`.
         * - When any data is returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `No return data was expected.`
         *   - `.code` = {@link errors.queryResultErrorCode.notEmpty queryResultErrorCode.notEmpty}
         */
        obj.none = function (query, values) {
            return obj.query.call(this, query, values, $npm.result.none);
        };

        /**
         * @method Database.one
         * @description
         * Executes a query that expects exactly one row of data.
         * When 0 or more than 1 rows are returned, the method rejects.
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} [cb]
         * Value transformation callback, to allow in-line value change.
         * When specified, the return value replaces the original resolved value.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When 1 row is returned, it resolves with that row as a single object.
         * - When no rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `No data returned from the query.`
         *   - `.code` = {@link errors.queryResultErrorCode.noData queryResultErrorCode.noData}
         * - When multiple rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `Multiple rows were not expected.`
         *   - `.code` = {@link errors.queryResultErrorCode.multiple queryResultErrorCode.multiple}
         *
         * @example
         *
         * // a query with in-line value transformation:
         * db.one('INSERT INTO Events VALUES($1) RETURNING id', [123], event => event.id)
         *     .then(data=> {
         *         // data = a new event id, rather than an object with it
         *     });
         *
         * @example
         *
         * // a query with in-line value transformation + conversion:
         * db.one('SELECT count(*) FROM Users', null, c => +c.count)
         *     .then(count=> {
         *         // count = a proper integer value, rather than an object with a string
         *     });
         *
         */
        obj.one = function (query, values, cb, thisArg) {
            var v = obj.query.call(this, query, values, $npm.result.one);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database.many
         * @description
         * Executes a query that expects one or more rows.
         * When the query returns no rows, the method rejects.
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When 1 or more rows are returned, it resolves with the array of rows. The array is extended with
         *   hidden property `duration` - number of milliseconds it took the client to execute the query.
         * - When no rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `No data returned from the query.`
         *   - `.code` = {@link errors.queryResultErrorCode.noData queryResultErrorCode.noData}
         */
        obj.many = function (query, values) {
            return obj.query.call(this, query, values, $npm.result.many);
        };

        /**
         * @method Database.oneOrNone
         * @description
         * Executes a query that expects 0 or 1 rows.
         * When the query returns more than 1 row, the method rejects.
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} [cb]
         * Value transformation callback, to allow in-line value change.
         * When specified, the return value replaces the original resolved value.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When no rows are returned, it resolves with `null`.
         * - When 1 row is returned, it resolves with that row as a single object.
         * - When multiple rows are returned, it rejects with {@link errors.QueryResultError QueryResultError}:
         *   - `.message` = `Multiple rows were not expected.`
         *   - `.code` = {@link errors.queryResultErrorCode.multiple queryResultErrorCode.multiple}
         *
         * @see
         * {@link Database.one one},
         * {@link Database.none none}
         *
         * @example
         *
         * // a query with in-line value transformation:
         * db.oneOrNone('SELECT id FROM Events WHERE type = $1', ['entry'], e => e && e.id)
         *     .then(data=> {
         *         // data = the event id or null (rather than object or null)
         *     });
         *
         */
        obj.oneOrNone = function (query, values, cb, thisArg) {
            var v = obj.query.call(this, query, values, $npm.result.one | $npm.result.none);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database.manyOrNone
         * @description
         * Executes a query that expects any number of rows.
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When no rows are returned, it resolves with an empty array.
         * - When 1 or more rows are returned, it resolves with the array of rows.
         *
         * The resolved array is extended with hidden property `duration` - number of milliseconds
         * it took the client to execute the query.
         *
         * @see {@link Database.any any}
         *
         */
        obj.manyOrNone = function (query, values) {
            return obj.query.call(this, query, values, $npm.result.many | $npm.result.none);
        };

        /**
         * @method Database.any
         * @description
         * Executes a query that expects any number of rows.
         * This is simply a shorter alias for method {@link Database.manyOrNone manyOrNone}.
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - When no rows are returned, it resolves with an empty array.
         * - When 1 or more rows are returned, it resolves with the array of rows.
         *
         * The resolved array is extended with hidden property `duration` - number of milliseconds
         * it took the client to execute the query.
         *
         * @see
         * {@link Database.manyOrNone manyOrNone},
         * {@link Database.map map},
         * {@link Database.each each}
         *
         */
        obj.any = function (query, values) {
            return obj.query.call(this, query, values, $npm.result.any);
        };

        /**
         * @method Database.result
         * @description
         * Executes a query without any expectation for the return data, to resolve with the
         * original $[Result] object when successful.
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} [cb]
         * Value transformation callback, to allow in-line value change.
         * When specified, the return value replaces the original resolved value.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         * A promise object that represents the query result:
         * - resolves with the original $[Result] object, extended with property `duration` -
         *   number of milliseconds it took the client to execute the query.
         *
         * @example
         *
         * // use of value transformation:
         * // deleting rows and returning the number of rows deleted
         * db.result('DELETE FROM Events WHERE id = $1', [123], r=>r.rowCount)
         *     .then(data=> {
         *         // data = number of rows that were deleted
         *     });
         *
         * @example
         *
         * // use of value transformation:
         * // getting only column details from a table
         * db.result('SELECT * FROM Users LIMIT 0', null, r=>r.fields)
         *     .then(data=> {
         *         // data = array of column descriptors
         *     });
         *
         */
        obj.result = function (query, values, cb, thisArg) {
            var v = obj.query.call(this, query, values, $npm.special.cache.resultQuery);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database.stream
         * @description
         * Custom data streaming, with the help of $[pg-query-stream].
         *
         * This method doesn't work with the $[Native Bindings], and if option `pgNative`
         * is set, it will reject with `Streaming doesn't work with Native Bindings.`
         *
         * @param {QueryStream} qs
         * Stream object of type $[QueryStream].
         *
         * @param {Database.streamInitCB} initCB
         * Stream initialization callback.
         *
         * It is invoked with the same `this` context as the calling method.
         *
         * @returns {external:Promise}
         * Result of the streaming operation.
         *
         * Once the streaming has finished successfully, the method resolves with
         * `{processed, duration}`:
         * - `processed` - total number of rows processed;
         * - `duration` - streaming duration, in milliseconds.
         *
         * Possible rejections messages:
         * - `Invalid or missing stream object.`
         * - `Invalid stream state.`
         * - `Invalid or missing stream initialization callback.`
         */
        obj.stream = function (qs, init) {
            return obj.query.call(this, qs, init, $npm.special.cache.streamQuery);
        };

        /**
         * @method Database.func
         * @description
         * Executes a query against a database function by its name: `SELECT * FROM funcName(values)`.
         *
         * @param {string} funcName
         * Name of the function to be executed.
         *
         * @param {array|value} [values]
         * Parameters for the function - one value or an array of values.
         *
         * @param {queryResult} [qrm=queryResult.any] - {@link queryResult Query Result Mask}.
         *
         * @returns {external:Promise}
         *
         * A promise object as returned from method {@link Database.query query}, according to parameter `qrm`.
         *
         * @see
         * {@link Database.query query},
         * {@link Database.proc proc}
         */
        obj.func = function (funcName, values, qrm) {
            return obj.query.call(this, {
                funcName: funcName
            }, values, qrm);
        };

        /**
         * @method Database.proc
         * @description
         * Executes a query against a stored procedure via its name: `select * from procName(values)`,
         * expecting back 0 or 1 rows.
         *
         * The method simply forwards into {@link Database.func func}`(procName, values, queryResult.one|queryResult.none)`.
         *
         * @param {string} procName
         * Name of the stored procedure to be executed.
         *
         * @param {array|value} [values]
         * Parameters for the procedure - one value or an array of values.
         *
         * @param {function} [cb]
         * Value transformation callback, to allow in-line value change.
         * When specified, the return value replaces the original resolved value.
         *
         * The function takes only one parameter - value resolved from the query.
         *
         * @param {} [thisArg]
         * Value to use as `this` when executing the transformation callback.
         *
         * @returns {external:Promise}
         *
         * It calls {@link Database.func func}(`procName`, `values`, `queryResult.one|queryResult.none`),
         * and then returns the same result as method {@link Database.oneOrNone oneOrNone}.
         *
         * @see
         * {@link Database.oneOrNone oneOrNone},
         * {@link Database.func func}
         */
        obj.proc = function (procName, values, cb, thisArg) {
            var v = obj.func.call(this, procName, values, $npm.result.one | $npm.result.none);
            return transform(v, cb, thisArg);
        };

        /**
         * @method Database.map
         * @description
         * Creates a new array with the results of calling a provided function on every element in the array of rows
         * resolved by method {@link Database.any any}.
         *
         * It is a convenience method to reduce the following code:
         *
         * ```js
         * db.any(query, values)
         *     .then(function(data) {
         *         return data.map(function(row, index, data) {
         *              // return a new element
         *         });
         *     });
         * ```
         *
         * In addition to much shorter code, it offers the following benefits:
         *
         * - Use of a custom iterator has a much better performance than the standard {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map Array.map}
         * - Automatic `this` context through the database protocol
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} values
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} cb
         * Function that produces an element of the new array, taking three arguments:
         * - `row` - the current row object being processed in the array
         * - `index` - the index of the current row being processed in the array
         * - `data` - the original array of rows resolved by method {@link Database.any any}
         *
         * @param {} [thisArg]
         * Value to use as `this` when executing the callback.
         *
         * @returns {external:Promise}
         * Resolves with the new array of values returned from the callback. The array is extended with
         * hidden property `duration` - number of milliseconds it took the client to execute the query.
         *
         * @see
         * {@link Database.any any},
         * {@link Database.each each},
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map Array.map}
         *
         * @example
         *
         * db.map('SELECT id FROM Users WHERE status = $1', ['active'], row => row.id)
         *     .then(data => {
         *         // data = array of active user id-s
         *     })
         *     .catch(error => {
         *        // error
         *     });
         *
         * @example
         *
         * db.tx(t => {
         *     return t.map('SELECT id FROM Users WHERE status = $1', ['active'], row => {
         *        return t.none('UPDATE Events SET checked = $1 WHERE userId = $2', [true, row.id]);
         *     }).then(t.batch);
         * })
         *     .then(data => {
         *         // success
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         * @example
         *
         * // Build a list of active users, each with the list of user events:
         * db.task(t => {
         *     return t.map('SELECT id FROM Users WHERE status = $1', ['active'], user => {
         *         return t.any('SELECT * FROM Events WHERE userId = $1', user.id)
         *             .then(events=> {
         *                 user.events = events;
         *                 return user;
         *             });
         *     }).then(t.batch);
         * })
         *     .then(data => {
         *         // success
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         */
        obj.map = function (query, values, cb, thisArg) {
            return obj.any.call(this, query, values)
                .then(function (data) {
                    var result = $arr.map(data, cb, thisArg);
                    $npm.utils.addReadProp(result, 'duration', data.duration, true);
                    return result;
                });
        };

        /**
         * @method Database.each
         * @description
         * Executes a provided function once per array element, for an array of rows resolved by method {@link Database.any any}.
         *
         * It is a convenience method to reduce the following code:
         *
         * ```js
         * db.any(query, values)
         *     .then(function(data) {
         *         data.forEach(function(row, index, data) {
         *              // process the row
         *         });
         *         return data;
         *     });
         * ```
         *
         * In addition to much shorter code, it offers the following benefits:
         *
         * - Use of a custom iterator has a much better performance than the regular {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach Array.forEach}
         * - Automatic `this` context through the database protocol
         *
         * @param {String|Object} query
         * Query to be executed, which can any of the following types:
         * - A non-empty query string
         * - Prepared Statement `{name, text, values, ...}` or {@link PreparedStatement} object
         * - Parameterized Query `{text, values, ...}` or {@link ParameterizedQuery} object
         * - {@link QueryFile} object
         *
         * @param {array|value} [values]
         * Query formatting parameters.
         *
         * When `query` is of type `string` or a {@link QueryFile} object, the `values` can be:
         * - a single value - to replace all `$1` occurrences
         * - an array of values - to replace all `$1`, `$2`, ... variables
         * - an object - to apply $[Named Parameters] formatting
         *
         * When `query` is a Prepared Statement or a Parameterized Query (or their class types),
         * and `values` is not `null` or `undefined`, it is automatically set within such object,
         * as an override for its internal `values`.
         *
         * @param {function} cb
         * Function to execute for each row, taking three arguments:
         * - `row` - the current row object being processed in the array
         * - `index` - the index of the current row being processed in the array
         * - `data` - the array of rows resolved by method {@link Database.any any}
         *
         * @param {} [thisArg]
         * Value to use as `this` when executing the callback.
         *
         * @returns {external:Promise}
         * Resolves with the original array of rows, extended with hidden property `duration` -
         * number of milliseconds it took the client to execute the query.
         *
         * @see
         * {@link Database.any any},
         * {@link Database.map map},
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach Array.forEach}
         *
         * @example
         *
         * db.each('SELECT id, code, name FROM Events', [], row => {
         *     row.code = +row.code; // leading `+` is short for `parseInt()`
         * })
         *     .then(data => {
         *         // data = array of events, with 'code' converted into integer
         *     })
         *     .catch(error => {
         *         // error
         *     });
         *
         */
        obj.each = function (query, values, cb, thisArg) {
            return obj.any.call(this, query, values)
                .then(function (data) {
                    $arr.forEach(data, cb, thisArg);
                    return data;
                });
        };

        /**
         * @method Database.task
         * @description
         * Executes a callback function (or $[ES6 generator]) with an automatically managed connection.
         *
         * This method should be used whenever executing more than one query at once, so the allocated connection
         * is reused between all queries, and released only after the task has finished.
         *
         * The callback function is called with one parameter - database protocol (same as `this`), extended with methods
         * {@link Task.batch batch}, {@link Task.page page}, {@link Task.sequence sequence}, plus property {@link Task.ctx ctx} -
         * the task context object.
         *
         * See class {@link Task} for more details.
         *
         * @param {} tag/cb
         * When the method takes only one parameter, it must be the callback function (or $[ES6 generator]) for the task.
         * However, when calling the method with 2 parameters, the first one is always the `tag` - traceable context for the
         * task (see $[tags]).
         *
         * @param {function|generator} [cb]
         * Task callback function (or $[ES6 generator]), if it is not `undefined`, or else the callback is expected to
         * be passed in as the first parameter.
         *
         * @returns {external:Promise}
         *
         * A promise object that represents the result from the callback function.
         *
         * @see
         * {@link Task},
         * {@link Database.tx tx},
         * $[tags]
         *
         * @example
         *
         * // using the regular callback syntax:
         * db.task(function(t) {
         *         // t = this
         *         // t.ctx = task context object
         *
         *         return t.one('SELECT id FROM Users WHERE name = $1', 'John')
         *             .then(user=> {
         *                 return t.any('SELECT * FROM Events WHERE userId = $1', user.id);
         *             });
         *     })
         *     .then(function(data) {
         *         // success
         *         // data = as returned from the task's callback
         *     })
         *     .catch(function(error) {
         *         // error
         *     });
         *
         * @example
         *
         * // using the ES6 arrow syntax:
         * db.task(t=> {
         *         // t.ctx = task context object
         *         
         *         return t.one('SELECT id FROM Users WHERE name = $1', 'John')
         *             .then(user=> {
         *                 return t.any('SELECT * FROM Events WHERE userId = $1', user.id);
         *             });
         *     })
         *     .then(data=> {
         *         // success
         *         // data = as returned from the task's callback
         *     })
         *     .catch(error=> {
         *         // error
         *     });
         *
         * @example
         *
         * // using an ES6 generator for the callback:
         * db.task(function*(t) {
         *         // t = this
         *         // t.ctx = task context object
         *
         *         let user = yield t.one('SELECT id FROM Users WHERE name = $1', 'John');
         *         return yield t.any('SELECT * FROM Events WHERE userId = $1', user.id);
         *     })
         *     .then(function(data) {
         *         // success
         *         // data = as returned from the task's callback
         *     })
         *     .catch(function(error) {
         *         // error
         *     });
         *
         */
        obj.task = function (p1, p2) {
            return taskProcessor.call(this, p1, p2, false);
        };

        /**
         * @method Database.tx
         * @description
         * Executes a callback function (or $[ES6 generator]) as a transaction.
         *
         * A transaction simply wraps a regular {@link Database.task task} in automatic queries:
         * - it executes `BEGIN` just before invoking the callback function
         * - it executes `COMMIT`, if the callback didn't throw any error or return a rejected promise
         * - it executes `ROLLBACK`, if the callback did throw an error or return a rejected promise
         *
         * The callback function is called with one parameter - database protocol (same as `this`), extended with methods
         * {@link Task.batch batch}, {@link Task.page page}, {@link Task.sequence sequence}, plus property {@link Task.ctx ctx} -
         * the transaction context object.
         *
         * See class {@link Task} for more details.
         *
         * Note that transactions should be chosen over tasks only where they are necessary, because unlike regular tasks,
         * transactions are blocking operations, and must be used with caution.
         *
         * @param {} tag/cb
         * When the method takes only one parameter, it must be the callback function (or $[ES6 generator]) for the transaction.
         * However, when calling the method with 2 parameters, the first one is always the `tag` - traceable context for the
         * transaction (see $[tags]).
         *
         * @param {function|generator} [cb]
         * Transaction callback function (or $[ES6 generator]), if it is not `undefined`, or else the callback is expected to be
         * passed in as the first parameter.
         *
         * @returns {external:Promise}
         *
         * A promise object that represents the result from the callback function.
         *
         * @see
         * {@link Task},
         * {@link Database.task},
         * $[tags]
         *
         * @example
         *
         * // using the regular callback syntax:
         * db.tx(function(t) {
         *         // t = this
         *         // t.ctx = transaction context object
         *
         *         return t.one('INSERT INTO Users(name, age) VALUES($1, $2) RETURNING id', ['Mike', 25])
         *             .then(user=> {
         *                 return t.none('INSERT INTO Events(userId, name) VALUES($1, $2)', [user.id, 'created']);
         *             });
         *     })
         *     .then(function(data) {
         *         // success
         *         // data = as returned from the transaction's callback
         *     })
         *     .catch(function(error) {
         *         // error
         *     });
         *
         * @example
         *
         * // using the ES6 arrow syntax:
         * db.tx(t=> {
         *         // t.ctx = transaction context object
         *         
         *         return t.one('INSERT INTO Users(name, age) VALUES($1, $2) RETURNING id', ['Mike', 25])
         *             .then(user=> {
         *                 return t.batch([
         *                     t.none('INSERT INTO Events(userId, name) VALUES($1, $2)', [user.id, 'created']),
         *                     t.none('INSERT INTO Events(userId, name) VALUES($1, $2)', [user.id, 'login'])
         *                 ]);
         *             });
         *     })
         *     .then(data=> {
         *         // success
         *         // data = as returned from the transaction's callback
         *     })
         *     .catch(error=> {
         *         // error
         *     });
         *
         * @example
         *
         * // using an ES6 generator for the callback:
         * db.tx(function*(t) {
         *         // t = this
         *         // t.ctx = transaction context object
         *
         *         let user = yield t.one('INSERT INTO Users(name, age) VALUES($1, $2) RETURNING id', ['Mike', 25]);
         *         return yield t.none('INSERT INTO Events(userId, name) VALUES($1, $2)', [user.id, 'created']);
         *     })
         *     .then(function(data) {
         *         // success
         *         // data = as returned from the transaction's callback
         *     })
         *     .catch(function(error) {
         *         // error
         *     });
         *
         */
        obj.tx = function (p1, p2) {
            return taskProcessor.call(this, p1, p2, true);
        };

        // Task method;
        // Resolves with result from the callback function;
        function taskProcessor(p1, p2, isTX) {

            var tag, // tag object/value;
                taskCtx = ctx.clone(); // task context object;

            if (isTX) {
                taskCtx.txLevel = taskCtx.txLevel >= 0 ? (taskCtx.txLevel + 1) : 0;
            }

            if (this !== obj) {
                taskCtx.context = this; // calling context object;
            }

            taskCtx.cb = p1; // callback function;

            // allow inserting a tag in front of the callback
            // function, for better code readability;
            if (p2 !== undefined) {
                tag = p1; // overriding any default tag;
                taskCtx.cb = p2;
            }

            var cb = taskCtx.cb;

            if (typeof cb !== 'function') {
                return $p.reject(new TypeError("Callback function is required for the " + (isTX ? "transaction." : "task.")));
            }

            if (tag === undefined) {
                if (cb.tag !== undefined) {
                    // use the default tag associated with the task:
                    tag = cb.tag;
                } else {
                    if (cb.name) {
                        tag = cb.name; // use the function name as tag;
                    }
                }
            }

            var tsk = new config.$npm.task(taskCtx, tag, isTX, config);

            extend(taskCtx, tsk);

            if (taskCtx.db) {
                // reuse existing connection;
                $npm.utils.addReadProp(tsk.ctx, 'isFresh', taskCtx.db.isFresh);
                return config.$npm.task.exec(taskCtx, tsk, isTX, config);
            }

            // connection required;
            return config.$npm.connect.pool(taskCtx)
                .then(function (db) {
                    taskCtx.connect(db);
                    $npm.utils.addReadProp(tsk.ctx, 'isFresh', db.isFresh);
                    return config.$npm.task.exec(taskCtx, tsk, isTX, config);
                })
                .then(function (data) {
                    taskCtx.disconnect();
                    return data;
                })
                .catch(function (error) {
                    taskCtx.disconnect();
                    return $p.reject(error);
                });
        }

        // lock all default properties to read-only,
        // to prevent override by the client.
        $npm.utils.lock(obj, false, ctx.options);

        // extend the protocol;
        $npm.events.extend(ctx.options, obj, ctx.dc);

        // freeze the protocol permanently;
        $npm.utils.lock(obj, true, ctx.options);
    }

}

var jsHandled, nativeHandled, dbObjects = {};

function checkForDuplicates(cn, config) {
    var cnKey = normalizeConnection(cn);
    if (cnKey in dbObjects) {
        if (!config.options.noWarnings) {
            $npm.con.warn("WARNING: Creating a duplicate database object for the same connection.\n%s\n",
                $npm.utils.getLocalStack(5));
        }
    } else {
        dbObjects[cnKey] = true;
    }
}

/**
 * For connections that are objects it reorders the keys alphabetically,
 * and then serializes the result into a JSON string.
 *
 * @param {string|object} cn - connection string or object
 */
function normalizeConnection(cn) {
    if (typeof cn === 'object') {
        var obj = {}, keys = Object.keys(cn).sort();
        $arr.forEach(keys, function (name) {
            obj[name] = cn[name];
        });
        cn = obj;
    }
    return JSON.stringify(cn);
}

function setErrorHandler(config) {
    // we do not do code coverage specific to Native Bindings:
    // istanbul ignore if
    if (config.options.pgNative) {
        if (!nativeHandled) {
            config.pgp.pg.on('error', onError);
            nativeHandled = true;
        }
    } else {
        if (!jsHandled) {
            config.pgp.pg.on('error', onError);
            jsHandled = true;
        }
    }
}

// this event only happens when the connection is lost physically,
// which cannot be tested automatically; removing from coverage:
// istanbul ignore next
function onError(err, client) {
    var ctx = client.$ctx;
    $npm.events.error(ctx.options, err, {
        cn: $npm.utils.getSafeConnection(ctx.cn),
        dc: ctx.dc
    });
}

module.exports = function (config) {
    var npm = config.$npm;
    npm.connect = npm.connect || $npm.connect(config);
    npm.query = npm.query || $npm.query(config);
    npm.task = npm.task || $npm.task(config);
    return Database;
};

/**
 * @callback Database.streamInitCB
 * @description
 * Stream initialization callback, used by {@link Database.stream}.
 *
 * @param {external:Stream} stream
 * Stream object to initialize streaming.
 *
 * @example
 * var QueryStream = require('pg-query-stream');
 * var JSONStream = require('JSONStream');
 *
 * // you can also use pgp.as.format(query, values, options)
 * // to format queries properly, via pg-promise;
 * var qs = new QueryStream('select * from users');
 *
 * db.stream(qs, function (stream) {
 *         // initiate streaming into the console:
 *         stream.pipe(JSONStream.stringify()).pipe(process.stdout);
 *     })
 *     .then(function (data) {
 *         console.log("Total rows processed:", data.processed,
 *           "Duration in milliseconds:", data.duration);
 *     })
 *     .catch(function (error) {
 *         // error;
 *     });
 */

/**
 * @external Stream
 * @see https://nodejs.org/api/stream.html
 */


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70),
    QueryFileError: __webpack_require__(80)
};

/**
 * @interface errors.ParameterizedQueryError
 * @augments external:Error
 * @description
 * {@link errors.ParameterizedQueryError ParameterizedQueryError} interface, available from the {@link errors} namespace.
 *
 * This type represents all errors that can be reported by class {@link ParameterizedQuery}, whether it is used
 * explicitly or implicitly (via a simple `{text, values}` object).
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `ParameterizedQueryError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {errors.QueryFileError} error
 * Internal {@link errors.QueryFileError} object.
 *
 * It is set only when the source {@link ParameterizedQuery} used a {@link QueryFile} which threw the error.
 *
 * @property {object} result
 * Resulting Parameterized Query object.
 *
 * @see ParameterizedQuery
 */
function ParameterizedQueryError(error, ps) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'ParameterizedQueryError';
    this.stack = temp.stack;
    if (error instanceof $npm.QueryFileError) {
        this.error = error;
        this.message = "Failed to initialize 'text' from a QueryFile.";
    } else {
        this.message = error;
    }
    this.result = ps;
}

ParameterizedQueryError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: ParameterizedQueryError,
        writable: true,
        configurable: true
    }
});

/**
 * @method errors.ParameterizedQueryError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
ParameterizedQueryError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        gap2 = $npm.utils.messageGap(level + 2),
        lines = [
            'ParameterizedQueryError {',
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'result: {',
            gap2 + 'text: ' + JSON.stringify(this.result.text),
            gap2 + 'values: ' + JSON.stringify(this.result.values),
            gap1 + '}'
        ];
    if (this.error) {
        lines.push(gap1 + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

ParameterizedQueryError.prototype.inspect = function () {
    return this.toString();
};

module.exports = ParameterizedQueryError;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70),
    QueryFileError: __webpack_require__(80)
};

/**
 * @interface errors.PreparedStatementError
 * @augments external:Error
 * @description
 * {@link errors.PreparedStatementError PreparedStatementError} interface, available from the {@link errors} namespace.
 *
 * This type represents all errors that can be reported by class {@link PreparedStatement}, whether it is used
 * explicitly or implicitly (via a simple `{name, text, values}` object).
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `PreparedStatementError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {errors.QueryFileError} error
 * Internal {@link errors.QueryFileError} object.
 *
 * It is set only when the source {@link PreparedStatement} used a {@link QueryFile} which threw the error.
 *
 * @property {object} result
 * Resulting Prepared Statement object.
 *
 * @see PreparedStatement
 */
function PreparedStatementError(error, ps) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'PreparedStatementError';
    this.stack = temp.stack;
    if (error instanceof $npm.QueryFileError) {
        this.error = error;
        this.message = "Failed to initialize 'text' from a QueryFile.";
    } else {
        this.message = error;
    }
    this.result = ps;
}

PreparedStatementError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: PreparedStatementError,
        writable: true,
        configurable: true
    }
});

/**
 * @method errors.PreparedStatementError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
PreparedStatementError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        gap2 = $npm.utils.messageGap(level + 2),
        lines = [
            'PreparedStatementError {',
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'result: {',
            gap2 + 'name: ' + JSON.stringify(this.result.name),
            gap2 + 'text: ' + JSON.stringify(this.result.text),
            gap2 + 'values: ' + JSON.stringify(this.result.values),
            gap1 + '}'
        ];
    if (this.error) {
        lines.push(gap1 + 'error: ' + this.error.toString(level + 1));
    }
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

PreparedStatementError.prototype.inspect = function () {
    return this.toString();
};

module.exports = PreparedStatementError;


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70)
};

/**
 * @enum {number}
 * @alias errors.queryResultErrorCode
 * @readonly
 * @description
 * `queryResultErrorCode` enumerator, available from the {@link errors} namespace.
 *
 * Represents an integer code for each type of error supported by type {@link errors.QueryResultError}.
 *
 * @see {@link errors.QueryResultError}
 */
var queryResultErrorCode = {
    /** No data returned from the query. */
    noData: 0,

    /** No return data was expected. */
    notEmpty: 1,

    /** Multiple rows were not expected. */
    multiple: 2
};

Object.freeze(queryResultErrorCode);

var errorMessages = [
    {name: "noData", message: "No data returned from the query."},
    {name: "notEmpty", message: "No return data was expected."},
    {name: "multiple", message: "Multiple rows were not expected."}
];

/**
 * @interface errors.QueryResultError
 * @augments external:Error
 * @description
 *
 * This error is specified as the rejection reason for all result-specific methods when the result doesn't match
 * the expectation, i.e. when a query result doesn't match its Query Result Mask - the value of {@link queryResult}.
 *
 * The error applies to the result from the following methods: {@link Database.none none},
 * {@link Database.one one}, {@link Database.oneOrNone oneOrNone} and {@link Database.many many}.
 *
 * Supported errors:
 *
 * - `No return data was expected.`, method {@link Database.none none}
 * - `No data returned from the query.`, methods {@link Database.one one} and {@link Database.many many}
 * - `Multiple rows were not expected.`, methods {@link Database.one one} and {@link Database.oneOrNone oneOrNone}
 *
 * Like any other error, this one is notified with through the global event {@link event:error error}.
 *
 * The type is available from the {@link errors} namespace.
 *
 * @property {string} name
 * Standard {@link external:Error Error} property - error type name = `QueryResultError`.
 *
 * @property {string} message
 * Standard {@link external:Error Error} property - the error message.
 *
 * @property {string} stack
 * Standard {@link external:Error Error} property - the stack trace.
 *
 * @property {object} result
 * The original $[Result] object that was received.
 *
 * @property {number} received
 * Total number of rows received. It is simply the value of `result.rows.length`.
 *
 * @property {number} code
 * Error code - {@link errors.queryResultErrorCode queryResultErrorCode} value.
 *
 * @property {string} query
 * Query that was executed.
 *
 * Normally, it is the query already formatted with values, if there were any.
 * But if you are using initialization option `pgFormatting`, then the query string is before formatting.
 *
 * @property {} values
 * Values passed in as query parameters. Available only when initialization option `pgFormatting` is used.
 * Otherwise, the values are within the pre-formatted `query` string.
 *
 * @example
 *
 * var QueryResultError = pgp.errors.QueryResultError;
 * var qrec = pgp.errors.queryResultErrorCode;
 *
 * var options = {
 *
 *   // pg-promise initialization options...
 *
 *   error: function (err, e) {
 *       if (err instanceof QueryResultError) {
 *           // A query returned unexpected number of records, and thus rejected;
 *           
 *           // we can check the error code, if we want specifics:
 *           if(err.code === qrec.noData) {
 *               // expected some data, but received none;
 *           }
 *
 *           // If you write QueryResultError into the console,
 *           // you will get a nicely formatted output.
 *
 *           console.log(err);
 *           
 *           // See also: err, e.query, e.params, etc.
 *       }
 *   }
 * };
 *
 * @see
 * {@link queryResult}, {@link Database.none none}, {@link Database.one one},
 * {@link Database.oneOrNone oneOrNone}, {@link Database.many many}
 *
 */
function QueryResultError(code, result, query, values) {
    var temp = Error.apply(this, arguments);
    temp.name = this.name = 'QueryResultError';
    this.stack = temp.stack;
    this.message = errorMessages[code].message;
    this.code = code;
    this.result = result;
    this.query = query;
    this.values = values;
    this.received = result.rows.length;
}

QueryResultError.prototype = Object.create(Error.prototype, {
    constructor: {
        value: QueryResultError,
        writable: true,
        configurable: true
    }
});

/**
 * @method errors.QueryResultError.toString
 * @description
 * Creates a well-formatted multi-line string that represents the error.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
QueryResultError.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap0 = $npm.utils.messageGap(level),
        gap1 = $npm.utils.messageGap(level + 1),
        lines = [
            'QueryResultError {',
            gap1 + 'code: queryResultErrorCode.' + errorMessages[this.code].name,
            gap1 + 'message: "' + this.message + '"',
            gap1 + 'received: ' + this.received,
            gap1 + 'query: ' + (typeof this.query === 'string' ? '"' + this.query + '"' : JSON.stringify(this.query))
        ];
    if (this.values !== undefined) {
        lines.push(gap1 + 'values: ' + JSON.stringify(this.values));
    }
    lines.push(gap0 + '}');
    return lines.join($npm.os.EOL);
};

QueryResultError.prototype.inspect = function () {
    return this.toString();
};

module.exports = {
    QueryResultError: QueryResultError,
    queryResultErrorCode: queryResultErrorCode
};



/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    concat: __webpack_require__(114),
    insert: __webpack_require__(115),
    update: __webpack_require__(117),
    values: __webpack_require__(118),
    sets: __webpack_require__(116),
    TableName: __webpack_require__(81),
    ColumnSet: __webpack_require__(75),
    Column: __webpack_require__(88)
};

/**
 * @namespace helpers
 * @description
 * Namespace for query-formatting generators, available as `pgp.helpers`, after initializing the library.
 *
 * It is a set of types and methods for generating queries in a fast, flexible and reliable way.
 *
 * See also: $[Performance Boost].
 *
 * @property {function} TableName
 * {@link helpers.TableName TableName} class constructor.
 *
 * @property {function} ColumnSet
 * {@link helpers.ColumnSet ColumnSet} class constructor.
 *
 * @property {function} Column
 * {@link helpers.Column Column} class constructor.
 *
 * @property {function} insert
 * {@link helpers.insert insert} static method.
 *
 * @property {function} update
 * {@link helpers.update update} static method.
 *
 * @property {function} values
 * {@link helpers.values values} static method.
 *
 * @property {function} sets
 * {@link helpers.sets sets} static method.
 *
 * @property {function} concat
 * {@link helpers.concat concat} static method.
 */
module.exports = function (config) {
    var res = {
        insert: function (data, columns, table) {
            var capSQL = config.options && config.options.capSQL;
            return $npm.insert(data, columns, table, capSQL);
        },
        update: function (data, columns, table, options) {
            var capSQL = config.options && config.options.capSQL;
            return $npm.update(data, columns, table, options, capSQL);
        },
        concat: $npm.concat,
        values: $npm.values,
        sets: $npm.sets,
        TableName: $npm.TableName,
        ColumnSet: $npm.ColumnSet,
        Column: $npm.Column
    };
    Object.freeze(res);
    return res;
};


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    format: __webpack_require__(72).as.format,
    QueryFile: __webpack_require__(76)
};

var $arr = __webpack_require__(73);

/**
 * @method helpers.concat
 * @description
 * **Added in v.5.3.0**
 *
 * Concatenates multiple queries into a single query string.
 *
 * - Before joining any query, the method removes from it all leading and trailing spaces, tabs and semi-colons.
 * - Empty queries are skipped automatically.
 *
 * @param {array<string|helpers.QueryFormat|QueryFile>} queries
 * Array of mixed-type elements:
 * - a simple query string, to be used as is
 * - a simple {@link helpers.QueryFormat QueryFormat}-like object = `{query, [values], [options]}`
 * - a {@link QueryFile} object
 *
 * @returns {string}
 * Concatenated string with all queries.
 *
 * @example
 *
 * var pgp = require('pg-promise')();
 *
 * var qf1 = new pgp.QueryFile('./query1.sql', {minify: true});
 * var qf2 = new pgp.QueryFile('./query2.sql', {minify: true});
 *
 * var query = pgp.helpers.concat([
 *     {query: 'INSERT INTO Users(name, age) VALUES($1, $2)', values: ['John', 23]}, // QueryFormat-like object
 *     {query: 'DELETE FROM Log WHERE userName = $1', values: 'John'}, // QueryFormat-like object
 *     {query: qf1, values: [1, 'Name']}, // QueryFile with formatting parameters
 *     'SELECT count(*) FROM Users', // a simple-string query,
 *     qf2 // direct QueryFile object
 * ]);
 *
 * // query = concatenated string with all the queries
 */
function concat(queries) {
    if (!Array.isArray(queries)) {
        throw new TypeError("Parameter 'queries' must be an array.");
    }
    var all = $arr.map(queries, function (q, index) {
        if (typeof q === 'string') {
            // a simple query string without parameters:
            return clean(q);
        }
        if (q && typeof q === 'object') {
            if (q instanceof $npm.QueryFile) {
                // QueryFile object:
                return clean(q.formatDBType());
            }
            if ('query' in q) {
                // object {query, values, options}:
                return clean($npm.format(q.query, q.values, q.options));
            }
        }
        throw new Error('Invalid query element at index ' + index + '.');
    });

    return $arr.filter(all, function (q) {
        return q;
    }).join(';');
}

function clean(q) {
    // removes from the query all leading and trailing symbols ' ', '\t' and ';'
    return q.replace(/^[\s;]*|[\s;]*$/g, '');
}

module.exports = concat;

/**
 * @typedef helpers.QueryFormat
 * @description
 * A simple structure of parameters to be passed into method {@link formatting.format as.format} exactly as they are.
 *
 * @property {string|value|object} query
 * A query string or a value/object that implements $[Custom Type Formatting], to be formatted according to `values`.
 *
 * @property {array|object|value} [values]
 * Optional formatting parameters for the query.
 *
 * @property {object} [options]
 * Query formatting options, as supported by method {@link formatting.format as.format}.
 *
 * @see
 * {@link formatting.format as.format}
 */


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    TableName: __webpack_require__(81),
    ColumnSet: __webpack_require__(75),
    formatting: __webpack_require__(72),
    utils: __webpack_require__(70)
};

var $arr = __webpack_require__(73);

/**
 * @method helpers.insert
 * @description
 * Generates an `INSERT` query for either one object or an array of objects.
 *
 * @param {object|object[]} data
 * An insert object with properties for insert values, or an array of such objects.
 *
 * When `data` is not a non-null object and not an array, it will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * When `data` is an empty array, it will throw {@link external:TypeError TypeError} = `Cannot generate an INSERT from an empty array.`
 *
 * When `data` is an array that contains a non-object value, the method will throw {@link external:Error Error} =
 * `Invalid insert object at index N.`
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Set of columns to be inserted.
 *
 * It is optional when `data` is a single object, and required when `data` is an array of objects. If not specified for an array
 * of objects, the method will throw {@link external:TypeError TypeError} = `Parameter 'columns' is required when inserting multiple records.`
 *
 * When `columns` is not a {@link helpers.ColumnSet ColumnSet} object, a temporary {@link helpers.ColumnSet ColumnSet}
 * is created - from the value of `columns` (if it was specified), or from the value of `data` (if it is not an array).
 *
 * When the final {@link helpers.ColumnSet ColumnSet} is empty (no columns in it), the method will throw
 * {@link external:Error Error} = `Cannot generate an INSERT without any columns.`
 *
 * @param {helpers.TableName|string|{table,schema}} [table]
 * Destination table.
 *
 * It is normally a required parameter. But when `columns` is passed in as a {@link helpers.ColumnSet ColumnSet} object
 * with `table` set in it, that will be used when this parameter isn't specified. When neither is available, the method
 * will throw {@link external:Error Error} = `Table name is unknown.`
 *
 * @returns {string}
 * The resulting query string.
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet},
 *  {@link helpers.TableName TableName}
 *
 * @example
 *
 * var pgp = require('pg-promise')({
 *    capSQL: true // if you want all generated SQL capitalized
 * });
 *
 * var dataSingle = {val: 123, msg: 'hello'};
 * var dataMulti = [{val: 123, msg: 'hello'}, {val: 456, msg: 'world!'}];
 *
 * // Column details can be taken from the data object:
 *
 * pgp.helpers.insert(dataSingle, null, 'my-table');
 * //=> INSERT INTO "my-table"("val","msg") VALUES(123,'hello')
 *
 * @example
 *
 * // Column details are required for a multi-row `INSERT`:
 *
 * pgp.helpers.insert(dataMulti, ['val', 'msg'], 'my-table');
 * //=> INSERT INTO "my-table"("val","msg") VALUES(123,'hello'),(456,'world!')
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance):
 *
 * var cs = new pgp.helpers.ColumnSet(['val', 'msg'], {table: 'my-table'});
 *
 * pgp.helpers.insert(dataMulti, cs);
 * //=> INSERT INTO "my-table"("val","msg") VALUES(123,'hello'),(456,'world!')
 *
 */
function insert(data, columns, table, capSQL) {

    if (!data || typeof data !== 'object') {
        throw new TypeError("Invalid parameter 'data' specified.");
    }

    var isArray = Array.isArray(data);

    if (isArray && !data.length) {
        throw new TypeError("Cannot generate an INSERT from an empty array.");
    }

    if (columns instanceof $npm.ColumnSet) {
        if ($npm.utils.isNull(table)) {
            table = columns.table;
        }
    } else {
        if (isArray && $npm.utils.isNull(columns)) {
            throw new TypeError("Parameter 'columns' is required when inserting multiple records.");
        }
        columns = new $npm.ColumnSet(columns || data);
    }

    if (!columns.columns.length) {
        throw new Error("Cannot generate an INSERT without any columns.");
    }

    if (!table) {
        throw new Error("Table name is unknown.");
    }

    if (!(table instanceof $npm.TableName)) {
        table = new $npm.TableName(table);
    }

    var query = capSQL ? sql.capCase : sql.lowCase;

    var format = $npm.formatting.as.format;
    query = format(query, [table.name, columns.names]);

    if (isArray) {
        return query + $arr.map(data, function (d, index) {
                if (!d || typeof d !== 'object') {
                    throw new Error("Invalid insert object at index " + index + ".");
                }
                return '(' + format(columns.variables, columns.prepare(d)) + ')';
            }).join();
    }
    return query + '(' + format(columns.variables, columns.prepare(data)) + ')';
}

var sql = {
    lowCase: "insert into $1^($2^) values",
    capCase: "INSERT INTO $1^($2^) VALUES"
};

module.exports = insert;


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    ColumnSet: __webpack_require__(75),
    format: __webpack_require__(72).as.format,
    utils: __webpack_require__(70)
};

/**
 * @method helpers.sets
 * @description
 * Generates a string of comma-separated value-set statements from a single object: `col1=val1, col2=val2, ...`,
 * to be used as part of a query.
 *
 * Since it is to be used as part of `UPDATE` queries, {@link helpers.Column Column} properties `cnd` and `skip` apply.
 *
 * @param {object} data
 * A simple, non-null and non-array source object.
 *
 * If it is anything else, the method will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Columns for which to set values.
 *
 * When not specified, properties of the `data` object are used.
 *
 * When no effective columns are found, an empty string is returned.
 *
 * @returns {string}
 * - comma-separated value-set statements for the `data` object
 * - an empty string, if no effective columns found
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet}
 *
 * @example
 *
 * var pgp = require('pg-promise')();
 *
 * var data = {id: 1, val: 123, msg: 'hello'};
 *
 * // Properties can be pulled automatically from the object:
 *
 * pgp.helpers.sets(data);
 * //=> "id"=1,"val"=123,"msg"='hello'
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance);
 * // NOTE: Conditional columns (start with '?') are skipped:
 *
 * var cs = new pgp.helpers.ColumnSet(['?id','val', 'msg']);
 *
 * pgp.helpers.sets(data, cs);
 * //=> "val"=123,"msg"='hello'
 *
 */
function sets(data, columns) {

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new TypeError("Invalid parameter 'data' specified.");
    }

    if (!(columns instanceof $npm.ColumnSet)) {
        columns = new $npm.ColumnSet(columns || data);
    }

    return $npm.format(columns.assign(data), columns.prepare(data));
}

module.exports = sets;


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    TableName: __webpack_require__(81),
    ColumnSet: __webpack_require__(75),
    formatting: __webpack_require__(72),
    utils: __webpack_require__(70)
};

var $arr = __webpack_require__(73);

/**
 * @method helpers.update
 * @description
 * Generates a simplified `UPDATE` query for either one object or an array of objects.
 *
 * The resulting query needs a `WHERE` clause to be appended to it, to determine the update logic.
 * This is to allow for update conditions of any complexity that are easy to add.
 *
 * @param {object|object[]} data
 * An update object with properties for update values, or an array of such objects.
 *
 * When `data` is not a non-null object and not an array, it will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * When `data` is an empty array, it will throw {@link external:TypeError TypeError} = `Cannot generate an UPDATE from an empty array.`
 *
 * When `data` is an array that contains a non-object value, the method will throw {@link external:Error Error} =
 * `Invalid update object at index N.`
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Set of columns to be updated.
 *
 * It is optional when `data` is a single object, and required when `data` is an array of objects. If not specified for an array
 * of objects, the method will throw {@link external:TypeError TypeError} = `Parameter 'columns' is required when updating multiple records.`
 *
 * When `columns` is not a {@link helpers.ColumnSet ColumnSet} object, a temporary {@link helpers.ColumnSet ColumnSet}
 * is created - from the value of `columns` (if it was specified), or from the value of `data` (if it is not an array).
 *
 * When the final {@link helpers.ColumnSet ColumnSet} is empty (no columns in it), the method will throw
 * {@link external:Error Error} = `Cannot generate an UPDATE without any columns.` (see also {@link helpers.ColumnSet.canGenerate ColumnSet.canGenerate})
 *
 * @param {helpers.TableName|string|{table,schema}} [table]
 * Table to be updated.
 *
 * It is normally a required parameter. But when `columns` is passed in as a {@link helpers.ColumnSet ColumnSet} object
 * with `table` set in it, that will be used when this parameter isn't specified. When neither is available, the method
 * will throw {@link external:Error Error} = `Table name is unknown.`
 *
 * @param {object} [options]
 * An object with formatting options for multi-row `UPDATE` queries.
 *
 * @param {string} [options.tableAlias=t]
 * Name of the SQL variable that represents the destination table.
 *
 * @param {string} [options.valueAlias=v]
 * Name of the SQL variable that represents the values.
 *
 * @returns {string}
 * The resulting query string that typically needs a `WHERE` condition appended.
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet},
 *  {@link helpers.TableName TableName}
 *
 * @example
 *
 * var pgp = require('pg-promise')({
 *    capSQL: true // if you want all generated SQL capitalized
 * });
 *
 * var dataSingle = {id: 1, val: 123, msg: 'hello'};
 * var dataMulti = [{id: 1, val: 123, msg: 'hello'}, {id: 2, val: 456, msg: 'world!'}];
 *
 * // Although column details can be taken from the data object, it is not
 * // a likely scenario for an update, unless updating the whole table:
 *
 * pgp.helpers.update(dataSingle, null, 'my-table');
 * //=> UPDATE "my-table" SET "id"=1,"val"=123,"msg"='hello'
 *
 * @example
 *
 * // A typical single-object update:
 *
 * pgp.helpers.update(dataSingle, ['val', 'msg'], 'my-table') + ' WHERE id = ' + dataSingle.id;
 * //=> UPDATE "my-table" SET "val"=123,"msg"='hello' WHERE id = 1
 *
 * @example
 *
 * // Column details are required for a multi-row `UPDATE`;
 * // Adding '?' in front of a column name means it is only for a WHERE condition:
 *
 * pgp.helpers.update(dataMulti, ['?id', 'val', 'msg'], 'my-table') + ' WHERE v.id = t.id';
 * //=> UPDATE "my-table" AS t SET "val"=v."val","msg"=v."msg" FROM (VALUES(1,123,'hello'),(2,456,'world!'))
 * //   AS v("id","val","msg") WHERE v.id = t.id
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance):
 *
 * var cs = new pgp.helpers.ColumnSet(['?id', 'val', 'msg'], {table: 'my-table'});
 *
 * pgp.helpers.update(dataMulti, cs) + ' WHERE v.id = t.id';
 * //=> UPDATE "my-table" AS t SET "val"=v."val","msg"=v."msg" FROM (VALUES(1,123,'hello'),(2,456,'world!'))
 * //   AS v("id","val","msg") WHERE v.id = t.id
 *
 * @example
 *
 * // Using parameter `options` to change the default alias names:
 *
 * pgp.helpers.update(dataMulti, cs, null, {tableAlias: 'X', valueAlias: 'Y'}) + ' WHERE Y.id = X.id';
 * //=> UPDATE "my-table" AS X SET "val"=Y."val","msg"=Y."msg" FROM (VALUES(1,123,'hello'),(2,456,'world!'))
 * //   AS Y("id","val","msg") WHERE Y.id = X.id
 *
 */
function update(data, columns, table, options, capSQL) {

    if (!data || typeof data !== 'object') {
        throw new TypeError("Invalid parameter 'data' specified.");
    }

    var isArray = Array.isArray(data);

    if (isArray && !data.length) {
        throw new TypeError("Cannot generate an UPDATE from an empty array.");
    }

    if (columns instanceof $npm.ColumnSet) {
        if ($npm.utils.isNull(table)) {
            table = columns.table;
        }
    } else {
        if (isArray && $npm.utils.isNull(columns)) {
            throw new TypeError("Parameter 'columns' is required when updating multiple records.");
        }
        columns = new $npm.ColumnSet(columns || data);
    }

    var format = $npm.formatting.as.format;

    if (isArray) {
        var tableAlias = 't', valueAlias = 'v';
        if (options && typeof options === 'object') {
            if (options.tableAlias && typeof options.tableAlias === 'string') {
                tableAlias = options.tableAlias;
            }
            if (options.valueAlias && typeof options.valueAlias === 'string') {
                valueAlias = options.valueAlias;
            }
        }

        var query = capSQL ? sql.multi.capCase : sql.multi.lowCase;

        var actualColumns = $arr.filter(columns.columns, function (c) {
            return !c.cnd;
        });

        checkColumns(actualColumns);
        checkTable();

        var targetCols = $arr.map(actualColumns, function (c) {
            return c.escapedName + '=' + valueAlias + '.' + c.escapedName;
        }).join();

        var values = $arr.map(data, function (d, index) {
            if (!d || typeof d !== 'object') {
                throw new Error("Invalid update object at index " + index + ".");
            }
            return '(' + format(columns.variables, columns.prepare(d)) + ')';
        }).join();

        return format(query, [table.name, tableAlias, targetCols, values, valueAlias, columns.names]);
    }

    var updates = columns.assign(data);

    checkColumns(updates);
    checkTable();

    var query = capSQL ? sql.single.capCase : sql.single.lowCase;

    return format(query, table.name) + format(updates, columns.prepare(data));

    function checkTable() {
        if (table && !(table instanceof $npm.TableName)) {
            table = new $npm.TableName(table);
        }
        if (!table) {
            throw new Error("Table name is unknown.");
        }
    }

    function checkColumns(cols) {
        if (!cols.length) {
            throw new Error("Cannot generate an UPDATE without any columns.");
        }
    }
}

var sql = {
    single: {
        lowCase: "update $1^ set ",
        capCase: "UPDATE $1^ SET "
    },
    multi: {
        lowCase: "update $1^ as $2^ set $3^ from (values$4^) as $5^($6^)",
        capCase: "UPDATE $1^ AS $2^ SET $3^ FROM (VALUES$4^) AS $5^($6^)"
    }
};

module.exports = update;


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    ColumnSet: __webpack_require__(75),
    formatting: __webpack_require__(72),
    utils: __webpack_require__(70)
};

var $arr = __webpack_require__(73);

/**
 * @method helpers.values
 * @description
 * Generates a string of comma-separated value groups from either one object or an array of objects,
 * to be used as part of a query:
 *
 * - from a single object: `(val_1, val_2, ...)`
 * - from an array of objects: `(val_11, val_12, ...), (val_21, val_22), ...`
 *
 * @param {object|object[]} data
 * A source object with properties as values, or an array of such objects.
 *
 * If it is anything else, the method will throw {@link external:TypeError TypeError} = `Invalid parameter 'data' specified.`
 *
 * When `data` is an array that contains a non-object value, the method will throw {@link external:Error Error} =
 * `Invalid object at index N.`
 *
 * When `data` is an empty array, an empty string is returned.
 *
 * @param {array|helpers.Column|helpers.ColumnSet} [columns]
 * Columns for which to return values.
 *
 * It is optional when `data` is a single object, and required when `data` is an array of objects. If not specified for an array
 * of objects, the method will throw {@link external:TypeError TypeError} = `Parameter 'columns' is required when generating multi-row values.`
 *
 * When the final {@link helpers.ColumnSet ColumnSet} is empty (no columns in it), the method will throw
 * {@link external:Error Error} = `Cannot generate values without any columns.`
 *
 * @returns {string}
 * - comma-separated value groups, according to `data`
 * - an empty string, if `data` is an empty array
 *
 * @see
 *  {@link helpers.Column Column},
 *  {@link helpers.ColumnSet ColumnSet}
 *
 * @example
 *
 * var pgp = require('pg-promise')();
 *
 * var dataSingle = {val: 123, msg: 'hello'};
 * var dataMulti = [{val: 123, msg: 'hello'}, {val: 456, msg: 'world!'}];
 *
 * // Properties can be pulled automatically from a single object:
 *
 * pgp.helpers.values(dataSingle);
 * //=> (123,'hello')
 *
 * @example
 *
 * // Column details are required when using an array of objects:
 *
 * pgp.helpers.values(dataMulti, ['val', 'msg']);
 * //=> (123,'hello'),(456,'world!')
 *
 * @example
 *
 * // Column details from a reusable ColumnSet (recommended for performance):
 *
 * var cs = new pgp.helpers.ColumnSet(['val', 'msg']);
 *
 * pgp.helpers.values(dataMulti, cs);
 * //=> (123,'hello'),(456,'world!')
 *
 */
function values(data, columns) {

    if (!data || typeof data !== 'object') {
        throw new TypeError("Invalid parameter 'data' specified.");
    }

    var isArray = Array.isArray(data);

    if (!(columns instanceof $npm.ColumnSet)) {
        if (isArray && $npm.utils.isNull(columns)) {
            throw new TypeError("Parameter 'columns' is required when generating multi-row values.");
        }
        columns = new $npm.ColumnSet(columns || data);
    }

    if (!columns.columns.length) {
        throw new Error("Cannot generate values without any columns.");
    }

    var format = $npm.formatting.as.format;

    if (isArray) {
        return $arr.map(data, function (d, index) {
            if (!d || typeof d !== 'object') {
                throw new Error("Invalid object at index " + index + ".");
            }
            return '(' + format(columns.variables, columns.prepare(d)) + ')';
        }).join();
    }
    return '(' + format(columns.variables, columns.prepare(data)) + ')';
}

module.exports = values;


/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    con: __webpack_require__(78).local,
    path: __webpack_require__(2),
    pg: __webpack_require__(127),
    minify: __webpack_require__(83),
    array: __webpack_require__(73),
    adapter: __webpack_require__(87),
    result: __webpack_require__(84),
    promise: __webpack_require__(120),
    formatting: __webpack_require__(72),
    helpers: __webpack_require__(113),
    queryFile: __webpack_require__(76),
    errors: __webpack_require__(79),
    utils: __webpack_require__(70),
    pubUtils: __webpack_require__(125),
    mode: __webpack_require__(92),
    types: __webpack_require__(93),
    package: __webpack_require__(99)
};

/**
 * @author Vitaly Tomilov
 * @module pg-promise
 *
 * @description
 * ### Initialization Options
 *
 * Below is the complete list of _Initialization Options_ for the library.
 *
 * @param {object} [options]
 * Library Initialization Options.
 *
 * @param {boolean} [options.pgFormatting=false]
 * Redirects query formatting to PG.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {boolean} [options.pgNative=false]
 * Use $[Native Bindings]. Library $[pg-native] must be installed, or else it will throw an error.
 *
 * This is a static property (can only be set prior to initialization).
 *
 * @param {object|function} [options.promiseLib=Promise]
 * Overrides the default promise library.
 *
 * This is a static property (can only be set prior to initialization).
 *
 * @param {boolean} [options.noLocking=false]
 * Prevents protocol locking.
 *
 * By default, the library locks its protocol to read-only access, as a fool-proof mechanism.
 * Specifically for the {@link event:extend extend} event this serves as a protection against overriding existing
 * properties or trying to set them at the wrong time.
 *
 * If this provision gets in the way of using a mock-up framework for your tests, you can force
 * the library to deactivate most of the locks by setting `noLocking` = `true` within the options.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {boolean} [options.capSQL=false]
 * Capitalizes any SQL generated by the library.
 *
 * By default, all internal SQL within the library is generated using the low case.
 * If, however, you want all SQL to be capitalized instead, set `capSQL` = `true`.
 *
 * This is purely a cosmetic feature.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {boolean} [options.noWarnings=false]
 * Disables all diagnostic warnings in the library (which is ill-advised).
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {function} [options.connect]
 * Global event {@link event:connect connect} handler.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {function} [options.disconnect]
 * Global event {@link event:disconnect disconnect} handler.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {function} [options.query]
 * Global event {@link event:query query} handler.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {function} [options.receive]
 * Global event {@link event:receive receive} handler.
 *
 * @param {function} [options.task]
 * Global event {@link event:task task} handler.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {function} [options.transact]
 * Global event {@link event:transact transact} handler.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {function} [options.error]
 * Global event {@link event:error error} handler.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @param {function} [options.extend]
 * Global event {@link event:extend extend} handler.
 *
 * This property can be set dynamically (before or after initialization).
 *
 * @example
 *
 * var options = {
 *   // Initialization Options
 * };
 *
 * var pgp = require('pg-promise')(options);
 *
 */
function $main(options) {

    if ($npm.utils.isNull(options)) {
        options = {};
    } else {
        if (typeof options !== 'object') {
            throw new TypeError("Invalid initialization options.");
        }

        // list of supported initialization options:
        var validOptions = ['pgFormatting', 'pgNative', 'promiseLib', 'noLocking', 'capSQL', 'noWarnings',
            'connect', 'disconnect', 'query', 'receive', 'task', 'transact', 'error', 'extend'];

        if (!options.noWarnings) {
            for (var prop in options) {
                if (validOptions.indexOf(prop) === -1) {
                    $npm.con.warn("WARNING: Invalid property '%s' in initialization options.\n%s\n", prop, $npm.utils.getLocalStack(3));
                    break;
                }
            }
        }
    }

    var pg = $npm.pg, p = $npm.promise(options.promiseLib);

    var config = {
        version: $npm.package.version,
        promiseLib: p.promiseLib,
        promise: p.promise,
    };

    $npm.utils.addReadProp(config, '$npm', {}, true);

    // Locking properties that cannot be changed later:
    $npm.utils.addReadProp(options, 'promiseLib', options.promiseLib);
    $npm.utils.addReadProp(options, 'pgNative', !!options.pgNative);

    config.options = options;

    // istanbul ignore next:
    // we do not cover code specific to Native Bindings
    if (options.pgNative) {
        pg = $npm.pg.native;
        if ($npm.utils.isNull(pg)) {
            throw new Error("Failed to initialize Native Bindings.");
        }
    }

    var Database = __webpack_require__(109)(config);

    var inst = function (cn, dc) {
        if ($npm.utils.isText(cn) || (cn && typeof cn === 'object')) {
            return new Database(cn, dc, config);
        }
        throw new TypeError("Invalid connection details.");
    };

    $npm.utils.addReadProperties(inst, rootNameSpace);

    /**
     * @member {external:PG} pg
     * @readonly
     * @description
     * Instance of the $[PG] library that's being used, depending on initialization option `pgNative`:
     *  - regular `pg` module instance, without option `pgNative`, or equal to `false` (default)
     *  - `pg` module instance with $[Native Bindings], if option `pgNative` was set.
     *
     * Available as `pgp.pg`, after initializing the library.
     */
    $npm.utils.addReadProp(inst, 'pg', pg);

    /**
     * @member {function} end
     * @readonly
     * @description
     * Terminates pg library (call it when exiting the application).
     *
     * Available as `pgp.end`, after initializing the library.
     */
    $npm.utils.addReadProp(inst, 'end', function () {
        pg.end();
    });

    /**
     * @member {helpers} helpers
     * @readonly
     * @description
     * Namespace for {@link helpers all query-formatting helper functions}.
     *
     * Available as `pgp.helpers`, after initializing the library.
     *
     * @see {@link helpers}.
     */
    $npm.utils.addReadProp(inst, 'helpers', $npm.helpers(config));

    /**
     * @member {external:spex} spex
     * @readonly
     * @description
     * Initialized instance of the $[spex] module, used by the library within tasks and transactions.
     *
     * Available as `pgp.spex`, after initializing the library.
     *
     * @see
     * {@link Task.batch},
     * {@link Task.page},
     * {@link Task.sequence}
     */
    $npm.utils.addReadProp(inst, 'spex', config.$npm.spex);

    config.pgp = inst;
    Object.freeze(config);

    return inst;
}

var rootNameSpace = {

    /**
     * @member {formatting} as
     * @readonly
     * @description
     * Namespace for {@link formatting all query-formatting functions}.
     *
     * Available as `pgp.as`, before and after initializing the library.
     *
     * @see {@link formatting}.
     */
    as: $npm.formatting.as,

    /**
     * @member {external:pg-minify} minify
     * @readonly
     * @description
     * Instance of the $[pg-minify] library that's used.
     *
     * Available as `pgp.minify`, before and after initializing the library.
     */
    minify: $npm.minify,

    /**
     * @member {queryResult} queryResult
     * @readonly
     * @description
     * Query Result Mask enumerator.
     *
     * Available as `pgp.queryResult`, before and after initializing the library.
     */
    queryResult: $npm.result,

    /**
     * @member {PromiseAdapter} PromiseAdapter
     * @readonly
     * @description
     * {@link PromiseAdapter} class.
     *
     * Available as `pgp.PromiseAdapter`, before and after initializing the library.
     */
    PromiseAdapter: $npm.adapter,

    /**
     * @member {ParameterizedQuery} ParameterizedQuery
     * @readonly
     * @description
     * {@link ParameterizedQuery} class.
     *
     * Available as `pgp.ParameterizedQuery`, before and after initializing the library.
     */
    ParameterizedQuery: $npm.types.ParameterizedQuery,

    /**
     * @member {PreparedStatement} PreparedStatement
     * @readonly
     * @description
     * {@link PreparedStatement} class.
     *
     * Available as `pgp.PreparedStatement`, before and after initializing the library.
     */
    PreparedStatement: $npm.types.PreparedStatement,

    /**
     * @member {QueryFile} QueryFile
     * @readonly
     * @description
     * {@link QueryFile} class.
     *
     * Available as `pgp.QueryFile`, before and after initializing the library.
     */
    QueryFile: $npm.queryFile,


    /**
     * @member {errors} errors
     * @readonly
     * @description
     * {@link errors} - namespace for all error types.
     *
     * Available as `pgp.errors`, before and after initializing the library.
     */
    errors: $npm.errors,

    /**
     * @member {utils} utils
     * @readonly
     * @description
     * {@link utils} - namespace for utility functions.
     *
     * Available as `pgp.utils`, before and after initializing the library.
     */
    utils: $npm.pubUtils,

    /**
     * @member {txMode} txMode
     * @readonly
     * @description
     * {@link txMode Transaction Mode} namespace.
     *
     * Available as `pgp.txMode`, before and after initializing the library.
     */
    txMode: $npm.mode
};

$npm.utils.addReadProperties($main, rootNameSpace);

module.exports = $main;

/**
 * @external Promise
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */

/**
 * @external PG
 * @see https://github.com/brianc/node-postgres/blob/master/lib/index.js#L17
 */

/**
 * @external Client
 * @see https://github.com/brianc/node-postgres/blob/master/lib/client.js#L20
 */

/**
 * @external pg-minify
 * @see https://github.com/vitaly-t/pg-minify
 */

/**
 * @external spex
 * @see https://github.com/vitaly-t/spex
 */


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var PromiseAdapter = __webpack_require__(87);

//////////////////////////////////////////
// Parses and validates a promise library;
function parsePromiseLib(pl) {

    var promise;
    if (pl instanceof PromiseAdapter) {
        promise = function (func) {
            return pl.create(func);
        };
        promise.resolve = pl.resolve;
        promise.reject = pl.reject;
        return promise;
    }
    var t = typeof pl;
    if (t === 'function' || t === 'object') {
        var root = typeof pl.Promise === 'function' ? pl.Promise : pl;
        promise = function (func) {
            return new root(func);
        };
        promise.resolve = root.resolve;
        promise.reject = root.reject;
        if (typeof promise.resolve === 'function' && typeof promise.reject === 'function') {
            return promise;
        }
    }

    throw new TypeError("Invalid promise library specified.");
}

function init(promiseLib) {
    var result = {
        promiseLib: promiseLib
    };
    if (promiseLib) {
        result.promise = parsePromiseLib(promiseLib);
    } else {
        result.promise = parsePromiseLib(Promise);
        result.promiseLib = Promise;
    }
    return result;
}

module.exports = init;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    events: __webpack_require__(74),
    utils: __webpack_require__(70)
};

////////////////////////////////////////////
// Streams query data into any destination,
// with the help of pg-query-stream library.
function $stream(ctx, qs, initCB, config) {

    var $p = config.promise;

    // istanbul ignore next:
    // we do not provide code coverage for the Native Bindings specifics
    if (ctx.options.pgNative) {
        return $p.reject(new Error("Streaming doesn't work with Native Bindings."));
    }
    if (!$npm.utils.isObject(qs, ['state', '_reading'])) {
        // stream object wasn't passed in correctly;
        return $p.reject(new TypeError("Invalid or missing stream object."));
    }
    if (qs._reading || qs.state !== 'initialized') {
        // stream object is in the wrong state;
        return $p.reject(new Error("Invalid stream state."));
    }
    if (typeof initCB !== 'function') {
        // parameter `initCB` must be passed as the initialization callback;
        return $p.reject(new TypeError("Invalid or missing stream initialization callback."));
    }
    var error = $npm.events.query(ctx.options, getContext());
    if (error) {
        error = getError(error);
        $npm.events.error(ctx.options, error, getContext());
        return $p.reject(error);
    }
    var stream, fetch, start, nRows = 0;
    try {
        stream = ctx.db.client.query(qs);
        fetch = stream._fetch;
        stream._fetch = function (size, func) {
            fetch.call(stream, size, function (err, rows) {
                if (!err && rows.length) {
                    nRows += rows.length;
                    var context = getContext();
                    if (!error) {
                        error = $npm.events.receive(ctx.options, rows, undefined, context);
                    }
                    if (error) {
                        stream.close();
                    }
                }
                return func(err, rows);
            });
        };
        start = Date.now();
        initCB.call(this, stream); // the stream must be initialized during the call;
    } catch (err) {
        error = err;
    }
    if (error) {
        // error thrown by initCB();
        stream._fetch = fetch;
        error = getError(error);
        $npm.events.error(ctx.options, error, getContext());
        return $p.reject(error);
    }
    return $p(function (resolve, reject) {
        stream.once('end', function () {
            stream._fetch = fetch;
            if (error) {
                onError(error);
            } else {
                resolve({
                    processed: nRows, // total number of rows processed;
                    duration: Date.now() - start // duration, in milliseconds;
                });
            }
        });
        stream.once('error', function (err) {
            stream._fetch = fetch;
            onError(err);
        });
        function onError(e) {
            e = getError(e);
            $npm.events.error(ctx.options, e, getContext());
            reject(e);
        }
    });

    function getError(e) {
        return e instanceof $npm.utils.InternalError ? e.error : e;
    }

    function getContext() {
        var client;
        if (ctx.db) {
            client = ctx.db.client;
        } else {
            error = new Error("Loose request outside an expired connection.");
        }
        return {
            client: client,
            dc: ctx.dc,
            query: qs.text,
            params: qs.values,
            ctx: ctx.ctx
        };
    }

}

module.exports = $stream;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    spex: __webpack_require__(143),
    utils: __webpack_require__(70),
    mode: __webpack_require__(92),
    events: __webpack_require__(74),
    query: __webpack_require__(90),
    async: __webpack_require__(106)
};

/**
 * @interface Task
 * @extends Database
 * @description
 * Extends {@link Database} for an automatic connection session, with methods for executing multiple database queries.
 * The type isn't available directly, it can only be created via methods {@link Database.task} and {@link Database.tx}.
 *
 * When executing more than one request at a time, one should allocate and release the connection only once,
 * while executing all the required queries within the same connection session. More importantly, a transaction
 * can only work within a single connection.
 *
 * This is an interface for tasks/transactions to implement a connection session, during which you can
 * execute multiple queries against the same connection that's released automatically when the task/transaction is finished.
 *
 * @see
 * {@link Task.ctx ctx},
 * {@link Task.batch batch},
 * {@link Task.sequence sequence},
 * {@link Task.page page}
 *
 * @example
 * db.task(function (t) {
 *       // this = t = task protocol context;
 *       // this.ctx = task config + state context;
 *       return t.one("select * from users where id=$1", 123)
 *           .then(function (user) {
 *               return t.any("select * from events where login=$1", user.name);
 *           });
 *   })
 * .then(function (events) {
 *       // success;
 *   })
 * .catch(function (error) {
 *       // error;
 *   });
 *
 */
function Task(ctx, tag, isTX, config) {

    /**
     * @member {object} Task.ctx
     * @description
     * Task/Transaction Context object - contains individual properties for each task/transaction.
     *
     * ```js
     * db.task(t => {
     *    // t.ctx = task context object
     * });
     * ```
     *
     * ```js
     * db.tx(t => {
     *    // t.ctx = transaction context object
     * });
     * ```
     *
     * Properties `context`, `dc`, `isTX`, `tag`, `start` and `isFresh` are set before the callback,
     * while properties `finish`, `success` and `result` are set after the callback has returned.
     *
     *
     * @property {object} context
     * If the operation was invoked with an object context - `task.call(obj,...)` or
     * `tx.call(obj,...)`, this property is set with the context object that was passed in.
     *
     * @property {} dc
     * _Database Context_ that was used when creating the database object. See {@link Database}.
     *
     * @property {boolean} isTX
     * Indicates whether this task represents a transaction.
     *
     * @property {} tag
     * Tag value as it was passed into the task. See methods {@link Database.task task} and {@link Database.tx tx}.
     *
     * @property {date} start
     * Date/Time of when this task or transaction started the execution.
     *
     * @property {boolean} isFresh
     * Indicates when a fresh physical connection is being used.
     *
     * @property {date} finish
     * Once the operation has finished, this property is set to the Data/Time of when it happened.
     *
     * @property {boolean} success
     * Once the operation has finished, this property indicates whether it was successful.
     *
     * @property {} result
     * Once the operation has finished, this property contains the result, depending on property `success`:
     * - data resolved by the operation, if `success` = `true`
     * - error / rejection reason, if `success` = `false`
     *
     * @see event {@link event:query query}
     */
    this.ctx = ctx.ctx = {}; // task context object;

    $npm.utils.addReadProp(this.ctx, 'isTX', isTX);

    if ('context' in ctx) {
        $npm.utils.addReadProp(this.ctx, 'context', ctx.context);
    }

    $npm.utils.addReadProp(this.ctx, 'tag', tag);
    $npm.utils.addReadProp(this.ctx, 'dc', ctx.dc);

    // generic query method;
    this.query = function (query, values, qrm) {
        if (!ctx.db) {
            throw new Error("Unexpected call outside of " + (isTX ? "transaction." : "task."));
        }
        return config.$npm.query.call(this, ctx, query, values, qrm);
    };

    /**
     * @method Task.batch
     * @description
     * **Alternative Syntax:** `batch(values, {cb})` &#8658; `Promise`
     *
     * Settles a predefined array of mixed values by redirecting to method $[spex.batch].
     *
     * For complete method documentation see $[spex.batch].
     * @param {array} values
     * @param {function} [cb]
     * @returns {external:Promise}
     */
    this.batch = function (values, cb) {
        return config.$npm.spex.batch.call(this, values, cb);
    };

    /**
     * @method Task.page
     * @description
     * **Alternative Syntax:** `page(source, {dest, limit})` &#8658; `Promise`
     *
     * Resolves a dynamic sequence of arrays/pages with mixed values, by redirecting to method $[spex.page].
     *
     * For complete method documentation see $[spex.page].
     * @param {function} source
     * @param {function} [dest]
     * @param {number} [limit=0]
     * @returns {external:Promise}
     */
    this.page = function (source, dest, limit) {
        return config.$npm.spex.page.call(this, source, dest, limit);
    };

    /**
     * @method Task.sequence
     * @description
     * **Alternative Syntax:** `sequence(source, {dest, limit, track})` &#8658; `Promise`
     *
     * Resolves a dynamic sequence of mixed values by redirecting to method $[spex.sequence].
     *
     * For complete method documentation see $[spex.sequence].
     * @param {function} source
     * @param {function} [dest]
     * @param {number} [limit=0]
     * @param {boolean} [track=false]
     * @returns {external:Promise}
     */
    this.sequence = function (source, dest, limit, track) {
        return config.$npm.spex.sequence.call(this, source, dest, limit, track);
    };

}

//////////////////////////
// Executes a task;
Task.exec = function (ctx, obj, isTX, config) {

    var $p = config.promise;

    // callback invocation helper;
    function callback() {
        var result, cb = ctx.cb;
        if (cb.constructor.name === 'GeneratorFunction') {
            cb = config.$npm.async(cb);
        }
        try {
            result = cb.call(obj, obj); // invoking the callback function;
        } catch (err) {
            $npm.events.error(ctx.options, err, {
                client: ctx.db.client,
                dc: ctx.dc,
                ctx: ctx.ctx
            });
            return $p.reject(err); // reject with the error;
        }
        if (result && typeof result.then === 'function') {
            return result; // result is a valid promise object;
        }
        return $p.resolve(result);
    }

    // updates the task context and notifies the client;
    function update(start, success, result) {
        var c = ctx.ctx;
        if (start) {
            $npm.utils.addReadProp(c, 'start', new Date());
        } else {
            c.finish = new Date();
            c.success = success;
            c.result = result;
            $npm.utils.lock(c, true);
        }
        (isTX ? $npm.events.transact : $npm.events.task)(ctx.options, {
            client: ctx.db.client,
            dc: ctx.dc,
            ctx: c
        });
    }

    var cbData, cbReason, success,
        spName, // Save-Point Name;
        capSQL = ctx.options.capSQL; // capitalize sql;

    update(true);

    if (isTX) {
        // executing a transaction;
        spName = "level_" + ctx.txLevel;
        return begin()
            .then(function () {
                    return callback()
                        .then(function (data) {
                            cbData = data; // save callback data;
                            success = true;
                            return commit();
                        }, function (reason) {
                            cbReason = reason; // save callback failure reason;
                            return rollback();
                        })
                        .then(function () {
                                if (success) {
                                    update(false, true, cbData);
                                    return cbData;
                                } else {
                                    update(false, false, cbReason);
                                    return $p.reject(cbReason);
                                }
                            },
                            // istanbul ignore next: either `commit` or `rollback` has failed, which is
                            // impossible to replicate in a test environment, so skipping from the test;
                            function (reason) {
                                update(false, false, reason);
                                return $p.reject(reason);
                            });
                },
                // istanbul ignore next: `begin` has failed, which is impossible
                // to replicate in a test environment, so skipping from the test;
                function (reason) {
                    update(false, false, reason);
                    return $p.reject(reason);
                });
    }

    function begin() {
        if (!ctx.txLevel && ctx.cb.txMode instanceof $npm.mode.TransactionMode) {
            return exec(ctx.cb.txMode.begin(capSQL), 'savepoint');
        }
        return exec('begin', 'savepoint');
    }

    function commit() {
        return exec('commit', 'release savepoint');
    }

    function rollback() {
        return exec('rollback', 'rollback to savepoint');
    }

    function exec(top, nested) {
        if (ctx.txLevel) {
            return obj.none((capSQL ? nested.toUpperCase() : nested) + ' ' + spName);
        }
        return obj.none(capSQL ? top.toUpperCase() : top);
    }

    // executing a task;
    return callback()
        .then(function (data) {
            update(false, true, data);
            return data;
        })
        .catch(function (error) {
            update(false, false, error);
            return $p.reject(error);
        });

};

module.exports = function (config) {
    var npm = config.$npm;

    // istanbul ignore next:
    // we keep 'npm.query' initialization here, even though it is always
    // pre-initialized by the 'database' module, for integrity purpose. 
    npm.query = npm.query || $npm.query(config);

    npm.async = npm.async || $npm.async(config);
    npm.spex = npm.spex || $npm.spex(config.promiseLib);
    return Task;
};


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70),
    errors: __webpack_require__(79),
    QueryFile: __webpack_require__(76)
};

/**
 * @constructor ParameterizedQuery
 * @description
 * **Alternative Syntax:** `ParameterizedQuery({text, values, ...})` &#8658; {@link ParameterizedQuery}
 *
 * Constructs a new {@link ParameterizedQuery} object.
 *
 * The alternative syntax supports advanced properties {@link ParameterizedQuery#binary binary} and {@link ParameterizedQuery#rowMode rowMode},
 * which are passed into $[pg], but not used by the class.
 *
 * All properties can also be set after the object's construction.
 *
 * This type extends the basic `{text, values}` object, by replacing it, i.e. when the basic object is used
 * with a query method, a new {@link ParameterizedQuery} object is created implicitly in its place.
 *
 * The type can be used in place of the `query` parameter, with any query method directly. And it never throws any error,
 * leaving it for query methods to reject with {@link errors.ParameterizedQueryError ParameterizedQueryError}.
 *
 * The type is available from the library's root: `pgp.ParameterizedQuery`.
 *
 * @param {string|QueryFile} text
 * A non-empty query string or a {@link QueryFile} object.
 *
 * Only the basic variables (`$1`, `$2`, etc) can be used in the query, because _Parameterized Queries_ are formatted by the database server.
 *
 * @param {array} [values]
 * Query formatting values. When it is not an `Array` and not `null`/`undefined`, it is automatically wrapped into an array.
 *
 * @returns {ParameterizedQuery}
 *
 * @see
 * {@link errors.ParameterizedQueryError ParameterizedQueryError}
 *
 * @example
 *
 * var PQ = require('pg-promise').ParameterizedQuery;
 *
 * // Creating a complete Parameterized Query with parameters:
 * var findUser = new PQ('SELECT * FROM Users WHERE id = $1', [123]);
 *
 * db.one(findUser)
 *     .then(user=> {
 *         // user found;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 *
 * @example
 *
 * var PQ = require('pg-promise').ParameterizedQuery;
 *
 * // Creating a reusable Parameterized Query without values:
 * var addUser = new PQ('INSERT INTO Users(name, age) VALUES($1, $2)');
 *
 * // setting values explicitly:
 * addUser.values = ['John', 30];
 *
 * db.none(addUser)
 *     .then(()=> {
 *         // user added;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 *
 * // setting values implicitly, by passing them into the query method:
 * db.none(addUser, ['Mike', 25])
 *     .then(()=> {
 *         // user added;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 *
 */
function ParameterizedQuery(text, values) {
    if (!(this instanceof ParameterizedQuery)) {
        return new ParameterizedQuery(text, values);
    }

    var currentError, PQ = {}, changed = true, state = {
        text: text,
        binary: undefined,
        rowMode: undefined
    };

    function setValues(v) {
        if (Array.isArray(v)) {
            if (v.length) {
                PQ.values = v;
            } else {
                delete PQ.values;
            }
        } else {
            if ($npm.utils.isNull(v)) {
                delete PQ.values;
            } else {
                PQ.values = [v];
            }
        }
    }

    setValues(values);

    /**
     * @name ParameterizedQuery#text
     * @type {string|QueryFile}
     * @description
     * A non-empty query string or a {@link QueryFile} object.
     */
    Object.defineProperty(this, 'text', {
        get: function () {
            return state.text;
        },
        set: function (value) {
            if (value !== state.text) {
                state.text = value;
                changed = true;
            }
        }
    });

    /**
     * @name ParameterizedQuery#values
     * @type {array}
     * @description
     * Query formatting parameters, depending on the type:
     *
     * - `null` / `undefined` means the query has no formatting parameters
     * - `Array` - it is an array of formatting parameters
     * - None of the above, means it is a single formatting value, which
     *   is then automatically wrapped into an array
     */
    Object.defineProperty(this, 'values', {
        get: function () {
            return PQ.values;
        },
        set: function (value) {
            setValues(value);
        }
    });

    /**
     * @name ParameterizedQuery#binary
     * @type {boolean}
     * @default undefined
     * @description
     * Activates binary result mode. The default is the text mode.
     *
     * @see {@link http://www.postgresql.org/docs/devel/static/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY Extended Query}
     */
    Object.defineProperty(this, 'binary', {
        get: function () {
            return state.binary;
        },
        set: function (value) {
            if (value !== state.binary) {
                state.binary = value;
                changed = true;
            }
        }
    });

    /**
     * @name ParameterizedQuery#rowMode
     * @type {string}
     * @default undefined
     * @description
     * Changes the way data arrives to the client, with only one value supported by $[pg]:
     *  - `rowMode = 'array'` will make all data rows arrive as arrays of values.
     *    By default, rows arrive as objects.
     */
    Object.defineProperty(this, 'rowMode', {
        get: function () {
            return state.rowMode;
        },
        set: function (value) {
            if (value !== state.rowMode) {
                state.rowMode = value;
                changed = true;
            }
        }
    });

    /**
     * @name ParameterizedQuery#error
     * @type {errors.ParameterizedQueryError}
     * @default undefined
     * @readonly
     * @description
     * When in an error state, it is set to a {@link errors.ParameterizedQueryError ParameterizedQueryError} object. Otherwise, it is `undefined`.
     *
     * This property is primarily for internal use by the library.
     */
    Object.defineProperty(this, 'error', {
        get: function () {
            return currentError;
        }
    });

    if ($npm.utils.isObject(text, ['text'])) {
        state.text = text.text;
        state.binary = text.binary;
        state.rowMode = text.rowMode;
        setValues(text.values);
    }

    /**
     * @method ParameterizedQuery.parse
     * @description
     * Parses the current object and returns a simple `{text, values}`, if successful,
     * or else it returns a {@link errors.ParameterizedQueryError ParameterizedQueryError} object.
     *
     * This method is primarily for internal use by the library.
     *
     * @returns {{text, values}|errors.ParameterizedQueryError}
     */
    this.parse = function () {

        var qf = state.text instanceof $npm.QueryFile ? state.text : null;

        if (!changed && !qf) {
            return PQ;
        }

        var errors = [], values = PQ.values;
        PQ = {
            name: state.name
        };
        changed = true;
        currentError = undefined;

        if (qf) {
            qf.prepare();
            if (qf.error) {
                PQ.text = state.text;
                errors.push(qf.error);
            } else {
                PQ.text = qf.query;
            }
        } else {
            PQ.text = state.text;
        }
        if (!$npm.utils.isText(PQ.text)) {
            errors.push("Property 'text' must be a non-empty text string.");
        }

        if (!$npm.utils.isNull(values)) {
            PQ.values = values;
        }

        if (state.binary !== undefined) {
            PQ.binary = state.binary;
        }

        if (state.rowMode !== undefined) {
            PQ.rowMode = state.rowMode;
        }

        if (errors.length) {
            return currentError = new $npm.errors.ParameterizedQueryError(errors[0], PQ);
        }

        changed = false;

        return PQ;
    };
}

/**
 * @method ParameterizedQuery.toString
 * @description
 * Creates a well-formatted multi-line string that represents the object's current state.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
ParameterizedQuery.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap = $npm.utils.messageGap(level + 1);
    var pq = this.parse();
    var lines = [
        'ParameterizedQuery {'
    ];
    if ($npm.utils.isText(pq.text)) {
        lines.push(gap + 'text: "' + pq.text + '"');
    }
    if (this.values !== undefined) {
        lines.push(gap + 'values: ' + JSON.stringify(this.values));
    }
    if (this.binary !== undefined) {
        lines.push(gap + 'binary: ' + JSON.stringify(this.binary));
    }
    if (this.rowMode !== undefined) {
        lines.push(gap + 'rowMode: ' + JSON.stringify(this.rowMode));
    }
    if (this.error !== undefined) {
        lines.push(gap + 'error: ' + this.error.toString(level + 1));
    }
    lines.push($npm.utils.messageGap(level) + '}');
    return lines.join($npm.os.EOL);
};

module.exports = ParameterizedQuery;


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    os: __webpack_require__(71),
    utils: __webpack_require__(70),
    errors: __webpack_require__(79),
    QueryFile: __webpack_require__(76)
};

/**
 * @constructor PreparedStatement
 * @description
 * **Alternative Syntax:** `PreparedStatement({name, text, values, ...})` &#8658; {@link PreparedStatement}
 *
 * Constructs a new $[Prepared Statement] object.
 *
 * The alternative syntax supports advanced properties {@link PreparedStatement#binary binary}, {@link PreparedStatement#rowMode rowMode}
 * and {@link PreparedStatement#rows rows}, which are passed into $[pg], but not used by the class.
 *
 * All properties can also be set after the object's construction.
 *
 * This type extends the basic `{name, text, values}` object, by replacing it, i.e. when the basic object is used
 * with a query method, a new {@link PreparedStatement} object is created implicitly in its place.
 *
 * The type can be used in place of the `query` parameter, with any query method directly. And it never throws any error,
 * leaving it for query methods to reject with {@link errors.PreparedStatementError PreparedStatementError}.
 *
 * The type is available from the library's root: `pgp.PreparedStatement`.
 *
 * @param {string} name
 * An arbitrary name given to this particular prepared statement. It must be unique within a single session and is
 * subsequently used to execute or deallocate a previously prepared statement.
 *
 * @param {string|QueryFile} text
 * A non-empty query string or a {@link QueryFile} object.
 *
 * Only the basic variables (`$1`, `$2`, etc) can be used in the query, because $[Prepared Statements] are formatted by the database server.
 *
 * @param {array} [values]
 * Query formatting values. When it is not an `Array` and not `null`/`undefined`, it is automatically wrapped into an array.
 *
 * @returns {PreparedStatement}
 *
 * @see
 * {@link errors.PreparedStatementError PreparedStatementError},
 * {@link http://www.postgresql.org/docs/9.5/static/sql-prepare.html PostgreSQL Prepared Statements}
 *
 * @example
 *
 * var PS = require('pg-promise').PreparedStatement;
 *
 * // Creating a complete Prepared Statement with parameters:
 * var findUser = new PS('find-user', 'SELECT * FROM Users WHERE id = $1', [123]);
 *
 * db.one(findUser)
 *     .then(user=> {
 *         // user found;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 *
 * @example
 *
 * var PS = require('pg-promise').PreparedStatement;
 *
 * // Creating a reusable Prepared Statement without values:
 * var addUser = new PS('add-user', 'INSERT INTO Users(name, age) VALUES($1, $2)');
 *
 * // setting values explicitly:
 * addUser.values = ['John', 30];
 *
 * db.none(addUser)
 *     .then(()=> {
 *         // user added;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 *
 * // setting values implicitly, by passing them into the query method:
 * db.none(addUser, ['Mike', 25])
 *     .then(()=> {
 *         // user added;
 *     })
 *     .catch(error=> {
 *         // error;
 *     });
 */
function PreparedStatement(name, text, values) {
    if (!(this instanceof PreparedStatement)) {
        return new PreparedStatement(name, text, values);
    }

    var currentError, PS = {}, changed = true, state = {
        name: name,
        text: text,
        binary: undefined,
        rowMode: undefined,
        rows: undefined
    };

    function setValues(v) {
        if (Array.isArray(v)) {
            if (v.length) {
                PS.values = v;
            } else {
                delete PS.values;
            }
        } else {
            if ($npm.utils.isNull(v)) {
                delete PS.values;
            } else {
                PS.values = [v];
            }
        }
    }

    setValues(values);

    /**
     * @name PreparedStatement#name
     * @type {string}
     * @description
     * An arbitrary name given to this particular prepared statement. It must be unique within a single session and is
     * subsequently used to execute or deallocate a previously prepared statement.
     */
    Object.defineProperty(this, 'name', {
        get: function () {
            return state.name;
        },
        set: function (value) {
            if (value !== state.name) {
                state.name = value;
                changed = true;
            }
        }
    });

    /**
     * @name PreparedStatement#text
     * @type {string|QueryFile}
     * @description
     * A non-empty query string or a {@link QueryFile} object.
     *
     * Changing this property for the same {@link PreparedStatement#name name} will have no effect, because queries
     * for Prepared Statements are cached, with {@link PreparedStatement#name name} being the cache key.
     */
    Object.defineProperty(this, 'text', {
        get: function () {
            return state.text;
        },
        set: function (value) {
            if (value !== state.text) {
                state.text = value;
                changed = true;
            }
        }
    });

    /**
     * @name PreparedStatement#values
     * @type {array}
     * @description
     * Query formatting parameters, depending on the type:
     *
     * - `null` / `undefined` means the query has no formatting parameters
     * - `Array` - it is an array of formatting parameters
     * - None of the above, means it is a single formatting value, which
     *   is then automatically wrapped into an array
     */
    Object.defineProperty(this, 'values', {
        get: function () {
            return PS.values;
        },
        set: function (value) {
            setValues(value);
        }
    });

    /**
     * @name PreparedStatement#binary
     * @type {boolean}
     * @default undefined
     * @description
     * Activates binary result mode. The default is the text mode.
     *
     * @see {@link http://www.postgresql.org/docs/devel/static/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY Extended Query}
     */
    Object.defineProperty(this, 'binary', {
        get: function () {
            return state.binary;
        },
        set: function (value) {
            if (value !== state.binary) {
                state.binary = value;
                changed = true;
            }
        }
    });

    /**
     * @name PreparedStatement#rowMode
     * @type {string}
     * @default undefined
     * @description
     * Changes the way data arrives to the client, with only one value supported by $[pg]:
     *  - `rowMode = 'array'` will make all data rows arrive as arrays of values.
     *    By default, rows arrive as objects.
     */
    Object.defineProperty(this, 'rowMode', {
        get: function () {
            return state.rowMode;
        },
        set: function (value) {
            if (value !== state.rowMode) {
                state.rowMode = value;
                changed = true;
            }
        }
    });

    /**
     * @name PreparedStatement#rows
     * @type {number}
     * @description
     * Number of rows to return at a time from a Prepared Statement's portal.
     * The default is 0, which means that all rows must be returned at once.
     */
    Object.defineProperty(this, 'rows', {
        get: function () {
            return state.rows;
        },
        set: function (value) {
            if (value !== state.rows) {
                state.rows = value;
                changed = true;
            }
        }
    });

    /**
     * @name PreparedStatement#error
     * @type {errors.PreparedStatementError}
     * @default undefined
     * @description
     * When in an error state, it is set to a {@link errors.PreparedStatementError PreparedStatementError} object. Otherwise, it is `undefined`.
     *
     * This property is primarily for internal use by the library.
     */
    Object.defineProperty(this, 'error', {
        get: function () {
            return currentError;
        }
    });

    if ($npm.utils.isObject(name, ['name'])) {
        state.name = name.name;
        state.text = name.text;
        state.binary = name.binary;
        state.rowMode = name.rowMode;
        state.rows = name.rows;
        setValues(name.values);
    }

    /**
     * @method PreparedStatement.parse
     * @description
     * Parses the current object and returns a simple `{name, text, values}`, if successful,
     * or else it returns a {@link errors.PreparedStatementError PreparedStatementError} object.
     *
     * This method is primarily for internal use by the library.
     *
     * @returns {{name, text, values}|errors.PreparedStatementError}
     */
    this.parse = function () {

        var qf = state.text instanceof $npm.QueryFile ? state.text : null;

        if (!changed && !qf) {
            return PS;
        }

        var errors = [], values = PS.values;
        PS = {
            name: state.name
        };
        changed = true;
        currentError = undefined;

        if (!$npm.utils.isText(PS.name)) {
            errors.push("Property 'name' must be a non-empty text string.");
        }

        if (qf) {
            qf.prepare();
            if (qf.error) {
                PS.text = state.text;
                errors.push(qf.error);
            } else {
                PS.text = qf.query;
            }
        } else {
            PS.text = state.text;
        }
        if (!$npm.utils.isText(PS.text)) {
            errors.push("Property 'text' must be a non-empty text string.");
        }

        if (!$npm.utils.isNull(values)) {
            PS.values = values;
        }

        if (state.binary !== undefined) {
            PS.binary = state.binary;
        }

        if (state.rowMode !== undefined) {
            PS.rowMode = state.rowMode;
        }

        if (state.rows !== undefined) {
            PS.rows = state.rows;
        }

        if (errors.length) {
            return currentError = new $npm.errors.PreparedStatementError(errors[0], PS);
        }

        changed = false;

        return PS;
    };
}

/**
 * @method PreparedStatement.toString
 * @description
 * Creates a well-formatted multi-line string that represents the object's current state.
 *
 * It is called automatically when writing the object into the console.
 *
 * @param {number} [level=0]
 * Nested output level, to provide visual offset.
 *
 * @returns {string}
 */
PreparedStatement.prototype.toString = function (level) {
    level = level > 0 ? parseInt(level) : 0;
    var gap = $npm.utils.messageGap(level + 1);
    var ps = this.parse();
    var lines = [
        'PreparedStatement {',
        gap + 'name: ' + JSON.stringify(this.name)
    ];
    if ($npm.utils.isText(ps.text)) {
        lines.push(gap + 'text: "' + ps.text + '"');
    }
    if (this.values !== undefined) {
        lines.push(gap + 'values: ' + JSON.stringify(this.values));
    }
    if (this.binary !== undefined) {
        lines.push(gap + 'binary: ' + JSON.stringify(this.binary));
    }
    if (this.rowMode !== undefined) {
        lines.push(gap + 'rowMode: ' + JSON.stringify(this.rowMode));
    }
    if (this.rows !== undefined) {
        lines.push(gap + 'rows: ' + JSON.stringify(this.rows));
    }
    if (this.error) {
        lines.push(gap + 'error: ' + this.error.toString(level + 1));
    }
    lines.push($npm.utils.messageGap(level) + '}');
    return lines.join($npm.os.EOL);
};

module.exports = PreparedStatement;



/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    fs: __webpack_require__(6),
    path: __webpack_require__(2),
    utils: __webpack_require__(70),
    package: __webpack_require__(99)
};

var EOL = __webpack_require__(71).EOL;

/**
 * @method utils.camelize
 * @description
 * Camelizes a text string.
 *
 * Case-changing characters include:
 * - _hyphen_
 * - _underscore_
 * - _period_
 * - _space_
 *
 * @param {string} text
 * Input text string.
 *
 * @returns {string}
 * Camelized text string.
 *
 * @see
 * {@link utils.camelizeVar camelizeVar}
 *
 */
function camelize(text) {
    text = text.replace(/[\-_\s\.]+(.)?/g, function (match, chr) {
        return chr ? chr.toUpperCase() : '';
    });
    return text.substr(0, 1).toLowerCase() + text.substr(1);
}

/**
 * @method utils.camelizeVar
 * @description
 * Camelizes a text string, while making it compliant with JavaScript variable names:
 * - contains symbols `a-z`, `A-Z`, `0-9`, `_` and `$`
 * - cannot have leading digits
 *
 * First, it removes all symbols that do not meet the above criteria, except for _hyphen_, _period_ and _space_,
 * and then it forwards into {@link utils.camelize camelize}.
 *
 * @param {string} text
 * Input text string.
 *
 * If it doesn't contain any symbols to make up a valid variable name, the result will be an empty string.
 *
 * @returns {string}
 * Camelized text string that can be used as an open property name.
 *
 * @see
 * {@link utils.camelize camelize}
 *
 */
function camelizeVar(text) {
    text = text.replace(/[^a-zA-Z0-9\$_\-\s\.]/g, '').replace(/^[0-9_\-\s\.]+/, '');
    return camelize(text);
}

function _enumSql(dir, options, cb, namePath) {
    var tree = {};
    $npm.fs.readdirSync(dir).forEach(function (file) {
        var stat, fullPath = $npm.path.join(dir, file);
        try {
            stat = $npm.fs.statSync(fullPath);
        } catch (e) {
            // while it is very easy to test manually, it is very difficult to test for
            // access-denied errors automatically; therefore excluding from the coverage:
            // istanbul ignore next
            if (options.ignoreErrors) {
                return; // on to the next file/folder;
            } else {
                throw e;
            }
        }
        if (stat.isDirectory()) {
            if (options.recursive) {
                var dirName = camelizeVar(file);
                var np = namePath ? (namePath + '.' + dirName) : dirName;
                var t = _enumSql(fullPath, options, cb, np);
                if (Object.keys(t).length) {
                    if (!dirName.length || dirName in tree) {
                        if (!options.ignoreErrors) {
                            throw new Error("Empty or duplicate camelized folder name: " + fullPath);
                        }
                    }
                    tree[dirName] = t;
                }
            }
        } else {
            if ($npm.path.extname(file).toLowerCase() === '.sql') {
                var name = camelizeVar(file.replace(/\.[^/.]+$/, ''));
                if (!name.length || name in tree) {
                    if (!options.ignoreErrors) {
                        throw new Error("Empty or duplicate camelized file name: " + fullPath);
                    }
                }
                tree[name] = fullPath;
                if (cb) {
                    var result = cb(fullPath, name, namePath ? (namePath + '.' + name) : name);
                    if (result !== undefined) {
                        tree[name] = result;
                    }
                }
            }
        }
    });
    return tree;
}

/**
 * @method utils.enumSql
 * @description
 * Synchronously enumerates all SQL files (within a given directory) into a camelized SQL tree.
 *
 * All property names within the tree are camelized via {@link utils.camelizeVar camelizeVar},
 * so they can be used in the code directly, as open property names.
 *
 * @param {string} dir
 * Directory path where SQL files are located, either absolute or relative to the current directory.
 *
 * SQL files are identified by using `.sql` extension (case-insensitive).
 *
 * @param {object} [options]
 * Search options.
 *
 * @param {boolean} [options.recursive=false]
 * Include sub-directories into the search.
 *
 * Sub-directories without SQL files will be skipped from the result.
 *
 * @param {boolean} [options.ignoreErrors=false]
 * Ignore the following types of errors:
 * - access errors, when there is no read access to a file or folder
 * - empty or duplicate camelized property names
 *
 * This flag does not affect errors related to invalid input parameters, or if you pass in a
 * non-existing directory.
 *
 * @param {function} [cb]
 * A callback function that takes three arguments:
 * - `file` - SQL file path, relative or absolute, according to how you specified the search directory
 * - `name` - name of the property that represents the SQL file
 * - `path` - property resolution path (full property name)
 *
 * If the function returns anything other than `undefined`, it overrides the corresponding property value in the tree.
 *
 * @returns {object}
 * Camelized SQL tree object, with each value being an SQL file path (unless changed via the callback).
 *
 * @see
 * {@link utils.objectToCode objectToCode},
 * {@link utils.buildSqlModule buildSqlModule}
 *
 * @example
 *
 * // simple SQL tree generation for further processing:
 * var tree = pgp.utils.enumSql('../sql', {recursive: true});
 *
 * @example
 *
 * // generating an SQL tree for dynamic use of names:
 * var sql = pgp.utils.enumSql(__dirname, {recursive: true}, file=> {
 *     return new pgp.QueryFile(file, {minify: true});
 * });
 *
 * @example
 *
 * var path = require('path');
 *
 * // replacing each relative path in the tree with a full one:
 * var tree = pgp.utils.enumSql('../sql', {recursive: true}, file=> {
 *     return path.join(__dirname, file);
 * });
 *
 */
function enumSql(dir, options, cb) {
    if (!$npm.utils.isText(dir)) {
        throw new TypeError("Parameter 'dir' must be a non-empty text string.");
    }
    if (!options || typeof options !== 'object') {
        options = {};
    }
    cb = (typeof cb === 'function') ? cb : null;
    return _enumSql(dir, options, cb, '');
}

/**
 *
 * @method utils.objectToCode
 * @description
 * Translates an object tree into a well-formatted JSON code string.
 *
 * @param {object} obj
 * Source tree object.
 *
 * @param {function} [cb]
 * A callback function to override property values for the code.
 *
 * It takes three arguments:
 *
 * - `value` - property value
 * - `name` - property name
 * - `obj` - current object (which contains the property)
 *
 * The returned value is used as is for the property value in the generated code.
 *
 * @returns {string}
 *
 * @see
 * {@link utils.enumSql enumSql},
 * {@link utils.buildSqlModule buildSqlModule}
 *
 * @example
 *
 * // Generating code for a simple object
 *
 * var tree = {one: 1, two: {item: 'abc'}};
 *
 * var code = pgp.utils.objectToCode(tree);
 *
 * console.log(code);
 * //=>
 * // {
 * //     one: 1,
 * //     two: {
 * //         item: "abc"
 * //     }
 * // }
 *
 * @example
 *
 * // Generating a Node.js module with an SQL tree
 *
 * var fs = require('fs');
 * var EOL = require('os').EOL;
 *
 * // generating an SQL tree from the folder:
 * var tree = pgp.utils.enumSql('./sql', {recursive: true});
 *
 * // generating the module's code:
 * var code = "var load = require('./loadSql');" + EOL + EOL + "module.exports = " +
 *         pgp.utils.objectToCode(tree, function (value) {
 *             return 'load(' + JSON.stringify(value) + ')';
 *         }) + ';';
 *
 * // saving the module:
 * fs.writeFileSync('sql.js', code);
 *
 * @example
 *
 * // generated code example (file sql.js)
 *
 * var load = require('./loadSql');
 *
 * module.exports = {
 *     events: {
 *         add: load("../sql/events/add.sql"),
 *         delete: load("../sql/events/delete.sql"),
 *         find: load("../sql/events/find.sql"),
 *         update: load("../sql/events/update.sql")
 *     },
 *     products: {
 *         add: load("../sql/products/add.sql"),
 *         delete: load("../sql/products/delete.sql"),
 *         find: load("../sql/products/find.sql"),
 *         update: load("../sql/products/update.sql")
 *     },
 *     users: {
 *         add: load("../sql/users/add.sql"),
 *         delete: load("../sql/users/delete.sql"),
 *         find: load("../sql/users/find.sql"),
 *         update: load("../sql/users/update.sql")
 *     },
 *     create: load("../sql/create.sql"),
 *     init: load("../sql/init.sql"),
 *     drop: load("../sql/drop.sql")
 *};
 *
 * @example
 *
 * // loadSql.js module example
 *
 * var QueryFile = require('pg-promise').QueryFile;
 *
 * module.exports = function(file) {
 *     return new QueryFile(file, {minify: true});
 * };
 *
 */
function objectToCode(obj, cb) {

    if (!obj || typeof obj !== 'object') {
        throw new TypeError("Parameter 'obj' must be a non-null object.");
    }

    cb = (typeof cb === 'function') ? cb : null;

    return '{' + generate(obj, 1) + EOL + '}';

    function generate(obj, level) {
        var code = '', gap = $npm.utils.messageGap(level);
        var idx = 0;
        for (var prop in obj) {
            var value = obj[prop];
            if (idx) {
                code += ',';
            }
            if (value && typeof value === 'object') {
                code += EOL + gap + prop + ': {';
                code += generate(value, level + 1);
                code += EOL + gap + '}';
            } else {
                code += EOL + gap + prop + ': ';
                if (cb) {
                    code += cb(value, prop, obj);
                } else {
                    code += JSON.stringify(value);
                }
            }
            idx++;
        }
        return code;
    }
}

/**
 * @method utils.buildSqlModule
 * @description
 * Synchronously generates a Node.js module with a camelized SQL tree, based on a configuration object that has the format shown below.
 *
 * This method is normally to be used on a grunt/gulp watch that triggers when the file structure changes in your SQL directory,
 * although it can be invoked manually as well.
 *
 * ```js
 * {
 *    // Required Properties:
 *    
 *    "dir" // {string}: relative or absolute directory where SQL files are located (see API for method enumSql, parameter `dir`)
 *
 *    // Optional Properties:
 *    
 *    "recursive" // {boolean}: search for sql files recursively (see API for method enumSql, option `recursive`)
 *
 *    "ignoreErrors" // {boolean}: ignore common errors (see API for method enumSql, option `ignoreErrors`)
 *
 *    "output" // {string}: relative or absolute destination file path; when not specified, no file is created,
 *             // but you still can use the code string that's always returned by the method.
 *     
 *    "module": {
 *        "path" // {string}: relative path to a module exporting a function which takes a file path
 *               // and returns a proper value (typically, a new QueryFile object); by default, it uses `./loadSql`.
 *
 *        "name" // {string}: local variable name for the SQL-loading module; by default, it uses `load`.
 *    }
 * }
 * ```
 *
 * @param {object|string} [config]
 * Configuration parameter for generating the code.
 *
 * - When it is a non-null object, it is assumed to be a configuration object (see the format above).
 * - When it is a text string - it is the relative path to either a JSON file that contains the configuration object,
 *   or a Node.js module that exports one. The path is relative to the application's entry point file.
 * - When `config` isn't specified, the method will try to locate the default `sql-config.json` file in the directory of your
 *   application's entry point file, and if not found - throw {@link external:Error Error} = `Default SQL configuration file not found`.
 *
 * @returns {string}
 * Generated code.
 *
 * @see
 * {@link utils.enumSql enumSql},
 * {@link utils.objectToCode objectToCode}
 *
 * @example
 *
 * // generate SQL module automatically, from sql-config.json in the module's start-up folder:
 *
 * pgp.utils.buildSqlModule();
 *
 * // see generated file below:
 *
 * @example
 *
 * /////////////////////////////////////////////////////////////////////////
 * // This file was automatically generated by pg-promise v.4.3.8
 * //
 * // Generated on: 6/2/2016, at 2:15:23 PM
 * // Total files: 15
 * //
 * // API: http://vitaly-t.github.io/pg-promise/utils.html#.buildSqlModule
 * /////////////////////////////////////////////////////////////////////////
 *
 * var load = require('./loadSql');
 *
 * module.exports = {
 *     events: {
 *         add: load("../sql/events/add.sql"),
 *         delete: load("../sql/events/delete.sql"),
 *         find: load("../sql/events/find.sql"),
 *         update: load("../sql/events/update.sql")
 *     },
 *     products: {
 *         add: load("../sql/products/add.sql"),
 *         delete: load("../sql/products/delete.sql"),
 *         find: load("../sql/products/find.sql"),
 *         update: load("../sql/products/update.sql")
 *     },
 *     users: {
 *         add: load("../sql/users/add.sql"),
 *         delete: load("../sql/users/delete.sql"),
 *         find: load("../sql/users/find.sql"),
 *         update: load("../sql/users/update.sql")
 *     },
 *     create: load("../sql/create.sql"),
 *     init: load("../sql/init.sql"),
 *     drop: load("../sql/drop.sql")
 *};
 *
 */
function buildSqlModule(config) {

    if ($npm.utils.isText(config)) {
        var path = $npm.utils.isPathAbsolute(config) ? config : $npm.path.join($npm.utils.startDir, config);
        config = !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND';; throw e; }());
    } else {
        if ($npm.utils.isNull(config)) {
            var defConfig = $npm.path.join($npm.utils.startDir, 'sql-config.json');
            // istanbul ignore else;
            if (!$npm.fs.existsSync(defConfig)) {
                throw new Error("Default SQL configuration file not found: " + defConfig);
            }
            // cannot test this automatically, because it requires that file 'sql-config.json'
            // resides within the Jasmine folder, since it is the client during the test.
            // istanbul ignore next;
            config = !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND';; throw e; }());
        } else {
            if (!config || typeof config !== 'object') {
                throw new TypeError("Invalid parameter 'config' specified.");
            }
        }
    }

    if (!$npm.utils.isText(config.dir)) {
        throw new Error("Property 'dir' must be a non-empty string.");
    }

    var total = 0;

    var tree = enumSql(config.dir, {recursive: config.recursive, ignoreErrors: config.ignoreErrors}, function () {
        total++;
    });

    var modulePath = './loadSql', moduleName = 'load';
    if (config.module && typeof config.module === 'object') {
        if ($npm.utils.isText(config.module.path)) {
            modulePath = config.module.path;
        }
        if ($npm.utils.isText(config.module.name)) {
            moduleName = config.module.name;
        }
    }

    var d = new Date();

    var header =
        "/////////////////////////////////////////////////////////////////////////" + EOL +
        "// This file was automatically generated by pg-promise v." + $npm.package.version + EOL +
        "//" + EOL +
        "// Generated on: " + d.toLocaleDateString() + ', at ' + d.toLocaleTimeString() + EOL +
        "// Total files: " + total + EOL +
        "//" + EOL +
        "// API: http://vitaly-t.github.io/pg-promise/utils.html#.buildSqlModule" + EOL +
        "/////////////////////////////////////////////////////////////////////////" + EOL + EOL +
        "'use strict';" + EOL + EOL +
        "var " + moduleName + " = require('" + modulePath + "');" + EOL + EOL +
        "module.exports = ";

    var code = header + objectToCode(tree, function (value) {
            return moduleName + '(' + JSON.stringify(value) + ')';
        }) + ';';

    if ($npm.utils.isText(config.output)) {
        var path = config.output;
        if (!$npm.utils.isPathAbsolute(path)) {
            path = $npm.path.join($npm.utils.startDir, path);
        }
        $npm.fs.writeFileSync(path, code);
    }

    return code;
}


/**
 * @namespace utils
 *
 * @description
 * Namespace for general-purpose static functions, available as `pgp.utils`, before and after initializing the library.
 *
 * Its main purpose is to simplify developing projects with either large or dynamic number of SQL files.
 *
 * See also:
 * - [Automatic SQL Trees](https://github.com/vitaly-t/pg-promise/issues/153)
 * - [SQL Files](https://github.com/vitaly-t/pg-promise/wiki/SQL-Files)
 *
 * @property {function} camelize
 * {@link utils.camelize camelize} - camelizes a text string
 *
 * @property {function} camelizeVar
 * {@link utils.camelizeVar camelizeVar} - camelizes a text string as a variable
 *
 * @property {function} enumSql
 * {@link utils.enumSql enumSql} - enumerates SQL files in a directory
 *
 * @property {function} objectToCode
 * {@link utils.objectToCode objectToCode} - generates code from an object
 *
 * @property {function} buildSqlModule
 * {@link utils.buildSqlModule buildSqlModule} - generates a complete Node.js module
 *
 */
module.exports = {
    camelize: camelize,
    camelizeVar: camelizeVar,
    enumSql: enumSql,
    objectToCode: objectToCode,
    buildSqlModule: buildSqlModule
};

Object.freeze(module.exports);


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

var crypto = __webpack_require__(62);
var EventEmitter = __webpack_require__(1).EventEmitter;
var util = __webpack_require__(0);
var pgPass = __webpack_require__(135);
var TypeOverrides = __webpack_require__(98);

var ConnectionParameters = __webpack_require__(95);
var Query = __webpack_require__(131);
var defaults = __webpack_require__(77);
var Connection = __webpack_require__(96);

var Client = function(config) {
  EventEmitter.call(this);

  this.connectionParameters = new ConnectionParameters(config);
  this.user = this.connectionParameters.user;
  this.database = this.connectionParameters.database;
  this.port = this.connectionParameters.port;
  this.host = this.connectionParameters.host;
  this.password = this.connectionParameters.password;

  var c = config || {};

  this._types = new TypeOverrides(c.types);

  this.connection = c.connection || new Connection({
    stream: c.stream,
    ssl: this.connectionParameters.ssl
  });
  this.queryQueue = [];
  this.binary = c.binary || defaults.binary;
  this.encoding = 'utf8';
  this.processID = null;
  this.secretKey = null;
  this.ssl = this.connectionParameters.ssl || false;
};

util.inherits(Client, EventEmitter);

Client.prototype.connect = function(callback) {
  var self = this;
  var con = this.connection;

  if(this.host && this.host.indexOf('/') === 0) {
    con.connect(this.host + '/.s.PGSQL.' + this.port);
  } else {
    con.connect(this.port, this.host);
  }


  //once connection is established send startup message
  con.on('connect', function() {
    if(self.ssl) {
      con.requestSsl();
    } else {
      con.startup(self.getStartupConf());
    }
  });

  con.on('sslconnect', function() {
    con.startup(self.getStartupConf());
  });

  function checkPgPass(cb) {
    return function(msg) {
      if (null !== self.password) {
        cb(msg);
      } else {
        pgPass(self.connectionParameters, function(pass){
          if (undefined !== pass) {
            self.connectionParameters.password = self.password = pass;
          }
          cb(msg);
        });
      }
    };
  }

  //password request handling
  con.on('authenticationCleartextPassword', checkPgPass(function() {
    con.password(self.password);
  }));

  //password request handling
  con.on('authenticationMD5Password', checkPgPass(function(msg) {
    var inner = Client.md5(self.password + self.user);
    var outer = Client.md5(Buffer.concat([new Buffer(inner), msg.salt]));
    var md5password = "md5" + outer;
    con.password(md5password);
  }));

  con.once('backendKeyData', function(msg) {
    self.processID = msg.processID;
    self.secretKey = msg.secretKey;
  });

  //hook up query handling events to connection
  //after the connection initially becomes ready for queries
  con.once('readyForQuery', function() {

    //delegate rowDescription to active query
    con.on('rowDescription', function(msg) {
      self.activeQuery.handleRowDescription(msg);
    });

    //delegate dataRow to active query
    con.on('dataRow', function(msg) {
      self.activeQuery.handleDataRow(msg);
    });

    //delegate portalSuspended to active query
    con.on('portalSuspended', function(msg) {
      self.activeQuery.handlePortalSuspended(con);
    });

    //deletagate emptyQuery to active query
    con.on('emptyQuery', function(msg) {
      self.activeQuery.handleEmptyQuery(con);
    });

    //delegate commandComplete to active query
    con.on('commandComplete', function(msg) {
      self.activeQuery.handleCommandComplete(msg, con);
    });

    //if a prepared statement has a name and properly parses
    //we track that its already been executed so we don't parse
    //it again on the same client
    con.on('parseComplete', function(msg) {
      if(self.activeQuery.name) {
        con.parsedStatements[self.activeQuery.name] = true;
      }
    });

    con.on('copyInResponse', function(msg) {
      self.activeQuery.handleCopyInResponse(self.connection);
    });

    con.on('copyData', function (msg) {
      self.activeQuery.handleCopyData(msg, self.connection);
    });

    con.on('notification', function(msg) {
      self.emit('notification', msg);
    });

    //process possible callback argument to Client#connect
    if (callback) {
      callback(null, self);
      //remove callback for proper error handling
      //after the connect event
      callback = null;
    }
    self.emit('connect');
  });

  con.on('readyForQuery', function() {
    var activeQuery = self.activeQuery;
    self.activeQuery = null;
    self.readyForQuery = true;
    self._pulseQueryQueue();
    if(activeQuery) {
      activeQuery.handleReadyForQuery();
    }
  });

  con.on('error', function(error) {
    if(self.activeQuery) {
      var activeQuery = self.activeQuery;
      self.activeQuery = null;
      return activeQuery.handleError(error, con);
    }
    if(!callback) {
      return self.emit('error', error);
    }
    callback(error);
    callback = null;
  });

  con.once('end', function() {
    if ( callback ) {
      // haven't received a connection message yet !
      var err = new Error('Connection terminated');
      callback(err);
      callback = null;
      return;
    }
    if(self.activeQuery) {
      var disconnectError = new Error('Connection terminated');
      self.activeQuery.handleError(disconnectError, con);
      self.activeQuery = null;
    }
    self.emit('end');
  });


  con.on('notice', function(msg) {
    self.emit('notice', msg);
  });

};

Client.prototype.getStartupConf = function() {
  var params = this.connectionParameters;

  var data = {
    user: params.user,
    database: params.database
  };

  var appName = params.application_name || params.fallback_application_name;
  if (appName) {
    data.application_name = appName;
  }

  return data;
};

Client.prototype.cancel = function(client, query) {
  if(client.activeQuery == query) {
    var con = this.connection;

    if(this.host && this.host.indexOf('/') === 0) {
      con.connect(this.host + '/.s.PGSQL.' + this.port);
    } else {
      con.connect(this.port, this.host);
    }

    //once connection is established send cancel message
    con.on('connect', function() {
      con.cancel(client.processID, client.secretKey);
    });
  } else if(client.queryQueue.indexOf(query) != -1) {
    client.queryQueue.splice(client.queryQueue.indexOf(query), 1);
  }
};

Client.prototype.setTypeParser = function(oid, format, parseFn) {
  return this._types.setTypeParser(oid, format, parseFn);
};

Client.prototype.getTypeParser = function(oid, format) {
  return this._types.getTypeParser(oid, format);
};

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
Client.prototype.escapeIdentifier = function(str) {

  var escaped = '"';

  for(var i = 0; i < str.length; i++) {
    var c = str[i];
    if(c === '"') {
      escaped += c + c;
    } else {
      escaped += c;
    }
  }

  escaped += '"';

  return escaped;
};

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
Client.prototype.escapeLiteral = function(str) {

  var hasBackslash = false;
  var escaped = '\'';

  for(var i = 0; i < str.length; i++) {
    var c = str[i];
    if(c === '\'') {
      escaped += c + c;
    } else if (c === '\\') {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }

  escaped += '\'';

  if(hasBackslash === true) {
    escaped = ' E' + escaped;
  }

  return escaped;
};

Client.prototype._pulseQueryQueue = function() {
  if(this.readyForQuery===true) {
    this.activeQuery = this.queryQueue.shift();
    if(this.activeQuery) {
      this.readyForQuery = false;
      this.hasExecuted = true;
      this.activeQuery.submit(this.connection);
    } else if(this.hasExecuted) {
      this.activeQuery = null;
      this.emit('drain');
    }
  }
};

Client.prototype.copyFrom = function (text) {
  throw new Error("For PostgreSQL COPY TO/COPY FROM support npm install pg-copy-streams");
};

Client.prototype.copyTo = function (text) {
  throw new Error("For PostgreSQL COPY TO/COPY FROM support npm install pg-copy-streams");
};

Client.prototype.query = function(config, values, callback) {
  //can take in strings, config object or query object
  var query = (typeof config.submit == 'function') ? config :
     new Query(config, values, callback);
  if(this.binary && !query.binary) {
    query.binary = true;
  }
  if(query._result) {
    query._result._getTypeParser = this._types.getTypeParser.bind(this._types);
  }

  this.queryQueue.push(query);
  this._pulseQueryQueue();
  return query;
};

Client.prototype.end = function() {
  this.connection.end();
};

Client.md5 = function(string) {
  return crypto.createHash('md5').update(string).digest('hex');
};

// expose a Query constructor
Client.Query = Query;

module.exports = Client;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(1).EventEmitter;
var util = __webpack_require__(0);
var Client = __webpack_require__(126);
var defaults =  __webpack_require__(77);
var pool = __webpack_require__(130);
var Connection = __webpack_require__(96);

var PG = function(clientConstructor) {
  EventEmitter.call(this);
  this.defaults = defaults;
  this.Client = clientConstructor;
  this.Query = this.Client.Query;
  this.pools = pool(clientConstructor);
  this.Connection = Connection;
  this.types = __webpack_require__(3);
};

util.inherits(PG, EventEmitter);

PG.prototype.end = function() {
  var self = this;
  var keys = Object.keys(self.pools.all);
  var count = keys.length;
  if(count === 0) {
    self.emit('end');
  } else {
    keys.forEach(function(key) {
      var pool = self.pools.all[key];
      delete self.pools.all[key];
      pool.drain(function() {
        pool.destroyAllNow(function() {
          count--;
          if(count === 0) {
            self.emit('end');
          }
        });
      });
    });
  }
};


PG.prototype.connect = function(config, callback) {
  if(typeof config == "function") {
    callback = config;
    config = null;
  }
  var pool = this.pools.getOrCreate(config);
  pool.connect(callback);
  if(!pool.listeners('error').length) {
    //propagate errors up to pg object
    pool.on('error', this.emit.bind(this, 'error'));
  }
};

// cancel the query runned by the given client
PG.prototype.cancel = function(config, client, query) {
  if(client.native) {
    return client.cancel(query);
  }
  var c = config;
  //allow for no config to be passed
  if(typeof c === 'function') {
    c = defaults;
  }
  var cancellingClient = new this.Client(c);
  cancellingClient.cancel(client, query);
};

if(typeof process.env.NODE_PG_FORCE_NATIVE != 'undefined') {
  module.exports = new PG(__webpack_require__(97));
} else {
  module.exports = new PG(Client);

  //lazy require native module...the native module may not have installed
  module.exports.__defineGetter__("native", function() {
    delete module.exports.native;
    var native = null;
    try {
      native = new PG(__webpack_require__(97));
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }
      console.error(err.message);
    }
    module.exports.native = native;
    return native;
  });
}


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(1).EventEmitter;
var util = __webpack_require__(0);
var utils = __webpack_require__(85);
var NativeResult = __webpack_require__(129);

var NativeQuery = module.exports = function(native) {
  EventEmitter.call(this);
  this.native = native;
  this.text = null;
  this.values = null;
  this.name = null;
  this.callback = null;
  this.state = 'new';
  this._arrayMode = false;

  //if the 'row' event is listened for
  //then emit them as they come in
  //without setting singleRowMode to true
  //this has almost no meaning because libpq
  //reads all rows into memory befor returning any
  this._emitRowEvents = false;
  this.on('newListener', function(event) {
    if(event === 'row') this._emitRowEvents = true;
  }.bind(this));
};

util.inherits(NativeQuery, EventEmitter);

NativeQuery.prototype.then = function(callback) {
  return this.promise().then(callback);
};

NativeQuery.prototype.catch = function(callback) {
  return this.promise().catch(callback);
};

NativeQuery.prototype.promise = function() {
  if (this._promise) return this._promise;
  this._promise = new Promise(function(resolve, reject) {
    this.once('end', resolve);
    this.once('error', reject);
  }.bind(this));
  return this._promise;
};

NativeQuery.prototype.handleError = function(err) {
  var self = this;
  //copy pq error fields into the error object
  var fields = self.native.pq.resultErrorFields();
  if(fields) {
    for(var key in fields) {
      err[key] = fields[key];
    }
  }
  if(self.callback) {
    self.callback(err);
  } else {
    self.emit('error', err);
  }
  self.state = 'error';
};

NativeQuery.prototype.submit = function(client) {
  this.state = 'running';
  var self = this;
  client.native.arrayMode = this._arrayMode;

  var after = function(err, rows) {
    client.native.arrayMode = false;
    setImmediate(function() {
      self.emit('_done');
    });

    //handle possible query error
    if(err) {
      return self.handleError(err);
    }

    var result = new NativeResult();
    result.addCommandComplete(self.native.pq);
    result.rows = rows;

    //emit row events for each row in the result
    if(self._emitRowEvents) {
      rows.forEach(function(row) {
        self.emit('row', row, result);
      });
    }


    //handle successful result
    self.state = 'end';
    self.emit('end', result);
    if(self.callback) {
      self.callback(null, result);
    }
  };

  if(process.domain) {
    after = process.domain.bind(after);
  }

  //named query
  if(this.name) {
    if (this.name.length > 63) {
      console.error('Warning! Postgres only supports 63 characters for query names.');
      console.error('You supplied', this.name, '(', this.name.length, ')');
      console.error('This can cause conflicts and silent errors executing queries');
    }
    var values = (this.values||[]).map(utils.prepareValue);

    //check if the client has already executed this named query
    //if so...just execute it again - skip the planning phase
    if(client.namedQueries[this.name]) {
      return this.native.execute(this.name, values, after);
    }
    //plan the named query the first time, then execute it
    return this.native.prepare(this.name, this.text, values.length, function(err) {
      if(err) return after(err);
      client.namedQueries[self.name] = true;
      return self.native.execute(self.name, values, after);
    });
  }
  else if(this.values) {
    var vals = this.values.map(utils.prepareValue);
    this.native.query(this.text, vals, after);
  } else {
    this.native.query(this.text, after);
  }
};


/***/ }),
/* 129 */
/***/ (function(module, exports) {

var NativeResult = module.exports = function(pq) {
  this.command = null;
  this.rowCount = 0;
  this.rows = null;
  this.fields = null;
};

NativeResult.prototype.addCommandComplete = function(pq) {
  this.command = pq.cmdStatus().split(' ')[0];
  this.rowCount = parseInt(pq.cmdTuples(), 10);
  var nfields = pq.nfields();
  if(nfields < 1) return;

  this.fields = [];
  for(var i = 0; i < nfields; i++) {
    this.fields.push({
      name: pq.fname(i),
      dataTypeID: pq.ftype(i)
    });
  }
};

NativeResult.prototype.addRow = function(row) {
  // This is empty to ensure pg code doesn't break when switching to pg-native
  // pg-native loads all rows into the final result object by default.
  // This is because libpg loads all rows into memory before passing the result
  // to pg-native.
};


/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(1).EventEmitter;

var defaults = __webpack_require__(77);
var genericPool = __webpack_require__(30);


module.exports = function(Client) {
  var pools = {
    Client: Client,
    //dictionary of all key:pool pairs
    all: {},
    //reference to the client constructor - can override in tests or for require('pg').native
    getOrCreate: function(clientConfig) {
      clientConfig = clientConfig || {};
      var name = JSON.stringify(clientConfig);
      var pool = pools.all[name];
      if(pool) {
        return pool;
      }
      pool = genericPool.Pool({
        name: name,
        max: clientConfig.poolSize || defaults.poolSize,
        idleTimeoutMillis: clientConfig.poolIdleTimeout || defaults.poolIdleTimeout,
        reapIntervalMillis: clientConfig.reapIntervalMillis || defaults.reapIntervalMillis,
        returnToHead: clientConfig.returnToHead || defaults.returnToHead,
        log: clientConfig.poolLog || defaults.poolLog,
        create: function(cb) {
          var client = new pools.Client(clientConfig);
          // Ignore errors on pooled clients until they are connected.
          client.on('error', Function.prototype);
          client.connect(function(err) {
            if(err) return cb(err, null);

            // Remove the noop error handler after a connection has been established.
            client.removeListener('error', Function.prototype);

            //handle connected client background errors by emitting event
            //via the pg object and then removing errored client from the pool
            client.on('error', function(e) {
              pool.emit('error', e, client);

              // If the client is already being destroyed, the error
              // occurred during stream ending. Do not attempt to destroy
              // the client again.
              if (!client._destroying) {
                pool.destroy(client);
              }
            });

            // Remove connection from pool on disconnect
            client.on('end', function(e) {
              // Do not enter infinite loop between pool.destroy
              // and client 'end' event...
              if ( ! client._destroying ) {
                pool.destroy(client);
              }
            });
            client.poolCount = 0;
            return cb(null, client);
          });
        },
        destroy: function(client) {
          client._destroying = true;
          client.poolCount = undefined;
          client.end();
        }
      });
      pools.all[name] = pool;
      //mixin EventEmitter to pool
      EventEmitter.call(pool);
      for(var key in EventEmitter.prototype) {
        if(EventEmitter.prototype.hasOwnProperty(key)) {
          pool[key] = EventEmitter.prototype[key];
        }
      }
      //monkey-patch with connect method
      pool.connect = function(cb) {
        var domain = process.domain;
        pool.acquire(function(err, client) {
          if(domain) {
            cb = domain.bind(cb);
          }
          if(err)  return cb(err, null, function() {/*NOOP*/});
          client.poolCount++;
          cb(null, client, function(err) {
            if(err) {
              pool.destroy(client);
            } else {
              pool.release(client);
            }
          });
        });
      };
      return pool;
    }
  };

  return pools;
};


/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

var EventEmitter = __webpack_require__(1).EventEmitter;
var util = __webpack_require__(0);

var Result = __webpack_require__(132);
var utils = __webpack_require__(85);

var Query = function(config, values, callback) {
  // use of "new" optional
  if(!(this instanceof Query)) { return new Query(config, values, callback); }

  config = utils.normalizeQueryConfig(config, values, callback);

  this.text = config.text;
  this.values = config.values;
  this.rows = config.rows;
  this.types = config.types;
  this.name = config.name;
  this.binary = config.binary;
  this.stream = config.stream;
  //use unique portal name each time
  this.portal = config.portal || "";
  this.callback = config.callback;
  if(process.domain && config.callback) {
    this.callback = process.domain.bind(config.callback);
  }
  this._result = new Result(config.rowMode, config.types);
  this.isPreparedStatement = false;
  this._canceledDueToError = false;
  this._promise = null;
  EventEmitter.call(this);
};

util.inherits(Query, EventEmitter);

Query.prototype.then = function(callback) {
  return this.promise().then(callback);
};

Query.prototype.catch = function(callback) {
  return this.promise().catch(callback);
};

Query.prototype.promise = function() {
  if (this._promise) return this._promise;
  this._promise = new Promise(function(resolve, reject) {
    this.once('end', resolve);
    this.once('error', reject);
  }.bind(this));
  return this._promise;
};

Query.prototype.requiresPreparation = function() {
  //named queries must always be prepared
  if(this.name) { return true; }
  //always prepare if there are max number of rows expected per
  //portal execution
  if(this.rows) { return true; }
  //don't prepare empty text queries
  if(!this.text) { return false; }
  //binary should be prepared to specify results should be in binary
  //unless there are no parameters
  if(this.binary && !this.values) { return false; }
  //prepare if there are values
  return (this.values || 0).length > 0;
};


//associates row metadata from the supplied
//message with this query object
//metadata used when parsing row results
Query.prototype.handleRowDescription = function(msg) {
  this._result.addFields(msg.fields);
  this._accumulateRows = this.callback || !this.listeners('row').length;
};

Query.prototype.handleDataRow = function(msg) {
  var row = this._result.parseRow(msg.fields);
  this.emit('row', row, this._result);
  if (this._accumulateRows) {
    this._result.addRow(row);
  }
};

Query.prototype.handleCommandComplete = function(msg, con) {
  this._result.addCommandComplete(msg);
  //need to sync after each command complete of a prepared statement
  if(this.isPreparedStatement) {
    con.sync();
  }
};

//if a named prepared statement is created with empty query text
//the backend will send an emptyQuery message but *not* a command complete message
//execution on the connection will hang until the backend receives a sync message
Query.prototype.handleEmptyQuery = function(con) {
  if (this.isPreparedStatement) {
    con.sync();
  }
};

Query.prototype.handleReadyForQuery = function() {
  if(this._canceledDueToError) {
    return this.handleError(this._canceledDueToError);
  }
  if(this.callback) {
    this.callback(null, this._result);
  }
  this.emit('end', this._result);
};

Query.prototype.handleError = function(err, connection) {
  //need to sync after error during a prepared statement
  if(this.isPreparedStatement) {
    connection.sync();
  }
  if(this._canceledDueToError) {
    err = this._canceledDueToError;
    this._canceledDueToError = false;
  }
  //if callback supplied do not emit error event as uncaught error
  //events will bubble up to node process
  if(this.callback) {
    return this.callback(err);
  }
  this.emit('error', err);
};

Query.prototype.submit = function(connection) {
  if(this.requiresPreparation()) {
    this.prepare(connection);
  } else {
    connection.query(this.text);
  }
};

Query.prototype.hasBeenParsed = function(connection) {
  return this.name && connection.parsedStatements[this.name];
};

Query.prototype.handlePortalSuspended = function(connection) {
  this._getRows(connection, this.rows);
};

Query.prototype._getRows = function(connection, rows) {
  connection.execute({
    portal: this.portalName,
    rows: rows
  }, true);
  connection.flush();
};

Query.prototype.prepare = function(connection) {
  var self = this;
  //prepared statements need sync to be called after each command
  //complete or when an error is encountered
  this.isPreparedStatement = true;
  //TODO refactor this poor encapsulation
  if(!this.hasBeenParsed(connection)) {
    connection.parse({
      text: self.text,
      name: self.name,
      types: self.types
    }, true);
  }

  if(self.values) {
    self.values = self.values.map(utils.prepareValue);
  }

  //http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
  connection.bind({
    portal: self.portalName,
    statement: self.name,
    values: self.values,
    binary: self.binary
  }, true);

  connection.describe({
    type: 'P',
    name: self.portalName || ""
  }, true);

  this._getRows(connection, this.rows);
};

Query.prototype.handleCopyInResponse = function (connection) {
  if(this.stream) this.stream.startStreamingToConnection(connection);
  else connection.sendCopyFail('No source stream defined');
};

Query.prototype.handleCopyData = function (msg, connection) {
  var chunk = msg.chunk;
  if(this.stream) {
    this.stream.handleChunk(chunk);
  }
  //if there are no stream (for example when copy to query was sent by
  //query method instead of copyTo) error will be handled
  //on copyOutResponse event, so silently ignore this error here
};
module.exports = Query;


/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

var types = __webpack_require__(3);

//result object returned from query
//in the 'end' event and also
//passed as second argument to provided callback
var Result = function(rowMode) {
  this.command = null;
  this.rowCount = null;
  this.oid = null;
  this.rows = [];
  this.fields = [];
  this._parsers = [];
  this.RowCtor = null;
  this.rowAsArray = rowMode == "array";
  if(this.rowAsArray) {
    this.parseRow = this._parseRowAsArray;
  }
};

var matchRegexp = /([A-Za-z]+) ?(\d+ )?(\d+)?/;

//adds a command complete message
Result.prototype.addCommandComplete = function(msg) {
  var match;
  if(msg.text) {
    //pure javascript
    match = matchRegexp.exec(msg.text);
  } else {
    //native bindings
    match = matchRegexp.exec(msg.command);
  }
  if(match) {
    this.command = match[1];
    //match 3 will only be existing on insert commands
    if(match[3]) {
      //msg.value is from native bindings
      this.rowCount = parseInt(match[3] || msg.value, 10);
      this.oid = parseInt(match[2], 10);
    } else {
      this.rowCount = parseInt(match[2], 10);
    }
  }
};

Result.prototype._parseRowAsArray = function(rowData) {
  var row = [];
  for(var i = 0, len = rowData.length; i < len; i++) {
    var rawValue = rowData[i];
    if(rawValue !== null) {
      row.push(this._parsers[i](rawValue));
    } else {
      row.push(null);
    }
  }
  return row;
};

//rowData is an array of text or binary values
//this turns the row into a JavaScript object
Result.prototype.parseRow = function(rowData) {
  return new this.RowCtor(this._parsers, rowData);
};

Result.prototype.addRow = function(row) {
  this.rows.push(row);
};

var inlineParser = function(fieldName, i) {
  return "\nthis['" +
    //fields containing single quotes will break
    //the evaluated javascript unless they are escaped
    //see https://github.com/brianc/node-postgres/issues/507
    //Addendum: However, we need to make sure to replace all
    //occurences of apostrophes, not just the first one.
    //See https://github.com/brianc/node-postgres/issues/934
    fieldName.replace(/'/g, "\\'") +
    "'] = " +
    "rowData[" + i + "] == null ? null : parsers[" + i + "](rowData[" + i + "]);";
};

Result.prototype.addFields = function(fieldDescriptions) {
  //clears field definitions
  //multiple query statements in 1 action can result in multiple sets
  //of rowDescriptions...eg: 'select NOW(); select 1::int;'
  //you need to reset the fields
  if(this.fields.length) {
    this.fields = [];
    this._parsers = [];
  }
  var ctorBody = "";
  for(var i = 0; i < fieldDescriptions.length; i++) {
    var desc = fieldDescriptions[i];
    this.fields.push(desc);
    var parser = this._getTypeParser(desc.dataTypeID, desc.format || 'text');
    this._parsers.push(parser);
    //this is some craziness to compile the row result parsing
    //results in ~60% speedup on large query result sets
    ctorBody += inlineParser(desc.name, i);
  }
  if(!this.rowAsArray) {
    this.RowCtor = Function("parsers", "rowData", ctorBody);
  }
};

Result.prototype._getTypeParser = types.getTypeParser;

module.exports = Result;


/***/ }),
/* 133 */
/***/ (function(module, exports) {

module.exports = {
	"_args": [
		[
			{
				"raw": "pg@5.1",
				"scope": null,
				"escapedName": "pg",
				"name": "pg",
				"rawSpec": "5.1",
				"spec": ">=5.1.0 <5.2.0",
				"type": "range"
			},
			"/home/neil/DevGit/zf2dbmodelgen/modgen/node_modules/pg-promise"
		]
	],
	"_from": "pg@>=5.1.0 <5.2.0",
	"_id": "pg@5.1.0",
	"_inCache": true,
	"_location": "/pg-promise/pg",
	"_nodeVersion": "6.1.0",
	"_npmOperationalInternal": {
		"host": "packages-16-east.internal.npmjs.com",
		"tmp": "tmp/pg-5.1.0.tgz_1465597295940_0.7661049372982234"
	},
	"_npmUser": {
		"name": "brianc",
		"email": "brian.m.carlson@gmail.com"
	},
	"_npmVersion": "3.8.6",
	"_phantomChildren": {},
	"_requested": {
		"raw": "pg@5.1",
		"scope": null,
		"escapedName": "pg",
		"name": "pg",
		"rawSpec": "5.1",
		"spec": ">=5.1.0 <5.2.0",
		"type": "range"
	},
	"_requiredBy": [
		"/pg-promise"
	],
	"_resolved": "https://registry.npmjs.org/pg/-/pg-5.1.0.tgz",
	"_shasum": "073b9b36763ad8a5478dbb85effef45e739ba9d8",
	"_shrinkwrap": null,
	"_spec": "pg@5.1",
	"_where": "/home/neil/DevGit/zf2dbmodelgen/modgen/node_modules/pg-promise",
	"author": {
		"name": "Brian Carlson",
		"email": "brian.m.carlson@gmail.com"
	},
	"bugs": {
		"url": "https://github.com/brianc/node-postgres/issues"
	},
	"dependencies": {
		"buffer-writer": "1.0.1",
		"generic-pool": "2.4.2",
		"packet-reader": "0.2.0",
		"pg-connection-string": "0.1.3",
		"pg-types": "1.*",
		"pgpass": "0.0.6",
		"semver": "4.3.2"
	},
	"description": "PostgreSQL client - pure javascript & libpq with the same API",
	"devDependencies": {
		"async": "0.9.0",
		"jshint": "2.5.2",
		"pg-copy-streams": "0.3.0"
	},
	"directories": {},
	"dist": {
		"shasum": "073b9b36763ad8a5478dbb85effef45e739ba9d8",
		"tarball": "https://registry.npmjs.org/pg/-/pg-5.1.0.tgz"
	},
	"engines": {
		"node": ">= 0.8.0"
	},
	"gitHead": "d1c5fc694be8dfab19b844e149141d4785ad7152",
	"homepage": "http://github.com/brianc/node-postgres",
	"keywords": [
		"postgres",
		"pg",
		"libpq",
		"postgre",
		"database",
		"rdbms"
	],
	"license": "MIT",
	"main": "./lib",
	"maintainers": [
		{
			"name": "brianc",
			"email": "brian.m.carlson@gmail.com"
		}
	],
	"minNativeVersion": "1.7.0",
	"name": "pg",
	"optionalDependencies": {},
	"readme": "ERROR: No README data found!",
	"repository": {
		"type": "git",
		"url": "git://github.com/brianc/node-postgres.git"
	},
	"scripts": {
		"changelog": "npm i github-changes && ./node_modules/.bin/github-changes -o brianc -r node-postgres -d pulls -a -v",
		"test": "make test-all connectionString=postgres://postgres@localhost:5432/postgres"
	},
	"version": "5.1.0"
};

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var path = __webpack_require__(2)
  , Stream = __webpack_require__(7).Stream
  , Split = __webpack_require__(57)
  , util = __webpack_require__(0)
  , defaultPort = 5432
  , isWin = (process.platform === 'win32')
  , warnStream = process.stderr
;


var S_IRWXG = 56     //    00070(8)
  , S_IRWXO = 7      //    00007(8)
  , S_IFMT  = 61440  // 00170000(8)
  , S_IFREG = 32768  //  0100000(8)
;
function isRegFile(mode) {
    return ((mode & S_IFMT) == S_IFREG);
}

var fieldNames = [ 'host', 'port', 'database', 'user', 'password' ];
var nrOfFields = fieldNames.length;
var passKey = fieldNames[ nrOfFields -1 ];


function warn() {
    var isWritable = (
        warnStream instanceof Stream &&
          true === warnStream.writable
    );

    if (isWritable) {
        var args = Array.prototype.slice.call(arguments).concat("\n");
        warnStream.write( util.format.apply(util, args) );
    }
}


Object.defineProperty(module.exports, 'isWin', {
    get : function() {
        return isWin;
    } ,
    set : function(val) {
        isWin = val;
    }
});


module.exports.warnTo = function(stream) {
    var old = warnStream;
    warnStream = stream;
    return old;
};

module.exports.getFileName = function(env){
    env = env || process.env;
    var file = env.PGPASSFILE || (
        isWin ?
          path.join( env.APPDATA , 'postgresql', 'pgpass.conf' ) :
          path.join( env.HOME, '.pgpass' )
    );
    return file;
};

module.exports.usePgPass = function(stats, fname) {
    if (Object.prototype.hasOwnProperty.call(process.env, 'PGPASSWORD')) {
        return false;
    }

    if (isWin) {
        return true;
    }

    fname = fname || '<unkn>';

    if (! isRegFile(stats.mode)) {
        warn('WARNING: password file "%s" is not a plain file', fname);
        return false;
    }

    if (stats.mode & (S_IRWXG | S_IRWXO)) {
        /* If password file is insecure, alert the user and ignore it. */
        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
        return false;
    }

    return true;
};


var matcher = module.exports.match = function(connInfo, entry) {
    return fieldNames.slice(0, -1).reduce(function(prev, field, idx){
        if (idx == 1) {
            // the port
            if ( Number( connInfo[field] || defaultPort ) === Number( entry[field] ) ) {
                return prev && true;
            }
        }
        return prev && (
            entry[field] === '*' ||
              entry[field] === connInfo[field]
        );
    }, true);
};


module.exports.getPassword = function(connInfo, stream, cb) {
    var pass;
    var lineStream = stream.pipe(new Split());

    function onLine(line) {
        var entry = parseLine(line);
        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
            pass = entry[passKey];
            lineStream.end(); // -> calls onEnd(), but pass is set now
        }
    }

    var onEnd = function() {
        cb(pass);
    };

    var onErr = function(err) {
        warn('WARNING: error on reading file: %s', err);
        cb(undefined);
    };

    stream.on('error', onErr);
    lineStream
        .on('data', onLine)
        .on('end', onEnd)
        .on('error', onErr)
    ;

};


var parseLine = module.exports.parseLine = function(line) {
    if (line.length < 11 || line.match(/^\s+#/)) {
        return null;
    }

    var curChar = '';
    var prevChar = '';
    var fieldIdx = 0;
    var startIdx = 0;
    var endIdx = 0;
    var obj = {};
    var isLastField = false;
    var addToObj = function(idx, i0, i1) {
        var field = line.substring(i0, i1);

        if (! Object.hasOwnProperty.call(process.env, 'PGPASS_NO_DEESCAPE')) {
            field = field.replace(/\\([:\\])/g, '$1');
        }

        obj[ fieldNames[idx] ] = field;
    };

    for (var i = 0 ; i < line.length-1 ; i += 1) {
        curChar = line.charAt(i+1);
        prevChar = line.charAt(i);

        isLastField = (fieldIdx == nrOfFields-1);

        if (isLastField) {
            addToObj(fieldIdx, startIdx);
            break;
        }

        if (i >= 0 && curChar == ':' && prevChar !== '\\') {
            addToObj(fieldIdx, startIdx, i+1);

            startIdx = i+2;
            fieldIdx += 1;
        }
    }

    obj = ( Object.keys(obj).length === nrOfFields ) ? obj : null;

    return obj;
};


var isValidEntry = module.exports.isValidEntry = function(entry){
    var rules = {
        // host
        0 : function(x){
            return x.length > 0;
        } ,
        // port
        1 : function(x){
            if (x === '*') {
                return true;
            }
            x = Number(x);
            return (
                isFinite(x) &&
                  x > 0 &&
                  x < 9007199254740992 &&
                  Math.floor(x) === x
            );
        } ,
        // database
        2 : function(x){
            return x.length > 0;
        } ,
        // username
        3 : function(x){
            return x.length > 0;
        } ,
        // password
        4 : function(x){
            return x.length > 0;
        }
    };

    for (var idx = 0 ; idx < fieldNames.length ; idx += 1) {
        var rule = rules[idx];
        var value = entry[ fieldNames[idx] ] || '';

        var res = rule(value);
        if (!res) {
            return false;
        }
    }

    return true;
};



/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var path = __webpack_require__(2)
  , fs = __webpack_require__(6)
  , helper = __webpack_require__(134)
;


module.exports.warnTo = helper.warnTo;

module.exports = function(connInfo, cb) {
    var file = helper.getFileName();
    
    fs.stat(file, function(err, stat){
        if (err || !helper.usePgPass(stat, file)) {
            return cb(undefined);
        }

        var st = fs.createReadStream(file);

        helper.getPassword(connInfo, st, cb);
    });
};


/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @class PromiseAdapter
 * @description
 * Adapter for the primary promise operations.
 * 
 * Provides compatibility with promise libraries that cannot be recognized automatically,
 * via functions that implement the primary operations with promises:
 *
 *  - construct a new promise with a callback function
 *  - resolve a promise with some result data
 *  - reject a promise with a reason
 *
 * #### Example
 *
 * Below is an example of setting up a [client-side]{@tutorial client} adapter for AngularJS $q.
 *
 * ```js
 * var spexLib = require('spex'); // or include client-side spex.js
 *
 * var adapter = new spexLib.PromiseAdapter(
 *    function (cb) {
 *        return $q(cb); // creating a new promise;
 *    }, function (data) {
 *        return $q.when(data); // resolving a promise;
 *    }, function (reason) {
 *        return $q.reject(reason); // rejecting a promise;
 *    });
 *
 * var spex = spexLib(adapter);
 * ```
 * Please note that AngularJS 1.4.1 or later no longer requires a promise adapter.
 *
 * @param {Function} create
 * A function that takes a callback parameter and returns a new promise object.
 * The callback parameter is expected to be `function(resolve, reject)`.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to create a promise.`
 *
 * @param {Function} resolve
 * A function that takes an optional data parameter and resolves a promise with it.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to resolve a promise.`
 *
 * @param {Function} reject
 * A function that takes an optional error parameter and rejects a promise with it.
 *
 * Passing in anything other than a function will throw `Adapter requires a function to reject a promise.`
 *
 * @see {@tutorial client}
 * 
 * @returns {PromiseAdapter}
 */
function PromiseAdapter(create, resolve, reject) {

    if (!(this instanceof PromiseAdapter)) {
        return new PromiseAdapter(create, resolve, reject);
    }

    this.create = create;
    this.resolve = resolve;
    this.reject = reject;

    if (typeof create !== 'function') {
        throw new TypeError('Adapter requires a function to create a promise.');
    }

    if (typeof resolve !== 'function') {
        throw new TypeError('Adapter requires a function to resolve a promise.');
    }

    if (typeof reject !== 'function') {
        throw new TypeError('Adapter requires a function to reject a promise.');
    }
}

module.exports = PromiseAdapter;


/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    BatchError: __webpack_require__(100),
    PageError: __webpack_require__(101),
    SequenceError: __webpack_require__(102)
};

/**
 * @namespace errors
 * @description
 * Namespace for all custom error types supported by the library.
 *
 * In addition to the custom error type used by each method (regular error), they can also reject with
 * {@link external:TypeError TypeError} when receiving invalid input parameters.
 *
 * @property {function} BatchError
 * {@link errors.BatchError BatchError} interface.
 *
 * Represents regular errors that can be reported by method {@link batch}.
 *
 * @property {function} PageError
 * {@link errors.PageError PageError} interface.
 *
 * Represents regular errors that can be reported by method {@link page}.
 *
 * @property {function} SequenceError
 * {@link errors.SequenceError SequenceError} interface.
 *
 * Represents regular errors that can be reported by method {@link sequence}.
 *
 */
module.exports = {
    BatchError: $npm.BatchError,
    PageError: $npm.PageError,
    SequenceError: $npm.SequenceError
};

Object.freeze(module.exports);


/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var BatchError = __webpack_require__(100);

/**
 * @method batch
 * @description
 * **Alternative Syntax:**
 * `batch(values, {cb})` &#8658; `Promise`
 *
 * Settles (resolves or rejects) every [mixed value]{@tutorial mixed} in the input array.
 *
 * The method resolves with an array of results, the same as the standard $[promise.all],
 * while providing comprehensive error details in case of a reject, in the form of
 * type {@link errors.BatchError BatchError}.
 *
 * @param {Array} values
 * Array of [mixed values]{@tutorial mixed} (it can be empty), to be resolved asynchronously, in no particular order.
 *
 * Passing in anything other than an array will reject with {@link external:TypeError TypeError} =
 * `Method 'batch' requires an array of values.`
 *
 * @param {Function|generator} [cb]
 * Optional callback (or generator) to receive the result for each settled value.
 *
 * Callback Parameters:
 *  - `index` = index of the value in the source array
 *  - `success` - indicates whether the value was resolved (`true`), or rejected (`false`)
 *  - `result` = resolved data, if `success`=`true`, or else the rejection reason
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * It can optionally return a promise to indicate that notifications are handled asynchronously.
 * And if the returned promise resolves, it signals a successful handling, while any resolved
 * data is ignored.
 *
 * If the function returns a rejected promise or throws an error, the entire method rejects
 * with {@link errors.BatchError BatchError} where the corresponding value in property `data`
 * is set to `{success, result, origin}`:
 *  - `success` = `false`
 *  - `result` = the rejection reason or the error thrown by the notification callback
 *  - `origin` = the original data passed into the callback as object `{success, result}`
 *
 * @returns {external:Promise}
 *
 * The method resolves with an array of individual resolved results, the same as the standard $[promise.all].
 * In addition, the array is extended with a hidden read-only property `duration` - number of milliseconds
 * spent resolving all the data.
 *
 * The method rejects with {@link errors.BatchError BatchError} when any of the following occurs:
 *  - one or more values rejected or threw an error while being resolved as a [mixed value]{@tutorial mixed}
 *  - notification callback `cb` returned a rejected promise or threw an error
 *
 */
function batch(values, cb, config) {

    var $p = config.promise, $utils = config.utils;

    if (!Array.isArray(values)) {
        return $p.reject(new TypeError("Method 'batch' requires an array of values."));
    }

    if (!values.length) {
        var empty = [];
        $utils.extend(empty, 'duration', 0);
        return $p.resolve(empty);
    }

    cb = $utils.wrap(cb);
    var self = this, start = Date.now();
    return $p(function (resolve, reject) {
        var cbTime, errors = [], remaining = values.length,
            result = new Array(remaining);
        values.forEach(function (item, i) {
            $utils.resolve.call(self, item, null, function (data) {
                result[i] = data;
                step(i, true, data);
            }, function (reason) {
                result[i] = {success: false, result: reason};
                errors.push(i);
                step(i, false, reason);
            });
        });
        function step(idx, pass, data) {
            if (cb) {
                var cbResult, cbNow = Date.now(),
                    cbDelay = idx ? (cbNow - cbTime) : undefined;
                cbTime = cbNow;
                try {
                    cbResult = cb.call(self, idx, pass, data, cbDelay);
                } catch (e) {
                    setError(e);
                }
                if ($utils.isPromise(cbResult)) {
                    cbResult
                        .then(check)
                        .catch(function (error) {
                            setError(error);
                            check();
                        });
                } else {
                    check();
                }
            } else {
                check();
            }

            function setError(e) {
                var r = pass ? {success: false} : result[idx];
                if (pass) {
                    result[idx] = r;
                    errors.push(idx);
                }
                r.result = e;
                r.origin = {success: pass, result: data}
            }

            function check() {
                if (!--remaining) {
                    if (errors.length) {
                        errors.sort();
                        if (errors.length < result.length) {
                            for (var i = 0, k = 0; i < result.length; i++) {
                                if (i === errors[k]) {
                                    k++;
                                } else {
                                    result[i] = {success: true, result: result[i]};
                                }
                            }
                        }
                        reject(new BatchError(result, errors, Date.now() - start));
                    } else {
                        $utils.extend(result, 'duration', Date.now() - start);
                        resolve(result);
                    }
                }
                return null; // this dummy return is just to prevent Bluebird warnings;
            }
        }
    });
}

module.exports = function (config) {
    return function (values, cb) {
        if (cb && typeof cb === 'object') {
            return batch.call(this, values, cb.cb, config);
        } else {
            return batch.call(this, values, cb, config);
        }
    };
};


/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var PageError = __webpack_require__(101);

/**
 * @method page
 * @description
 * **Alternative Syntax:**
 * `page(source, {dest, limit})` &#8658; `Promise`
 *
 * Resolves a dynamic sequence of pages/arrays with [mixed values]{@tutorial mixed}.
 *
 * The method acquires pages (arrays of [mixed values]{@tutorial mixed}) from the `source` function, one by one,
 * and resolves each page as a {@link batch}, till no more pages left or an error/reject occurs.
 *
 * @param {Function|generator} source
 * Expected to return a [mixed value]{@tutorial mixed} that resolves with the next page of data (array of [mixed values]{@tutorial mixed}).
 * Returning or resolving with `undefined` ends the sequence, and the method resolves.
 *
 * The function inherits `this` context from the calling method.
 *
 * Parameters:
 *  - `index` = index of the page being requested
 *  - `data` = previously returned page, resolved as a {@link batch} (`undefined` when `index=0`)
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * If the function throws an error or returns a rejected promise, the method rejects with
 * {@link errors.PageError PageError}, which will have property `source` set.
 *
 * And if the function returns or resolves with anything other than an array or `undefined`,
 * the method rejects with the same {@link errors.PageError PageError}, but with `error` set to
 * `Unexpected data returned from the source.`
 *
 * Passing in anything other than a function will reject with {@link external:TypeError TypeError} = `Parameter 'source' must be a function.`
 *
 * @param {Function|generator} [dest]
 * Optional destination function (or generator), to receive a resolved {@link batch} of data
 * for each page, process it and respond as required.
 *
 * Parameters:
 *  - `index` = page index in the sequence
 *  - `data` = page data resolved as a {@link batch}
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * It can optionally return a promise object, if notifications are handled asynchronously.
 * And if a promise is returned, the method will not request another page from the `source`
 * function until the promise has been resolved.
 *
 * If the function throws an error or returns a rejected promise, the sequence terminates,
 * and the method rejects with {@link errors.PageError PageError}, which will have property `dest` set.
 *
 * @param {Number} [limit=0]
 * Limits the maximum number of pages to be requested from the `source`. If the value is greater
 * than 0, the method will successfully resolve once the specified limit has been reached.
 *
 * When `limit` isn't specified (default), the sequence is unlimited, and it will continue
 * till one of the following occurs:
 *  - `source` returns or resolves with `undefined` or an invalid value (non-array)
 *  - either `source` or `dest` functions throw an error or return a rejected promise
 *
 * @returns {external:Promise}
 *
 * When successful, the method resolves with object `{pages, total, duration}`:
 *  - `pages` = number of pages resolved
 *  - `total` = the sum of all page sizes (total number of values resolved)
 *  - `duration` = number of milliseconds consumed by the method
 *
 * When the method fails, it rejects with {@link errors.PageError PageError}.
 *
 */
function page(source, dest, limit, config) {

    var $p = config.promise, $spex = config.spex, $utils = config.utils;

    if (typeof source !== 'function') {
        return $p.reject(new TypeError("Parameter 'source' must be a function."));
    }

    limit = (limit > 0) ? parseInt(limit) : 0;
    source = $utils.wrap(source);
    dest = $utils.wrap(dest);

    var self = this, request, srcTime, destTime, start = Date.now(), total = 0;

    return $p(function (resolve, reject) {

        function loop(idx) {
            var srcNow = Date.now(),
                srcDelay = idx ? (srcNow - srcTime) : undefined;
            srcTime = srcNow;
            $utils.resolve.call(self, source, [idx, request, srcDelay], function (value) {
                if (value === undefined) {
                    success();
                } else {
                    if (value instanceof Array) {
                        $spex.batch(value)
                            .then(function (data) {
                                request = data;
                                total += data.length;
                                if (dest) {
                                    var destResult, destNow = Date.now(),
                                        destDelay = idx ? (destNow - destTime) : undefined;
                                    destTime = destNow;
                                    try {
                                        destResult = dest.call(self, idx, data, destDelay);
                                    } catch (err) {
                                        fail({
                                            error: err,
                                            dest: data
                                        }, 4, dest.name);
                                        return;
                                    }
                                    if ($utils.isPromise(destResult)) {
                                        destResult
                                            .then(next)
                                            .catch(function (error) {
                                                fail({
                                                    error: error,
                                                    dest: data
                                                }, 3, dest.name);
                                            });
                                    } else {
                                        next();
                                    }
                                } else {
                                    next();
                                }
                                return null; // this dummy return is just to prevent Bluebird warnings;
                            })
                            .catch(function (error) {
                                fail({
                                    error: error
                                }, 0);
                            });
                    } else {
                        fail({
                            error: new Error("Unexpected data returned from the source."),
                            source: request
                        }, 5, source.name);
                    }
                }
            }, function (reason, isRej) {
                fail({
                    error: reason,
                    source: request
                }, isRej ? 1 : 2, source.name);
            });

            function next() {
                if (limit === ++idx) {
                    success();
                } else {
                    loop(idx);
                }
                return null; // this dummy return is just to prevent Bluebird warnings;
            }

            function success() {
                resolve({
                    pages: idx,
                    total: total,
                    duration: Date.now() - start
                });
            }

            function fail(reason, code, cbName) {
                reason.index = idx;
                reject(new PageError(reason, code, cbName, Date.now() - start));
            }
        }

        loop(0);
    });
}

module.exports = function (config) {
    return function (source, dest, limit) {
        if (dest && typeof dest === 'object') {
            return page.call(this, source, dest.dest, dest.limit, config);
        } else {
            return page.call(this, source, dest, limit, config);
        }
    };
};


/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var SequenceError = __webpack_require__(102);

/**
 * @method sequence
 * @description
 * **Alternative Syntax:**
 * `sequence(source, {dest, limit, track})` &#8658; `Promise`
 *
 * Resolves a dynamic sequence of [mixed values]{@tutorial mixed}.
 *
 * The method acquires [mixed values]{@tutorial mixed} from the `source` function, one at a time, and resolves them,
 * till either no more values left in the sequence or an error/reject occurs.
 *
 * It supports both [linked and detached sequencing]{@tutorial sequencing}.
 *
 * @param {Function|generator} source
 * Expected to return the next [mixed value]{@tutorial mixed} to be resolved. Returning or resolving
 * with `undefined` ends the sequence, and the method resolves.
 *
 * Parameters:
 *  - `index` = current request index in the sequence
 *  - `data` = resolved data from the previous call (`undefined` when `index=0`)
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * If the function throws an error or returns a rejected promise, the sequence terminates,
 * and the method rejects with {@link errors.SequenceError SequenceError}, which will have property `source` set.
 *
 * Passing in anything other than a function will reject with {@link external:TypeError TypeError} = `Parameter 'source' must be a function.`
 *
 * @param {Function|generator} [dest]
 * Optional destination function (or generator), to receive resolved data for each index,
 * process it and respond as required.
 *
 * Parameters:
 *  - `index` = index of the resolved data in the sequence
 *  - `data` = the data resolved
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function inherits `this` context from the calling method.
 *
 * It can optionally return a promise object, if data processing is done asynchronously.
 * If a promise is returned, the method will not request another value from the `source` function,
 * until the promise has been resolved (the resolved value is ignored).
 *
 * If the function throws an error or returns a rejected promise, the sequence terminates,
 * and the method rejects with {@link errors.SequenceError SequenceError}, which will have property `dest` set.
 *
 * @param {Number} [limit=0]
 * Limits the maximum size of the sequence. If the value is greater than 0, the method will
 * successfully resolve once the specified limit has been reached.
 *
 * When `limit` isn't specified (default), the sequence is unlimited, and it will continue
 * till one of the following occurs:
 *  - `source` either returns or resolves with `undefined`
 *  - either `source` or `dest` functions throw an error or return a rejected promise
 *
 * @param {Boolean} [track=false]
 * Changes the type of data to be resolved by this method. By default, it is `false`
 * (see the return result). When set to be `true`, the method tracks/collects all resolved data
 * into an array internally, and resolves with that array once the method has finished successfully.
 *
 * It must be used with caution, as to the size of the sequence, because accumulating data for
 * a very large sequence can result in consuming too much memory.
 *
 * @returns {external:Promise}
 *
 * When successful, the resolved data depends on parameter `track`. When `track` is `false`
 * (default), the method resolves with object `{total, duration}`:
 *  - `total` = number of values resolved by the sequence
 *  - `duration` = number of milliseconds consumed by the method
 *
 * When `track` is `true`, the method resolves with an array of all the data that has been resolved,
 * the same way that the standard $[promise.all] resolves. In addition, the array comes extended with
 * a hidden read-only property `duration` - number of milliseconds consumed by the method.
 *
 * When the method fails, it rejects with {@link errors.SequenceError SequenceError}.
 */
function sequence(source, dest, limit, track, config) {

    var $p = config.promise, $utils = config.utils;

    if (typeof source !== 'function') {
        return $p.reject(new TypeError("Parameter 'source' must be a function."));
    }

    limit = (limit > 0) ? parseInt(limit) : 0;
    source = $utils.wrap(source);
    dest = $utils.wrap(dest);

    var self = this, data, srcTime, destTime, result = [], start = Date.now();

    return $p(function (resolve, reject) {

        function loop(idx) {
            var srcNow = Date.now(),
                srcDelay = idx ? (srcNow - srcTime) : undefined;
            srcTime = srcNow;
            $utils.resolve.call(self, source, [idx, data, srcDelay], function (value, delayed) {
                data = value;
                if (data === undefined) {
                    success();
                } else {
                    if (track) {
                        result.push(data);
                    }
                    if (dest) {
                        var destResult, destNow = Date.now(),
                            destDelay = idx ? (destNow - destTime) : undefined;
                        destTime = destNow;
                        try {
                            destResult = dest.call(self, idx, data, destDelay);
                        } catch (e) {
                            fail({
                                error: e,
                                dest: data
                            }, 3, dest.name);
                            return;
                        }
                        if ($utils.isPromise(destResult)) {
                            destResult
                                .then(function () {
                                    next(true);
                                    return null; // this dummy return is just to prevent Bluebird warnings;
                                })
                                .catch(function (error) {
                                    fail({
                                        error: error,
                                        dest: data
                                    }, 2, dest.name);
                                });
                        } else {
                            next(delayed);
                        }
                    } else {
                        next(delayed);
                    }
                }
            }, function (reason, isRej) {
                fail({
                    error: reason,
                    source: data
                }, isRej ? 0 : 1, source.name);
            });

            function next(delayed) {
                if (limit === ++idx) {
                    success();
                } else {
                    if (delayed) {
                        loop(idx);
                    } else {
                        $p.resolve()
                            .then(function () {
                                loop(idx);
                                return null; // this dummy return is just to prevent Bluebird warnings;
                            });
                    }
                }
            }

            function success() {
                var length = Date.now() - start;
                if (track) {
                    $utils.extend(result, 'duration', length);
                } else {
                    result = {
                        total: idx,
                        duration: length
                    }
                }
                resolve(result);
            }

            function fail(reason, code, cbName) {
                reason.index = idx;
                reject(new SequenceError(reason, code, cbName, Date.now() - start));
            }
        }

        loop(0);
    });
}

module.exports = function (config) {
    return function (source, dest, limit, track) {
        if (dest && typeof dest === 'object') {
            return sequence.call(this, source, dest.dest, dest.limit, dest.track, config);
        } else {
            return sequence.call(this, source, dest, limit, track, config);
        }
    };
};


/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    read: __webpack_require__(142)
};

/**
 * @namespace stream
 * @description
 * Namespace with methods that implement stream operations, and {@link stream.read read} is the only method currently supported.
 *
 * **Synchronous Stream Processing**
 *
 * ```javascript
 * var stream = require('spex')(Promise).stream;
 * var fs = require('fs');
 *
 * var rs = fs.createReadStream('values.txt');
 *
 * function receiver(index, data, delay) {
 *    console.log("RECEIVED:", index, data, delay);
 * }
 *
 * stream.read(rs, receiver)
 * .then(function (data) {
 *        console.log("DATA:", data);
 *    })
 * .catch(function (error) {
 *        console.log("ERROR:", error);
 *    });
 * ```
 *
 * **Asynchronous Stream Processing**
 *
 * ```javascript
 * var stream = require('spex')(Promise).stream;
 * var fs = require('fs');
 *
 * var rs = fs.createReadStream('values.txt');
 *
 * function receiver(index, data, delay) {
 *    return new Promise(function (resolve) {
 *        console.log("RECEIVED:", index, data, delay);
 *        resolve();
 *    });
 * }
 *
 * stream.read(rs, receiver)
 * .then(function (data) {
 *        console.log("DATA:", data);
 *    })
 * .catch(function (error) {
 *        console.log("ERROR:", error);
 *    });
 * ```
 *
 * @property {function} stream.read
 * Consumes and processes data from a $[Readable] stream.
 *
 */
module.exports = function (config) {
    var res = {
        read: $npm.read(config)
    };
    Object.freeze(res);
    return res;
};



/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @method stream.read
 * @description
 * **Alternative Syntax:**
 * `read(stream, receiver, {closable, readSize})` &#8658; `Promise`
 *
 * Consumes and processes data from a $[Readable] stream.
 *
 * It reads the entire stream, using **paused mode**, with support for both synchronous
 * and asynchronous data processing.
 *
 * **NOTE:** Once the method has finished, the onus is on the caller to release the stream
 * according to its protocol.
 *
 * @param {Object} stream
 * $[Readable] stream object.
 *
 * Passing in anything else will throw `Readable stream is required.`
 *
 * @param {Function|generator} receiver
 * Data processing callback (or generator).
 *
 * Passing in anything else will throw `Invalid stream receiver.`
 *
 * Parameters:
 *  - `index` = index of the call made to the function
 *  - `data` = array of all data reads from the stream's buffer
 *  - `delay` = number of milliseconds since the last call (`undefined` when `index=0`)
 *
 * The function is called with the same `this` context as the calling method.
 *
 * It can optionally return a promise object, if data processing is asynchronous.
 * And if a promise is returned, the method will not read data from the stream again,
 * until the promise has been resolved.
 *
 * If the function throws an error or returns a rejected promise, the method rejects
 * with the same error / rejection reason.
 *
 * @param {Boolean} [closable=false]
 * Instructs the method to resolve on event `close` supported by the stream,
 * as opposed to event `end` that's used by default.
 *
 * @param {Number} [readSize]
 *
 * When the value is greater than 0, it sets the read size from the stream's buffer
 * when the next data is available. By default, the method uses as few reads as possible
 * to get all the data currently available in the buffer.
 *
 * @returns {external:Promise}
 *
 * When finished successfully, resolves with object `{calls, reads, length, duration}`:
 *  - `calls` = number of calls made into the `receiver`
 *  - `reads` = number of successful reads from the stream
 *  - `length` = total length for all the data reads from the stream
 *  - `duration` = number of milliseconds consumed by the method
 *
 * When it fails, the method rejects with the error/reject specified,
 * which can happen as a result of:
 *  - event `error` emitted by the stream
 *  - receiver throws an error or returns a rejected promise
 */
function read(stream, receiver, closable, readSize, config) {

    var $p = config.promise, $utils = config.utils;

    if (!$utils.isReadableStream(stream)) {
        return $p.reject(new TypeError("Readable stream is required."));
    }

    if (typeof receiver !== 'function') {
        return $p.reject(new TypeError("Invalid stream receiver."));
    }

    readSize = (readSize > 0) ? parseInt(readSize) : null;
    receiver = $utils.wrap(receiver);

    var self = this, reads = 0, length = 0, start = Date.now(),
        index = 0, cbTime, ready, waiting, stop;

    return $p(function (resolve, reject) {

        function onReadable() {
            ready = true;
            process();
        }

        function onEnd() {
            if (!closable) {
                success();
            }
        }

        function onClose() {
            success();
        }

        function onError(error) {
            fail(error);
        }

        stream.on('readable', onReadable);
        stream.on('end', onEnd);
        stream.on('close', onClose);
        stream.on('error', onError);

        function process() {
            if (!ready || stop || waiting) {
                return;
            }
            ready = false;
            waiting = true;
            var page, data = [];
            do {
                page = stream.read(readSize);
                if (page) {
                    data.push(page);
                    // istanbul ignore next: requires a unique stream that
                    // creates objects without property `length` defined.
                    length += page.length || 0;
                    reads++;
                }
            } while (page);

            if (!data.length) {
                waiting = false;
                return;
            }

            var result, cbNow = Date.now(),
                cbDelay = index ? (cbNow - cbTime) : undefined;
            cbTime = cbNow;
            try {
                result = receiver.call(self, index++, data, cbDelay);
            } catch (e) {
                fail(e);
                return;
            }

            if ($utils.isPromise(result)) {
                result
                    .then(function () {
                        waiting = false;
                        process();
                        return null; // this dummy return is just to prevent Bluebird warnings;
                    })
                    .catch(function (error) {
                        fail(error);
                    });
            } else {
                waiting = false;
                process();
            }
        }

        function success() {
            cleanup();
            resolve({
                calls: index,
                reads: reads,
                length: length,
                duration: Date.now() - start
            });
        }

        function fail(error) {
            stop = true;
            cleanup();
            reject(error);
        }

        function cleanup() {
            stream.removeListener('readable', onReadable);
            stream.removeListener('close', onClose);
            stream.removeListener('error', onError);
            stream.removeListener('end', onEnd);
        }
    });
}

module.exports = function (config) {
    return function (stream, receiver, closable, readSize) {
        if (closable && typeof closable === 'object') {
            return read.call(this, stream, receiver, closable.closable, closable.readSize, config);
        } else {
            return read.call(this, stream, receiver, closable, readSize, config);
        }
    };
};


/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var $npm = {
    utils: __webpack_require__(144),
    batch: __webpack_require__(138),
    page: __webpack_require__(139),
    sequence: __webpack_require__(140),
    stream: __webpack_require__(141),
    errors: __webpack_require__(137)
};

/**
 * @module spex
 * @summary Specialized Promise Extensions
 * @author Vitaly Tomilov
 *
 * @description
 * Attaches to an external promise library and provides additional methods built solely
 * on the basic promise operations:
 *  - construct a new promise with a callback function
 *  - resolve a promise with some result data
 *  - reject a promise with a reason
 *
 * ### usage
 * For any third-party promise library:
 * ```js
 * var promise = require('bluebird');
 * var spex = require('spex')(promise);
 * ```
 * For ES6 promises:
 * ```js
 * var spex = require('spex')(Promise);
 * ```
 *
 * @param {Object|Function} promiseLib
 * Instance of a promise library to be used by this module.
 *
 * Some implementations use `Promise` constructor to create a new promise, while
 * others use the module's function for it. Both types are supported the same.
 *
 * Alternatively, an object of type {@link PromiseAdapter} can be passed in, which provides
 * compatibility with any promise library outside of the standard.
 *
 * Passing in a promise library that cannot be recognized will throw
 * `Invalid promise library specified.`
 *
 * @returns {Object}
 * Namespace with all supported methods.
 *
 * @see {@link PromiseAdapter}, {@link batch}, {@link page}, {@link sequence}, {@link stream}
 */
function main(promiseLib) {

    var spex = {}, // library instance;
        promise = parsePromiseLib(promiseLib); // promise library parsing;

    var config = {
        spex: spex,
        promise: promise,
        utils: $npm.utils(promise)
    };

    spex.errors = $npm.errors;
    spex.batch = $npm.batch(config);
    spex.page = $npm.page(config);
    spex.sequence = $npm.sequence(config);
    spex.stream = $npm.stream(config);

    config.utils.extend(spex, '$p', promise);

    Object.freeze(spex);

    return spex;
}

//////////////////////////////////////////
// Parses and validates a promise library;
function parsePromiseLib(lib) {
    if (lib) {
        var promise;
        if (lib instanceof main.PromiseAdapter) {
            promise = function (func) {
                return lib.create(func);
            };
            promise.resolve = lib.resolve;
            promise.reject = lib.reject;
            return promise;
        }
        var t = typeof lib;
        if (t === 'function' || t === 'object') {
            var root = typeof lib.Promise === 'function' ? lib.Promise : lib;
            promise = function (func) {
                return new root(func);
            };
            promise.resolve = root.resolve;
            promise.reject = root.reject;
            if (typeof promise.resolve === 'function' && typeof promise.reject === 'function') {
                return promise;
            }
        }
    }
    throw new TypeError("Invalid promise library specified.");
}

main.PromiseAdapter = __webpack_require__(136);
Object.freeze(main);

module.exports = main;

/**
 * @external Error
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 */

/**
 * @external TypeError
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
 */

/**
 * @external Promise
 * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
 */


/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stat = __webpack_require__(82);

module.exports = function ($p) {

    var exp = {
        formatError: stat.formatError,
        isPromise: stat.isPromise,
        isReadableStream: stat.isReadableStream,
        messageGap: stat.messageGap,
        extend: stat.extend,
        resolve: resolve,
        wrap: wrap
    };

    return exp;

    //////////////////////////////////////////
    // Checks if the function is a generator,
    // and if so - wraps it up into a promise;
    function wrap(func) {
        if (typeof func === 'function') {
            if (func.constructor.name === 'GeneratorFunction') {
                return asyncAdapter(func);
            }
            return func;
        }
        return null;
    }

    /////////////////////////////////////////////////////
    // Resolves a mixed value into the actual value,
    // consistent with the way mixed values are defined:
    // https://github.com/vitaly-t/spex/wiki/Mixed-Values
    function resolve(value, params, onSuccess, onError) {

        var self = this,
            delayed = false;

        function loop() {
            while (typeof value === 'function') {
                if (value.constructor.name === 'GeneratorFunction') {
                    value = asyncAdapter(value);
                }
                try {
                    value = params ? value.apply(self, params) : value.call(self);
                } catch (e) {
                    onError(e, false); // false means 'threw an error'
                    return;
                }
            }
            if (exp.isPromise(value)) {
                value
                    .then(function (data) {
                        delayed = true;
                        value = data;
                        loop();
                        return null; // this dummy return is just to prevent Bluebird warnings;
                    })
                    .catch(function (error) {
                        onError(error, true); // true means 'rejected'
                    });
            } else {
                onSuccess(value, delayed);
            }
        }

        loop();
    }

    // Generator-to-Promise adapter;
    // Based on: https://www.promisejs.org/generators/#both
    function asyncAdapter(generator) {
        return function () {
            var g = generator.apply(this, arguments);

            function handle(result) {
                if (result.done) {
                    return $p.resolve(result.value);
                }
                return $p.resolve(result.value)
                    .then(function (res) {
                        return handle(g.next(res));
                    }, function (err) {
                        return handle(g.throw(err));
                    });
            }

            return handle(g.next());
        }
    }

};


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map