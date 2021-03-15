import request from '@/utils/request';
import {API_SERVICE} from "@/services/config";

export interface CommodityQueryParameters {
  tags: string[];
  key: string;
  orderKey: string;
  offset: number;
  limit: number;
}

export interface CommodityItem {
  id: number;
  title: string;
  coverUrl: string;
  tags: string[];
  createTime: number;
  updateTime: number;
}

export interface Commodity {
  id: number;
  title: string;
  largePrice: number;
  coverUrl: string;
  tags: string[]
  contentUrl: string;
  description: string;
  signingInfo: string;
  extra: string;
  creatorUserGroupId: number;
}

export async function getCommodities(parameters: CommodityQueryParameters) {
  return request(API_SERVICE, `commodity`, {
    method: 'POST',
    data: parameters
  });
}

export async function getCommodity(commodityId: number) {
  return request(API_SERVICE, `commodity/${commodityId}`);
}
