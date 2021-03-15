"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var styled_components_1 = __importDefault(require("styled-components"));
var theme_1 = __importDefault(require("../../theme/theme"));
var ToggleContainer = styled_components_1.default.label(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""])));
var ToggleBase = styled_components_1.default.span(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  position: relative;\n  box-sizing: border-box;\n  display: inline-grid;\n  align-items: center;\n  width: ", ";\n  height: ", ";\n  vertical-align: middle;\n  margin: 0 4px;\n\n  input[type=\"checkbox\"] {\n    position: absolute;\n    margin-left: -9999px;\n    visibility: hidden;\n\n    // off state\n    & + label {\n      display: inline-grid;\n      box-sizing: border-box;\n      align-items: center;\n      outline: none;\n      user-select: none;\n      width: ", ";\n      height: ", ";\n      background-color: ", ";\n      border-radius: ", ";\n      cursor: pointer;\n      transition: background ease-out 0.3s;\n\n      &:before {\n        content: \"\";\n        display: block;\n        position: absolute;\n        border-radius: ", ";\n        width: calc(\n          ", " - 2 *\n            ", "\n        );\n        height: calc(\n          ", " - 2 *\n            ", "\n        );\n        background-color: ", ";\n        left: ", ";\n      }\n\n      &:after {\n        display: block;\n        position: absolute;\n        content: \"\";\n        width: ", ";\n        height: ", ";\n        border-radius: ", ";\n        background-color: ", ";\n        transition: all ease-out 0.4s;\n        margin-left: ", ";\n      }\n    }\n\n    // on state\n    &:checked {\n      & + label {\n        background-color: ", ";\n\n        &:before {\n          background-color: ", ";\n        }\n\n        &:after {\n          margin-left: calc(\n            100% - ", " -\n              ", "\n          );\n          transition: all ease-out 0.2s;\n          background-color: ", ";\n        }\n      }\n\n      &:disabled {\n        & + label {\n          background-color: ", ";\n          &:after {\n            box-shadow: none;\n          }\n        }\n      }\n    }\n\n    // disabled\n    &:disabled {\n      & + label {\n        background-color: ", ";\n        cursor: default;\n        &:after {\n          box-shadow: none;\n          background-color: ", ";\n        }\n      }\n    }\n  }\n"], ["\n  position: relative;\n  box-sizing: border-box;\n  display: inline-grid;\n  align-items: center;\n  width: ", ";\n  height: ", ";\n  vertical-align: middle;\n  margin: 0 4px;\n\n  input[type=\"checkbox\"] {\n    position: absolute;\n    margin-left: -9999px;\n    visibility: hidden;\n\n    // off state\n    & + label {\n      display: inline-grid;\n      box-sizing: border-box;\n      align-items: center;\n      outline: none;\n      user-select: none;\n      width: ", ";\n      height: ", ";\n      background-color: ",
    ";\n      border-radius: ", ";\n      cursor: pointer;\n      transition: background ease-out 0.3s;\n\n      &:before {\n        content: \"\";\n        display: block;\n        position: absolute;\n        border-radius: ",
    ";\n        width: calc(\n          ", " - 2 *\n            ", "\n        );\n        height: calc(\n          ", " - 2 *\n            ", "\n        );\n        background-color: ",
    ";\n        left: ", ";\n      }\n\n      &:after {\n        display: block;\n        position: absolute;\n        content: \"\";\n        width: ", ";\n        height: ", ";\n        border-radius: ", ";\n        background-color: ",
    ";\n        transition: all ease-out 0.4s;\n        margin-left: ", ";\n      }\n    }\n\n    // on state\n    &:checked {\n      & + label {\n        background-color: ",
    ";\n\n        &:before {\n          background-color: ",
    ";\n        }\n\n        &:after {\n          margin-left: calc(\n            100% - ", " -\n              ", "\n          );\n          transition: all ease-out 0.2s;\n          background-color: ",
    ";\n        }\n      }\n\n      &:disabled {\n        & + label {\n          background-color: ",
    ";\n          &:after {\n            box-shadow: none;\n          }\n        }\n      }\n    }\n\n    // disabled\n    &:disabled {\n      & + label {\n        background-color: ",
    ";\n        cursor: default;\n        &:after {\n          box-shadow: none;\n          background-color: ",
    ";\n        }\n      }\n    }\n  }\n"])), function (p) { return p.width || (p.theme && p.theme.width) || theme_1.default.width; }, function (p) { return p.height || (p.theme && p.theme.height) || theme_1.default.height; }, function (p) { return p.width || (p.theme && p.theme.width) || theme_1.default.width; }, function (p) { return p.height || (p.theme && p.theme.height) || theme_1.default.height; }, function (p) {
    return p.borderColor || p.leftBorderColor || (p.theme && p.theme.leftBorderColor) || theme_1.default.leftBorderColor;
}, function (p) { return p.radius || (p.theme && p.theme.radius) || theme_1.default.radius; }, function (p) {
    return p.radiusBackground || (p.theme && p.theme.radiusBackground) || theme_1.default.radiusBackground;
}, function (p) { return p.width || (p.theme && p.theme.width) || theme_1.default.width; }, function (p) { return p.borderWidth || (p.theme && p.theme.borderWidth) || theme_1.default.borderWidth; }, function (p) { return p.height || (p.theme && p.theme.height) || theme_1.default.height; }, function (p) { return p.borderWidth || (p.theme && p.theme.borderWidth) || theme_1.default.borderWidth; }, function (p) {
    return p.backgroundColor ||
        p.leftBackgroundColor ||
        (p.theme && p.theme.leftBackgroundColor) ||
        theme_1.default.leftBackgroundColor;
}, function (p) { return p.borderWidth || (p.theme && p.theme.borderWidth) || theme_1.default.borderWidth; }, function (p) { return p.knobWidth || (p.theme && p.theme.knobWidth) || theme_1.default.knobWidth; }, function (p) { return p.knobHeight || (p.theme && p.theme.knobHeight) || theme_1.default.knobHeight; }, function (p) { return p.knobRadius || (p.theme && p.theme.knobRadius) || theme_1.default.knobRadius; }, function (p) {
    return p.knobColor || p.leftKnobColor || (p.theme && p.theme.leftKnobColor) || theme_1.default.leftKnobColor;
}, function (p) { return p.knobGap || (p.theme && p.theme.knobGap) || theme_1.default.knobGap; }, function (p) {
    return p.borderColor ||
        p.rightBorderColor ||
        (p.theme && p.theme.rightBorderColor) ||
        theme_1.default.rightBorderColor;
}, function (p) {
    return p.backgroundColor ||
        p.rightBackgroundColor ||
        (p.theme && p.theme.rightBackgroundColor) ||
        theme_1.default.rightBackgroundColor;
}, function (p) { return p.knobWidth || (p.theme && p.theme.knobWidth) || theme_1.default.knobWidth; }, function (p) { return p.knobGap || (p.theme && p.theme.knobGap) || theme_1.default.knobGap; }, function (p) {
    return p.knobColor || p.rightKnobColor || (p.theme && p.theme.rightKnobColor) || theme_1.default.rightKnobColor;
}, function (p) {
    return p.backgroundColorDisabled ||
        (p.theme && p.theme.backgroundColorDisabled) ||
        theme_1.default.backgroundColorDisabled;
}, function (p) {
    return p.backgroundColorDisabled ||
        (p.theme && p.theme.backgroundColorDisabled) ||
        theme_1.default.backgroundColorDisabled;
}, function (p) {
    return p.backgroundColorDisabled ||
        (p.theme && p.theme.backgroundColorDisabled) ||
        theme_1.default.backgroundColorDisabled;
});
var Toggle = function (props, ref) {
    var className = props.className, name = props.name, _a = props.checked, checked = _a === void 0 ? false : _a, _b = props.controlled, controlled = _b === void 0 ? false : _b, _c = props.disabled, disabled = _c === void 0 ? false : _c, _d = props.value, value = _d === void 0 ? "" : _d, _e = props.onToggle, onToggle = _e === void 0 ? function () { return true; } : _e, _f = props.onRight, onRight = _f === void 0 ? function () { return true; } : _f, _g = props.onLeft, onLeft = _g === void 0 ? function () { return true; } : _g, others = __rest(props, ["className", "name", "checked", "controlled", "disabled", "value", "onToggle", "onRight", "onLeft"]);
    var cls = ["react-toggle", className || ""].join(" ");
    var onChangeHandler = function (e) {
        if (!!onToggle) {
            onToggle(e);
            var target = e.target;
            if (target && target.checked) {
                onRight(e);
            }
            else {
                onLeft(e);
            }
        }
    };
    var checkedProp = function (controlled) {
        return controlled ? { checked: checked } : { defaultChecked: checked };
    };
    return (react_1.default.createElement(ToggleBase, __assign({ className: cls }, others),
        react_1.default.createElement("input", __assign({ ref: ref, onChange: onChangeHandler, type: "checkbox", id: name, name: name, value: value, disabled: disabled }, checkedProp(controlled))),
        react_1.default.createElement(ToggleContainer, { htmlFor: name })));
};
exports.ToggleProps = Toggle;
exports.default = react_1.forwardRef(Toggle);
var templateObject_1, templateObject_2;
//# sourceMappingURL=index.js.map