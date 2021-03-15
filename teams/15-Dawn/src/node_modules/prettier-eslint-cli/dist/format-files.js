"use strict";

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.promise");

require("core-js/modules/es.string.trim");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _glob = _interopRequireDefault(require("glob"));

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _prettierEslint = _interopRequireDefault(require("prettier-eslint"));

var _chalk = _interopRequireDefault(require("chalk"));

var _getStdin = _interopRequireDefault(require("get-stdin"));

var _ignore = _interopRequireDefault(require("ignore"));

var _findUp = _interopRequireDefault(require("find-up"));

var _lodash = _interopRequireDefault(require("lodash.memoize"));

var _indentString = _interopRequireDefault(require("indent-string"));

var _loglevelColoredLevelPrefix = _interopRequireDefault(require("loglevel-colored-level-prefix"));

var _configFile = _interopRequireDefault(require("eslint/lib/config/config-file"));

var _linter = _interopRequireDefault(require("eslint/lib/linter"));

var _config2 = _interopRequireDefault(require("eslint/lib/config"));

var messages = _interopRequireWildcard(require("./messages"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

const LINE_SEPERATOR_REGEX = /(\r|\n|\r\n)/;
const rxGlob = (0, _rxjs.bindNodeCallback)(_glob.default);
const rxReadFile = (0, _rxjs.bindNodeCallback)(_fs.default.readFile);
const rxWriteFile = (0, _rxjs.bindNodeCallback)(_fs.default.writeFile);
const findUpEslintignoreSyncMemoized = (0, _lodash.default)(findUpEslintignoreSync, findUpMemoizeResolver);
const findUpPrettierignoreSyncMemoized = (0, _lodash.default)(findUpPrettierignoreSync, findUpMemoizeResolver);
const getIsIgnoredMemoized = (0, _lodash.default)(getIsIgnored);
const logger = (0, _loglevelColoredLevelPrefix.default)({
  prefix: 'prettier-eslint-cli'
});
var _default = formatFilesFromArgv;
exports.default = _default;

function formatFilesFromArgv(_ref) {
  let {
    _: fileGlobs,
    $0: _$0,
    //eslint-disable-line
    help: _help,
    h: _help_,
    version: _version,
    logLevel = logger.getLevel(),
    l: _logLevelAlias,
    config: _config,
    listDifferent,
    stdin,
    stdinFilepath,
    write,
    eslintPath,
    prettierPath,
    ignore: ignoreGlobs = [],
    eslintIgnore: applyEslintIgnore = true,
    prettierIgnore: applyPrettierIgnore = true,
    eslintConfigPath,
    prettierLast
  } = _ref,
      prettierOptions = _objectWithoutProperties(_ref, ["_", "$0", "help", "h", "version", "logLevel", "l", "config", "listDifferent", "stdin", "stdinFilepath", "write", "eslintPath", "prettierPath", "ignore", "eslintIgnore", "prettierIgnore", "eslintConfigPath", "prettierLast"]);

  logger.setLevel(logLevel);
  const prettierESLintOptions = {
    logLevel,
    eslintPath,
    prettierPath,
    prettierLast,
    prettierOptions
  };

  if (eslintConfigPath) {
    const configContext = new _config2.default({}, new _linter.default());
    prettierESLintOptions.eslintConfig = _configFile.default.load(eslintConfigPath, configContext);
  }

  const cliOptions = {
    write,
    listDifferent
  };

  if (stdin) {
    return formatStdin(_objectSpread({
      filePath: stdinFilepath
    }, prettierESLintOptions));
  } else {
    return formatFilesFromGlobs({
      fileGlobs,
      ignoreGlobs: [...ignoreGlobs],
      // make a copy to avoid manipulation
      cliOptions,
      prettierESLintOptions,
      applyEslintIgnore,
      applyPrettierIgnore
    });
  }
}

async function formatStdin(prettierESLintOptions) {
  const stdinValue = (await (0, _getStdin.default)()).trim();

  try {
    const formatted = (0, _prettierEslint.default)(_objectSpread({
      text: stdinValue
    }, prettierESLintOptions));
    process.stdout.write(formatted);
    return Promise.resolve(formatted);
  } catch (error) {
    logger.error('There was a problem trying to format the stdin text', `\n${(0, _indentString.default)(error.stack, 4)}`);
    process.exitCode = 1;
    return Promise.resolve(stdinValue);
  }
}

function formatFilesFromGlobs({
  fileGlobs,
  ignoreGlobs,
  cliOptions,
  prettierESLintOptions,
  applyEslintIgnore,
  applyPrettierIgnore
}) {
  const concurrentGlobs = 3;
  const concurrentFormats = 10;
  return new Promise(resolve => {
    const successes = [];
    const failures = [];
    const unchanged = [];
    (0, _rxjs.from)(fileGlobs).pipe((0, _operators.mergeMap)(getFilesFromGlob.bind(null, ignoreGlobs, applyEslintIgnore, applyPrettierIgnore), null, concurrentGlobs), (0, _operators.concatAll)(), (0, _operators.distinct)(), (0, _operators.mergeMap)(filePathToFormatted, null, concurrentFormats)).subscribe(onNext, onError, onComplete);

    function filePathToFormatted(filePath) {
      return formatFile(filePath, prettierESLintOptions, cliOptions);
    }

    function onNext(info) {
      if (info.error) {
        failures.push(info);
      } else if (info.unchanged) {
        unchanged.push(info);
      } else {
        successes.push(info);
      }
    }

    function onError(error) {
      logger.error('There was an unhandled error while formatting the files', `\n${(0, _indentString.default)(error.stack, 4)}`);
      process.exitCode = 1;
      resolve({
        error,
        successes,
        failures
      });
    }

    function onComplete() {
      const isNotSilent = logger.getLevel() !== logger.levels.SILENT;
      /* use console.error directly here because
       * - we don't want these messages prefixed
       * - we want them to go to stderr, not stdout
       */

      if (successes.length && isNotSilent) {
        console.error(messages.success({
          success: _chalk.default.green('success'),
          count: successes.length,
          countString: _chalk.default.bold(successes.length)
        }));
      }

      if (failures.length && isNotSilent) {
        process.exitCode = 1;
        console.error(messages.failure({
          failure: _chalk.default.red('failure'),
          count: failures.length,
          countString: _chalk.default.bold(failures.length)
        }));
      }

      if (unchanged.length && isNotSilent) {
        console.error(messages.unchanged({
          unchanged: _chalk.default.gray('unchanged'),
          count: unchanged.length,
          countString: _chalk.default.bold(unchanged.length)
        }));
      }

      resolve({
        successes,
        failures
      });
    }
  });
}

function getFilesFromGlob(ignoreGlobs, applyEslintIgnore, applyPrettierIgnore, fileGlob) {
  const globOptions = {
    ignore: ignoreGlobs
  };

  if (!fileGlob.includes('node_modules')) {
    // basically, we're going to protect you from doing something
    // not smart unless you explicitly include it in your glob
    globOptions.ignore.push('**/node_modules/**');
  }

  return rxGlob(fileGlob, globOptions).pipe((0, _operators.map)(filePaths => {
    return filePaths.filter(filePath => {
      if (applyEslintIgnore && isFilePathMatchedByEslintignore(filePath)) {
        return false;
      }

      if (applyPrettierIgnore && isFilePathMatchedByPrettierignore(filePath)) {
        return false;
      }

      return true;
    });
  }));
}

function formatFile(filePath, prettierESLintOptions, cliOptions) {
  const fileInfo = {
    filePath
  };
  let format$ = rxReadFile(filePath, 'utf8').pipe((0, _operators.map)(text => {
    fileInfo.text = text;
    fileInfo.formatted = (0, _prettierEslint.default)(_objectSpread({
      text,
      filePath
    }, prettierESLintOptions));
    fileInfo.unchanged = fileInfo.text === fileInfo.formatted;
    return fileInfo;
  }));

  if (cliOptions.write) {
    format$ = format$.pipe((0, _operators.mergeMap)(info => {
      if (info.unchanged) {
        return (0, _rxjs.of)(info);
      } else {
        return rxWriteFile(filePath, info.formatted).pipe((0, _operators.map)(() => info));
      }
    }));
  } else if (cliOptions.listDifferent) {
    format$ = format$.pipe((0, _operators.map)(info => {
      if (!info.unchanged) {
        process.exitCode = 1;
        console.log(info.filePath);
      }

      return info;
    }));
  } else {
    format$ = format$.pipe((0, _operators.map)(info => {
      process.stdout.write(info.formatted);
      return info;
    }));
  }

  return format$.pipe((0, _operators.catchError)(error => {
    logger.error(`There was an error formatting "${fileInfo.filePath}":`, `\n${(0, _indentString.default)(error.stack, 4)}`);
    return (0, _rxjs.of)(Object.assign(fileInfo, {
      error
    }));
  }));
}

function getNearestEslintignorePath(filePath) {
  const {
    dir
  } = _path.default.parse(filePath);

  return findUpEslintignoreSyncMemoized('.eslintignore', dir);
}

function isFilePathMatchedByEslintignore(filePath) {
  const eslintignorePath = getNearestEslintignorePath(filePath);

  if (!eslintignorePath) {
    return false;
  }

  const eslintignoreDir = _path.default.parse(eslintignorePath).dir;

  const filePathRelativeToEslintignoreDir = _path.default.relative(eslintignoreDir, filePath);

  const isIgnored = getIsIgnoredMemoized(eslintignorePath);
  return isIgnored(filePathRelativeToEslintignoreDir);
}

function getNearestPrettierignorePath(filePath) {
  const {
    dir
  } = _path.default.parse(filePath);

  return findUpPrettierignoreSyncMemoized('.prettierignore', dir);
}

function isFilePathMatchedByPrettierignore(filePath) {
  const prettierignorePath = getNearestPrettierignorePath(filePath);

  if (!prettierignorePath) {
    return false;
  }

  const prettierignoreDir = _path.default.parse(prettierignorePath).dir;

  const filePathRelativeToPrettierignoreDir = _path.default.relative(prettierignoreDir, filePath);

  const isIgnored = getIsIgnoredMemoized(prettierignorePath);
  return isIgnored(filePathRelativeToPrettierignoreDir);
}

function findUpMemoizeResolver(...args) {
  return args.join('::');
}

function findUpEslintignoreSync(filename, cwd) {
  return _findUp.default.sync('.eslintignore', {
    cwd
  });
}

function findUpPrettierignoreSync(filename, cwd) {
  return _findUp.default.sync('.prettierignore', {
    cwd
  });
}

function getIsIgnored(filename) {
  const ignoreLines = _fs.default.readFileSync(filename, 'utf8').split(LINE_SEPERATOR_REGEX).filter(line => Boolean(line.trim()));

  const instance = (0, _ignore.default)();
  instance.add(ignoreLines);
  return instance.ignores.bind(instance);
}