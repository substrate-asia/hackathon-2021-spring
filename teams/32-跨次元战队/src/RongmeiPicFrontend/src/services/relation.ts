import request from "@/utils/request";
import {API_SERVICE} from "@/services/config";

export interface FavoritesParameters {
  id: number;
  name: string;
  orderId: number;
}

export async function postLike(relationId: number, type: number) {
  return request(API_SERVICE, `relation/like`, {
    method: 'POST',
    data: {
      relationId,
      type
    }
  });
}

export async function getLike(relationId: number, type: number) {
  return request(API_SERVICE, `relation/like?relation_id=${relationId}&type=${type}`);
}

export async function updateFavorites(parameters: FavoritesParameters) {
  return request(API_SERVICE, `relation/favorites`, {
    method: 'POST',
    data: parameters
  });
}

export async function deleteFavorites(favoritesId: number) {
  return request(API_SERVICE, `relation/favorites/${favoritesId}`, {
    method: 'DELETE'
  });
}

export async function getMineFavorites() {
  return request(API_SERVICE, `relation/favorites/mine`)
}
