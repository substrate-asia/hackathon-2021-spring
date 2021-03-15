import request from '@/utils/request';
import {API_SERVICE} from "@/services/config";

export interface SaleQueryParameters {
  key: string;
  offset: number;
  limit: number;
  outdated: boolean;
  ownedByAuthor: boolean;
  // 0: 最近活跃, 1: 价格（低到高）, 2: 价格（高到低）, 3: 最近发布
  rankType: number;
  // 拍卖品属性
  tags: [];
}


export interface QueryBasicParams {
  limit: number;
  offset: number;
}

export interface SaleItem {
  id: number;
  startPrice: number;
  status: string;
  intervalPrice: number;
  thing: Thing;
  createTime: number;
  startTime: number;
  endTime: number;
}

export interface Thing {
  id: number;
  name: string;
  url: string;
  price: number;
  description: string;
  createTime: number;
  author: string;
  owner: string;
  tokenId: string;
}

export async function getSale(id: number) {
  return request(API_SERVICE, `auction/sale/${id}`);
}

export async function getSales(parameters: SaleQueryParameters) {
  return request(API_SERVICE, `auction/sale/query`, {
    method: 'POST',
    data: parameters
  });
}

export async function getMineSales() {
  return request(API_SERVICE, `auction/sale/mine`);
}

export async function bid(price: number, saleId: number) {
  return request(API_SERVICE, `auction/bid`, {
    method: 'POST',
    data: {
      price,
      saleId
    }
  });
}

export async function getSaleHistory(id: number) {
  return request(API_SERVICE, `auction/history/${id}`);
}

export async function getOwnerArtworks(ownerName: string) {
  return request(API_SERVICE, `auction/thing/owner?owner=${ownerName}`);
}

export async function getAuthorArtworks(authorName: string) {
  return request(API_SERVICE, `auction/thing/author?author=${authorName}`);
}

export async function getAuctionTransactionHistory() {
  return request(API_SERVICE, `auction/transaction/history/mine`);
}

export async function getTopTags(startTime: number, endTime: number) {
  return request(API_SERVICE, `auction/statistics/tag?startTime=${startTime}&endTime=${endTime}`)
}

export async function getTopArtist(params: QueryBasicParams) {
  return request(API_SERVICE, `auction/artist?limit=${params.limit}&offset=${params.offset}`)
}

export async function getAuctionTransactionHistories(params: QueryBasicParams) {
  return request(API_SERVICE, `auction/transaction/current?limit=${params.limit}&offset=${params.offset}`)
}

export async function getThingByTokenId(tokenId: string) {
  return request(API_SERVICE, `auction/thing/token/${tokenId}`);
}

export async function getStatistics() {
  return request(API_SERVICE, `auction/statistics`);
}

export async function getAuctionTopic(key: string, offset: number, limit: number) {
  return request(API_SERVICE, `auction/sale/topic?key=${key}&offset=${offset}&limit=${limit}`);
}

export async function getMineSalesParticipate() {
  return request(API_SERVICE, `auction/sale/participate/mine`);
}

export async function getMineThings() {
  return request(API_SERVICE, `auction/thing/mine`);
}

export async function getThings() {
  return request(API_SERVICE, `auction/thing`);
}

export async function getThing(thingId: number) {
  return request(API_SERVICE, `auction/thing/${thingId}`);
}

export async function getFavoritesThings(favoritesId: number, status: number) {
  return request(API_SERVICE, `auction/favorites?favorites_id=${favoritesId}&status=${status}`)
}

export async function moveFavoritesThing(favoritesId: number, thingId: number, status: number) {
  return request(API_SERVICE, `auction/favorites/move?favorites_id=${favoritesId}&thing_id=${thingId}&status=${status}`)
}

export async function getTokenValue(tokenId: string) {
  return request(API_SERVICE, `auction/token/${tokenId}`)
}
