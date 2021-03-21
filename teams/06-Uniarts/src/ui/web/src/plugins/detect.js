import UAParser from "ua-parser-js";

const uaParser = new UAParser(window.userAgent);
export default {
    browser: uaParser.getBrowser(),
};
