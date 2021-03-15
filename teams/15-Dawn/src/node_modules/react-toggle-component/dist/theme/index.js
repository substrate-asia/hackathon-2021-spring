"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Default theme provider.
 *
 */
var react_1 = __importDefault(require("react"));
var styled_components_1 = require("styled-components");
var theme_1 = __importDefault(require("./theme"));
var ReactToggleThemeProvider = function (_a) {
    var children = _a.children, theme = _a.theme;
    return react_1.default.createElement(styled_components_1.ThemeProvider, { theme: theme || theme_1.default }, children);
};
exports.default = ReactToggleThemeProvider;
//# sourceMappingURL=index.js.map