'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('@babel/runtime/helpers/extends');
require('@babel/runtime/helpers/defineProperty');
var _classCallCheck = _interopDefault(require('@babel/runtime/helpers/classCallCheck'));
var _createClass = _interopDefault(require('@babel/runtime/helpers/createClass'));
var _inherits = _interopDefault(require('@babel/runtime/helpers/inherits'));
var _possibleConstructorReturn = _interopDefault(require('@babel/runtime/helpers/possibleConstructorReturn'));
var _getPrototypeOf = _interopDefault(require('@babel/runtime/helpers/getPrototypeOf'));
require('@babel/runtime/helpers/toConsumableArray');
var React = require('react');
var React__default = _interopDefault(React);
var react = require('@emotion/react');
require('react-dom');
require('@babel/runtime/helpers/typeof');
var index$1 = require('./index-ba786d0c.cjs.dev.js');
var reactSelect = require('./Select-80425816.cjs.dev.js');
require('@babel/runtime/helpers/objectWithoutProperties');
require('@babel/runtime/helpers/taggedTemplateLiteral');
require('react-input-autosize');
var stateManager = require('./stateManager-4a65415d.cjs.dev.js');
var createCache = _interopDefault(require('@emotion/cache'));
var memoizeOne = _interopDefault(require('memoize-one'));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var NonceProvider = /*#__PURE__*/function (_Component) {
  _inherits(NonceProvider, _Component);

  var _super = _createSuper(NonceProvider);

  function NonceProvider(props) {
    var _this;

    _classCallCheck(this, NonceProvider);

    _this = _super.call(this, props);

    _this.createEmotionCache = function (nonce, key) {
      return createCache({
        nonce: nonce,
        key: key
      });
    };

    _this.createEmotionCache = memoizeOne(_this.createEmotionCache);
    return _this;
  }

  _createClass(NonceProvider, [{
    key: "render",
    value: function render() {
      var emotionCache = this.createEmotionCache(this.props.nonce, this.props.cacheKey);
      return /*#__PURE__*/React__default.createElement(react.CacheProvider, {
        value: emotionCache
      }, this.props.children);
    }
  }]);

  return NonceProvider;
}(React.Component);

var index = stateManager.manageState(reactSelect.Select);

exports.components = index$1.components;
exports.createFilter = reactSelect.createFilter;
exports.defaultTheme = reactSelect.defaultTheme;
exports.mergeStyles = reactSelect.mergeStyles;
exports.NonceProvider = NonceProvider;
exports.default = index;
