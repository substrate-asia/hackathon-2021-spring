"use strict";
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
exports.__esModule = true;
/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
var pro_layout_1 = require("@ant-design/pro-layout");
var react_1 = require("react");
var umi_1 = require("umi");
var antd_1 = require("antd");
var Authorized_1 = require("@/utils/Authorized");
var RightContent_1 = require("@/components/GlobalHeader/RightContent");
var utils_1 = require("@/utils/utils");
var logo_p_png_1 = require("../assets/logo_p.png");
var Footer_1 = require("./Footer");
var BasicLayout_less_1 = require("@/layouts/BasicLayout.less");
var noMatch = (react_1["default"].createElement(antd_1.Result, { status: 403, title: "403", subTitle: "Sorry, you are not authorized to access this page.", extra: react_1["default"].createElement(antd_1.Button, { type: "primary" },
        react_1["default"].createElement(umi_1.Link, { to: "/user/login" }, "\u524D\u5F80\u767B\u5F55")) }));
/**
 * use Authorized check all menu item
 */
var menuDataRender = function (menuList) {
    return menuList.map(function (item) {
        var localItem = __assign(__assign({}, item), { children: item.children ? menuDataRender(item.children) : [] });
        return Authorized_1["default"].check(item.authority, localItem, null);
    });
};
var BasicLayout = function (props) {
    var dispatch = props.dispatch, children = props.children, settings = props.settings, _a = props.location, location = _a === void 0 ? {
        pathname: '/'
    } : _a, history = props.history;
    /**
     * init variables
     */
    var handleMenuCollapse = function (payload) {
        if (dispatch) {
            dispatch({
                type: 'global/changeLayoutCollapsed',
                payload: payload
            });
        }
    }; // get children authority
    var authorized = utils_1.getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
        authority: undefined
    };
    return (react_1["default"].createElement(pro_layout_1["default"], __assign({ className: BasicLayout_less_1["default"].main, logo: logo_p_png_1["default"], menuHeaderRender: function (logoDom, titleDom) { return (react_1["default"].createElement(umi_1.Link, { to: "/", style: { marginRight: '0' } },
            react_1["default"].createElement("img", { style: { margin: '0 10px', width: "auto", height: "60px" }, alt: '', src: logo_p_png_1["default"] }),
            react_1["default"].createElement("div", { style: { display: 'inline-block', color: '#333333', fontSize: '20px', fontWeight: '500' } }, "\u8DE8 \u6B21 \u5143"))); }, onCollapse: handleMenuCollapse, menuItemRender: function (menuItemProps, defaultDom) {
            if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
                return defaultDom;
            }
            return react_1["default"].createElement(umi_1.Link, { to: menuItemProps.path }, defaultDom);
        }, itemRender: function (route, params, routes, paths) {
            var first = routes.indexOf(route) === 0;
            return first ? (react_1["default"].createElement(umi_1.Link, { to: paths.join('/') }, route.breadcrumbName)) : (react_1["default"].createElement("span", null, route.breadcrumbName));
        }, footerRender: function () { return react_1["default"].createElement(Footer_1["default"], null); }, menuDataRender: menuDataRender, rightContentRender: function () { return react_1["default"].createElement(RightContent_1["default"], { history: history }); } }, props, settings),
        react_1["default"].createElement(Authorized_1["default"], { authority: authorized.authority, noMatch: noMatch }, children)));
};
exports["default"] = umi_1.connect(function (_a) {
    var global = _a.global, settings = _a.settings, userInfo = _a.userInfo;
    return ({
        collapsed: global.collapsed,
        settings: settings,
        userInfo: userInfo
    });
})(BasicLayout);
