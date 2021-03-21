import React from "react";
// import { IntlProvider } from "react-intl";
import ReactDOM from "react-dom";
import RouteApp from "./router/Route"; //路由配置

const Stream = require("stream-browserify");

import zh_CN from "./locales/zh-CN";
import en_US from "./locales/en-US";

import "semantic-ui-css/semantic.css"; // semantic-ui 样式
import "assets/style/reset.scss";

// const messages = {
//   en: en_US,
//   zh: zh_CN,
// };

// class IntlApp extends React.Component {
//   constructor() {
//     super();
//     state = {
//       lang: "en",
//     };
//   }

//   changeLanguage(lang) {
//     this.setState({
//       lang: lang,
//     });
//   }

//   render() {
//     // const { lang } = this.state;
//     return (
//       // <IntlProvider locale={navigator.language} messages={messages[lang]}>
//       <RouteApp />
//       // </IntlProvider>
//     );
//   }
// }

ReactDOM.render(<RouteApp />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept();
}
