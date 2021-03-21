const { MBTEST_CONFIG } = require("./config/mbtest-config");
const { MBLOCAL_CONFIG } = require("./config/mblocal-config");

exports.GetConfig = function (network, accounts) {
    var CONFIG = {}
    switch (network) {
        case "mbtestnet":
            CONFIG = MBTEST_CONFIG
            CONFIG.multiSigAddress = accounts[0]
            CONFIG.defaultMaintainer = accounts[0]
            break;
        case "mbdev":
            CONFIG = MBLOCAL_CONFIG
            CONFIG.multiSigAddress = accounts[0]
            CONFIG.defaultMaintainer = accounts[0]
            break;
    }
    return CONFIG
}