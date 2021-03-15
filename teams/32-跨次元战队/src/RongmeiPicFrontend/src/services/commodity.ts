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

export async function getCommodityTopic(key: string, offset: number, limit: number) {
  return request(API_SERVICE, `commodity/topic?key=${key}&offset=${offset}&limit=${limit}`)
}

export async function getCommodityAuthor(commodityId: number) {
  return request(API_SERVICE, `commodity/author/${commodityId}`)
}

export async function getFavoritesCommodities(favoritesId: number, status: number) {
  return request(API_SERVICE, `commodity/favorites?favorites_id=${favoritesId}&status=${status}`)
}

export async function moveFavoritesCommodity(favoritesId: number, commodityId: number, status: number) {
  return request(API_SERVICE, `commodity/favorites/move?favorites_id=${favoritesId}&commodity_id=${commodityId}&status=${status}`)
}

