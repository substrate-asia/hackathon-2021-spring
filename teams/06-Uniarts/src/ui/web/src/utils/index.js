import { BigNumber } from "bignumber.js";

export function DateFormat(inputTime) {
    if (!inputTime) return "";
    var date = new Date(inputTime * 1000);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
}

export function ComputeBlockNumber(timestamp, blockTimestamp, blockHeight) {
    if (!timestamp || !blockTimestamp || !blockHeight) return "";
    let tempBlocks = parseInt(
        new BigNumber(timestamp).minus(blockTimestamp).div(6000).toNumber()
    );
    let result = new BigNumber(blockHeight).plus(tempBlocks).toNumber();
    return result;
}

export function ComputeBlockTimestamp(number, blockTimestamp, blockHeight) {
    if (!number || !blockTimestamp || !blockHeight) return "";
    let tempTimestamp = parseInt(
        new BigNumber(number).minus(blockHeight).times(6000).toNumber()
    );
    let result = parseInt(
        new BigNumber(blockTimestamp).plus(tempTimestamp).div(1000).toNumber()
    );
    return result;
}
