"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mgobexsCode = void 0;
const gameServer = {
    mode: 'sync',
    onInitGameData: function () {
        return {};
    },
    onRecvFromClient: function onRecvFromClient({ actionData, gameData, SDK, room, exports }) {
        gameData.pos = Math.floor(Math.random() * 2000);
        SDK.logger.debug('onRecvFromClient', gameData, actionData);
        setTimeout(() => {
            SDK.sendData({ playerIdList: [], data: { data: gameData, ts: new Date().toISOString() } }, { timeout: 2000, maxTry: 3 });
            SDK.exitAction();
        }, gameData.pos);
    },
    onJoinRoom: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onJoinRoom', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onCreateRoom: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onCreateRoom', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onLeaveRoom: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onLeaveRoom', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onRemovePlayer: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onRemovePlayer', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onDestroyRoom: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onDestroyRoom', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onChangeRoom: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onChangeRoom', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onChangeCustomPlayerStatus: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onChangeCustomPlayerStatus', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onChangePlayerNetworkState: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onChangePlayerNetworkState', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onStartFrameSync: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onStartFrameSync', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onStopFrameSync: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onStopFrameSync', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
    onChangeRoomPlayerProfile: function ({ actionData, gameData, SDK, room, exports }) {
        SDK.logger.debug('onChangeRoomPlayerProfile', 'actionData:', actionData, 'gameData:', gameData, 'room:', room);
    },
};
// 服务器初始化时调用
function onInitGameServer(tcb) {
    // 如需要，可以在此初始化 TCB
    const tcbApp = tcb.init({
        secretId: "请填写腾讯云API密钥ID",
        secretKey: "请填写腾讯云API密钥KEY",
        env: "请填写云开发环境ID",
        serviceUrl: 'http://tcb-admin.tencentyun.com/admin',
        timeout: 5000,
    });
    // ...
}
exports.mgobexsCode = {
    logLevel: 'error+',
    logLevelSDK: 'error+',
    gameInfo: {
        gameId: "请填写游戏ID",
        serverKey: "请填写后端密钥",
    },
    onInitGameServer,
    gameServer
};
