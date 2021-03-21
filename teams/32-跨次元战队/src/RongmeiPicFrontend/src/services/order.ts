import request from '@/utils/request';
import {API_SERVICE} from "@/services/config";

export interface Order {
  id: number;
  orderId?: string;
  userGroupId?: number;
  largePrice: number;
  avatarUrl: string;
  userGroupTitle: string;
  pageUrl: string;
  status: string;
  totalNum: number;
  completeNum: number;
  createTime?: number;
  customer?: string;
  orderType: string;
  relationId: number;
}

export async function updateOrder(parameters: Order) {
  return request(API_SERVICE, `order`, {
    method: 'POST',
    data: parameters
  });
}

export async function getMineOrders() {
  return request(API_SERVICE, `order/mine?status=全部&orderType=pic`, {
    method: 'GET'
  });
}

export async function isOrderExist(relationId: number) {
  return request(API_SERVICE, `order/existence?status=已完成&orderType=pic&relationId=${relationId}`, {
    method: 'GET'
  });
}
