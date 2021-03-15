"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.success = success;
exports.failure = failure;
exports.unchanged = unchanged;

var _messageformat = _interopRequireDefault(require("messageformat"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const mf = new _messageformat.default('en');

function success(data) {
  const files = `{count, plural, one{file} other{files}}`;
  return mf.compile(`{success} formatting {countString} ${files} with prettier-eslint`)(data);
}

function failure(data) {
  const files = `{count, plural, one{file} other{files}}`;
  return mf.compile(`{failure} formatting {countString} ${files} with prettier-eslint`)(data);
}

function unchanged(data) {
  const files = `{count, plural, one{file was} other{files were}}`;
  return mf.compile(`{countString} ${files} {unchanged}`)(data);
}