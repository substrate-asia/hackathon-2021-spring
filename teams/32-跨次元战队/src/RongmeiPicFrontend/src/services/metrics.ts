import request from '@/utils/request';
import {METRICS_SERVICE} from "@/services/config";

export async function getView(id: number) {
  return request(METRICS_SERVICE, `metrics/count?key=dimension_view_${id}`);
}

export async function getShare(id: number) {
  return request(METRICS_SERVICE, `metrics/count?key=dimension_share_${id}`);
}

export async function getDislike(id: number) {
  return request(METRICS_SERVICE, `metrics/count?key=dimension_dislike_${id}`);
}

export async function getDownload(id: number) {
  return request(METRICS_SERVICE, `metrics/count?key=dimension_download_${id}`);
}

export async function addView(id: number, msg: any) {
  return request(METRICS_SERVICE, `metrics`, {
    method: 'POST',
    data: {
      key: `dimension_view_${id}`,
      msg: msg
    }
  })
}

export async function addShare(id: number, msg: any) {
  return request(METRICS_SERVICE, `metrics`, {
    method: 'POST',
    data: {
      key: `dimension_share_${id}`,
      msg: msg
    }
  })
}

export async function addDislike(id: number, msg: any) {
  return request(METRICS_SERVICE, `metrics`, {
    method: 'POST',
    data: {
      key: `dimension_dislike_${id}`,
      msg: msg
    }
  })
}

export async function addDownload(id: number, msg: any) {
  return request(METRICS_SERVICE, `metrics`, {
    method: 'POST',
    data: {
      key: `dimension_download_${id}`,
      msg: msg
    }
  })
}
