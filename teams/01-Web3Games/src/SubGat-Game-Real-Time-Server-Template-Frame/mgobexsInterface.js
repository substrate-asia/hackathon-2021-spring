"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mgobexsInterface = void 0;
var mgobexsInterface;
(function (mgobexsInterface) {
    //PROTO-STRUCT-BEGIN
    let NetworkState;
    (function (NetworkState) {
        NetworkState[NetworkState["COMMON_OFFLINE"] = 0] = "COMMON_OFFLINE";
        NetworkState[NetworkState["COMMON_ONLINE"] = 1] = "COMMON_ONLINE";
        NetworkState[NetworkState["RELAY_OFFLINE"] = 2] = "RELAY_OFFLINE";
        NetworkState[NetworkState["RELAY_ONLINE"] = 3] = "RELAY_ONLINE";
    })(NetworkState = mgobexsInterface.NetworkState || (mgobexsInterface.NetworkState = {}));
    ;
    let CreateRoomType;
    (function (CreateRoomType) {
        CreateRoomType[CreateRoomType["COMMON_CREATE"] = 0] = "COMMON_CREATE";
        CreateRoomType[CreateRoomType["MATCH_CREATE"] = 1] = "MATCH_CREATE";
        CreateRoomType[CreateRoomType["THIRD_PARTY_CREATE"] = 2] = "THIRD_PARTY_CREATE";
    })(CreateRoomType = mgobexsInterface.CreateRoomType || (mgobexsInterface.CreateRoomType = {}));
    ;
    let FrameSyncState;
    (function (FrameSyncState) {
        FrameSyncState[FrameSyncState["STOP"] = 0] = "STOP";
        FrameSyncState[FrameSyncState["START"] = 1] = "START";
    })(FrameSyncState = mgobexsInterface.FrameSyncState || (mgobexsInterface.FrameSyncState = {}));
    ;
    let GroupType;
    (function (GroupType) {
        GroupType[GroupType["GROUP_LIMITED"] = 0] = "GROUP_LIMITED";
        GroupType[GroupType["GROUP_MANY"] = 1] = "GROUP_MANY";
    })(GroupType = mgobexsInterface.GroupType || (mgobexsInterface.GroupType = {}));
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
})(mgobexsInterface = exports.mgobexsInterface || (exports.mgobexsInterface = {}));
