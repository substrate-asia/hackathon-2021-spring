"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
var react_1 = require("react");
var useLifecycles = function (mount, unmount) {
    react_1.useEffect(function () {
        if (mount) {
            mount();
        }
        return function () {
            if (unmount) {
                unmount();
            }
        };
    }, []);
};
exports.default = useLifecycles;
